---
layout: tool
---
<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>

## Qr Code

<div>
  <label class="custom-field one">
    <input type="text" id="hash-input" placeholder=" "/>
    <span class="placeholder">Enter Text</span>
  </label>
  <button class="btn" id="btn-generate" style="float: right; margin-top: 5px;">Genarate</button>
</div>

***

### Genarated:
<blockquote>
  <p>MD5: <span class="limited-text-width" id="md5"></span></p>

  <p>SHA-1: <span class="limited-text-width" id="sha1"></span></p>

  <p>SHA-256: <span class="limited-text-width" id="sha256"></span></p>

  <p>SHA-512: <span class="limited-text-width" id="sha512"></span></p>

  <p>RIPEMD-160: <span class="limited-text-width" id="ripemd160"></span></p>
</blockquote>


