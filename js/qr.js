// Enhanced QR Code Handling with Authentication
class QRSystem {
  constructor() {
    this.videoStream = null;
    this.scanningInterval = null;
    this.authModal = null;
    this.init();
  }

  init() {
    // Initialize based on page
    if (document.getElementById('qrForm')) this.initFacultyQR();
    if (document.getElementById('startScanBtn')) this.initStudentQR();
    
    // Initialize authentication system
    this.initAuthSystem();
    
    // Check if user is already logged in
    if (localStorage.getItem('isLoggedIn') {
      this.hideAuthModal();
    } else {
      this.showAuthModal();
    }
  }

  // ================= AUTHENTICATION SYSTEM =================
  initAuthSystem() {
    // Create auth modal if it doesn't exist
    if (!document.getElementById('authModal')) {
      const authModalHTML = `
        <div id="authModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
          <div class="bg-white rounded-lg p-6 w-full max-w-md">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold">Login</h2>
              <button id="closeAuthModal" class="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form id="authForm">
              <div class="mb-4">
                <label for="authEmail" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" id="authEmail" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              
              <div class="mb-4">
                <label for="authPassword" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" id="authPassword" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center">
                  <input type="checkbox" id="rememberMe" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                  <label for="rememberMe" class="ml-2 block text-sm text-gray-700">Remember me</label>
                </div>
                
                <button type="button" id="forgotPasswordBtn" class="text-sm text-blue-600 hover:text-blue-800">Forgot password?</button>
              </div>
              
              <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Login
              </button>
            </form>
            
            <div id="forgotPasswordSection" class="hidden mt-4">
              <h3 class="text-lg font-medium mb-2">Reset Password</h3>
              <p class="text-sm text-gray-600 mb-3">Enter your email to receive a password reset link</p>
              <div class="flex">
                <input type="email" id="resetEmail" placeholder="Your email" class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <button id="sendResetLinkBtn" class="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700">Send</button>
              </div>
              <button id="backToLoginBtn" class="mt-2 text-sm text-blue-600 hover:text-blue-800">Back to login</button>
            </div>
          </div>
        </div>
      `;
      
      document.body.insertAdjacentHTML('beforeend', authModalHTML);
    }
    
    this.authModal = document.getElementById('authModal');
    
    // Set up auth event listeners
    document.getElementById('authForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });
    
    document.getElementById('closeAuthModal').addEventListener('click', () => {
      // Only allow dismiss if not on faculty page (where login is required)
      if (!document.getElementById('qrForm')) {
        this.hideAuthModal();
      }
    });
    
    document.getElementById('forgotPasswordBtn').addEventListener('click', () => {
      document.getElementById('authForm').classList.add('hidden');
      document.getElementById('forgotPasswordSection').classList.remove('hidden');
    });
    
    document.getElementById('backToLoginBtn').addEventListener('click', () => {
      document.getElementById('forgotPasswordSection').classList.add('hidden');
      document.getElementById('authForm').classList.remove('hidden');
    });
    
    document.getElementById('sendResetLinkBtn').addEventListener('click', () => {
      this.handleForgotPassword();
    });
  }

  showAuthModal() {
    this.authModal.classList.remove('hidden');
    document.getElementById('authEmail').focus();
  }

  hideAuthModal() {
    this.authModal.classList.add('hidden');
  }

  async handleLogin() {
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!email || !password) {
      this.showToast('Please enter both email and password', 'error');
      return;
    }
    
    const btn = document.querySelector('#authForm button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Logging in...
    `;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would verify credentials with your backend
      // const response = await fetch('/api/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });
      // const data = await response.json();
      
      // For demo purposes, we'll just accept any non-empty credentials
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userId', email.split('@')[0]); // Use username part as ID
      
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      this.hideAuthModal();
      this.showToast('Login successful', 'success');
      
      // Refresh the page to update UI based on auth state
      window.location.reload();
    } catch (error) {
      this.showToast('Login failed. Please check your credentials.', 'error');
      console.error('Login error:', error);
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  }

  async handleForgotPassword() {
    const email = document.getElementById('resetEmail').value;
    
    if (!email) {
      this.showToast('Please enter your email', 'error');
      return;
    }
    
    const btn = document.getElementById('sendResetLinkBtn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Sending...
    `;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would send the reset link
      // await fetch('/api/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
      
      this.showToast(`Password reset link sent to ${email}`, 'success');
      document.getElementById('forgotPasswordSection').classList.add('hidden');
      document.getElementById('authForm').classList.remove('hidden');
      document.getElementById('resetEmail').value = '';
    } catch (error) {
      this.showToast('Failed to send reset link. Please try again.', 'error');
      console.error('Forgot password error:', error);
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  }

  // ================= FACULTY FUNCTIONS =================
  initFacultyQR() {
    // Show auth modal immediately for faculty
    this.showAuthModal();
    
    document.getElementById('qrForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.generateQRCode();
    });
    
    // Check if user is faculty (in a real app, you'd check this with your backend)
    if (localStorage.getItem('userId')) {
      document.getElementById('facultyGreeting').textContent = `Welcome, Faculty ${localStorage.getItem('userId')}`;
    }
  }

  generateQRCode() {
    // Ensure user is logged in
    if (!localStorage.getItem('isLoggedIn')) {
      this.showAuthModal();
      return;
    }
    
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

  // ... [Rest of the existing QRSystem methods remain unchanged] ...
}

// Initialize the system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Add some basic styles if they don't exist
  if (!document.getElementById('qrSystemStyles')) {
    const style = document.createElement('style');
    style.id = 'qrSystemStyles';
    style.textContent = `
      .hidden { display: none; }
      .animate-spin {
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
  
  new QRSystem();
});
