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

### 

## Prevent
---
1. Xác định rõ thông tin nào là "nhạy cảm"
2. Kiểm tra mã nguồn để phát hiện rò rỉ thông tin
3. Sử dụng thông báo lỗi chung chung
4. Tắt tính năng debug, test và logging nhạy cảm ở production
5. Cấu hình kỹ lưỡng các công nghệ bên thứ ba

---
Goodluck! 🍀🍀🍀 