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

# Introduce
---
Đây là công cụ bảo mật đầu tiên do waibui phát triển. Dù mã nguồn còn đơn giản, nhưng hiệu suất đủ nhanh và có các tùy chọn phù hợp cho nhu cầu pentest của tôi. Thực ra, có rất nhiều công cụ mạnh mẽ và đa năng hơn, nhưng việc sử dụng một tool do chính mình tạo ra mang lại cảm giác thỏa mãn, có thể tùy chỉnh theo ý muốn.

Tôi viết nó đơn giản vì nhu cầu cá nhân, sau thời gian dài phân tích cũng thấy mệt, nên code cho vui và để đổi gió một chút.

# Contructure
---
{% highlight bash %}
psdir
.
├── config
│   └── settings.py
├── controller
│   └── controller.py
├── data
│   ├── common.txt
│   ├── user-agent.txt
│   └── wordlist.txt
├── model
│   ├── exception.py
│   ├── result.py
│   └── scanner.py
├── psdir.py
├── README.md
├── requirements.txt
├── setup.py
├── utils
│   ├── arg_parser.py
│   ├── dependencies.py
│   ├── file_logger.py
│   ├── file.py
│   ├── logger.py
│   ├── request_handler.py
│   ├── scrape.py
│   ├── user_agent.py
│   └── validators.py
└── view
    ├── banner.py
    ├── config.py
    └── result.py

6 directories, 24 files
{% endhighlight %}

# Installation
---
1. Sử dụng git: `git clone https://github.com/waibui/psdir.git`
2. Tải zip file: [https://github.com/waibui/psdir.git](https://github.com/waibui/psdir/archive/refs/heads/main.zip)

# Doccument
---
{% highlight bash %}
usage: psdir.py [-u|--url] target [options].

psdir - Web Path Scanner

options:
  -h, --help            show this help message and exit
  -u URL, --url URL     Target URL
  -w WORDLIST, --wordlist WORDLIST
                        Path to wordlist file(s)
  -ua USER_AGENT, --user-agent USER_AGENT
                        Path to user-agent file(s)
  -c CONCURRENCY, --concurrency CONCURRENCY
                        Number of threads
  -t TIMEOUT, --timeout TIMEOUT
                        Connection timeout in seconds
  -m HTTP_METHOD, --http-method HTTP_METHOD
                        HTTP method
  -mc MATCH_CODE, --match-code MATCH_CODE
                        Match HTTP status codes

HTTP Settings:
  --cookie COOKIE       Cookies for requests (e.g., 'key=value; key2=value2')
  --proxies PROXIES     Proxy for requests (e.g., 'http://user:pass@proxy.com:8080')
  -ar, --allow-redirect
                        Allow HTTP redirects (true/false)
  -s, --scrape          Scrape <a> tags and request their URLs
  -rl RATE_LIMIT, --rate-limit RATE_LIMIT
                        Limit requests per second (default: unlimited)

Output Settings:
  -o OUTPUT, --output OUTPUT
                        Save output to a file (.txt, .log, .json)

See 'config/settings.py' for the example configuration file
{% endhighlight %}




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