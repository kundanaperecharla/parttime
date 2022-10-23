const socket = io();

const mobileForm = document.querySelector('form[id="mobileForm');
const otpForm = document.querySelector('form[id="otpForm');
const nameForm = document.querySelector('form[id="nameForm');

document.getElementById('otpForm').style.display = 'none';
document.getElementById('nameForm').style.display = 'none';

const mobile = document.querySelector('input[id="mobile"]');
const otp = document.querySelector('input[id="otp"]');
const username = document.querySelector('input[id="name"]');

const resendOTP = document.querySelector('p[id="resendOTP"]');

const baseURL = window.location.origin;

const addAlert = ({ alertType, alertContent }) => {
    let alertIcon = "";
    if (alertType === "success") alertIcon = "task_alt";
    else if (alertType === "info") alertIcon = "info";
    else if (alertType === "warning") alertIcon = "warning";

    const alerts = document.getElementById("alerts");

    alerts.innerHTML += `<div id="alert" class="alert ${alertType}">
    <div class="toLeft">
    <i class="search-icon material-icons">${alertIcon}</i>
    &nbsp;&nbsp;
    <label id="alertContent">${alertContent}</label>
    </div>
    <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
</div>`;
}

mobileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (mobile.value.length === 10) {
        socket.emit('mobileInputted', mobile.value);
    } else {
        // todo css ui
        console.log("Please enter 10 digit number");
    }
});

socket.on('otpRequested', () => {
    document.getElementById('mobileForm').style.display = 'none';
    document.getElementById('otpForm').style.display = 'flex';
    document.getElementById('otp').value = '';
    document.getElementById('otp').focus();

    addAlert({
        alertType: "success",
        alertContent: "OTP sent to your mobile"
    });
    
    otpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (otp.value.length === 6) {
            socket.emit('otpInputted', mobile.value, otp.value, userType, baseURL);
        } else {
            // todo css ui
            console.log("Please enter valid OTP");
            addAlert({
                alertType: "warning",
                alertContent: "Please enter valid 6 digit OTP"
            });
        }
    });
});

socket.on('nameRequested', () => {
    document.getElementById('mobileForm').style.display = 'none';
    document.getElementById('otpForm').style.display = 'none';
    document.getElementById('nameForm').style.display = 'flex';
    document.getElementById('name').focus();
    nameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        socket.emit('nameInputted', mobile.value, username.value, userType, baseURL);
    });
});

resendOTP.addEventListener("click", () => {
    socket.emit("resendOTPRequested", mobile.value);
});

socket.on("invalidOTPEntered", () => {
    addAlert({
        alertType: "warning",
        alertContent: "Invalid OTP"
    });
})

socket.on('redirectToHome', () => {
    location.assign('/home');
});
