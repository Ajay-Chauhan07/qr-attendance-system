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

// Enhanced QR Code Handling with Mobile Support
class QRSystem {
  constructor() {
    this.videoStream = null;
    this.scanningInterval = null;
    this.init();
  }

  init() {
    // Initialize based on page
    if (document.getElementById('qrForm')) this.initFacultyQR();
    if (document.getElementById('startScanBtn')) this.initStudentQR();
  }

  // ================= FACULTY FUNCTIONS =================
  initFacultyQR() {
    document.getElementById('qrForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.generateQRCode();
    });
  }

  generateQRCode() {
    const subject = document.getElementById('subject').value;
    const classTime = document.getElementById('classTime').value;
    const duration = document.getElementById('duration').value;

    if (!subject || !classTime || !duration) {
      this.showToast('Please fill all fields', 'error');
      return;
    }

    const qrData = {
      subject,
      classTime,
      duration,
      facultyId: localStorage.getItem('userId'),
      timestamp: new Date().toISOString()
    };

    const shareableUrl = this.generateShareableUrl(qrData);
    this.displayQRCode(shareableUrl, subject, classTime);
  }

  generateShareableUrl(qrData) {
    // In production: return `https://yourdomain.com/student/scan-attendance.html?data=${encodeURIComponent(JSON.stringify(qrData))}`;
    
    // For development demo:
    return `data:text/html,<html>
      <head>
        <title>Attendance QR</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
          .qr-data { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left; }
          button { background: #4CAF50; color: white; border: none; padding: 12px 20px; border-radius: 6px; margin: 10px; cursor: pointer; }
          .container { max-width: 500px; margin: 0 auto; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Attendance QR Code</h2>
          <p>In production, this would redirect to attendance submission</p>
          <div class="qr-data">
            <p><strong>Subject:</strong> ${qrData.subject}</p>
            <p><strong>Time:</strong> ${new Date(qrData.classTime).toLocaleString()}</p>
            <p><strong>Valid for:</strong> ${qrData.duration} minutes</p>
          </div>
          <button onclick="window.location.href='${window.location.origin}/student/scan-attendance.html?data=${encodeURIComponent(JSON.stringify(qrData))}'">
            Continue to Attendance
          </button>
          <script>
            // Auto-redirect on mobile
            if(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
              window.location.href='${window.location.origin}/student/scan-attendance.html?data=${encodeURIComponent(JSON.stringify(qrData))}';
            }
          </script>
        </div>
      </body>
    </html>`;
  }

  displayQRCode(url, subject, classTime) {
    const qrCodeElement = document.getElementById('qrcode');
    qrCodeElement.innerHTML = '';
    
    new QRCode(qrCodeElement, {
      text: url,
      width: 220,
      height: 220,
      colorDark: "#1E40AF",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });

    // Animate appearance
    qrCodeElement.style.opacity = 0;
    setTimeout(() => {
      qrCodeElement.style.transition = 'opacity 0.5s ease';
      qrCodeElement.style.opacity = 1;
    }, 100);

    this.setupQRControls(url, subject, classTime);
  }

  setupQRControls(url, subject, classTime) {
    const qrResult = document.getElementById('qrResult');
    qrResult.classList.remove('hidden');
    qrResult.style.opacity = 0;
    setTimeout(() => {
      qrResult.style.transition = 'opacity 0.5s ease';
      qrResult.style.opacity = 1;
    }, 100);

    // Download button
    document.getElementById('downloadBtn').onclick = () => {
      const canvas = document.querySelector('#qrcode canvas');
      if (canvas) {
        const link = document.createElement('a');
        link.download = `attendance-${subject}-${new Date(classTime).toLocaleDateString()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        this.showToast('QR code downloaded', 'success');
      }
    };

    // Share button
    document.getElementById('shareBtn').onclick = () => {
      if (navigator.share) {
        navigator.share({
          title: `Attendance for ${subject}`,
          text: `Submit attendance for ${subject} class`,
          url: url
        }).catch(err => {
          this.copyToClipboard(url);
        });
      } else {
        this.copyToClipboard(url);
      }
    };
  }

  // ================= STUDENT FUNCTIONS =================
  initStudentQR() {
    this.setupCameraSelection();
    
    document.getElementById('startScanBtn').addEventListener('click', () => this.startScanning());
    document.getElementById('stopScanBtn').addEventListener('click', () => this.stopScanning());
    document.getElementById('submitAttendanceBtn').addEventListener('click', () => this.submitAttendance());
    document.getElementById('tryAgainBtn').addEventListener('click', () => this.resetScanner());
    
    // Handle camera selection changes
    document.getElementById('cameraSelect').addEventListener('change', () => {
      if (this.videoStream) {
        this.stopScanning();
      }
    });
  }

  async setupCameraSelection() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const cameraSelect = document.getElementById('cameraSelect');
      
      // Clear existing options
      cameraSelect.innerHTML = '<option value="">Select Camera</option>';
      
      videoDevices.forEach((device, index) => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.text = device.label || `Camera ${index + 1}`;
        cameraSelect.appendChild(option);
      });
      
      // Auto-select back camera if available
      if (videoDevices.length > 1) {
        const backCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear')
        );
        if (backCamera) {
          cameraSelect.value = backCamera.deviceId;
        }
      }
    } catch (err) {
      console.error('Camera enumeration error:', err);
      this.showToast('Could not access camera devices', 'error');
    }
  }

  async startScanning() {
    const cameraSelect = document.getElementById('cameraSelect');
    const selectedCameraId = cameraSelect.value;
    
    if (!selectedCameraId) {
      this.showToast('Please select a camera', 'error');
      return;
    }

    try {
      const video = document.getElementById('video');
      const constraints = {
        video: {
          deviceId: { exact: selectedCameraId },
          facingMode: selectedCameraId ? undefined : 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      this.videoStream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = this.videoStream;
      await video.play();

      // UI Updates
      document.getElementById('startScanBtn').classList.add('hidden');
      document.getElementById('stopScanBtn').classList.remove('hidden');
      document.getElementById('scanRegion').classList.remove('hidden');
      document.getElementById('cameraSelect').disabled = true;

      // Start scanning loop
      this.scanningInterval = setInterval(() => this.scanQR(), 300);
    } catch (err) {
      console.error('Camera access error:', err);
      this.showToast(`Camera error: ${err.message}`, 'error');
      this.handleCameraError(err);
    }
  }

  handleCameraError(err) {
    // Show manual entry option if camera fails
    if (err.name === 'NotAllowedError') {
      document.getElementById('cameraError').classList.remove('hidden');
      document.getElementById('manualEntrySection').classList.remove('hidden');
    }
    this.stopScanning();
  }

  stopScanning() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }

    if (this.scanningInterval) {
      clearInterval(this.scanningInterval);
      this.scanningInterval = null;
    }

    const video = document.getElementById('video');
    video.srcObject = null;

    // UI Updates
    document.getElementById('startScanBtn').classList.remove('hidden');
    document.getElementById('stopScanBtn').classList.add('hidden');
    document.getElementById('scanRegion').classList.add('hidden');
    document.getElementById('cameraSelect').disabled = false;
  }

  scanQR() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code) {
        this.processScannedQR(code.data);
      }
    }
  }

  processScannedQR(data) {
    try {
      const qrData = JSON.parse(data);
      
      // Validate QR data
      if (!qrData.subject || !qrData.classTime || !qrData.facultyId) {
        throw new Error('Invalid QR code format');
      }

      // Check expiration
      const expiryTime = new Date(qrData.classTime);
      expiryTime.setMinutes(expiryTime.getMinutes() + parseInt(qrData.duration));
      
      if (new Date() > expiryTime) {
        throw new Error('This QR code has expired');
      }

      // Check if class is in the future
      if (new Date() < new Date(qrData.classTime)) {
        throw new Error('Attendance is not open yet for this class');
      }

      this.stopScanning();
      this.showScanResult(qrData, expiryTime);
    } catch (err) {
      this.showToast(err.message, 'error');
      console.error('QR processing error:', err);
    }
  }

  showScanResult(qrData, expiryTime) {
    const resultSection = document.getElementById('scanResult');
    resultSection.classList.remove('hidden');
    resultSection.style.opacity = 0;
    
    // Populate data
    document.getElementById('subjectName').textContent = qrData.subject;
    document.getElementById('professorName').textContent = `Prof. ${qrData.facultyId}`;
    document.getElementById('classTime').textContent = new Date(qrData.classTime).toLocaleString();
    document.getElementById('validUntil').textContent = expiryTime.toLocaleString();
    document.getElementById('submitAttendanceBtn').setAttribute('data-qr', JSON.stringify(qrData));
    
    // Animate appearance
    setTimeout(() => {
      resultSection.style.transition = 'opacity 0.3s ease';
      resultSection.style.opacity = 1;
    }, 50);
  }

  submitAttendance() {
    const btn = document.getElementById('submitAttendanceBtn');
    const qrData = JSON.parse(btn.getAttribute('data-qr'));
    const studentId = localStorage.getItem('userId');

    // Show loading state
    btn.disabled = true;
    btn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Submitting...
    `;

    // Simulate API call
    setTimeout(() => {
      this.showSuccessScreen(qrData);
      console.log('Attendance submitted:', { studentId, qrData });
      
      // In a real app, you would send this to your backend
      // await fetch('/api/attendance', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ studentId, qrData })
      // });
    }, 1500);
  }

  showSuccessScreen(qrData) {
    document.getElementById('scanResult').classList.add('hidden');
    document.getElementById('successScreen').classList.remove('hidden');
    
    // Populate success data
    document.getElementById('successSubject').textContent = qrData.subject;
    document.getElementById('successTime').textContent = new Date().toLocaleTimeString();
    
    // Animate checkmark
    const checkmark = document.getElementById('checkmark');
    checkmark.style.strokeDashoffset = 0;
  }

  resetScanner() {
    document.getElementById('scanResult').classList.add('hidden');
    document.getElementById('successScreen').classList.add('hidden');
    document.getElementById('submitAttendanceBtn').disabled = false;
    document.getElementById('submitAttendanceBtn').innerHTML = 'Submit Attendance';
    this.startScanning();
  }

  // ================= UTILITY FUNCTIONS =================
  copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    this.showToast('Link copied to clipboard', 'success');
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg text-white ${
      type === 'error' ? 'bg-red-500' : 
      type === 'success' ? 'bg-green-500' : 'bg-blue-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.transition = 'opacity 0.5s ease';
      toast.style.opacity = 0;
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }
}

// Initialize the system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new QRSystem();
});
