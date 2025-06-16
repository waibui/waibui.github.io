---
title: "[PortSwigger Lab] - Business Logic Vulnerabilities"
description: Solution of Business Logic Vulnerabilities Lab
date: 2025-06-14 23:00:00 +0700
categories: [Cyber ​​Security, Web Pentest]
tags: [portswigger, burpsuite, labs, web, vulnerability, Business Logic]   
pin: false
comments: true
image:
    path: https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-06-14-portswigger-lab-business-logic-vulnerabilities/business-logic-vulnerabilities.png
    alt: Business Logic Vulnerabilities
---

## Introduction
---
### **Business Logic Vulnerabilities**
**Business logic vulnerabilities**(hay còn gọi là **logic flaws**) là lỗ hổng trong thiết kế hoặc triển khai của một ứng dụng, cho phép kẻ tấn công khai thác hành vi không như mong muốn bằng cách sử dụng chức năng hợp pháp của ứng dụng theo cách **trái phép** hoặc **phi logic**.
Trong mọi ứng dụng, luôn có một tập hợp các quy tắc xử lý, được gọi là **business logic** – nó quy định ứng dụng hoạt động như thế nào trong từng tình huống.

## **Solve Business Logic Vulnerabilities Lab**
---
### Lab: Excessive trust in client-side controls
- Login bằng tài khoản `wiener` => Có `100 đô` (quá đã)
- Mua `"Lightweight l33t leather jacket"` => Không đủ `money`
- Quan sát request mua

```http
POST /cart HTTP/2
Host: 0a4600d8048ea82d800a4e3600460012.web-security-academy.net
...
productId=1&redir=PRODUCT&quantity=1&price=133700
```
- Đổi `price=1` rồi gửi lại request
- **Wao~!** Quan sát lại chỗ giỏ hàng, giá chỉ còn `0.02` đô tức `0.01 x 2`
- Thanh toán thành công
- Do ứng dụng phụ thuộc vào `client side` => có thể sửa lại giá được

### Lab: High-level logic vulnerability
- Login bằng tài khoản `wiener` => Có `100 đô` (quá đã)
- Mua `"Lightweight l33t leather jacket"` => Không đủ `money`
- Thử mua với số lượng âm
    - Tăng `"Lightweight l33t leather jacket"` lên 1 để lấy `request` thay đổi số lượng 
    - Sau đó giảm xuống 3 để  **giá** có giá trị **âm(-)** 
    - Mua => `Cart total price cannot be less than zero`

```http
POST /cart HTTP/2
Host: 0a6c008603b8b437805b5477009600ce.web-security-academy.net
...
productId=1&quantity=-3&redir=CART
```
- Bây giờ đã biến số lượng có thể âm, để thanh toán thì **giá của tổng giỏ hàng > 0**
- Thêm một sản phẩm khác vào giỏ hàng
- Giảm số lượng của sảm phẩm đó để khi tính **giá của tổng giỏ hàng > 0** và nhỏ hơn hoặc bằng số tiền hiện có

```http
POST /cart HTTP/2
Host: 0a6c008603b8b437805b5477009600ce.web-security-academy.net
...
productId=1&quantity=-28&redir=CART
```
- Thanh toán thành công

| Name                              | Price     | Quantity |
|-----------------------------------|-----------|----------|
| Lightweight "l33t" Leather Jacket | $1337.00  | 1        |
| Pet Experience Days               | $44.06    | -29      |

**Total:**	`$59.26`

### Lab: Low-level logic flaw
- Login bằng tài khoản `wiener` => Có `100 đô` (quá đã)
- Mua `"Lightweight l33t leather jacket"` => Không đủ `money`
- Thử mua với số lượng âm: Nếu giảm **quantity < 0** => `"Your card is empty"`
- Thử tăng **quantity** lên để xảy ra **tràn số** thành số **âm**
- Gửi request đến **Burp Intruder**

```http
GET /cart HTTP/2
Host: 0afa001e037e4eaf831ab4bc009000f4.web-security-academy.net
...
productId=1&quantity=99&redir=CART
```
- Max `quantity` là `99`
- **Add** tại `99` và **Payload type**: `Null payloads`
- **Payload configuration**: `Continue indefinitely` 
- **Create new resource pool** > **Max concurrence requests**: `1`
- **Start attack**: **Refresh** trang liên tục, chờ đến khi con số âm nhỏ lại
- Thêm 1 sản phẩm nữa để tổng tiền thấp hơn tiền hiện có

| Name                           | Price     | Quantity |
|--------------------------------|-----------|----------|
| Lightweight "l33t" Leather Jacket | $1337.00  | 32123    |
| Cheshire Cat Grin             | $79.60    | 16       |

**Total:**	`$51.64`

### Lab: Inconsistent handling of exceptional input
- Sử dụng chức năng **Register**:
    - **Email** tối đa chỉ được 255 kí tự
    - Nếu lớn hơn 255 kí tự => Lấy 255 ký tự đầu tiên, bỏ kí tự sau
    - Trở thành **admin** nếu **email** là `@dontwannacry.com`
- **Register** với **email** sau:
``aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@dontwannacry.com.exploit-0abe00f404487fde819410b90116001e.exploit-server.net``

- Vậy ta chỉ cần tạo **email** với 255 kí tự: `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@dontwannacry.com`
- Ứng dụng sẽ cắt đi phần `.exploit-0abe00f404487fde819410b90116001e.exploit-server.net`
- Như vậy ta đã có quyền **admin**
- Xóa user `carlos`
- Cách tạo nhanh **email** trên

```zsh
wai :: ~ » python3
Python 3.13.3 (main, Apr 10 2025, 21:38:51) [GCC 14.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> len("@dontwannacry.com")
17
>>> print("a"*(255-17) + "@dontwannacry.com" + ".exploit-0abe00f404487fde819410\
b90116001e.exploit-server.net")
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@dontwannacry.com.exploit-0abe00f404487fde819410b90116001e.exploit-server.net
>>> 
```
### Lab: Inconsistent security controls
- Sử dụng chức năng **Register**
- Có quyền **admin** nếu **email** là `@dontwannacry.com`
- Sử dụng chức đăng đổi **email** thành `something@dontwannacry.com` => Đã có quyền **admin**
- Xóa user `carlos`

### Lab: Weak isolation on dual-use endpoint
- **Login** bằng tài khoản `wiener`
- Sử dụng chức năng **change-password** và gửi đến **Burp Repeater**

```http
POST /my-account/change-password HTTP/2
Host: 0a5300c90321af5f8044c6a900100071.web-security-academy.net
...
csrf=IeoER9UfFaHVoPAPOj8b8kM8Yjh75MCa&username=wiener&current-password=peter&new-password-1=a&new-password-2=a
```
- Gửi lại request với **user** là `administrator`, bỏ đi params `current-password=peter` => Thành công thay đổi **password** `administrator`
- Login bằng tài khoản `admin` và xóa user `carlos`
- **Server** không xác thực mật khẩu cũ, và ủy quyền lỏng lẻo => cho phép người dùng `A` gửi **request** để thay đổi tài nguyên của người dùng `B`

### Lab: Insufficient workflow validation
- **Login** bằng tài khoản `wiener`
- Mua thử có mặt hàng vừa giá, quy trình diễn ra như sau:
    - **Add vào card** `/cart`: `productId=2&redir=PRODUCT&quantity=1`
    - **Checkout:** `/cart/checkout`: `csrf=...`
    - **Confirm:** `/cart/order-confirmation?order-confirmed=true`
- Add mặt hàng `"Lightweight "l33t" Leather Jacket"`
- Bỏ qua bước **checkout** tiến hành **confrim** luôn => bỏ qua bước kiểm tra số dư

### Lab: Authentication bypass via flawed state machine
- Login bằng tài khoản `wiener`
- Chọn **role**
- Truy cập trang `/admin` => yêu cầu **role** **admin**
- **Logout** > bật **Intercept**
- **Login** lại bằng tài khoản `wiener`, đến request sau thì **drop**

```http
GET /role-selector HTTP/2
Host: 0a840060044744b980b0c1f800e6003f.web-security-academy.net
```
- Truy cập trang `admin` và xóa user `carlos`
- Dường như ứng dụng chỉ bắt chọn **role** đối với **user** không phải **admin** => bỏ qua bước chọn role => **admin**

### Lab: Flawed enforcement of business rules
- Login bằng tài khoản `wiener`
- Thêm `"Lightweight "l33t" Leather Jacket"` vào giỏ hàng
- Áp dụng mã `NEWCUST5` => `-$5.00` => `Quá đã`
- Thử áp dụng lần nữa => `Coupon already applied`
- Trở lại trang `home` => `Sign up to our newsletter!` ở **footer** => nhận được mã `SIGNUP30` => `-30%`
- Áp dụng mã `SIGNUP30` và `NEWCUST5` xen kẽ nhau:
    - Khi áp dụng mã này thì mã kia được reset và được nhập lại
    - Áp dụng cho đến khi đủ tiển mua

### Lab: Infinite money logic flaw
#### Analysis
- **Login** bằng tài khoản `wiener`
- **Add product** `Gift Card` giá `$10.00`
- **Sign up** ở phần footer để lấy mã giảm giá `SIGNUP30`, lấy 1 lần, sẽ được sử dụng cho mỗi sản phẩm
- **Add discount** => giá còn `$7.00`
- **Place order** để nhận **gift-card** với giá trị `$10.00`
- Sử dụng **gift-card** => số dư tăng `$3.00` so với ban đầu
- Cần tự động hóa lặp đi lặp lại quá trình trên để tài tăng số dư tài khoản
#### Exploit
- Sử dụng **macro**: **Macro** là một kịch bản gồm các **HTTP request** được chạy tự động phía trước một **request chính**, nhằm thiết lập trạng thái phù hợp để thực hiện **tấn công/phân tích**.
- Vào **Setting** > **Session** > **Macro** > **Add**, chọn 5 request sau (Nhấn giữ **ctrl** và **click** vào từng **request**):
    - **Add product**
    ```http
POST /cart HTTP/2
Host: 0a8c00e9040177d78184d9430008003d.web-security-academy.net
...
productId=2&redir=PRODUCT&quantity=1
    ```
    - **Add discount**
    ```http
POST /cart/coupon HTTP/2
Host: 0a8c00e9040177d78184d9430008003d.web-security-academy.net
...
csrf=6X428KRMgAbF8oCWQXuhdujLH8nLEL8f&coupon=SIGNUP30
    ```
    - **Place order**
    ```http
POST /cart/checkout HTTP/2
Host: 0a8c00e9040177d78184d9430008003d.web-security-academy.net
...
csrf=6X428KRMgAbF8oCWQXuhdujLH8nLEL8f
    ``` 
    ```http
GET /cart/order-confirmation?order-confirmed=true HTTP/2
Host: 0a8c00e9040177d78184d9430008003d.web-security-academy.net
    ```
    - **Use gift-card**
    ```http
POST /gift-card HTTP/2
Host: 0a8c00e9040177d78184d9430008003d.web-security-academy.net
...
csrf=6X428KRMgAbF8oCWQXuhdujLH8nLEL8f&gift-card=QRUfRsFGZJ
    ```
- Lấy **gift-card** để tạo biến đầu ra cho request thứ 5 sử dụng
    - **Click** vào request thứ 4 `/cart/order-confirmation?order-confirmed=true` > **Configure item** 
    - **Custem parameter locations in response** > **Add** > bôi đen vào **QRUfRsFGZJ (gift-card)** > **OK**
- Lấy param **gift-card** được tạo ra từ **repsonse** thứ 4 và **use**
    - **Click** vào request thứ 5 `/gift-card` > **Configure item** 
    - **gift-card** > **Diliver from prior response** > **Response 4** > **OK**
- **Configure** để kịch bản chạy cùng tất cả các request
    - **Settings** > **Session** > **Session handling rules** > **Add**
    - **Details** > **Rule actions** > **Add** > **Run a macro** > chọn **Macro** vừa tạo
    - **Scope** > **Scope** > **URL scope** > **Include all URLs** => Chạy config này với **all URLs**
- Bây giờ chỉ cần gửi 1 request thì 5 request trên cũng sẽ được sử dụng
- Sử dụng **Burp Intruder** để tự động quá trình này, tầm `420` lần là đủ
    - Gửi 1 request đã sử dụng trước đó, không liên quan đến 5 request trên đến **Burp Intruder**
    ```http
GET /my-account HTTP/2
Host: 0a8c00e9040177d78184d9430008003d.web-security-academy.net
    ```
    - **Add** đại tại 1 vị trí bất kì
    - **Payload type**: `Null payloads` 
    - **Payload configuration**: Genarate `420` payloads, nếu muốn không giới hạn thì chon **Continue indefinitely**
    - Nếu sử dụng **BurpSuite Pro** cần phải tạo **Resource pool** mới với **concurrent** là 1, bời vì mặc định sẽ là 10 dẫn đến bất đồng bộ => lệch kịch bản
    - **Start attack**
- **Ngồi chờ mòn đít** đến khi nó hoàn thành thì đủ tiền mua `Lightweight "l33t" Leather Jacket` rồi đó

## Prevent
---

1. Hiểu rõ nghiệp vụ **(business domain)** của ứng dụng.
2. Không đưa ra giả định mơ hồ về hành vi người dùng hay các phần khác trong hệ thống.
3. Kiểm soát chặt chẽ trạng thái và luồng xử lý ở phía server.
4. Lập trình và kiểm thử có chủ đích, nhằm phát hiện logic sai lệch.

---
Goodluck! 🍀🍀🍀 


