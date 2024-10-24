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

// Camera QR Code Scanner using HTML5-QRCode
const btnScanCamera = document.getElementById('btn-scan-camera');
const cameraDropZone = document.getElementById('camera-scan-result');
const qrReaderDiv = document.getElementById('qr-reader');

btnScanCamera.addEventListener('click', () => {
    startCameraScanner();
});

function startCameraScanner() {
    const html5QrCode = new Html5Qrcode("qr-reader");

    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
        cameraDropZone.textContent = 'Content: ' + decodedText;
        html5QrCode.stop().then(() => {
            console.log("QR code scanning stopped.");
        }).catch(err => {
            console.error("Unable to stop scanning: ", err);
        });
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    html5QrCode.start(
        { facingMode: "environment" }, 
        config, 
        qrCodeSuccessCallback
    ).catch(err => {
        console.error("Error starting QR code scanning: ", err);
    });
}
