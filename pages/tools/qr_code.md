---
layout: tool
---

## Qr Code

<div>
  <label class="custom-field one">
    <input type="text" id="qr-code-input" placeholder=" "/>
    <span class="placeholder">Enter Text</span>
  </label>
  <button class="btn" id="btn-genarate-qr-code" style="float: right; margin-top: 5px;">Generate</button>
</div>

***

### Generated:
<img id="qr-code-img" src="/icon.png" alt="Qr Code">
<button class="btn" id="btn-copy-qr-code">Copy</button>
<button class="btn" id="btn-download-qr-code">Download</button>

***

### Read:
<div>
    <div id="drop-zone">
        Drag & Drop or Browse
    </div>
    <input type="file" id="qr-code-file-input" style="display: none;" accept="image/*">
    <button class="btn" id="btn-scan-qr-code">Scan</button>
    <button class="btn" id="btn-copy-text-qr-code">Copy</button>
</div>

<script src="/assets/js/tools/qr_code.js"></script>

