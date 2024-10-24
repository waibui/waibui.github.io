const hashInput = document.getElementById('hash-input');
const btnGenerate = document.getElementById('btn-generate');

const hashElements = {
    md5: document.getElementById('md5'),
    sha1: document.getElementById('sha1'),
    sha256: document.getElementById('sha256'),
    sha512: document.getElementById('sha512'),
    ripemd160: document.getElementById('ripemd160')
};

btnGenerate.addEventListener('click', () => {
    const hash = hashInput.value.trim();
    if (hash) {
        hashElements.md5.textContent = CryptoJS.MD5(hash).toString();
        hashElements.sha1.textContent = CryptoJS.SHA1(hash).toString();
        hashElements.sha256.textContent = CryptoJS.SHA256(hash).toString();
        hashElements.sha512.textContent = CryptoJS.SHA512(hash).toString();
        hashElements.ripemd160.textContent = CryptoJS.RIPEMD160(hash).toString();
    }
});

function copyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
}

document.querySelectorAll('.copy').forEach(span => {
    span.addEventListener('click', () => {
        copyToClipboard(span.innerText);
        span.classList.add('copied'); 
        setTimeout(() => {
            span.classList.remove('copied'); 
        }, 2000);
    });
});
