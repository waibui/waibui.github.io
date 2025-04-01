---
author: "waibui"
layout: post
title:  "Psdir - My web path scan tool"
date: 2025-04-01
comments: true
description: Công cụ quét đường dẫn website dựa trên wordlist của tôi.
categories: introduce
toc: true
tags: 
- security
- python
- web
---

# Giới thiệu
---
Đây là security tool đầu tay của tay mơ waibui, code tuy lỏ nhưng chạy đủ nhanh, option vừa đủ phục vụ cho nhu cầu pentest của tui. Thực ra có rất nhiều tool mạnh mẽ và nhiều chức năng hơn, nhưng dùng cái do mình tự tạo ra cảm thấy thỏa mãn, custom tùy ý, không sợ cái mẹ chi hết...
Tui tạo cái này do nhu cầu của tui, phân tích riết cũng mệt, code cho vui nhà vui cửa...

# Cấu trúc
---
{% highlight bash %}
psdir
.
├── controllers
│   ├── controller.py
│   ├── __init__.py
│   └── scan.py
├── core
│   ├── dependencies.py
│   ├── __init__.py
│   └── setting.py
├── models
│   ├── __init__.py
│   └── option.py
├── parse
│   ├── __init__.py
│   └── parse_cmd.py
├── statics
│   ├── common.txt
│   ├── user-agent.txt
│   └── wordlist.txt
├── views
│   ├── banner.py
│   ├── file_logging.py
│   ├── __init__.py
│   └── logging.py
├── __init__.py
├── LICENSE
├── psdir.py
├── README.md
├── requirements.txt
└── setup.py
{% endhighlight %}

# Installation
---
1. Sử dụng git: `git clone https://github.com/waibui/psdir.git`
2. Tải zip file: [https://github.com/waibui/psdir.git](https://github.com/waibui/psdir/archive/refs/heads/main.zip)

# Options
---
{% highlight bash %}
Usage: psdir.py [-u|--url] target [options].
Choose -h/--help option for more detail.

Options:
  --version             show program's version number and exit
  -h, --help            show this help message and exit

  CORE SETTINGS:
    -u URL, --url=URL   Target URL, eg: https://example.com,
                        http://example.com
    -w WORDLISTS, --wordlists=WORDLISTS
                        Wordlist files or directories contain wordlists
    --ua=USER_AGENT, --user-agent=USER_AGENT
                        User-Agent files or directories contain useragent

  PERFORMENT & REQUEST SETTINGS:
    -t THREADS, --threads=THREADS
                        Number of threads (default: 40)
    --to=TIMEOUT, --timeout=TIMEOUT
                        Connection timeout in seconds
    -m METHOD, --http-method=METHOD
                        HTTP method (default: GET)
    --mc=MATCH_CODE, --match-code=MATCH_CODE
                        Match HTTP status code
                        (default:200,204,301,302,307,401,403)
    --cookie=COOKIE     The cookie of the requests, eg: key:value
    --proxies=PROXY     PROXY for requests, eg:
                        https://username:password@proxy.example.com:8080,
                        https://proxy.example.com:8080
    --ar=ALLOW_REDIRECT, --allow-redirect=ALLOW_REDIRECT
                        Accept redirect in request

  OUTPUT & LOGGING SETTINGS:
    -o FILE, --output=FILE
                        Save output to a file

See 'core/setting.py' for the example configuration file
{% endhighlight %}

# Hoạt động



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