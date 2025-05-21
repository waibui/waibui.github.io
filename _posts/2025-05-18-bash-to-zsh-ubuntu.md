---
title: Change Bash to Zsh on Ubuntu
date: 2025-05-18 07:57:00 +0700
comments: true
description: A quick guide on how to switch the default shell from bash to zsh on Ubuntu for a more powerful and customizable terminal experience.
categories: [Life, You]
toc: true
pin: true
tags: [bash, zsh, ubuntu, linux]
image:
    path: https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-05-18-bash-to-zsh-ubuntu/bash-to-zsh.png
    alt: Bash to Zsh
---

## Introduction
---
**Bash (Bourne Again Shell)** và **Zsh (Z Shell)** là 2 shell phổ biến trên Unix
Lợi ích của việc sử dụng **Zsh** thay cho **Bash**:
* Gợi ý lệnh đã sử dụng (**Command history**)
* Hỗ trợ **plugin framework** như: **Oh My Zsh**
* Không phân biệt chữ hoa và chữ thường

## Switching 
---
Mặc định, Ubuntu sử dụng Bash làm shell chính. Để thay đổi shell thành Zsh, cần tài về vài cấu hình một số thứ.

### Install Zsh
Tải zsh về thông qua **apt**
```bash
sudo apt install zsh
```

### Change Shell
Dùng lệnh sau để thay đổi shell mặc định của Ubuntu
```bash 
chsh -s $(which zsh)
```

Hoặc có thể thay đổi trực tiếp không thông qua **which**
```bash
chsh -s /usr/bin/zsh
```

Sau khi thay đổi cần khởi động lại hoặc đăng nhập lại để shell thay đổi.

### Create **.zshrc** File
Mở **Terminal** sau khi trở lại, recommended chọn option 2 để tạo file .zshrc
* .zshrc là một file ẩn nằm trong thư mục home của người dùng (~/.zshrc).
* Nó chứa các lệnh và thiết lập cấu hình được thực thi mỗi khi bạn mở một terminal mới với Zsh (interactive shell).
* Tương tự như .bashrc với Bash.

![Create .zshrc](https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-05-18-bash-to-zsh-ubuntu/startup.png)


## Change Theme
---
Mặc định giao diện khá xấu, nên sử dụng [Oh-my-zsh](https://ohmyz.sh/) để custom giao diện terminal.

### Install Git
Chạy lệnh sau nếu chưa có **git**
```zsh
sudo apt install git -y
```

### Install Oh-my-zsh
* Tải thông qua lệnh **curl**

```zsh
sudo sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

Chạy lệnh sau nếu chưa có **curl**
```zsh
sudo apt install curl -y
```

* Tải thông qua lệnh **wget**

```zsh
sudo sh -c "$(wget https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh -O -)"
```

Chạy lệnh sau nếu chưa có **wget**
```zsh
sudo apt install wget -y
```

Như này là đã tải thành công
![Installed Ohmyzsh](https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-05-18-bash-to-zsh-ubuntu/installed-zsh.png)

### Install Powerlever10k
Sử dụng **powerlever10k** để thay đổi **promt** của **terminal**.
```zsh
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git "${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k"
```

### Change Fonts
Cần thay đổi fonts để có thể sử dụng 1 số icons
[Download fonts](https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/fonts/posts/2025-05-18-bash-to-zsh-ubuntu/MesloLGS NF Regular.ttf)
* Di chuyển để thư mục **home**
* Ctrl + h để hiển thị file ẩn
* Tạo thư mục **.fonts** 
* Di chuyển font vừa tải vào **.fonts**

Thay đổi fonts của hệ thống
```zsh
sudo apt install gnome-tweaks -y
```
Vào Tweaks > Fonts > Monospace Text chọn font vừa tải

### Change Theme in .zshrc File
Thay đổi theme trong .zshrc
```zsh
nano ~/.zshrc
```
Thay đổi ZSH_THEME thành ZSH_THEME="powerlevel10k/powerlevel10k"

Chạy lệnh sau để khởi động lại file .zshrc
```zsh
source ~/,zshrc
```
Như này là đã thành công
![Successfull](https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-05-18-bash-to-zsh-ubuntu/success.png)

Bạn chỉ cần custom theo sở thích của mình

## Enable Command History Feature
---
Mặc định tính năng này không được bật, bạn cần phải tải thêm plugin về để sử dụng tính năng này
### Install zsh-autosuggestions
```zsh
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
```

### Change .zshrc file
```zsh
nano ~/.zshrc
```
Sửa hoặc thêm plugin này nếu chưa có: `plugins=(git zsh-autosuggestions)`

### Reload .zshrc
```zsh
source ~/.zshrc
```

Như này là đã ok rồi đấy.

---
Goodluck! 🍀🍀🍀