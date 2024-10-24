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