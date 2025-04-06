// Simulated attendance data
const attendanceData = {
    CS101: [
        { date: '2023-05-15', classTime: '10:00 AM', present: 35, total: 40, percentage: '87.5%' },
        { date: '2023-05-08', classTime: '10:00 AM', present: 32, total: 40, percentage: '80%' },
        { date: '2023-05-01', classTime: '10:00 AM', present: 38, total: 40, percentage: '95%' }
    ],
    MATH202: [
        { date: '2023-05-14', classTime: '09:00 AM', present: 28, total: 40, percentage: '70%' },
        { date: '2023-05-07', classTime: '09:00 AM', present: 30, total: 40, percentage: '75%' }
    ],
    PHYS301: [
        { date: '2023-05-12', classTime: '02:00 PM', present: 40, total: 40, percentage: '100%' },
        { date: '2023-05-05', classTime: '02:00 PM', present: 39, total: 40, percentage: '97.5%' }
    ]
};

// Simulated attendance details
const attendanceDetails = {
    'CS101-2023-05-15': [
        { studentId: 'S2001', name: 'John Doe', status: 'Present', time: '10:02 AM' },
        { studentId: 'S2002', name: 'Jane Smith', status: 'Present', time: '10:01 AM' },
        { studentId: 'S2003', name: 'Bob Johnson', status: 'Absent', time: '-' },
        { studentId: 'S2004', name: 'Alice Brown', status: 'Present', time: '10:05 AM' }
    ]
};

// Initialize faculty dashboard
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('faculty/dashboard.html')) {
        // Update dashboard stats
        document.getElementById('todayClasses').textContent = '2';
        document.getElementById('totalStudents').textContent = '120';
        document.getElementById('attendanceToday').textContent = '85%';
    }
    
    if (window.location.pathname.includes('view-attendance.html')) {
        // Populate attendance table
        const tbody = document.getElementById('attendanceTableBody');
        tbody.innerHTML = '';
        
        for (const subject in attendanceData) {
            attendanceData[subject].forEach(session => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${session.date}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${subject}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${session.classTime}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${session.present}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${session.total}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${session.percentage}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button class="text-blue-600 hover:text-blue-900 view-details" data-subject="${subject}" data-date="${session.date}">View Details</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
        
        // Add event listeners for view details buttons
        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', function() {
                const subject = this.getAttribute('data-subject');
                const date = this.getAttribute('data-date');
                showAttendanceDetails(subject, date);
            });
        });
        
        // Add filter functionality
        document.getElementById('subjectFilter').addEventListener('change', function() {
            filterAttendanceTable();
        });
        
        document.getElementById('dateFilter').addEventListener('change', function() {
            filterAttendanceTable();
        });
    }
});

function showAttendanceDetails(subject, date) {
    const key = `${subject}-${date}`;
    const details = attendanceDetails[key] || [];
    
    const detailsBody = document.getElementById('attendanceDetailsBody');
    detailsBody.innerHTML = '';
    
    details.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${student.studentId}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${student.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    student.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }">
                    ${student.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${student.time}</td>
        `;
        detailsBody.appendChild(row);
    });
    
    document.getElementById('detailsTitle').textContent = `Attendance Details - ${subject} on ${date}`;
    document.getElementById('attendanceDetails').classList.remove('hidden');
}

function filterAttendanceTable() {
    const subjectFilter = document.getElementById('subjectFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    const rows = document.querySelectorAll('#attendanceTableBody tr');
    rows.forEach(row => {
        const subject = row.querySelector('td:nth-child(2)').textContent;
        const date = row.querySelector('td:nth-child(1)').textContent;
        
        const subjectMatch = subjectFilter === 'all' || subject === subjectFilter;
        const dateMatch = !dateFilter || date === dateFilter;
        
        row.style.display = subjectMatch && dateMatch ? '' : 'none';
    });
}