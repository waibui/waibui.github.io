---
author: "waibui"
layout: post
title:  "wai-bot-tele - A Telegram Bot using Python"
date: 2025-04-06
comments: true
description: Telegram bot sử dụng Python, dễ dàng mở rộng.
categories: introduce
toc: true
tags: 
- security
- python
---

# Overview
Wai-bot-tele là một Telegram bot linh hoạt và có thể mở rộng, được xây dựng bằng Python. Nó cung cấp một framework để quản lý plugin và các lệnh, giúp các lập trình viên dễ dàng tạo và mở rộng các tính năng của bot. Bot được thiết kế để tương tác với Telegram API một cách mượt mà, đồng thời cung cấp phương thức dễ dàng để thêm các tính năng mới thông qua kiến trúc plugin. Dù bạn muốn tạo ra các lệnh mới hay tùy chỉnh các lệnh có sẵn, bot này rất linh hoạt và có thể mở rộng, giúp bạn dễ dàng điều chỉnh theo nhu cầu cụ thể của mình.

Một số tính năng nổi bật của bot bao gồm:

- **Kiến trúc dựa trên Plugin:** Dễ dàng thêm và quản lý các plugin mới.
- **Xử lý Lệnh:** Hỗ trợ thêm và thực thi các lệnh tùy chỉnh.
- **Khả năng Mở rộng:** Sẵn sàng mở rộng với các tính năng tùy chỉnh cho các trường hợp sử dụng cụ thể.

---
# Construct
{% highlight bash %}
wai-bot-tele
.
├── config
│   └── settings.py
├── LICENSE
├── manager
│   └── plugin_manager.py
├── plugins
│   ├── command_excutor.py
│   ├── file_manager.py
│   ├── __init__.py
│   └── screenshot.py
├── README.md
├── requirements.txt
├── utils
│   ├── auth.py
│   ├── dependencies.py
│   └── logger.py
└── wai-bot-tele.py

4 directories, 13 files
{% endhighlight %}

---
# Requirements
## Telegram Bot
* Go to **Bot Father**: [Bot Father](https://t.me/botfather)
![Bot Father](/assets/images/posts/2025-04-06-wai-bot-tele/bot_father.png)
* Create new Bot: `/newbot`
* Enter Name: `bot's name`
* Username for bot: `username` (It must end in `bot`. Like this, for example: TetrisBot or tetris_bot.)
* Store token string

## .env File
Thêm nội dung vào file `.env`
{% highlight bash %}
TELEGRAM_BOT_TOKEN=yourbot-token
AUTHORIZED_USERS=valid-uid
{% endhighlight %}

[valid-uid](https://t.me/userinfobot)


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