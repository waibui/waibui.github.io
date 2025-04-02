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
- tool
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

# Recommended 
---
venv (Virtual Environment) là một công cụ giúp tạo môi trường ảo để quản lý các thư viện và dependencies trong Python. Nói rõ ra trong mỗi dự án bạn sử dụng 1 venv riêng, không trùng nhau và cũng không trùng với Python hệ thống. Mọi gói bạn tải đều nằm trong venv không tải trên Python hệ thống, giúp hệ thống của bạn sạch, tránh được xung đột.
## Using Virtual Environment (venv)
---
### Linux
{% highlight bash %}
sudo apt-get install python3 # Install python if you don't have it yet

sudo apt-get install python3-venv # Get python3-venv package to create venv

cd psdir # Go to project directory

python3 -m venv name_venv # Create venv

source name_venv/bin/activate # Activate venv

pip install package_name # Install package

deactivate # Exit venv
{% endhighlight %}

### Windows
{% highlight powershell %}
# Install Python if you don't have it yet (Download from https://www.python.org/downloads/)
# Make sure to check "Add Python to PATH" during installation
# Or go to Microsoft Store to download Python, it help auto config in your environment

cd psdir # Go to project directory

python -m venv name_venv # Create venv

name_venv\Scripts\activate # Activate venv (for cmd)
# OR
name_venv\Scripts\Activate.ps1 # Activate venv (for PowerShell)

pip install package_name # Install package

deactivate # Exit venv
{% endhighlight %}

# Usage
---
Ở lần chạy đầu tiên, chương trình sẽ tự động tải các gói cần thiết từ `requirements.txt`.

{% highlight bash %}
python psdir.py -u example.com 
{% endhighlight %}

---
Tham số **[-u|--url]** là bắt buộc, biến được truyền vào có thể không chỉ định **http** hay **https**(default), nếu không chỉ định thì mặc định sử dụng **https**.

## Wordlist
---
Nếu không truyền tham số **[-w|--wordlist]**, chương trình sử dụng wordlist mặc định trong **data/wordlist.txt**
{% highlight bash %}
python psdir.py [-u|--url] example.com [-w|--wordlist] path_to_wordlist.txt
{% endhighlight %}

## User-Agent
---
Nếu không truyền tham số **[-ua|--user-agent]**, chương trình sử dụng module **fake-useragent** để lấy giá trị User-Agent ngẫu nhiên. Nếu truyền thì phải truyền đường dẫn đến file chứa User-Agent.
{% highlight bash %}
python psdir.py [-u|--url] example.com [-ua|--user-agent] path_to_user_agent.txt
{% endhighlight %}

## Concurrency
---
Số luồng thực thi request đồng thời của chương trình(default: 50), không được bé hơn 1.
{% highlight bash %}
python psdir.py [-u|--url] example.com [-c|--concurrency] number_of_concurrency
{% endhighlight %}

## Timeout
---
Thời gian 1 request tồn tại(default: 10, unit: second(s) ), không được bé hơn 1.
{% highlight bash %}
python psdir.py [-u|--url] example.com [-t|--time-out] number_of_timeout
{% endhighlight %}

## HTTP method
---
Mặc định sử dụng GET method, nhưng có thể tùy chình với các method hợp lệ: GET, POST, HEAD, PUT, DELETE.
{% highlight bash %}
python psdir.py [-u|--url] example.com [-m|--http-method] method
{% endhighlight %}
Tham só method có thể lowercase hoặc uppercase.

## Match code
---
Filter các status code hợp lệ, mặc định: 200, 204, 301, 302, 307, 401, 403, 429.
{% highlight bash %}
python psdir.py [-u|--url] example.com [-mc|--match-code] statuscode1,statuscode2,...
{% endhighlight %}
Code phải viết liền nhau, không có **space**.

## Cookie
---
Cookie cho từng request
{% highlight bash %}
python psdir.py [-u|--url] example.com [--cookie] key=value,key2=value2,...
{% endhighlight %}
Cookie phải viết liền nhau, không có **space**.

## Proxy
---
Proxy cho từng request
{% highlight bash %}
python psdir.py [-u|--url] example.com [--proxie] http://user:pass@proxy.com:8080
{% endhighlight %}

## Allow redirect
---
Đây là tham số quan trọng trong chương trình, mặc định mang giá trị **false**. Chỉ cần thêm [--ar|--allow-redirect] mà không cần kèm biến theo sau. Khi truyền vào tham số này, khi request nhận được các status code có ý nghĩa chuyển hướng, chương trình sẽ thực hiện redirect tới đích của request. Không có tham số này, chương trình trả về các status code chưa chuyển hướng.
{% highlight bash %}
python psdir.py [-u|--url] example.com [--ar|--allow-redirect]
{% endhighlight %}

## Scrape
---
Cào các thẻ <a> có thuộc tính **href** tiếp tục request để lấy thông tin. Không cần kèm theo biến phía sau.
{% highlight bash %}
python psdir.py [-u|--url] example.com [--s|--scrape]
{% endhighlight %}

## Rate limit
---
Giới hạn số lượng request mỗi giây (default: unlimited, unit: second(s) ).
{% highlight bash %}
python psdir.py [-u|--url] example.com [--rl|--rate-limit]
{% endhighlight %}

## Output file
---
Log thông tin ra file sau khi quét. Mặc định không thực hiện log.
Các extension file log hợp lệ: .txt, .log, .json, .csv, .xlsx, .yaml, .yml, .md, .html, .xml
{% highlight bash %}
python psdir.py [-u|--url] example.com [--o|--output] path_to_log_file.valid_extension
{% endhighlight %}

# Test
---
{% highlight bash %}
(venv) wai@wai:~/Documents/Projects/psdir$ python psdir.py -u google.com -c 100 > a.txt
~~~
    ██████╗ ███████╗██████╗ ██╗██████╗   Author    : waibui
    ██╔══██╗██╔════╝██╔══██╗██║██╔══██╗  Version   : 1.0.0
    ██████╔╝███████╗██║  ██║██║██████╔╝  License   : LICECSE
    ██╔═══╝ ╚════██║██║  ██║██║██╔══██╗  Doccument : https://github.com/waibui/psdir
    ██║     ███████║██████╔╝██║██║  ██║  OS        : Linux 6.8.0-57-generic
    ╚═╝     ╚══════╝╚═════╝ ╚═╝╚═╝  ╚═╝  Python    : 3.10.12                                                                         
~~~    
------------------------------------------------------------
- Target URL: https://google.com
- Threads: 100
- Timeout: 10 seconds
- Allow Redirects: No
- Cookie: None
- Proxy: None
- Wordlist: /home/wai/Documents/Projects/psdir/data/wordlist.txt (9674 entries)
- Target Status Codes: [200, 204, 301, 302, 307, 401, 403, 429]
------------------------------------------------------------
[+] 200 - 0.232s - https://google.com/.well-known/assetlinks.json
[+] 301 - 0.231s - https://google.com/.well-known/security.txt
[+] 301 - 0.222s - https://google.com/2001
[+] 301 - 0.193s - https://google.com/2002
[+] 301 - 0.197s - https://google.com/2001/
[+] 301 - 0.170s - https://google.com/2002/
[+] 301 - 0.167s - https://google.com/2003
[+] 301 - 0.140s - https://google.com/2004
[+] 301 - 0.143s - https://google.com/2003/
[+] 301 - 0.117s - https://google.com/2004/
[+] 301 - 0.272s - https://google.com/2005
[+] 301 - 0.248s - https://google.com/2005/
[+] 301 - 0.245s - https://google.com/2006
...
[+] 301 - 0.226s - https://google.com/workspace/uploads/
------------------------------------------------------------
[+] Scan Completed in 34.53s
- 200: 2 occurrences
- 301: 234 occurrences
- 302: 14 occurrences
------------------------------------------------------------
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