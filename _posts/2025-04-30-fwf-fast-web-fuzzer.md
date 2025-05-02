---
title: "FwF - Fast Web Fuzzer"
description: A high-performance web path discovery and reconnaissance tool
date: 2025-04-30 10:00:00 +0700
categories: [Cybersecurity, Tools]
tags: [introduction, tool, web, directoryscan, reconnaissance]
pin: false
comments: true
image:
    path: /assets/img/posts/2025-04-30-fwf-fast-web-fuzzer/banner.png
    alt: FwF
---

## Introduction
---
**FwF** là một công cụ mã nguồn mở được viết bằng Python, hỗ trợ quá trình thu thập thông tin và khám phá cấu trúc thư mục của các ứng dụng web. Công cụ này hoạt động theo cơ chế brute-force, sử dụng các wordlist (từ điển đường dẫn) tùy chỉnh hoặc có sẵn để tìm ra các đường dẫn tiềm ẩn như `/admin`, `/login`, hoặc các tệp quan trọng như `config.php`, `.env`, v.v.

Mục tiêu chính của **FwF** là giúp pentester rút ngắn thời gian trinh sát ban đầu (reconnaissance), đồng thời mang lại khả năng tùy biến linh hoạt để phù hợp với từng mục tiêu cụ thể.

> ✍️ *Author: WaiBui*.

## Installation
---
Choose one of these installation options:
* Install with `git`
```bash
git clone https://github.com/waibui/FwF
```

* Intall with [Zip file](https://github.com/waibui/FwF/archive/refs/heads/main.zip)

## Configuration
---
### Virtual Environment(venv)
* **Linux**/**macOS**
```bash
python3 -m venv venv
source venv/bin/activate
```

* **Window**(CMD):
```bash
python -m venv venv
venv/Scripts/activate
```

* **Window PowerShell**
```powershell
python -m venv venv
./venv/Scripts/Activate.ps1
```

> Sử dụng **Virtual Environment(venv)** để tránh xung đột với **Python** hệ thống.
{: .prompt-info }

### Dependencies
Sau khi setup **Virtual Environment (venv)**, chạy lệnh dưới để tải các thư viện cần thiết
```bash
pip install -r requirements.txt
```

## Option
---
```
usage: python fwf.py [-u|--url] target [options]

Fast Web Fuzzer - Fast Web Fuzzer: A web path discovery tool

options:
  -h, --help            show this help message and exit
  -v, --version         Show tool's version

HTTP Option:
  -u, --url URL         Target URL (default: None)
  -X, --method METHOD   HTTP method to use (e.g., GET, POST) (default: GET)
  -t, --timeout TIMEOUT
                        Request timeout in seconds (default: 10)
  -r, --follow-redirects
                        Follow HTTP redirects (default: False)
  -k, --cookie COOKIE   Cookies for requests (e.g., 'key=value,key2=value2') (default: None)

General Option:
  -c, --concurrency CONCURRENCY
                        Number of concurrent threads (default: 100)
  -y, --retry RETRY     Number of times to retry failed requests (default: 0)

Input Options:
  -w, --wordlist WORDLIST
                        Path to Wordlist file (default: /home/wai/Documents/Projects/FwF/data/common.txt)
  -a, --user-agent USER_AGENT
                        Path to User-Agent file (default: /home/wai/Documents/Projects/FwF/data/user_agent.txt)

output option:
  --color               Disable colored output (default: False)
  --verbose             Suppress all non-essential output (default: False)
  -o, --output OUTPUT   Save output to file (.txt, .log, .json, etc.) (default: None)

filter option:
  -m, --match-codes MATCH_CODES
                        Filter status codes (comma-separated)(default: [200, 201, 202, 203, 204, 301, 302, 307, 308, 401,
                        403])

Example: python -u example.com -r -mc 200,301
```

## Usage
---
> Option **-u** (**Target URL**) là bắt buộc
{: .prompt-info }

### Normal
```bash
python fwf.py -w target_url
```

```bash
┌──(venv)─(wai㉿wai)-[~/Documents/Projects/FwF]
└─$ python fwf.py -u google.com                                                                                                 

     _____          _____ 
    |  ___|_      _|  ___|
    | |_  \ \ /\ / / |_   
    |  _|  \ V  V /|  _|  
    |_|     \_/\_/ |_|                                                                    
                            v1.0.0 by WaiBui                                                  
    
------------------------------------------------------------
:: Method: GET
:: Target: https://google.com
:: Wordlist: /home/wai/Documents/Projects/FwF/data/common.txt
:: User-Agent: /home/wai/Documents/Projects/FwF/data/user_agent.txt
:: Concurrency: 100
:: Timeout: 10
:: Retries: 0
:: Follow Redirects: False
:: Cookies: None
:: Match Code: 200, 201, 202, 203, 204, 301, 302, 307, 308, 401, 403
:: Output File: None
------------------------------------------------------------
[301] https://google.com/saved 0.50s
[301] https://google.com/talk 0.53s
[301] https://google.com/saves 0.56s
[301] https://google.com/work 0.08s
[301] https://google.com/movies 0.08s
[301] https://google.com/ads 0.08s
[301] https://google.com/mozilla 0.08s
[301] https://google.com/mozilla 0.08s
```
> Mặc định, khi không thêm vào tiền tố `http://` hoặc `https://` thì **Target URL** có dạng `https://target_url`

### -v (- -version) Option
Hiển thị **version** của tool

### -w (- -wordlist) Option
Sử dụng **Custom** wordlist nếu không muốn sử dụng **Default** wordlist của tool
* Default wordlist: **data/common.txt**
* Custom wordlist có thể là **Relative path** hoặc **Absolute path**

### -a (- -user-agent)
Sử dụng **Custom** user-agent nếu không muốn sử dụng **Default** user-agent của tool
* Default user-agent: **data/common.txt**
* Custom user-agent có thể là **Relative path** hoặc **Absolute path**

> user-agent được sử dụng ngẫu nhiên cho mỗi request

### -X (- -method) Option
Các **HTTP method** được phép sử dụng **GET**, **POST**, **HEAD**, **PUT**, **DELETE**
```bash
python fwf -u example.com -X post
```

### -t (- -timeout) Option
Thay đổi **timeout** của mỗi request, mặc định là 10s
```bash
python fwf -u example.com -t 20
```

### -r (- -follow-redirects)
Khi gặp các request có status code từ **300 - 399** (redirects) thì chuyển hướng đến đích cuối cùng
```bash
python fwf -u example.com -r
```

### -k (- -cookie)
Thêm cookie cho mỗi request theo cấu trúc: 
```bash
python fwf.py -u example.com -k key1=abc,key2=bcd
```

### -c (- -concurrency)
Thay đổi số lượng request đồng thời, mặc định là 100
```bash
python fwf -u example.com -c 200
```

### -y (- -retry)
Thực hiện gửi lại request khi có lỗi hoặc timeout, mặc định là 0
```bash
python fwf -u example.com -y 3
```

### -m (- -match-codes) 
Lọc kết quả hiển thị theo các status code được phép
```bash
python fwf -u example.com -m 200,301
```

### - -color
Thêm màu hiển thị ra console, hiển thị giao diện trực quan, mặc định là false
```bash
python fwf -u example.com --color
```

### - -verbose
Hiển thị chi tiết request và lỗi, mặc định là false
```bash
python fwf -u example.com --verbose
```

### -o (- -output)
Ghi kết quả ra file, mặc định là None
```bash
python fwf -u example.com -o a.log
```

## Structure of the Tool
---
```
FwF
.
├── data
│   ├── common.txt
│   ├── user_agent.txt
│   └── wordlist.txt
├── fwf.py
├── LICENSE
├── README.md
├── requirements.txt
├── src
│   ├── constants
│   ├── __init__.py
│   ├── input
│   ├── models
│   ├── output
│   ├── scanner
│   └── validator
├── test_server.py
└── venv
    ├── bin
    ├── include
    ├── lib
    ├── lib64 -> lib
    └── pyvenv.cfg

14 directories, 10 files
```

### data
Thư mục chứa các dữ liệu đầu vào cần thiết.
* **common.txt**: Danh sách các đường dẫn phổ biến để fuzz
* **user_agent.txt**: Danh sách các User-Agent để gửi request
* **wordlist.txt**: Wordlist phụ dùng để quét

### fwf.py
Entry point, tập tin khởi động chính của tool, nơi gọi và điều phối các thành phần chính trong thư mục src.

### LICENSE
Giấy phép sử dụng phần mềm, ở đây là `MIT`.

### README.md
Tài liệu hướng dẫn sử dụng, cài đặt và giới thiệu công cụ.

### requirements.txt
Danh sách các thư viện Python cần thiết để chạy công cụ.

### src
Thư mục chứa mã nguồn chính của công cụ.
__init__.py: Biến src thành một package Python
* **constants**: Chứa các hằng số toàn cục như mã trạng thái HTTP, ký hiệu, v.v.
* **input**: Xử lý đầu vào từ người dùng hoặc dòng lệnh
* **models**: Định nghĩa các kiểu dữ liệu và cấu trúc logic
* **output**: Xử lý việc hiển thị kết quả ra terminal hoặc file
* **scanner**: Chứa logic quét đường dẫn, gửi request, xử lý phản hồi
* **validator**: Kiểm tra tính hợp lệ của các tham số, file, đường dẫn,...

### test_server.py
Tập tin Python tạo server giả (mock server) để kiểm thử tool trong môi trường cục bộ.

### venv
Môi trường ảo Python dùng để quản lý các thư viện cục bộ cho dự án.
`bin/`, `include/`, `lib/`, `lib64`, `pyvenv.cfg`: Các thành phần tiêu chuẩn của virtualenv

## Main Libraries Used
* **aiohttp**: Thư viện HTTP client hỗ trợ bất đồng bộ, dùng để gửi các request một cách nhanh chóng và hiệu quả trong quá trình quét.
* **asyncio**: Thư viện chuẩn của Python để xử lý các tác vụ bất đồng bộ, cho phép thực hiện nhiều request song song để tăng tốc độ quét.
* **argparse**: Dùng để phân tích và xử lý các tham số dòng lệnh mà người dùng cung cấp khi chạy tool.
* **random**: Hỗ trợ tạo tính ngẫu nhiên, ví dụ như chọn ngẫu nhiên User-Agent.