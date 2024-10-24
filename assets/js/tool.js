/* Hash */
const hashInput = document.getElementById('hash-input');
const btnHash = document.getElementById('btn-hash');

const hashElements = {
    md5: document.getElementById('md5'),
    sha1: document.getElementById('sha1'),
    sha256: document.getElementById('sha256'),
    sha512: document.getElementById('sha512'),
    ripemd160: document.getElementById('ripemd160')
};

function hash(){
    const hash = hashInput.value.trim();
    if (hash) {
        hashElements.md5.textContent = CryptoJS.MD5(hash).toString();
        hashElements.sha1.textContent = CryptoJS.SHA1(hash).toString();
        hashElements.sha256.textContent = CryptoJS.SHA256(hash).toString();
        hashElements.sha512.textContent = CryptoJS.SHA512(hash).toString();
        hashElements.ripemd160.textContent = CryptoJS.RIPEMD160(hash).toString();
    }
}

btnHash.addEventListener('click', () => {
    hash()
});

hashInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') { 
        hash()
    }
});

function copyHashToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
}

document.querySelectorAll('.copy').forEach(span => {
    span.addEventListener('click', () => {
        copyHashToClipboard(span.innerText);
        span.classList.add('copied'); 
        setTimeout(() => {
            span.classList.remove('copied'); 
        }, 2000);
    });
});

/* Qr Code */
const btnGenerateQrCode = document.getElementById('btn-genarate-qr-code')
const btnCopyQrCode = document.getElementById('btn-copy-qr-code');
const btnDownloadQrCode = document.getElementById('btn-download-qr-code');
const inputQrCode = document.getElementById('qr-code-input');
const qrCodeImg = document.getElementById('qr-code-img');

btnGenerateQrCode.addEventListener('click', () => {
    const input = inputQrCode.value;
    if (input.trim()) {
        generalQRCode(input.trim())
    }
});

btnCopyQrCode.addEventListener('click', () =>{
    copyQrCodeToClipBoard()
});

/**
 * Generates a QR code.
 * @param {string} text - The text to encode into the QR code.
 */
function generalQRCode(text) {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1024x1024&data=${encodeURIComponent(text)}`;
    const img = document.getElementById('qr-code-img');
    img.src = qrCodeUrl;
}

/**
 * Copies image to clipboard.
 */
async function copyQrCodeToClipBoard() {
    try {
        const img = document.getElementById('qr-code-img').src;
        const response = await fetch(img);
        const blob = await response.blob();
        const clipboardItem = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([clipboardItem]);
    } catch (err) {
        console.error(err.name, err.message);
    }
}
