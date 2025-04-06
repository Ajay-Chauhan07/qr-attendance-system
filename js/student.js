// Initialize student dashboard
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('student/dashboard.html')) {
        // Update dashboard stats
        document.getElementById('todayClasses').textContent = '3';
        document.getElementById('monthAttendance').textContent = '92%';
        document.getElementById('pendingAttendance').textContent = '1';
    }
    
    if (window.location.pathname.includes('scan-qr.html')) {
        // Initialize camera selection
        initializeCameraSelection();
    }
});

function initializeCameraSelection() {
    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            const cameraSelect = document.getElementById('cameraSelect');
            
            videoDevices.forEach(device => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `Camera ${cameraSelect.length + 1}`;
                cameraSelect.appendChild(option);
            });
        })
        .catch(err => {
            console.error('Error enumerating devices:', err);
        });
}


// Initialize student dashboard
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('student/scan-qr.html')) {
        // Initialize camera selection
        initializeCameraSelection();
        
        // Set up event listener for camera select change
        document.getElementById('cameraSelect').addEventListener('change', function() {
            if (videoStream) {
                stopScanning();
            }
        });
    }
});

function initializeCameraSelection() {
    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            const cameraSelect = document.getElementById('cameraSelect');
            
            // Clear existing options except the first one
            while (cameraSelect.options.length > 1) {
                cameraSelect.remove(1);
            }
            
            videoDevices.forEach((device, index) => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `Camera ${index + 1}`;
                cameraSelect.appendChild(option);
            });
        })
        .catch(err => {
            console.error('Error enumerating devices:', err);
            alert('Could not access camera devices. Please check permissions.');
        });
}