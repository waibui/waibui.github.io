---
layout: blog
---

# Blog

## Fixed error PIP INSTALL: `externally-managed-environment` in Linux

### What is "error: externally-managed-environment"?

The externally-managed-environment error in Python occurs when you attempt to use pip to install packages in a Python environment that is managed by an external system, such as an operating system package manager or a bundled Python environment inside a specific application. The message simply tells you that the package won’t be installed, modified, or removed in this environment.

### Why does the “externally-managed-environment” error occur?

The latest versions of all Linux distributions implement the standards defined in PEP-668. These changes ensure that pip packages are not installed in the global context by default. This is done to avoid conflicts between the distribution's package manager and Python package management tools. You can read more in the [official PEP-668 documentation](https://peps.python.org/pep-0668/?ref=itsfoss.com). If you want to revert or override this mechanism, you can take three approaches.

### Solutions how to fix "error: externally-managed-environment"

Normally you can add this flag to ignore system notifications:
```bash
pip install <package_name> --break-system-packages
```

But this is disadvantageous when you use it multiple times, so just remove EXTERNALLY-MANAGED in `python package`, example:

```bash
rm /usr/lib/python3.xx/EXTERNALLY-MANAGED
```
Replace xx by your python version.
