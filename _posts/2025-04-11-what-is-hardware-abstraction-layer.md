---
title:  "What is Hardware Abstraction Layer?"
date: 2025-04-11 10:00:00 +0700
comments: true
description: Hardware Abstraction Layer on Windows
categories: [introduce]
toc: true
tags: [analytics, windows]
image:
        path: /assets/img/posts/2025-04-11-what-is-hardware-abstraction-layer/layer-model.png
---

## Hardware Abstraction Layer (HAL)
HAL (tạm dịch: Lớp trừu tượng phần cứng) là một phần mềm trung gian giữa phần cứng của máy tính và hệ điều hành (chính xác là kernel – nhân hệ điều hành).

---
## Functions of HAL
💻 Phần cứng → 🧱 HAL → 🧠 Kernel (Nhân hệ điều hành) 
* Máy tính có thể có nhiều loại phần cứng khác nhau (mainboard, CPU, thiết bị ngoại vi…).
* HAL giúp hệ điều hành không cần biết chính xác phần cứng bên dưới là gì.
* HAL đảm nhận việc dịch các lệnh từ hệ điều hành thành ngôn ngữ phù hợp với phần cứng.

---
## Example
* Bạn cắm chuột vào máy tính.
* Hệ điều hành không trực tiếp điều khiển con chuột.
* Lệnh từ hệ điều hành đi qua HAL, rồi mới đến driver phần cứng, rồi đến chuột.

---
## How does the Kernel and HAL work?
* **Kernel**: Là phần cốt lõi của hệ điều hành, điều khiển mọi hoạt động (quản lý bộ nhớ, thiết bị, tiến trình…).
* **HAL**: Là lớp trung gian, giúp tách biệt phần cứng khỏi phần mềm.
* Trong một vài trường hợp đặc biệt, kernel có thể giao tiếp trực tiếp với phần cứng, nhưng vẫn dựa vào HAL cho phần lớn công việc.

---
## Conclusion

| Component | Role |
|------------|--------|
| Kernel     | Nhân hệ điều hành, điều khiển toàn bộ hệ thống |
| HAL        | Dịch và xử lý yêu cầu giữa kernel và phần cứng |
| Hardware   | Thiết bị vật lý như CPU, RAM, ổ cứng, chuột, bàn phím |
{:.inner-borders}