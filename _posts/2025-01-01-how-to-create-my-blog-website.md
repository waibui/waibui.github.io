---
title:  "How I Created This Blog"
date: 2025-01-01 10:00:00 +0700
comments: true
description: How I created this blog using Github Pages and Giscus.
categories: [Life, Me]
toc: true
tags: [github, web, blog, giscus]
image:
        path: /assets/img/posts/2025-01-01-how-to-create-my-blog-website/githubpage.png
        alt: Github + Giscis
---

## Overview
---
Hi. Nay mình sẽ chia sẽ cách mình đã tạo ra trang Blog này. Mình sử dụng 2 nền tảng miễn phí là Github pages và Giscus.

### Github pages
Github pages là một web hosting service được phát triển bởi Github để lưu trữ các trang web tĩnh phục vụ cho việc viết blog, tài liệu cho dự án, hoặc thậm chí là viết sách (Nguồn wiki). Github pages chủ yếu dựa trên nền tảng phần mềm Jekyll - một nền tảng viết bằng Ruby được phát triển bởi Tom Preston-Werner.
Mình thấy Github pages thực sự ngon, bổ, miễn phí. Dùng để viết blog thì quá ok, sẽ kết hợp với Giscus để tương tác với mọi người.

### Giscus
Giscus là một ứng dụng được phát triển để đơn giản hóa và tối ưu hóa trải nghiệm thảo luận và bình luận cho các dự án trên GitHub. Với Giscus, bạn có thể tích hợp một hệ thống bình luận trực tiếp vào trang web hoặc ứng dụng của bạn, cho phép người dùng thảo luận, theo dõi vấn đề (issues), và tương tác với cộng đồng của dự án một cách thuận tiện. 
Do Github pages dùng để lưu trữ các web tĩnh nên phần cơ sở dữ liệu sẽ không được thêm vào, nếu có thì bạn có thể sử dụng Firebase để làm cơ sở dữ liệu.
Giscus nó miễn phí, không quảng cáo, cài đặt dễ dàng. 

## Carry Out
---
### Choose Templates
Đầu tiên mình sẽ sử dụng template của Jekyll, các bạn có thể tham khảo các trang này để chọn.
[jekyllthemes.io/free](https://jekyllthemes.io/free)
<img style="width: 100%;" src="/assets/img/posts/2025-01-01-how-to-create-my-blog-website/choose_theme.gif" alt="Choose Theme">

### Get Source
Ở bước này bạn có thể **Fork** rồi **Clone code** hoặc **Clone code** rồi push lên lại cũng được. Ở đây mình sẽ Fork về và đặt repository là `username.github.io`
<img style="width: 100%;" src="/assets/img/posts/2025-01-01-how-to-create-my-blog-website/fork.gif" alt="Fork">
Sau khi Fork về, mình cần setting để nó có thể render ra web.
![Setting](/assets/img/posts/2025-01-01-how-to-create-my-blog-website/setting.png)
Sau khi clone code về bạn cần phải chỉnh sửa một số thông tin, thay đổi thành thông tin của bạn, thường thì nó ở file `_config.yml`

### Add Comment Feature
Như giời thiệu ở trên, mình sẽ sử dụng Giscus để tạo chức năng bình luận cho mỗi bài viết.
Để sử dụng chức năng bình luận thì bạn cần phải đáp ứng 3 yêu cầu sau
1. Kho lưu trữ là công khai, nếu không, khách truy cập sẽ không thể xem thảo luận.
2. Ứng dụng giscus đã được cài đặt, nếu không, khách truy cập sẽ không thể bình luận và phản hồi.
3. Tính năng Thảo luận được bật bằng cách bật tính năng này cho kho lưu trữ của bạn.
Vào **Setting** -> **Genaral** -> **bật Discusions**

![Discusions](/assets/img/posts/2025-01-01-how-to-create-my-blog-website/enable_discusion.png)

Tiếp theo cần cần tải Giscus app ở [install Giscus app](https://github.com/apps/giscus)
Sau khi tải Giscus, bạn lựa chọn option phù hợp cho phần bình luận của mình.
Truy cập [config Giscus](https://giscus.app/). Cấu nhập username/repository vào repository của phần Configuration.
Cuối cùng dán script vào cuối cùng của mỗi bài viết cần bình luận.

![Script](/assets/img/posts/2025-01-01-how-to-create-my-blog-website/code.png)

---
Good luck!🍀🍀🍀