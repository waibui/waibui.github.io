---
title:  "Packet Sniffing On Windows And Linux"
date: 2025-03-18 10:00:00 +0700
comments: true
description: A practical guide to packet sniffing on both Windows and Linux using raw sockets in Python.
categories: [Cybersecurity, Networking]
toc: true
tags: [windows, linux, packet, sniffing]
image:
    path: /assets/img/posts/2025-03-18-packet-sniffing-on-windows-&-linux/packet_sniffing.png
---

## Overview
---
Packet sniffing là quá trình bắt và phân tích gói tin truyền qua mạng. Kỹ thuật này được sử dụng để giám sát lưu lượng mạng, phân tích lỗi, kiểm tra bảo mật hoặc thậm chí thực hiện các cuộc tấn công mạng. Trên Windows và Linux, việc triển khai packet sniffing có một số điểm khác biệt do cách xử lý raw sockets của từng hệ điều hành.

## What is Raw Sockets?
---
Raw sockets là loại socket cho phép truy cập trực tiếp vào gói tin ở mức thấp, bao gồm cả phần tiêu đề (header) và dữ liệu (payload). Điều này giúp lập trình viên có thể bắt, phân tích, và thậm chí tạo các gói tin tùy chỉnh.

Apply To:
* Giám sát và phân tích mạng (tương tự Wireshark)
* Phát hiện và khai thác lỗ hổng bảo mật
* Tạo công cụ tấn công mạng như ARP Spoofing, Man-in-the-Middle (MITM)
* Xây dựng tường lửa hoặc hệ thống phát hiện xâm nhập (IDS/IPS)

## Packet Sniffing on Windows
---
Trên Windows, raw sockets bị giới hạn, đặc biệt từ Windows 10 trở lên, do Microsoft vô hiệu hóa khả năng gửi gói tin tùy chỉnh nhằm ngăn chặn các cuộc tấn công mạng.

Step to Follows:
* Tạo raw socket với giao thức IPPROTO_IP
* Bật chế độ promiscuous mode bằng IOCTL (SIO_RCVALL)
* Bắt gói tin và phân tích dữ liệu
* Tắt promiscuous mode sau khi hoàn tất

## Packet Sniffing on Linux
---
Linux cung cấp nhiều quyền kiểm soát hơn đối với raw sockets so với Windows, giúp dễ dàng thực hiện packet sniffing.

Step to Follows:
* Tạo raw socket với giao thức IPPROTO_ICMP
* Bind socket vào giao diện mạng
* Nhận và phân tích gói tin

## Python Code Example
---
```python
import socket
import os

def create_sniffer():
    host = "192.168.1.13"
    print(f"[*] Listening on {host}")

    socket_protocol = socket.IPPROTO_IP if os.name == "nt" else socket.IPPROTO_ICMP

    try:
        sniffer = socket.socket(socket.AF_INET, socket.SOCK_RAW, socket_protocol)
        sniffer.bind((host, 0))
        sniffer.setsockopt(socket.IPPROTO_IP, socket.IP_HDRINCL, 1)

        if os.name == "nt":
            sniffer.ioctl(socket.SIO_RCVALL, socket.RCVALL_ON)

        return sniffer
    except socket.error as e:
        print(f"[!] Error creating socket: {e}")
        return None

def main():
    sniffer = create_sniffer()
    if sniffer:
        try:
            print("[*] Sniffing packets...")
            packet, addr = sniffer.recvfrom(65535)
            print(f"[*] Packet received from {addr}:")
            print(packet)

        except KeyboardInterrupt:
            print("\n[!] Stopping sniffer...")

        finally:
            if os.name == "nt":
                sniffer.ioctl(socket.SIO_RCVALL, socket.RCVALL_OFF)
            sniffer.close()
            print("[*] Sniffer stopped.")

if __name__ == "__main__":
    main()
```

## Explain Code
---
### Define IP Address and Create Socket
* Chương trình đặt biến HOST là địa chỉ IP của máy tính cục bộ.
* Sau đó, nó tạo một raw socket với tham số phù hợp để bắt gói tin từ card mạng.

```python
host = "192.168.1.13"  # Địa chỉ máy tính cục bộ
sniffer = socket.socket(socket.AF_INET, socket.SOCK_RAW, socket_protocol)
```

### Difference Between Windows and Linux
* Windows cho phép bắt tất cả các gói tin (TCP, UDP, ICMP, v.v.).
* Linux/macOS chỉ cho phép người dùng thông thường bắt gói ICMP (ping) trừ khi chạy bằng quyền root.

```python
socket_protocol = socket.IPPROTO_IP if os.name == "nt" else socket.IPPROTO_ICMP
```

### Promiscuous Mode and Requires Admin Privilege
* Promiscuous Mode là chế độ giúp card mạng bắt tất cả gói tin, ngay cả những gói không gửi đến máy của bạn.
* Cần quyền admin trên Windows hoặc root trên Linux để bật chế độ này.description: description: A practical guide to packet sniffing on both Windows and Linux using raw sockets in Python.
* Nếu không bật, chỉ có thể bắt gói tin dành riêng cho máy của bạn.

### Enable IP Header Option in Packet
* Khi nhận một gói tin, đôi khi hệ thống sẽ tự động loại bỏ phần tiêu đề IP (IP header).
* Để đảm bảo gói tin vẫn giữ header đầy đủ, cần dùng tùy chọn `IP_HDRINCL`.

```python
sniffer.setsockopt(socket.IPPROTO_IP, socket.IP_HDRINCL, 1)
```

### Enable Promiscuous Mode on Windows
* Windows cần gửi lệnh `IOCTL` để kích hoạt Promiscuous Mode.
* Lệnh này nói với driver của card mạng rằng phải bắt tất cả gói tin, thay vì chỉ những gói dành riêng cho máy.

```python
if os.name == "nt":
    sniffer.ioctl(socket.SIO_RCVALL, socket.RCVALL_ON)
```

* Trên Linux, không cần lệnh này vì `SOCK_RAW` đã đủ mạnh để bắt gói tin.

### Receive and Print Raw Packet Data
* Chương trình bắt gói tin và in ra dạng raw (chưa giải mã).
* Mục đích là kiểm tra xem sniffer có hoạt động đúng không.

```python
print(sniffer.recvfrom(65535))
```

* Sau khi chạy, chương trình sẽ in ra dữ liệu dạng byte (b'...').

```bash
(venv) ┌─[wai@wai]─[~/Documents/Project/Blackhat-python]
└──╼ $ ping 8.8.8.8 -c 4
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=118 time=24.4 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=118 time=26.9 ms
64 bytes from 8.8.8.8: icmp_seq=3 ttl=118 time=22.8 ms
64 bytes from 8.8.8.8: icmp_seq=4 ttl=118 time=25.0 ms

--- 8.8.8.8 ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3004ms
rtt min/avg/max/mdev = 22.785/24.765/26.928/1.482 ms
```

```bash
(venv) ┌─[wai@wai]─[~/Documents/Project/Blackhat-python]
└──╼ $ sudo python3 chapter_3/sniffer.py 
[*] Listening on 192.168.1.13
[*] Sniffing packets...
[*] Packet received from ('8.8.8.8', 0):
b'E \x00T\x00\x00\x00\x00v\x01r\xc4\x08\x08\x08\x08\xc0\xa8\x01\r\x00\x00\xe6\x05\x1d\xb4\x00\x01x\xd2\xd8g\x00\x00\x00\x00\xe07\x0c\x00\x00\x00\x00\x00\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f !"#$%&\'()*+,-./01234567' 
[*] Sniffer stopped.
```

### Disable Promiscuous Mode on Windows
* Sau khi bắt xong 1 gói tin, nếu đang chạy trên Windows, cần tắt chế độ Promiscuous Mode để tránh lỗi.

```python
if os.name == "nt":
    sniffer.ioctl(socket.SIO_RCVALL, socket.RCVALL_OFF)
```

[Blackhat Python Book](https://github.com/bhavyagoel/BlackArch/blob/main/Black%20Hat%20Python%2C%202nd%20Edition%20by%20Justin%20Seitz%20%20Tim%20Arnold%20%5BJustin%20Seitz%5D.pdf)

[Blackhat Python Code](https://github.com/EONRaider/blackhat-python3)