---
title: "[PortSwigger Lab] - Web Cache Deception"
description: Solution of Web Cache Deception Lab
date: 2025-06-24 11:55:00 +0700
categories: [Cyber ​​Security, Web Pentest]
tags: [portswigger, burpsuite, labs, web, vulnerability, web cache deception]   
pin: false
comments: true
image:
    path: https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-06-24-portswigger-lab-web-cache-deception/web-cache-deception.png
    alt: Web Cache Deception
---

## Introduction
---
### **Web Cache**
**Web Cache** là một hệ thống trung gian nằm giữa **người dùng** và **origin server**, với nhiệm vụ:
- Lưu trữ phản hồi tạm thời **(cached response)** của các tài nguyên (chủ yếu là tĩnh như `.css`, `.js`, `.jpg`,`…`).
- Trả về bản sao đã lưu khi có yêu cầu giống hệt yêu cầu trước (gọi là **cache hit**).
- Nếu không có bản lưu, thì gọi là **cache miss**, và yêu cầu sẽ được chuyển tiếp đến **server gốc**.

### **How Web Cache Work**
#### **Cache Key** - `“chìa khóa”` để quyết định **cache**
Khi nhận một **request HTTP**, **cache** sẽ tạo ra một **cache key** để kiểm tra xem đã từng có phản hồi nào tương ứng chưa. Cache key thường bao gồm:
- **URL** (đường dẫn và query string).
- Có thể bao gồm **headers**, **method**, **cookie**, **content type**,…

Nếu cache key khớp với một **request trước đó** => trả lại bản sao đã lưu **(cache hit)**.
#### **Cache Rules** - Quy tắc xác định nội dung nào được **cache**
Không phải mọi phản hồi **HTTP** đều được lưu vào **cache**. Bộ **cache** sẽ dùng **cache rules** để quyết định điều này:

| Loại Rule                | Ý nghĩa                            | Ví dụ                                   |
| ------------------------ | ---------------------------------- | --------------------------------------- |
| **File extension**       | Cache dựa vào phần đuôi file       | `.css`, `.js`, `.jpg` => thường bị cache |
| **Static directory**     | Cache theo thư mục                 | `/assets/`, `/static/`                  |
| **File name**            | Cache theo tên cụ thể              | `robots.txt`, `favicon.ico`             |
| **URL params / headers** | Cache có thể tùy biến nâng cao hơn | Dựa vào giá trị query hoặc header       |

### **Web Cache Deception**
**Web Cache Deception (WCD)** là một kiểu tấn công khai thác sự khác biệt giữa cách máy chủ gốc **(origin server)** và bộ nhớ đệm web **(web cache)** xử lý các **URL**, để lừa bộ **cache** lưu trữ nội dung nhạy cảm vốn không nên bị **cache**.

| Đặc điểm | Web Cache Deception                          | Web Cache Poisoning                            |
| -------- | -------------------------------------------- | ---------------------------------------------- |
| Mục tiêu | Lưu nhầm dữ liệu nhạy cảm                    | Lưu nội dung độc hại                           |
| Lợi dụng | Trình tự xử lý khác nhau của cache và server | Thao túng request (thường là header hoặc URL)  |
| Tác hại  | Lộ dữ liệu người dùng khác                   | Gây XSS, chuyển hướng, tấn công CSRF qua cache |

### Constructing an Attack
#### Xác định **endpoint** chứa dữ liệu nhạy cảm
- Tìm các **URL** trả về thông tin người dùng, ví dụ: `email`, `username`, `token`,...
- Ưu tiên các phương thức **GET**, **HEAD**, **OPTIONS** (vì các phương thức như **POST** không được `cache`).

> Một số thông tin nhạy cảm không hiện trong **HTML**, nhưng nằm trong **JSON** hoặc **headers** => phải đọc nội dung **response** đầy đủ, không chỉ xem trong trình duyệt.
{: .prompt-info}

#### Tìm điểm khác biệt giữa cách **cache** và **server** gốc xử lý **URL**
Tức là tìm sự không đồng bộ **(discrepancy)** giữa:
- **Cache system (CDN/reverse proxy)** => đơn giản, hay xử lý **URL** theo **pattern** (đuôi **file**, **thư mục**).
- **Server gốc** => có thể xử lý **route** linh hoạt hơn.

| Kiểu               | Ví dụ                                                   |
| ------------------ | ------------------------------------------------------- |
| Mapping            | `/profile/bob.css` map về `/profile/<user>`             |
| Delimiter          | `/user;token=123` => cache coi là khác, server thì không |
| Path normalization | `/profile/../bob.css` => cache và server xử lý khác nhau |

#### Tạo **URL** giả đánh lừa **cache** lưu dữ liệu riêng tư

```
https://example.com/profile/alice.css
```
Nếu người dùng (đã đăng nhập) truy cập link này:
- **Server** vẫn hiểu là `/profile/alice` và trả dữ liệu nhạy cảm.
- **Cache** thì thấy `.css` => tưởng là tài nguyên tĩnh => lưu lại.

#### Dùng **Cache Buster** để kiểm thử đúng cách
- Nếu test cùng **URL** nhiều lần => có thể bị cache lại => không thấy thay đổi gì.
- Cần **cache-busting** để tạo **cache key mới** mỗi lần.
- Dùng **Param Miner extension** trong **Burp**:
    - Vào **Param Miner** > **Settings** > **Add dynamic cachebuster**
    - Mỗi **request** sẽ được tự động thêm `?cb=123abc`, `?cb=456def`, `v.v.`

#### Xác định phản hồi có bị **cache** không

| Header             | Ý nghĩa                                              |
| ------------------ | ---------------------------------------------------- |
| `X-Cache: hit`     | Được trả từ cache (cache đã lưu từ trước)            |
| `X-Cache: miss`    | Cache không có, lấy từ origin (và thường sẽ lưu lại) |
| `X-Cache: dynamic` | Nội dung động, không nên cache                       |
| `X-Cache: refresh` | Đã cache nhưng cần cập nhật lại                      |

## Solve Web Cache Deception Lab
[Delimiter list](https://portswigger.net/web-security/web-cache-deception/wcd-lab-delimiter-list)

---
### Lab: Exploiting path mapping for web cache deception
#### Analysis
- Login bằng account `wiener`
- Gửi request đến **Repeater**
- Gửi lại request đến `/my-account/xnxx` => **Response** vẫn chứa **API key** của người dùng
- **Server** gốc không quan tâm đoạn `"xnxx"` => có khả năng dùng **RESTful routing** kiểu `/my-account/*`
- Gửi tiếp `/my-account/xnxx.css`
    - Ban đầu `X-Cache: miss` => không có trong **cache**, `Cache-Control: max-age=30` => nếu **cache** lưu thì giữ trong `30s`
    ```http
HTTP/2 200 OK
Content-Type: text/html; charset=utf-8
X-Frame-Options: SAMEORIGIN
Cache-Control: max-age=30
Age: 0
X-Cache: miss
    ```

    - Gửi lại lần nữa `X-Cache: hit` => **cache** đã lưu **response** trước đó
    ```http
HTTP/2 200 OK
Content-Type: text/html; charset=utf-8
X-Frame-Options: SAMEORIGIN
Cache-Control: max-age=30
Age: 22
X-Cache: hit
    ```

#### Exploit
- Thêm **payload** vào body **exploit server** và gửi cho `carlos`

```html
<link href=https://0a8a0087046548ea8097037000e200a0.web-security-academy.net/my-account/pornhub.css rel=stylesheet>
```
- **Deliver to victim**
- Khi `carlos` truy cập link này
    - **Server** trả **response** chứa **API key** của `carlos`
    - **Cache** hiểu đó là `.css` => lưu lại **response**
    - Vì đây là truy cập lần 2 nên `X-Cache: hit`
- Truy cập vào đường dẫn `https://0a8a0087046548ea8097037000e200a0.web-security-academy.net/my-account/pornhub.css` để lấy **API key** của `carlos`

### Lab: Exploiting path delimiters for web cache deception
#### Exploit
- Login bằng account `wiener`
- Gửi request đến **Repeater**
- Gửi request đến `/my-account/xnxx.js` => `"Not found"`
- Sử dụng ký tự phân tách `?` 
    - **Server:** hiểu `?xnxx.css` là **query string** => **response** chứa **API key**
    - **Cache:** có thể cũng dùng `?` làm **delimiter** => không **cache**
    - Không thấy `X-Cache: hit` => không thành công

```http
GET /my-account?xnxx.css HTTP/2
Host: 0a7a00470405790980a7039900f20031.web-security-academy.net
```
- Sử dụng ký tự phân tách `;` 

```http
GET /my-account;xnxx.css HTTP/2
Host: 0a7a00470405790980a7039900f20031.web-security-academy.net
```

```http
HTTP/2 200 OK
Content-Type: text/html; charset=utf-8
X-Frame-Options: SAMEORIGIN
Server: Apache-Coyote/1.1
Cache-Control: max-age=30
Age: 0
X-Cache: miss
```
- `X-Cache: miss` dấu hiệu **cache**
- Gửi lại lần nữa ta nhận được `X-Cache: hit` => đã được **cache**

#### Exploit
- Thêm **payload** vào body **exploit server** và gửi cho `carlos`

```html
<link href=https://0a7a00470405790980a7039900f20031.web-security-academy.net/my-account;pornhub.css rel=stylesheet>
```
- **Deliver to victim**
- Khi `carlos` truy cập link này
    - **Server** trả **response** chứa **API key** của `carlos`
    - **Cache** hiểu đó là `.css` => lưu lại **response**
    - Vì đây là truy cập lần 2 nên `X-Cache: hit`
- Truy cập vào đường dẫn `https://0a7a00470405790980a7039900f20031.web-security-academy.net/my-account;pornhub.css` để lấy **API key** của `carlos`
- Ngoài cách trên có thể tự động tìm kí tự phân tách bằng **Burp Intruder**

```http
GET /my-account§§xnxx.css HTTP/2
Host: 0a7a00470405790980a7039900f20031.web-security-academy.net
```
- Sử dụng [Delimiter list](https://portswigger.net/web-security/web-cache-deception/wcd-lab-delimiter-list)
- Tắt **URL-encode these characters**

### Lab: Exploiting origin server normalization for web cache deception
#### Analysis
- Login bằng account `wiener`
- Gửi request đến **Repeater**
- Gửi request với các ký tự phân tách bằng **Burp Intruder** => `?` trả về **status code** `200`, còn lại là `404`
- Gửi request đến `/my-account/xnxx` => `404` => không dùng **RESTful routing**
- Gửi request đến `/xnxx/%2e%2e%2fmy-account` (`/xnxx/../my-account`) => `/my-account` => xác nhận **server** giải mã và chuẩn hóa path **(normalization)**.
- Gửi request đến `/resources/xnxx` => `X-Cache: miss` => lần 2 `X-Cache: hit`
- Mặc dù `xnxx` không tồn tại nhưng vẫn được **cache** => **cache** có **rule** dựa trên **prefix** `/resources`

#### Exploit
- Thêm **payload** vào body **exploit server** và gửi cho `carlos`

```html
<link href=https://0a8000ed03dacf3e8119de3c000a00c9.web-security-academy.net/resources/%2e%2e%2fmy-account?xnxx rel=stylesheet>
```
- **Deliver to victim**
- Khi `carlos` truy cập link này
    - **Server** giải mã và chuẩn hóa path **(normalization)**: `/resources/../my-account?xnxx` => `/my-account?xnxx`
    - **Server** trả **response** chứa **API key** của `carlos`
    - **Cache** hiểu đó có **prefix** `/resources` => lưu lại **response**
    - Vì đây là truy cập lần 2 nên `X-Cache: hit`
- Truy cập vào đường dẫn `https://0a8000ed03dacf3e8119de3c000a00c9.web-security-academy.net/resources/%2e%2e%2fmy-account?xnxx` để lấy **API key** của `carlos`
- Dùng `xnxx` để tránh lặp lại **cache** trước

### Lab: Exploiting cache server normalization for web cache deception
#### Analysis
- Login bằng account `wiener`
- Gửi request đến **Repeater**
- Test các biến thể:
    - `/my-account/abc` => `404`
    - `/my-accountabc` => `404`
    - Gửi request với các ký tự phân tách bằng **Burp Intruder** => `?` trả về **status code** `200`, còn lại là `404`
- Gửi `/resources/abc` thấy có `X-Cache: hit` => được **cache**.
- Gửi `/aaa/..%2fresources/abc` => cũng có `X-Cache: hit` => **cache server** **decode** + **normalize** được `..%2f`.
- Gửi `/my-account%23%2f%2e%2e%2fresources` => được **cache**
    - **Cache server** **decode** + **normalize**: `/my-account#/../resources` => `/resources`
    - **Origin server** thấy `#` nên không quan tâm phía sau => trả về tài nguyên `/my-account`
    - Tài nguyên trả về được lưu trữ ở **cache**

#### Exploit
- Thêm **payload** vào body **exploit server** và gửi cho `carlos`

```html
<link href=https://0a66002d04a9fde5806a03c1006a00f3.web-security-academy.net/my-account%23%2f%2e%2e%2fresources/xnxx rel=stylesheet>
```
- **Deliver to victim**
- Khi `carlos` truy cập link này
    - **Cache server** giải mã và chuẩn hóa path **(normalization)**: `/my-account#/../resources` => `/resources`
    - **Origin server** trả **response** chứa **API key** của `carlos`
    - **Cache** hiểu đó có **prefix** `/resources` => lưu lại **response**
    - Vì đây là truy cập lần 2 nên `X-Cache: hit`

---
Goodluck! 🍀🍀🍀 


 
