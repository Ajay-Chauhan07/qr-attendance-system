// QR Code Handling for Faculty and Students

// Generate a shareable URL for mobile devices
function generateShareableUrl(qrData) {
    // For production: Replace with your actual domain
    // return "https://yourdomain.com/student/scan-attendance.html?data=" + encodeURIComponent(JSON.stringify(qrData));
    
    // For local testing - creates a data URL that shows the QR content
    const jsonData = JSON.stringify(qrData, null, 2);
    return `data:text/html,<html>
        <head>
            <title>Attendance QR</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                pre { background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
                button { background: #4CAF50; color: white; border: none; padding: 10px 15px; border-radius: 5px; margin-top: 10px; cursor: pointer; }
            </style>
        </head>
        <body>
            <h2>Attendance QR Data</h2>
            <p>In production, this would redirect to attendance submission.</p>
            <pre>${jsonData}</pre>
            <button onclick="window.location.href='${window.location.origin}/student/scan-attendance.html?data=${encodeURIComponent(JSON.stringify(qrData))}'">
                Continue to Attendance
            </button>
            <script>
                // Auto-redirect if on mobile
                if(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                    window.location.href='${window.location.origin}/student/scan-attendance.html?data=${encodeURIComponent(JSON.stringify(qrData))}';
                }
            </script>
        </body>
    </html>`;
}

// Faculty QR Generation
if (document.getElementById('qrForm')) {
    document.getElementById('qrForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const subject = document.getElementById('subject').value;
        const classTime = document.getElementById('classTime').value;
        const duration = document.getElementById('duration').value;
        
        if (!subject || !classTime || !duration) {
            alert('Please fill all fields');
            return;
        }
        
        const qrData = {
            subject,
            classTime,
            duration,
            facultyId: localStorage.getItem('userId'),
            timestamp: new Date().toISOString()
        };
        
        const shareableUrl = generateShareableUrl(qrData);
        const qrCodeElement = document.getElementById('qrcode');
        qrCodeElement.innerHTML = '';
        
        new QRCode(qrCodeElement, {
            text: shareableUrl,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        document.getElementById('qrResult').classList.remove('hidden');
        
        // Download button
        document.getElementById('downloadBtn').onclick = function() {
            const canvas = qrCodeElement.querySelector('canvas');
            if (canvas) {
                const link = document.createElement('a');
                link.download = `attendance-${subject}-${new Date(classTime).toLocaleDateString()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
        };
        
        // Share button
        document.getElementById('shareBtn').onclick = function() {
            if (navigator.share) {
                navigator.share({
                    title: `Attendance for ${subject}`,
                    text: `Submit attendance for ${subject}`,
                    url: shareableUrl
                }).catch(err => {
                    console.log('Error sharing:', err);
                    copyToClipboard(shareableUrl);
                });
            } else {
                copyToClipboard(shareableUrl);
                alert('Link copied to clipboard:\n' + shareableUrl);
            }
        };
        
        function copyToClipboard(text) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
    });
}

// Student QR Scanning
if (document.getElementById('startScanBtn')) {
    let videoStream = null;
    let scanningInterval = null;
    
    document.getElementById('startScanBtn').addEventListener('click', startScanning);
    document.getElementById('stopScanBtn').addEventListener('click', stopScanning);
    document.getElementById('submitAttendanceBtn').addEventListener('click', submitAttendance);
    
    function startScanning() {
        const cameraSelect = document.getElementById('cameraSelect');
        const selectedCameraId = cameraSelect.value;
        
        if (!selectedCameraId) {
            alert('Please select a camera');
            return;
        }
        
        const video = document.getElementById('video');
        const constraints = {
            video: {
                deviceId: { exact: selectedCameraId },
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                videoStream = stream;
                video.srcObject = stream;
                video.play();
                
                document.getElementById('startScanBtn').classList.add('hidden');
                document.getElementById('stopScanBtn').classList.remove('hidden');
                document.getElementById('scanRegion').style.display = 'block';
                
                scanningInterval = setInterval(scanQR, 500);
            })
            .catch(err => {
                console.error('Error accessing camera:', err);
                alert('Camera access error: ' + err.message);
            });
    }
    
    function stopScanning() {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            videoStream = null;
        }
        
        if (scanningInterval) {
            clearInterval(scanningInterval);
            scanningInterval = null;
        }
        
        const video = document.getElementById('video');
        video.srcObject = null;
        
        document.getElementById('startScanBtn').classList.remove('hidden');
        document.getElementById('stopScanBtn').classList.add('hidden');
        document.getElementById('scanRegion').style.display = 'none';
    }
    
    function scanQR() {
        const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');
        
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            
            if (code) {
                processScannedQR(code.data);
            }
        }
    }
    
    function processScannedQR(data) {
        try {
            const qrData = JSON.parse(data);
            
            if (!qrData.subject || !qrData.classTime) {
                throw new Error('Invalid QR code');
            }
            
            const expiryTime = new Date(qrData.classTime);
            expiryTime.setMinutes(expiryTime.getMinutes() + parseInt(qrData.duration));
            
            if (new Date() > expiryTime) {
                throw new Error('QR code expired');
            }
            
            stopScanning();
            showScanResult(qrData, expiryTime);
            
        } catch (err) {
            alert('Error: ' + err.message);
            console.error('QR processing error:', err);
        }
    }
    
    function showScanResult(qrData, expiryTime) {
        document.getElementById('scanResult').classList.remove('hidden');
        document.getElementById('subjectName').textContent = qrData.subject;
        document.getElementById('professorName').textContent = 'Faculty ID: ' + qrData.facultyId;
        document.getElementById('classTime').textContent = new Date(qrData.classTime).toLocaleString();
        document.getElementById('validUntil').textContent = expiryTime.toLocaleString();
        document.getElementById('submitAttendanceBtn').setAttribute('data-qr', JSON.stringify(qrData));
    }
    
    function submitAttendance() {
        const qrData = JSON.parse(document.getElementById('submitAttendanceBtn').getAttribute('data-qr'));
        const studentId = localStorage.getItem('userId');
        
        // Show loading state
        const btn = document.getElementById('submitAttendanceBtn');
        btn.disabled = true;
        btn.innerHTML = 'Submitting...';
        
        // Simulate API call
        setTimeout(() => {
            alert(`Attendance submitted for ${qrData.subject}`);
            window.location.href = 'dashboard.html';
        }, 1000);
    }
}