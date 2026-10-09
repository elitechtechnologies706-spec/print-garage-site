---
name: Desktop-mode navigation
description: Phone browsers in desktop-site mode must expose the desktop navigation
---

Account for phone browsers' desktop-site layout widths, not only full laptop widths, when choosing the desktop navigation breakpoint.

**Why:** The user reported that Chrome's desktop-site mode still hid the links. The previous desktop cutoff excluded a 980px layout viewport.

**How to apply:** Check the header at a 980px desktop-mode layout as well as normal phone and laptop widths. Keep header spacing and navigation visibility breakpoints coordinated so links remain usable without desktop dropdown icons.
