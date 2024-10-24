/* QR Code Generation and File Scanning */
// Generate QR Code
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
    copyQrCodeToClipboard();
});

btnDownloadQrCode.addEventListener('click', () => {
    downloadQrCode();
});

function generateQRCode(text) {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1024x1024&data=${encodeURIComponent(text)}`;
    qrCodeImg.src = qrCodeUrl;
}

async function copyQrCodeToClipboard() {
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
    .catch(err => console.error('Error downloading QR code:', err));
}

// File QR Code Scanner
const dropZone = document.getElementById('drop-zone');
const qrCodeFileInput = document.getElementById('qr-code-file-input');
const btnCopyTextQrCode = document.getElementById('btn-copy-text-qr-code');
let innerTextDrop = "";

function readQrCode(file) {
    const formData = new FormData();
    formData.append('file', file);
    fetch('https://api.qrserver.com/v1/read-qr-code/', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data && data[0].symbol[0].data) {
            innerTextDrop = data[0].symbol[0].data;
            dropZone.textContent = 'Content: ' + innerTextDrop;
        } else {
            dropZone.textContent = "Please select a valid QR code!";
        }
    })
    .catch(error => {
        console.error(error);
    });
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

// Camera QR Code Scanner
const btnScanCamera = document.getElementById('btn-scan-camera');
const video = document.getElementById('video');
const cameraDropZone = document.getElementById('camera-scan-result');
let scanning = false;

btnScanCamera.addEventListener('click', async () => {
    if (scanning) {
        stopCamera();
    } else {
        await startCamera();
    }
});

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.srcObject = stream;
        video.setAttribute("playsinline", true);
        video.style.display = 'block';
        video.play();
        scanning = true;
        scanQRCodeFromCamera();
    } catch (err) {
        console.error("Error accessing camera: ", err);
    }
}

function stopCamera() {
    const stream = video.srcObject;
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
    }
    video.srcObject = null;
    video.style.display = 'none';
    scanning = false;
}

function scanQRCodeFromCamera() {
    if (!scanning) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const scanFrame = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const decoded = jsQR(imageData.data, canvas.width, canvas.height);

        if (decoded) {
            cameraDropZone.textContent = 'Content: ' + decoded.data;
            stopCamera();
        } else {
            requestAnimationFrame(scanFrame);
        }
    };

    requestAnimationFrame(scanFrame);
}

// Dynamically include jsQR library
if (!window.jsQR) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jsqr/1.4.0/jsQR.js';
    document.head.appendChild(script);
}
