/* Qr Code */
// Generate
const btnGenerateQrCode = document.getElementById('btn-genarate-qr-code');
const btnCopyQrCode = document.getElementById('btn-copy-qr-code');
const btnDownloadQrCode = document.getElementById('btn-download-qr-code');
const inputQrCode = document.getElementById('qr-code-input');
const qrCodeImg = document.getElementById('qr-code-img');

btnGenerateQrCode.addEventListener('click', () => {
    const input = inputQrCode.value;
    if (input.trim()) {
        generateQRCode(input.trim());
    }
});

inputQrCode.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const input = inputQrCode.value;
        if (input.trim()) {
            generateQRCode(input.trim());
        }
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
function generateQRCode(text) {
    $('#qr-code-img').empty();
    $('#qr-code-img').qrcode({
        text: text,
        width: 1024,
        height: 1024
    });
}

/**
 * Copies image to clipboard.
 */
async function copyQrCodeToClipBoard() {
    try {
        const canvas = document.querySelector('#qr-code-img canvas');
        if (!canvas) {
            throw new Error('No QR code generated');
        }
        canvas.toBlob(async (blob) => {
            const clipboardItem = new ClipboardItem({ [blob.type]: blob });
            await navigator.clipboard.write([clipboardItem]);
        });
    } catch (err) {
        console.error(err.name, err.message);
    }
}

/**
 * Downloads the QR code as an image.
 */
function downloadQrCode() {
    const canvas = document.querySelector('#qr-code-img canvas');
    if (canvas) {
        canvas.toBlob(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'qr-code.png';
            link.click();
        });
    } else {
        console.error('No QR code to download');
    }
}

// Read
const dropZone = document.getElementById('drop-zone');
const qrCodeFileInput = document.getElementById('qr-code-file-input');
const btnCopyTextQrCode = document.getElementById('btn-copy-text-qr-code');
let innerTextDrop = "";

function readQrCode(file) {
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const img = new Image();
        img.src = event.target.result;

        img.onload = function() {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height); 

            if (code) {
                innerTextDrop = code.data; 
                const text = 'Content: ' + innerTextDrop;
                dropZone.textContent = text; 
            } else {
                dropZone.textContent = "No QR code found!";
            }
        };
    };

    reader.readAsDataURL(file);
}

dropZone.addEventListener('click', () => {
    qrCodeFileInput.click();
});

qrCodeFileInput.addEventListener('change', (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
        readQrCode(selectedFile);
    }
});

dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.classList.add('drag-over'); 
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over'); 
});

dropZone.addEventListener('drop', (event) => {
    event.preventDefault(); 
    dropZone.classList.remove('drag-over'); 
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        readQrCode(files[0]);
    }
});

dropZone.addEventListener('paste', (event) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file') {
            const file = items[i].getAsFile();
            if (file) {
                readQrCode(file);
            }
        }
    }
});

btnCopyTextQrCode.addEventListener('click', () => {
    const textArea = document.createElement('textarea');
    textArea.value = innerTextDrop;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
});
