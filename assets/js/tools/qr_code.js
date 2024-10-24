/* Qr Code */
// Genarate
const btnGenerateQrCode = document.getElementById('btn-genarate-qr-code');
const btnCopyQrCode = document.getElementById('btn-copy-qr-code');
const btnDownloadQrCode = document.getElementById('btn-download-qr-code');
const inputQrCode = document.getElementById('qr-code-input');
const qrCodeImg = document.getElementById('qr-code-img');

btnGenerateQrCode.addEventListener('click', () => {
    const input = inputQrCode.value;
    if (input.trim()) {
        generalQRCode(input.trim());
    }
});

btnCopyQrCode.addEventListener('click', () => {
    copyQrCodeToClipBoard();
});

btnDownloadQrCode.addEventListener('click', () => {
    downloadQrCode();
});

/**
 * Generates a QR code.
 * @param {string} text - The text to encode into the QR code.
 */
function generalQRCode(text) {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1024x1024&data=${encodeURIComponent(text)}`;
    qrCodeImg.src = qrCodeUrl;
}

/**
 * Copies image to clipboard.
 */
async function copyQrCodeToClipBoard() {
    try {
        const img = qrCodeImg.src;
        const response = await fetch(img);
        const blob = await response.blob();
        const clipboardItem = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([clipboardItem]);
    } catch (err) {
        console.error(err.name, err.message);
    }
}

/**
 * Downloads the QR code as an image.
 */
function downloadQrCode() {
    const qrImg = document.getElementById('qr-code-img');
    const imgSrc = qrImg.src;

    fetch(imgSrc)
        .then(response => response.blob())
        .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'qr-code.png';
        link.click();
    })
    .catch(err => console.error('Lỗi khi tải ảnh QR:', err));
}

// Read
const dropZone = document.getElementById('drop-zone');
const qrCodeFileInput = document.getElementById('qr-code-file-input');
const btnCopyTextQrCode = document.getElementById('btn-copy-text-qr-code');

function readQrCode(file){
    const formData = new FormData()
    formData.append('file', file)
    fetch('https://api.qrserver.com/v1/read-qr-code/', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data && data[0].symbol[0].data) {
            const text = 'Nội dung mã QR Code: ' + data[0].symbol[0].data;
            console.log('tim thay');
            
        } else {
            console.error('Khong tim thay');
        }
    })
    .catch(error => {
        console.error('Lỗi:', error);
    });
}

dropZone.addEventListener('click', () => {
    qrCodeFileInput.click();
});

qrCodeFileInput.addEventListener('change', (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
        readQrCode(selectedFile)
    }
    console.log('Change');
});