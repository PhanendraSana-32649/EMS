document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selectors ---
    const authScreen = document.getElementById('authScreen');
    const mainApp = document.getElementById('mainApp');
    const phoneForm = document.getElementById('phoneForm');
    const otpForm = document.getElementById('otpForm');
    const phoneNumberInput = document.getElementById('phoneNumber');
    const otpInput = document.getElementById('otp');
    const userNameInput = document.getElementById('userName');
    const userRoleSelect = document.getElementById('userRole');
    const otpTimerEl = document.getElementById('otpTimer');
    const changeNumberBtn = document.getElementById('changeNumberBtn');
    const resendOtpBtn = document.getElementById('resendOtpBtn');
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const verifyBtn = document.getElementById('verifyBtn');
    const userInfoHeader = document.getElementById('userInfoHeader');
    const headerName = document.getElementById('headerName');
    const headerPhone = document.getElementById('headerPhone');
    const bannerName = document.getElementById('bannerName');
    const bannerRole = document.getElementById('bannerRole');
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content section');
    const toast = document.getElementById('toast');
    const reportForm = document.getElementById('reportForm');
    const complaintsList = document.getElementById('complaintsList');
    const resultsContainer = document.getElementById('resultsContainer');
    const verifyForm = document.getElementById('verifyForm');
    const verificationResult = document.getElementById('verificationResult');
    const logoutBtn = document.getElementById('logoutBtn');

    let otpTimerInterval;
    const OTP_VALIDITY_SECONDS = 60; // 1 minute

    // --- Mock Data ---
    const MOCK_COMPLAINTS = [
        { id: 'CMP-001', type: 'EVM Malfunction', status: 'Resolved' },
        { id: 'CMP-002', type: 'Voter Intimidation', status: 'Pending' },
    ];
    const MOCK_RESULTS = [
        { party: 'Party A', votes: 120500, percent: 45 },
        { party: 'Party B', votes: 98700, percent: 37 },
        { party: 'Party C', votes: 35400, percent: 13 },
        { party: 'NOTA', votes: 12300, percent: 5 },
    ];
    const MOCK_VOTER_DB = {
        'ABC1234567': { name: 'Ramesh Kumar', booth: 'PS-123', constituency: 'New Delhi' }
    };

    // --- UTILITY FUNCTIONS ---
    
    // Shows a toast notification
    const showToast = (message, isError = false) => {
        toast.textContent = message;
        toast.className = `toast show ${isError ? 'error' : ''}`;
        setTimeout(() => toast.classList.remove('show'), 3000);
    };

    // Displays a spinner on a button and disables it
    const showSpinner = (button, text = 'Processing...') => {
        button.disabled = true;
        button.innerHTML = `<span class="spinner"></span> ${text}`;
    };

    // Hides the spinner and re-enables the button
    const hideSpinner = (button, originalText) => {
        button.disabled = false;
        button.innerHTML = originalText;
    };
    
    // --- AUTHENTICATION LOGIC ---

    const startOtpTimer = () => {
        let timeLeft = OTP_VALIDITY_SECONDS;
        otpTimerEl.classList.remove('warning');
        
        const updateTimer = () => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            otpTimerEl.textContent = `OTP valid for ${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 30) otpTimerEl.classList.add('warning');
            if (timeLeft <= 0) {
                clearInterval(otpTimerInterval);
                otpTimerEl.textContent = 'OTP Expired!';
                verifyBtn.disabled = true;
                showToast('Your OTP has expired. Please resend.', true);
            }
            timeLeft--;
        };
        
        clearInterval(otpTimerInterval);
        updateTimer(); // Initial call
        otpTimerInterval = setInterval(updateTimer, 1000);
    };

    const handleLogin = (user) => {
        localStorage.setItem('ems-user', JSON.stringify(user));
        authScreen.classList.remove('active');
        authScreen.style.display = 'none';
        mainApp.classList.add('active');
        userInfoHeader.classList.remove('hidden');

        headerName.textContent = `Welcome, ${user.name}`;
        headerPhone.textContent = `📱 ${user.phone}`;
        bannerName.textContent = user.name;
        bannerRole.textContent = user.role;
        
        // Load initial data for the app
        loadComplaints();
        loadResults();
        navigate('dashboard');
    };

    phoneForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!phoneNumberInput.checkValidity()) {
            showToast('Please enter a valid 10-digit number.', true);
            return;
        }
        const originalText = sendOtpBtn.innerHTML;
        showSpinner(sendOtpBtn, 'Sending...');

        setTimeout(() => { // Simulate API call
            hideSpinner(sendOtpBtn, originalText);
            phoneForm.classList.add('hidden');
            otpForm.classList.remove('hidden');
            verifyBtn.disabled = false;
            startOtpTimer();
            showToast('OTP sent successfully!');
        }, 1500);
    });

    otpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const otp = otpInput.value;
        const name = userNameInput.value;
        const role = userRoleSelect.value;
        const phone = `+91 ${phoneNumberInput.value}`;

        if (otp !== '123456') {
            showToast('Invalid OTP. Please try again.', true);
            return;
        }
        if (!name || !role) {
            showToast('Please fill in your name and role.', true);
            return;
        }

        const originalText = verifyBtn.innerHTML;
        showSpinner(verifyBtn, 'Verifying...');

        setTimeout(() => { // Simulate API call
            hideSpinner(verifyBtn, originalText);
            const user = { name, role, phone };
            handleLogin(user);
        }, 1500);
    });

    const resetAuth = () => {
        phoneForm.classList.remove('hidden');
        otpForm.classList.add('hidden');
        clearInterval(otpTimerInterval);
        otpTimerEl.textContent = `OTP valid for ${OTP_VALIDITY_SECONDS/60}:00`;
        otpForm.reset();
    };

    changeNumberBtn.addEventListener('click', resetAuth);
    resendOtpBtn.addEventListener('click', () => {
        showToast('A new OTP has been sent.');
        verifyBtn.disabled = false;
        startOtpTimer();
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('ems-user');
        window.location.reload();
    });

    // --- NAVIGATION ---
    const navigate = (pageId) => {
        sections.forEach(sec => sec.classList.remove('active'));
        navItems.forEach(item => item.classList.remove('active'));

        document.getElementById(pageId).classList.add('active');
        document.querySelector(`.nav-item[data-page="${pageId}"]`).classList.add('active');
    };

    navItems.forEach(item => {
        item.addEventListener('click', () => navigate(item.dataset.page));
    });

    // --- DYNAMIC CONTENT RENDERING ---

    const loadComplaints = () => {
        if (MOCK_COMPLAINTS.length === 0) {
            complaintsList.innerHTML = `<p>You have not filed any complaints yet.</p>`;
            return;
        }
        complaintsList.innerHTML = MOCK_COMPLAINTS.map(c => `
            <div class="complaint-item">
                <div class="complaint-header">
                    <div class="complaint-id">${c.id}</div>
                    <div class="status-badge ${c.status === 'Resolved' ? 'status-resolved' : 'status-pending'}">
                        ${c.status}
                    </div>
                </div>
                <p><strong>Type:</strong> ${c.type}</p>
            </div>
        `).join('');
    };

    const loadResults = () => {
        resultsContainer.innerHTML = MOCK_RESULTS.map(r => `
            <div class="result-container">
                <div class="result-header">
                    <div class="result-name">${r.party}</div>
                    <div class="result-percent">${r.percent}%</div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%;" data-width="${r.percent}%">${r.votes.toLocaleString('en-IN')} Votes</div>
                </div>
            </div>
        `).join('');

        // Animate progress bars on view
        setTimeout(() => {
            document.querySelectorAll('.progress-fill').forEach(fill => {
                fill.style.width = fill.dataset.width;
            });
        }, 200);
    };

    // --- FORM SUBMISSIONS ---
    
    reportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const originalText = reportForm.querySelector('button').innerHTML;
        showSpinner(reportForm.querySelector('button'), 'Submitting...');
        
        setTimeout(() => {
            hideSpinner(reportForm.querySelector('button'), originalText);
            const newComplaint = {
                id: `CMP-00${MOCK_COMPLAINTS.length + 1}`,
                type: document.getElementById('incidentType').value,
                status: 'Pending',
            };
            MOCK_COMPLAINTS.push(newComplaint);
            showToast('Report submitted successfully!');
            reportForm.reset();
            loadComplaints(); // Update the track page
            navigate('track'); // Switch to track page
        }, 2000);
    });

    verifyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const epic = document.getElementById('epicNumber').value.toUpperCase();
        const voter = MOCK_VOTER_DB[epic];
        
        verificationResult.classList.remove('hidden');
        if (voter) {
            verificationResult.innerHTML = `
                <div class="alert alert-success">
                    <h4>✅ Voter Verified</h4>
                    <p><strong>Name:</strong> ${voter.name}</p>
                    <p><strong>Booth:</strong> ${voter.booth}</p>
                    <p><strong>Constituency:</strong> ${voter.constituency}</p>
                </div>
            `;
        } else {
            verificationResult.innerHTML = `
                <div class="alert alert-error">
                    <h4>❌ Verification Failed</h4>
                    <p>No voter record found for EPIC number: <strong>${epic}</strong>.</p>
                </div>
            `;
        }
    });

    // --- APP INITIALIZATION ---
    
    const init = () => {
        const user = JSON.parse(localStorage.getItem('ems-user'));
        if (user) {
            handleLogin(user);
        } else {
            authScreen.style.display = 'flex';
        }
    };

    init();
});
