// -------------------- Simulated Database & Local Storage Handling --------------------
let usersDB = {
    faculty: [],
    student: []
};

function loadDatabase() {
    const savedData = localStorage.getItem('qrAttendanceDB');
    if (savedData) {
        usersDB = JSON.parse(savedData);
    } else {
        usersDB = {
            faculty: [
                {
                    id: 'F1001',
                    name: 'Dr. Smith',
                    email: 'smith@university.edu',
                    password: 'faculty123',
                    department: 'Computer Science'
                }
            ],
            student: [
                {
                    id: 'S2001',
                    name: 'John Doe',
                    email: 'john@student.edu',
                    password: 'student123',
                    program: 'BSc Computer Science'
                }
            ]
        };
        saveDatabase();
    }
}

function saveDatabase() {
    localStorage.setItem('qrAttendanceDB', JSON.stringify(usersDB));
}

// Call this on load
loadDatabase();

// -------------------- Auth Check & User Info Display --------------------
function checkAuth() {
    const userType = localStorage.getItem('userType');
    const userId = localStorage.getItem('userId');

    if (!userType || !userId) {
        window.location.href = '../auth/login.html';
        return false;
    }

    const user = usersDB[userType].find(u => u.id === userId);
    if (user) {
        const nameEls = ['userName', 'dashboardUserName'];
        nameEls.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = user.name;
        });

        const initialEl = document.getElementById('userInitial');
        if (initialEl) initialEl.textContent = user.name.charAt(0);
    }

    return true;
}

// -------------------- Login --------------------
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const userType = document.getElementById('userType').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const user = usersDB[userType].find(u => u.email === email && u.password === password);
            if (user) {
                localStorage.setItem('userType', userType);
                localStorage.setItem('userId', user.id);

                const redirectPath = userType === 'faculty' ? '../faculty/dashboard.html' : '../student/dashboard.html';
                window.location.href = redirectPath;
            } else {
                alert('Invalid credentials. Please try again.');
            }
        });
    }

    // -------------------- Signup --------------------
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        document.getElementById('userType').addEventListener('change', function () {
            const userType = this.value;
            document.getElementById('studentFields').style.display = userType === 'student' ? 'block' : 'none';
            document.getElementById('facultyFields').style.display = userType === 'faculty' ? 'block' : 'none';
        });

        signupForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const userType = document.getElementById('userType').value;
            const name = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            const id = userType === 'faculty'
                ? 'F' + (1000 + usersDB.faculty.length + 1)
                : 'S' + (2000 + usersDB.student.length + 1);

            const newUser = { id, name, email, password };

            if (userType === 'faculty') {
                newUser.department = document.getElementById('department').value;
                usersDB.faculty.push(newUser);
            } else {
                newUser.program = 'BSc Program';
                usersDB.student.push(newUser);
            }

            saveDatabase();
            alert(`Account created successfully! Your ${userType} ID is: ${id}`);
            window.location.href = '../auth/login.html';
        });
    }

    // -------------------- Logout --------------------
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('userType');
            localStorage.removeItem('userId');
            window.location.href = '../auth/login.html';
        });
    }

    // -------------------- Auth Guard for Protected Pages --------------------
    const protectedPages = [
        'faculty/dashboard.html',
        'faculty/generate-qr.html',
        'faculty/view-attendance.html',
        'student/dashboard.html',
        'student/scan-qr.html'
    ];

    const currentPage = window.location.pathname.split('/').pop();
    if (protectedPages.includes(currentPage)) {
        checkAuth();
    }

    // -------------------- Faculty Dashboard Attendance Data --------------------
    if (document.getElementById('recentAttendance') && currentPage.includes('faculty')) {
        const attendanceData = [
            { date: '2023-05-15', subject: 'CS101', present: 35, absent: 5, percentage: '87.5%' },
            { date: '2023-05-14', subject: 'MATH202', present: 28, absent: 12, percentage: '70%' },
            { date: '2023-05-12', subject: 'PHYS301', present: 40, absent: 0, percentage: '100%' }
        ];

        const tbody = document.getElementById('recentAttendance');
        attendanceData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.subject}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.present}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.absent}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.percentage}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // -------------------- Student Dashboard Attendance Data --------------------
    if (document.getElementById('recentAttendance') && currentPage.includes('student')) {
        const attendanceData = [
            { date: '2023-05-15', subject: 'CS101', status: 'Present', time: '10:05 AM' },
            { date: '2023-05-14', subject: 'MATH202', status: 'Present', time: '09:15 AM' },
            { date: '2023-05-12', subject: 'PHYS301', status: 'Present', time: '02:30 PM' }
        ];

        const tbody = document.getElementById('recentAttendance');
        attendanceData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.subject}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        ${item.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.time}</td>
            `;
            tbody.appendChild(row);
        });
    }
});
