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

inputQrCode.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const input = inputQrCode.value;
        if (input.trim()) {
            generalQRCode(input.trim());
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
let innerTextDrop = "";

function readQrCode(file) {
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const img = new Image();
        img.src = event.target.result;

        img.onload = function() {
            // Tạo canvas để vẽ hình ảnh
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            // Đặt kích thước canvas bằng kích thước hình ảnh
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);

            // Lấy dữ liệu pixel từ canvas
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height); // Đọc mã QR

            if (code) {
                innerTextDrop = code.data; // Lưu dữ liệu
                const text = 'Content: ' + innerTextDrop;
                dropZone.textContent = text; // Hiển thị dữ liệu
            } else {
                dropZone.textContent = "No QR code found!";
            }
        };
    };

    reader.readAsDataURL(file); // Đọc tệp hình ảnh
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

// Thêm sự kiện dán vào drop zone
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
