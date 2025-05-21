---
title:  "Windows File Systems"
date: 2025-04-11 10:00:00 +0700
comments: true
description: Overview of file systems supported by Windows such as FAT32, exFAT, and NTFS, along with key security considerations when handling file system data.
categories: [Cybersecurity, Operating Systems]
toc: true
tags: [filesystem, windows]
image:
  path: https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-04-11-windows-file-system/window_file_system.png
  alt: Windows file system
---

## Introduction
---
**File system (hệ thống tập tin)** là cách mà hệ điều hành tổ chức, lưu trữ và truy xuất dữ liệu trên các thiết bị lưu trữ như ổ cứng, SSD, USB, thẻ nhớ,…

Trước khi sử dụng thiết bị lưu trữ, cần phải:
1. **Partition** (chia phân vùng)
2. **Format** (định dạng) với một hệ thống tập tin phù hợp.

## File Systems Supported by Windows
---

| File System           | Description |
|------------------------|-------------|
| **FAT16 / FAT32**     | Hệ thống đơn giản, hỗ trợ đa nền tảng. Bị giới hạn về kích thước file và phân vùng. Ít được dùng cho ổ cứng hiện nay. |
| **exFAT**             | Phù hợp cho USB/thẻ nhớ lớn. Không giới hạn kích thước file như FAT32. |
| **NTFS**              | Hệ thống tập tin chính của Windows. Hỗ trợ bảo mật, khôi phục lỗi, mã hóa, phân quyền,… |
| **HFS+**              | Dùng trên macOS. Windows không hỗ trợ trực tiếp, cần phần mềm thứ ba để đọc. |
| **EXT (EXT3/EXT4)**   | Dùng trên Linux. Windows không hỗ trợ trực tiếp, nhưng có thể đọc với phần mềm hỗ trợ. |
{:.inner-borders}

## Advantages of NTFS
---
- Hỗ trợ file và phân vùng có dung lượng rất lớn.
- Tương thích tốt với các hệ điều hành khác (với driver hỗ trợ).
- Tính năng nổi bật:
  - **Access control**: Phân quyền chi tiết đến từng file.
  - **Timestamps** (MACE): Modify, Access, Create, Entry Modified.
  - **File encryption**.
  - **File system recovery**.
{:.inner-borders}

## NTFS Partition Structure
---

| Component                | Role |
|--------------------------|------|
| **Partition Boot Sector** | 16 sector đầu chứa vị trí của MFT. 16 sector cuối là bản sao của boot sector. |
| **Master File Table (MFT)** | Ghi vị trí, thông tin, quyền truy cập của tất cả file và thư mục. |
| **System Files**         | Các file hệ thống ẩn, chứa thông tin về phân vùng và thuộc tính file. |
| **File Area**            | Vùng lưu trữ thực tế cho dữ liệu người dùng. |
{:.inner-borders}


## Security Considerations
---
- Format không xóa hoàn toàn dữ liệu → có thể khôi phục bằng công cụ chuyên dụng.
- Nên sử dụng **secure wipe** (xóa an toàn) để ghi đè nhiều lần và bảo đảm dữ liệu cũ không thể phục hồi.