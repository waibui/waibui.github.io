---
layout: tool
---
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.qrcode/1.0/jquery.qrcode.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsqr.min.js"></script>


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
<div>
    <div id="drop-zone">
    Drag & Drop or Browse
    </div>
    <input type="file" id="qr-code-file-input" style="display: none;" accept="image/*">
    <button class="btn" id="btn-copy-text-qr-code">Copy</button>
</div>

<script src="/assets/js/tools/qr_code.js"></script>
