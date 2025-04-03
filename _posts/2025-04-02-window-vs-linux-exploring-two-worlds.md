---
author: "waibui"
layout: post
title:  "Windows vs. Linux: Exploring Two Worlds"
date: 2025-04-02
comments: true
description: Trải nghiệm của tôi khi sử dụng Windows và Linux
categories: introduce
toc: true
tags: 
- me
---

# Overview
Khi nói tới hệ điều hành, mọi người thường nghĩ đến **Windows** đầu tiên, bởi vì trong quá trình học tập và rèn luyện họ đã được tiếp xúc với **Windows** đầu tiên. Windows chủ yếu sử dụng GUI (Graphic User Interface) và hỗ trợ tốt cho nhiều ứng dụng. Tuy nhiên nó lại có phí để `active` mới sài được các chức năng quan trọng như Office. Điều đó không quan trong, vì hầu hết các máy sử dụng Windows hiện nay đều sài hàng **crack**, nó đáp ứng đủ nhu cầu của người dùng thông thường nên không cần `active` để nhận thêm các ưu đãi khác.

Trái ngược với **Windows**, **Linux** hướng tới người dùng nâng cao 1 tí, hơn cả, nó miễn phí 100%, có cộng đồng hỗ trợ đông đảo. Đặc biệt, **Linux** có rất nhiều phiên bản phân phối, phục vụ có từng nhu cầu cụ thể, đẽ dàng tùy chỉnh giao diện với nhiều môi trường Desktop khác nhau.
**Linux** chủ yếu sử dụng giao CLI (Command Line Interface).

# Opera System Family 
![Opera System Family](/assets/images/posts/2025-04-02-window-vs-linux-exploring-two-worlds/os-family.png)

**Linux** thực chất là một **kernel** (hạt nhân), không phải một hệ điều hành hoàn chỉnh. **Kernel** là phần lõi của hệ điều hành, chịu trách nhiệm giao tiếp giữa phần cứng và phần mềm, quản lý tài nguyên hệ thống như CPU, bộ nhớ, và thiết bị ngoại vi. Các bản phân phối **Linux** (Linux distributions - distros) như **Ubuntu**, **Fedora**, **Arch**, **Debian**… mới thực sự là hệ điều hành.

**Windows** mà bạn dùng hiện nay dựa trên **Windows NT Kenel**, là **kenel** của các hệ điều hành phổ biến như **Windows 10** và **Windows 11**.

# My Experience with Windows and Linux
Ở bài viết này tôi chỉ đánh giá các hệ điều hành mà mình đã sữ dụng, chia sẽ cảm nhận của mình về các hệ điều hành đó.

## User Interface (UI)
Mặc dù **Windows 11** có nhiều người chê nhưng tôi phải công nhận rằng UI của nó đẹp thực sự, không bị khô cứng như các các phiên bản **Windows** trước hay **Linux** nói chung. **Windows** có giao diện trực quan, dễ sử dụng, quen thuộc với đa số người dùng. còn **Linux** có tính tùy chỉnh cao, có nhiều môi trường desktop như GNOME, KDE, XFCE.

Còn khi dùng **Linux**, việc đầu tiên sau tôi khi cài là tùy chỉnh giao diện, đặc biệt trên mỗi trường **GNOME** có cộng đồng hỗ trợ mạnh mẽ, các tùy chỉnh template đẹp, dễ sử dụng. Trên **Kali Linux** nếu không ưa dùng **XFCE**(default), bạn có thể chuyển sang **GNOME** từ bước cài đặt nó hoặc tùy chỉnh thông qua dòng lệnh sau khi chạy.

Hầu như tôi chỉ dùng **CLI** (Command Line Interface) trên **Linux**, hiếm khi sử dụng nó trên **Windows**. **Linux** sử dụng **Terminal** làm giao diện dòng lệnh còn **Windows** sử dụng **CMD** hoặc **Power Shell**. Sử dụng trên **Terminal** thích nhất phím `Ctrl + C`, nó giúp **Terminate** hay dừng chương trình ngay lập tức, còn **Windows** trong một số trường hợp không hỗ trợ, khi code, các chương trình vòng lặp được thực thi, chúng ta có thể ngừng ngay lập tức mà không cần phải bắt sự kiện để ngừng.

## Resources
Sau khi sài nhiều bản phân phối, hệ điều hành khác nhau, tôi thấy **Windows** luôn chiếm nhiều **RAM** hơn so với các bản phân phối **Linux** do chạy nhiều tiến trình hơn ngay từ khi khởi động, mặc dù tôi đã tắt các **process** tự khởi động. Do đó khi dùng **laptop** cũng sẽ nóng hơn hết. 
Trong các điều kiện giống nhau, **Pin** của **Windows** nó nhanh hết hơn của **Linux**, phải gấp 2 lần.

![In Ubuntu](/assets/images/posts/2025-04-02-window-vs-linux-exploring-two-worlds/ram-linux.png)

![In Windows](/assets/images/posts/2025-04-02-window-vs-linux-exploring-two-worlds/ram-windows.png)

## Software & Applications
Bản phân phối Linux chính mà tôi đang sài là **Ubuntu 22.04.5 LTS** cũng là hệ điều hành chính mà tôi dang sài, dual boot với **Windows 11 Pro**. Tuy vậy, không thể phủ nhận rằng Lib Office lỏ hơn Microsoft Office, nên tôi mới dual boot để sử dụng Office của Microsoft.

Khả năng gõ tiếng Việt thì **Linux** lỏ thôi rồi, không được tối ưu như Unikey hay EVKey trên **Windows**.

Về phần quản lý gói và cài đặt ứng dụng, dường như **Linux** sử dụng CLI để quản lý, có thể cài trên **Software** cho một số bản phân phối có hỗ trợ GUI như **Ubuntu**. Trên **Windows** có thể cài trên **Microsoft Store** hoặc tải file `.exe` để cài. Phần này thấy sài quen rồi thì cài bằng cách nào cũng được. Như người dùng bình thường thì thấy cài trên **Windows** khỏe hơn.

# Conclusion
Người dùng bình thường thì nên sài **Windows**, hỗ trợ tốt. **Linux** dùng cho **Dev** hay **System Manager** vì thực hiện giao diện dòng lệnh cho quen, đó là đầu vào chuẩn, có thể sử dụng trên tất cả các thiết bị.

<script src="https://giscus.app/client.js"
        data-repo="waibui/waibui.github.io"
        data-repo-id="R_kgDONiHcVw"
        data-category="Announcements"
        data-category-id="DIC_kwDONiHcV84ClolG"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="preferred_color_scheme"
        data-lang="vi"
        crossorigin="anonymous"
        async>
</script>