---
title:  "IP Header Explain"
date: 2025-03-18 10:00:00 +0700
comments: true
description: Detail about IP header
categories: [Cybersecurity, Networking]
toc: true
tags: [analytics, ipv4, protocol]
image:
    path: /assets/img/posts/2025-03-18-ip-header-explain/ip_header.png
---

## Overview
IP Header là phần tiêu đề của 1 gói tin IP(Internet Protocol) khi truyền đi trong mạng hay internet. Nó gồm nhiểu trường khác nhau, chứa các thông tin quan trọng để định tuyến và truyền dữ liệu qua mạng. Mỗi gói tin IP bao gồm 2 phần chính:
* IP Header
* Payload

---
## Components of IP Header
### Version
* Vị trí: Octec 0 (4 Bit đầu)
* Chức năng: Chỉ định phiên bản của IP packet.

| Giá trị | Phiên bản | Mô tả |
|---------|----------|--------|
| 4 | IPv4 | Phiên bản IP phổ biến nhất hiện nay |
| 6 | IPv6 | Phiên bản IP mới, cải thiện về không gian địa chỉ và bảo mật |
| 5 | ST (Internet Stream Protocol, RFC 1819) | Một giao thức thử nghiệm, không được sử dụng rộng rãi |
| 7-9 | Để dành | Dự trữ cho các mục đích tương lai |
| 10-15 | Không hợp lệ | Không được sử dụng chính thức |
{:.inner-borders}

### IHL (Internet Header Length)
* Vị trí: Octec 0 (Bit 4 -> Bit 7)
* Chức năng: Xác định kích thước của phần Header

Vì ở đây là 4 bit nên max value là 15(1111) nhưng min value lại là 5(0101)

#### Header size calculation formula
```bash
length(header) = IHL * 4
min(length(header)) = 5 * 4 = 20(bytes) // Header IPv4 chuẩn
max(length(header)) = 15 * 4 = 60(bytes) 
```

Nếu ở IHL=5 thì chỉ chứa Header IPv4 chuẩn, không có phần Option (giải thích ở dưới). Vì nó chỉ có 20 byte, bắt đầu từ byte 0 đến byte 19, quan sát hình ở trên bạn sẽ thấy rằng phần Option nó xuất hiện từ byte 20.

### TOS(Type of Service)
TOS (Type of Service) là một trường 8 bit trong IPv4 Header, được sử dụng để xác định ưu tiên và chất lượng dịch vụ của gói tin IP.
* Vị trí: Octec 1 (Bit 8 -> Bit 15)
* Chức năng: Được dùng để kiểm soát độ ưu tiên, độ trễ, thông lượng và độ tin cậy của gói tin.
* Bao gồm 2 thành phần chính: DSCP và ECN

#### DSCP (Differentiated Services Code Point)
DSCP (6 bit) là một phần của trường TOS, được sử dụng để phân loại mức độ ưu tiên của gói tin trong mạng.
* Vị trí: 6 bit đầu tiên của byte thứ 2 trong IPv4 header (Bit 8 -> Bit 13).
* Chức năng: Giúp các bộ định tuyến (router) ưu tiên xử lý một số gói tin nhất định (ví dụ: thoại, video, dữ liệu quan trọng).

| Tên                     |  Decimal | Binary  | Ứng dụng |
|-------------------------|----------------------|---------|------------|
| Default                 | 0                    | 000000  | Không ưu tiên |
| CS0 (Default)           | 0                    | 000000  | Lưu lượng bình thường |
| CS1 (Low-Priority Data) | 8                    | 001000  | Dữ liệu ít quan trọng |
| AF11                    | 10                   | 001010  | Assured Forwarding (Thấp) |
| AF21                    | 18                   | 010010  | Assured Forwarding (Trung bình) |
| AF31                    | 26                   | 011010  | Assured Forwarding (Cao) |
| AF41                    | 34                   | 100010  | Assured Forwarding (Rất cao) |
| EF (Expedited Forwarding) | 46                | 101110  | Lưu lượng quan trọng (VoIP, Video) |
| CS5 (Video)             | 40                   | 101000  | Streaming Video |
| CS6 (Network Control)   | 48                   | 110000  | Gói tin điều khiển mạng (OSPF, BGP) |
| CS7 (Reserved)          | 56                   | 111000  | Dự trữ |
{:.inner-borders}

####  ECN (Explicit Congestion Notification) 
ECN là một cơ chế giúp phát hiện và kiểm soát tắc nghẽn mạng mà không cần drop (hủy bỏ) gói tin.
* Vị trí: ECN là 2 bit cuối cùng của byte DSCP/ECN trong IP Header (Bit 14 -> Bit 15).
* Ứng dụng: Hỗ trợ kiểm soát tắc nghẽn trong TCP/IP mà không mất gói tin.

| ECN Value | Binary | Ý nghĩa |
|-----------|--------|---------|
| 00        | 00     | Not-ECT (Non-ECN Capable Transport) – Không hỗ trợ ECN |
| 01        | 01     | ECT(1) (ECN-Capable Transport 1) – Hỗ trợ ECN |
| 10        | 10     | ECT(0) (ECN-Capable Transport 0) – Hỗ trợ ECN |
| 11        | 11     | CE (Congestion Experienced) – Xác nhận tắc nghẽn |

### Total Length
Total Length là một trường 16-bit trong IP Header.
* Vị trí: Thuộc byte 2 và 3 (Bit 16 -> Bit 31).
* Úng dụng: Biểu thị tổng kích thước của toàn bộ gói tin IP, bao gồm Header và Payload (dữ liệu).
* Giá trị tối thiểu: 20 bytes (khi chỉ có IP Header, không có dữ liệu).
* Giá trị tối đa: 65,535 bytes (giới hạn bởi kích thước 16-bit).

#### Formula for calculating Total Length
```bash
Total Length=IP Header Length+Payload Length
```

Nếu Total Length > MTU (Maximum Transmission Unit), gói tin sẽ bị chia nhỏ (fragmentation)

| Kích thước (Byte)  | Ý nghĩa |
|-------------------|----------------------------------|
| 20 - 1,500       | Kích thước phổ biến trong mạng Ethernet (MTU = 1500 bytes). |
| 1,500 - 65,535   | Yêu cầu phân mảnh do vượt quá MTU. |
| > 65,535         | Không hợp lệ trong IPv4. |
{:.inner-borders}

### Identification
Identification (ID) là một trường 16-bit trong IP Header.
* Vị trí: Thuộc byte 4 và 5 (Bit 31 -> Bit 47).
* Úng dụng: Dùng để xác định từng gói tin IP riêng lẻ. Khi một gói tin bị phân mảnh, tất cả các mảnh sẽ có cùng ID để bộ thu có thể ghép lại đúng thứ tự.

### Flags (3) + Fragment Offset (13)
Flags + Fragment Offset là một trường 16-bit trong IP Header.
* Vị trí: Nằm ở byte 6 và 7.

#### Flag
* Vị trí: 3 bit đầu của byte 6 (Bit 48 -> Bit 50).
* Ứng dụng: Flags giúp xác định xem gói tin có bị phân mảnh hay không.

| Bit  | Tên                  | Ý nghĩa |
|------|----------------------|------------------------------------------------|
| Bit 0 | Reserved            | Luôn bằng 0 (Không sử dụng). |
| Bit 1 | DF (Don't Fragment) | 1 = Không phân mảnh gói tin.<br>0 = Cho phép phân mảnh. |
| Bit 2 | MF (More Fragments) | 1 = Còn nhiều mảnh phía sau.<br>0 = Đây là mảnh cuối cùng. |
{:.inner-borders}

#### Fragment Offset
* Vị trí: 13 bit sau của byte 6 (Bit 51 -> Bit 63)
* Úng dụng: Xác định vị trí của mảnh hiện tại trong gói tin gốc.

| Giá trị | Ý nghĩa |
|---------|-------------------------------------------------|
| 0       | Mảnh đầu tiên của gói tin. |
| n       | Độ dời (offset) của mảnh so với gói tin gốc (tính theo đơn vị 8 byte). |
{:.inner-borders}

* Offset được tính theo 8-byte:
Nếu Offset = 100, thì vị trí thực = 100 × 8 = 800 bytes.
Mảnh đầu tiên luôn có Offset = 0.

---

### TTL (Time to Live)
TTL là một trường 8-bit, nằm ở Byte 8 trong IP Header.
* Vị trí: Byte 8 (Bit 64 -> Bit 71)
* Ứng dụng: Giới hạn tuổi thọ của một gói tin trong mạng bằng cách giảm dần mỗi khi nó đi qua một router.

#### How TTL Works
1. Khi gói tin được gửi đi, TTL được thiết lập với một giá trị nhất định (thường là 64, 128, hoặc 255).
2. Mỗi lần gói tin đi qua một router, TTL bị giảm 1.
3. Nếu TTL giảm xuống 0, gói tin bị loại bỏ và router gửi về một ICMP Time Exceeded.

#### Applications of TTL
* Ngăn chặn vòng lặp mạng: Tránh việc gói tin bị lặp vô hạn nếu có lỗi định tuyến.
* Kiểm soát thời gian sống của gói tin: Đảm bảo gói tin không tồn tại mãi trong mạng.
* Công cụ Traceroute: Dựa vào TTL để xác định đường đi của gói tin qua các router.

#### Common TTL values ​​by operating system

| Hệ điều hành  | Giá trị TTL mặc định |
|--------------|----------------------|
| Windows      | 128                  |
| Linux/Unix   | 64                   |
| macOS        | 64                   |
| Cisco        | 255                  |
{:.inner-borders}

---

### Protocol
Protocol là một trường 8-bit
* Vị trí: Byte 9 (Bit 72 -> Bit 79)
* Úng dụng: Xác định giao thức lớp trên mà IP sẽ chuyển tiếp gói tin đến, ví dụ như TCP, UDP, ICMP...

#### Some common values ​​of Protocol

| Giá trị | Giao thức | Mô tả |
|---------|----------|-------------------------------|
| 1       | ICMP     | Giao thức điều khiển, thường dùng trong ping. |
| 6       | TCP      | Giao thức hướng kết nối, dùng trong HTTP, FTP. |
| 17      | UDP      | Giao thức không kết nối, dùng trong DNS, VoIP. |
| 41      | IPv6     | Đóng gói IPv6 trong IPv4. |
| 47      | GRE      | Giao thức đóng gói, dùng trong VPN. |
| 50      | ESP      | Mã hóa dữ liệu trong IPSec VPN. |
| 51      | AH       | Xác thực gói tin trong IPSec VPN. |
| 89      | OSPF     | Giao thức định tuyến nội bộ. |
| 132     | SCTP     | Giao thức truyền tải thay thế TCP, hỗ trợ đa luồng. |
{:.inner-borders}

---

### Header Checksum
Header Checksum là một trường 16-bit
* Vị trí: Nằm ở Byte 10 và 11 (Bit 80 -> Bit 95).
* Ứng dụng: Header Checksum là một giá trị kiểm tra lỗi, giúp xác định xem header của gói tin IP có bị lỗi trong quá trình truyền hay không.

#### How it works
1. Trước khi gửi đi, bộ gửi tính toán checksum dựa trên toàn bộ IP Header.
2. Khi nhận gói tin, bộ nhận tính toán lại checksum và so sánh với giá trị checksum trong header.
* Nếu khớp, gói tin không bị lỗi.
* Nếu khác, gói tin bị lỗi và sẽ bị loại bỏ hoặc yêu cầu gửi lại.

### Source IP Address
* Vị trí: Nằm ở Byte 12 - 15 (Bit 96 -> Bit 127)
* Ứng dụng: Trường này chứa địa chỉ IP nguồn, tức là địa chỉ của thiết bị gửi gói tin.

### Destination IP Address
* Vị trí: Nằm ở Byte 16 - 19 (Bit 128 - Bit 159)
* Ứng dung: Destination IP Address chứa địa chỉ IP đích, tức là thiết bị nhận gói tin.

### Option
* Vị trí: Trường Option trong IP Header có kích thước biến đổi và chỉ xuất hiện khi IHL > 5 (tức là header lớn hơn 20 bytes). Nếu không có Option, IP Header mặc định có 20 bytes. Nếu có Option, tổng kích thước header có thể lên tới 60 bytes.
* Ứng dụng: Trường Option được dùng để thêm thông tin tùy chọn vào gói tin (gỡ lỗi, kiểm tra mạng, bảo mật, quản lý mạng, ...)

| Loại Option              | Mã (Decimal) | Mô tả |
|--------------------------|-------------|-------------------------------|
| No Operation (NOP)       | 1           | Giữ khoảng trống, không có tác dụng. |
| Record Route (RR)        | 7           | Lưu lại địa chỉ các router mà gói tin đi qua. |
| Timestamp                | 68          | Ghi lại thời gian tại mỗi router. |
| Strict Source Routing (SSR) | 137     | Chỉ định đường đi cố định của gói tin. |
| Loose Source Routing (LSR) | 131     | Đề xuất đường đi, có thể thay đổi nếu cần. |
| Router Alert             | 148         | Báo hiệu gói tin cần xử lý đặc biệt. |
{:.inner-borders}

---
## Code 
```python
import socket
import os
import struct

from ctypes import *

HOST = "192.168.1.13"

class IP(Structure):
    _fields_ = [
        ("ihl", c_ubyte, 4),
        ("version", c_ubyte, 4),
        ("tos", c_ubyte),
        ("len", c_ushort),
        ("id", c_ushort),
        ("offset", c_ushort),
        ("ttl", c_ubyte),
        ("protocol_num", c_ubyte),
        ("sum", c_ushort),
        ("src", c_uint32),
        ("dst", c_uint32)
    ]
    
    def __new__(cls, socket_buffer=None):
        return cls.from_buffer_copy(socket_buffer)
    
    def __init__(self, socket_buffer=None):
        self.socket_buffer = socket_buffer
        
        self.protocol_map = {1:"ICMP", 6:"TCP", 17:"UDP"}
        
        self.src_address = socket.inet_ntoa(struct.pack("@I", self.src))
        self.dst_address = socket.inet_ntoa(struct.pack("@I", self.dst))
        
        try:
            self.protocol = self.protocol_map[self.protocol_num]
        except IndexError:
            self.protocol = str(self.protocol_num)
        
class ICMP(Structure):
    _fields_ = [
        ("type", c_ubyte),
        ("code", c_ubyte),
        ("checksum", c_ushort),
        ("unused", c_ushort),
        ("next_hop_mtu", c_ushort),
    ]
    
    def __new__(cls, socket_buffer=None):
        return cls.from_buffer_copy(socket_buffer)
    
    def __init__(self, socket_buffer=None):
        self.socket_buffer = socket_buffer
        
socket_protocol = socket.IPPROTO_IP if os.name == "nt" else socket.IPPROTO_ICMP

sniffer = socket.socket(socket.AF_INET, socket.SOCK_RAW, socket_protocol)

sniffer.bind((HOST, 0))

sniffer.setsockopt(socket.IPPROTO_IP, socket.IP_HDRINCL, 1)

if os.name == "nt":
    sniffer.ioctl(socket.SIO_RCVALL, socket.RCVALL_ON)
    
try:
    while True:
        raw_buffer = sniffer.recvfrom(65535)[0]
        ip_header = IP(raw_buffer[0:20])
        
        print("Protocol: %s %s -> %s" % (
            ip_header.protocol,
            ip_header.src_address,
            ip_header.dst_address
            )
        )
        
        if ip_header.protocol == "ICMP":
            offset = ip_header.ihl * 4
            buf = raw_buffer[offset:offset+sizeof(ICMP)]
            
            icmp_header = ICMP(buf)
            print("ICMP -> Type: %d Code: %d" % (
                icmp_header.type,
                icmp_header.code
                )
            )
            
except KeyboardInterrupt:
    if os.name == "nt":
        sniffer.ioctl(socket.SIO_RCVALL, socket.RCVALL_OFF)
```

### Overview
Đoạn code này là một **sniffer** (bộ thu thập gói tin) đơn giản được viết bằng Python. Nó sử dụng **Raw Socket** để bắt các gói tin trên một địa chỉ IP cụ thể (`192.168.1.13`).  
Code có khả năng phân tích tiêu đề của các gói tin IP và ICMP.

### Libraries used
- `socket`: Hỗ trợ làm việc với socket mạng.
- `os`: Kiểm tra hệ điều hành (Windows hoặc Linux).
- `struct`: Hỗ trợ xử lý dữ liệu nhị phân.
- `ctypes`: Định nghĩa cấu trúc dữ liệu ở cấp thấp.

### IP Layer - IP Header Analysis
Lớp IP dùng để biểu diễn tiêu đề của gói tin IP.

```python
class IP(Structure):
    _fields_ = [
        ("ihl", c_ubyte, 4),  # Độ dài phần header IP
        ("version", c_ubyte, 4),  # Phiên bản IP (IPv4 hoặc IPv6)
        ("tos", c_ubyte),  # Type of Service
        ("len", c_ushort),  # Độ dài tổng cộng của gói tin
        ("id", c_ushort),  # ID của gói tin
        ("offset", c_ushort),  # Phân mảnh
        ("ttl", c_ubyte),  # Thời gian sống (Time To Live)
        ("protocol_num", c_ubyte),  # Giao thức (ICMP, TCP, UDP)
        ("sum", c_ushort),  # Checksum
        ("src", c_uint32),  # Địa chỉ nguồn
        ("dst", c_uint32)  # Địa chỉ đích
    ]
```
* **__new__()**: Tạo đối tượng từ dữ liệu nhị phân.
* **__init__()**: Trích xuất địa chỉ nguồn và đích từ dữ liệu IP.

### The ICMP class represents the header of an ICMP packet
```python
class ICMP(Structure):
    _fields_ = [
        ("type", c_ubyte),  # Loại ICMP (Echo Request, Echo Reply, ...)
        ("code", c_ubyte),  # Mã lỗi (nếu có)
        ("checksum", c_ushort),  # Checksum để kiểm tra lỗi
        ("unused", c_ushort),
        ("next_hop_mtu", c_ushort),
    ]
```

### Create socket raw
```python
socket_protocol = socket.IPPROTO_IP if os.name == "nt" else socket.IPPROTO_ICMP
sniffer = socket.socket(socket.AF_INET, socket.SOCK_RAW, socket_protocol)
sniffer.bind((HOST, 0))
sniffer.setsockopt(socket.IPPROTO_IP, socket.IP_HDRINCL, 1)
```

* Raw Socket được sử dụng để bắt gói tin thô.
* Windows: Dùng IPPROTO_IP, Linux: Dùng IPPROTO_ICMP.
* IP_HDRINCL = 1: Bao gồm tiêu đề IP trong dữ liệu nhận được.

### Packet capture
```python
while True:
    raw_buffer = sniffer.recvfrom(65535)[0]
    ip_header = IP(raw_buffer[0:20])
    
    print("Protocol: %s %s -> %s" % (
        ip_header.protocol,
        ip_header.src_address,
        ip_header.dst_address
        )
    )
```

* Nhận dữ liệu từ socket.
* Giải mã tiêu đề IP để lấy giao thức, địa chỉ nguồn và đích.

### ICMP packet processing
```python
if ip_header.protocol == "ICMP":
    offset = ip_header.ihl * 4
    buf = raw_buffer[offset:offset+sizeof(ICMP)]
    
    icmp_header = ICMP(buf)
    print("ICMP -> Type: %d Code: %d" % (
        icmp_header.type,
        icmp_header.code
        )
    )
```

* Nếu gói tin là ICMP, trích xuất tiêu đề ICMP và in ra type và code.
* IHL=5 ở đây sẽ là 5, nên Header Length là 20 byte, không chứa phần `Option`
* Vị trí của gói tin ICMP bắt đầu từ Byte thứ 20, mở rộng đến `+ sizeof(ICMP)`

### Program Interrupt Handling
```python
except KeyboardInterrupt:
    if os.name == "nt":
        sniffer.ioctl(socket.SIO_RCVALL, socket.RCVALL_OFF)
```

* Khi nhấn Ctrl + C, nếu trên Windows, tắt chế độ promiscuous mode (RCVALL_OFF).

### Result
#### Ping
```bash
(venv) ┌─[wai@wai]─[~/Documents/Project/Blackhat-python]
└──╼ $ ping -c 4 8.8.8.8
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=118 time=27.0 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=118 time=38.4 ms
64 bytes from 8.8.8.8: icmp_seq=3 ttl=118 time=25.2 ms
64 bytes from 8.8.8.8: icmp_seq=4 ttl=118 time=26.4 ms

--- 8.8.8.8 ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3003ms
rtt min/avg/max/mdev = 25.198/29.237/38.354/5.302 ms
```

#### Sniffing
```bash
(venv) ┌─[wai@wai]─[~/Documents/Project/Blackhat-python]
└──╼ $ sudo python3 chapter_3/sniffer_with_icmp.py 
Protocol: ICMP 8.8.8.8 -> 192.168.1.13
ICMP -> Type: 0 Code: 0
Protocol: ICMP 8.8.8.8 -> 192.168.1.13
ICMP -> Type: 0 Code: 0
Protocol: ICMP 8.8.8.8 -> 192.168.1.13
ICMP -> Type: 0 Code: 0
Protocol: ICMP 8.8.8.8 -> 192.168.1.13
ICMP -> Type: 0 Code: 0
```