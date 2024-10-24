---
layout: tool
---

## Qr Code

<div>
  <label class="custom-field one">
    <input type="text" id="qr-code-input" placeholder=" "/>
    <span class="placeholder">Enter Text</span>
  </label>
  <button class="btn" id="btn-genarate-qr-code" style="float: right; margin-top: 5px;">Genarate</button>
</div>

***

### Genarated:
<img id="qr-code-img" src="/icon.png" alt="Qr Code">
<button class="btn" id="btn-copy-qr-code">Copy</button>
<button class="btn" id="btn-download-qr-code">Download</button>

***
### Read:
<div id="drop-zone" style="border: 2px dashed #ccc; padding: 20px; text-align: center;">
  Drop image here or paste from clipboard
</div>

<input type="file" id="qr-code-file-input" accept="image/*"/>
<button class="btn" id="btn-read-qr-code">Read QR Code</button>
<p id="qr-code-result"></p>

<script src="/assets/js/tools/qr_code.js"></script>
