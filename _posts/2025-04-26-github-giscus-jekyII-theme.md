---
title: Build a blog with Chirpy theme Jekyll
date: 2025-04-16 09:41:00 +0700
comments: true
description: Set Up and Deploy a Documentation Site With Jekyll, Chirpy, Giscus
categories: [Life, You]
toc: true
tags: [github, giscus, jekyll, chirpy, ruby, blog]
image:
    path: https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-04-26-github-giscus-jekyII-theme/chirpy.png
    alt: Chirpy Jekyll Theme
---

## Introduction
---
Ở bài viết trước ([link](https://waibui.github.io/posts/how-to-create-my-blog-website/)), tôi có giới thiệu về cách tạo trang Blog bằng **Github Page** và **Giscus**. Sau một thời gian dạo chơi trên internet, nhờ đọc các writeup CTF, để ý răng có nhiều người sử dụng **Chirpy** theme này. Tại thời điển tôi viết bài này, theme vẫn đang được cập nhật. 

Thấy rất ưng ý sau 1 thời gian sử dụng, ở bài viết này là chia sẻ của tôi về cách sử dụng theme này, thực ra nó có sẵn [document](https://chirpy.cotes.page/) ở trang chính thức, tôi chỉ chia sẽ những gì mà tôi thấy là cần thiết.

> Dành cho tất cả đối tượng.
{: .prompt-info }

## Requirements
---
### Github Account
Điều tiên quyết ở đây là phải có tài khoản **Github**, up nó lên **Github Page** mà 🤡🤡🤡

### IDE
Dùng IDE để chỉnh sửa nội dung sau khi **clone**, recommended sử dụng [Visual Studio Code](https://code.visualstudio.com/), tải về cài rồi nét nét nét nét là xong...

### Understanding Markdown files
Các bài viết được sử dụng ở đây có dạng **Markdown(.md)** hoặc **HTML(.html)**, nên sử dụng **Markdown** file để viết vì nó tiện và được cấu hình cho mục đích viết blog trên **Github Page**. [Tham khảo tại đây](https://markdownlivepreview.com/)

## Installation
---
### Use Chirpy Template
Hướng dẫn cài đặt đã có chi tiết ở [đây](https://chirpy.cotes.page/posts/getting-started/)

### Giscus
Tiến hành cài [Giscus](https://giscus.app/vi) theo hướng dẫn. Nó được dùng cho chức năng **comment** bằng tài khoản **Github**

## Configuration
---
Sau khi đã hoàn tất việc setup và chạy được trên local, tiến hành cấu hình:
### _config.yml File
Đây là file cấu hình chính cho dự án, mọi thay đổi ở đây đều cần phải chạy lại lệnh khỏi động trên local để thay đổi nôi dung của page. các nội dung cơ bản cần thay đổi:
* **title**: tên của `blog`
* **tagline**: `subtitle` cho blog
* **url**: đường dãn tới `Github Page`của bạn, dùng để chuyển hướng
* **github**: thay `username` bằng `Github Username` 
* **social**: thay `name` bằng tên của bạn, nó được hiển thị sau phần `By` trong mỗi bài viết, tức tên của người viết
* **avatar**: sử dụng đường dẫn tương đối hoặc đường dẫn tuyệt đối đến hình ảnh bên ngoài.
* **comments**: chọn `giscus` làm hệ thống `comments` chính, thêm cấu hình cho giscus ở bên dưới, đã được lấy ở cài đặt giscus. Mặc định, tính năng `comments` được bật, sử dụng `comments: false` ở header bài viết cần tắt.

### _data/locales/en.yml File
Mặc định file này chưa được tạo, tạo file và copy nội dụng từ [en.yml](https://github.com/cotes2020/jekyll-theme-chirpy/blob/master/_data/locales/en.yml) chỉnh thức để cấu hình.
* **meta**: ở phần `Footer` bạn sẽ thấy dòng `Using the Chirpy theme for Jekyll.`, nhìn rất ngữa mắt. Đặt `meta: ""` để tắt nó.
* **copyright**: thay đổi nội dung nếu cần.

### assets/img/favicons/favicon.ico File
Để thay đổi **favicon**, bạn cần tạo 1 tập các **favicon** theo cách sau:
Truy cập vào [site](https://www.favicon-generator.org/) sau để tạo tập **favicon**
![favicon](https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-04-26-github-giscus-jekyII-theme/create_favicon.png)

Sau đó tải tập các **favicon** này về và giải nén

![Download favicon](https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-04-26-github-giscus-jekyII-theme/download_favicon.png)

Cuối cùng xóa 2 file `browserconfig.xml` và `manifest.json` rồi copy tập **favicon** vào `assets/img/favicons`

### post File
Mọi bài viết phải được đặt tên ở dạng **year-month-day-name-of-article.md**. Tham khảo chuẩn viêt tại [đây](https://chirpy.cotes.page/posts/write-a-new-post/)

> Sau khi cấu hình, chỉ cần **push** nó lên lại, đợi cho **Github Action** chạy 1 thời gian rồi vào **reload** để cập nhật nội dung mới.
{: .prompt-info }

## Conclusion
---
Hoàn thành được hết các bước ở trên, bạn đã có trang blog cho riêng mình. 

---
Goodluck! 🍀🍀🍀