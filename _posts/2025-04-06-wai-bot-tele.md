---
title:  "wai-bot-tele - A Telegram Bot using Python"
date: 2025-04-06 10:00:00 +0700
comments: true
description: Telegram bot using Python, easy to extend.
categories: [Cybersecurity, Tools]
toc: true
tags: [telegram, python, bot, automation]
image:
    path: /assets/img/posts/2025-04-06-wai-bot-tele/pythonxtele.png
---

## Overview
---
wai-bot-tele là một Telegram bot linh hoạt và có thể mở rộng, được xây dựng bằng Python. Nó cung cấp một framework để quản lý plugin và các lệnh, giúp các lập trình viên dễ dàng tạo và mở rộng các tính năng của bot. Bot được thiết kế để tương tác với Telegram API một cách mượt mà, đồng thời cung cấp phương thức dễ dàng để thêm các tính năng mới thông qua kiến trúc plugin. Dù bạn muốn tạo ra các lệnh mới hay tùy chỉnh các lệnh có sẵn, bot này rất linh hoạt và có thể mở rộng, giúp bạn dễ dàng điều chỉnh theo nhu cầu cụ thể của mình.

Một số tính năng nổi bật của bot bao gồm:

- **Kiến trúc dựa trên Plugin:** Dễ dàng thêm và quản lý các plugin mới.
- **Xử lý Lệnh:** Hỗ trợ thêm và thực thi các lệnh tùy chỉnh.
- **Khả năng Mở rộng:** Sẵn sàng mở rộng với các tính năng tùy chỉnh cho các trường hợp sử dụng cụ thể.

## Construct
---
```
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
```

## Requirements
---
### Telegram Bot
* Go to **Bot Father**: [Bot Father](https://t.me/botfather)
![Bot Father](/assets/img/posts/2025-04-06-wai-bot-tele/bot_father.png)
* Create new Bot: `/newbot`
* Enter Name: `bot's name`
* Username for bot: `username` (It must end in `bot`. Like this, for example: TetrisBot or tetris_bot.)
* Store token string

### .env File
Thêm nội dung vào file `.env`
```
TELEGRAM_BOT_TOKEN=yourbot-token
AUTHORIZED_USERS=valid-uid
```

[Get valid-uid](https://t.me/userinfobot)

## Running
---
### Virtual Enviroment
Nên tạo môi trường ảo để chạy:
* Tránh xung đột với **Python System**
* Dễ dàng quản lý

```bash
python3 -m venv venv
```

### Default feature
* `/start`: khởi động bot.
* `/help`: hiển thị các tính năng đang có.
* `/reload`: nạp lại các plugins(thêm/sửa/xóa plugins ngay cả khi chương trình vẫn đang chạy).
* `/shutdown`: shutdown bot, thoát chương trình.

### Testing
```bash
python wai-bot-tele.py
```

## Extend
---
Để thêm các **plugin** khác:
* Tạo file **Python** trong thư mục **plugins**
* Trong mỗi file tạo các **module** với tên có cấu trúc **cmd_namefunc**, phải có **async** trước **def**, vì **Telegram** yêu cầu bất đồng bộ.

```python
async def cmd_namefunc(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """docstring"""
```

* `namefunc`: cũng chính là tên của feature.
* `docstring`: là phần mô tả cho hàm, cũng mô tả cho feature.