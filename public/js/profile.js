const socket = io();

const baseURL = window.location.origin;

const nameLabel = document.querySelector('div[id="profile-name"]');
const nameInput = document.querySelector('input[id="profile-name-edit-input"]');
const mobile = document.querySelector('div[id="profile-mobile"]');
const requestsDiv = document.querySelector('div[id="profile-requests"]');

const editNameButton = document.getElementById('edit-name-button');
const saveNameChangesButton = document.getElementById('save-name-changes-button');
const discardNameChangesButton = document.getElementById('discard-name-changes-button');

function renderProfile() {
    socket.emit('getProfile', baseURL);
}

socket.on('postProfile', ({ user, requests }) => {
    nameLabel.innerHTML = user.name;
    nameInput.value = user.name;
    mobile.innerHTML = user.mobile;
    requestsDiv.innerHTML = requests;
});

socket.on('postNameChange', (newName) => {
    nameLabel.innerHTML = newName;
    nameInput.value = newName;
})

editNameButton.addEventListener('click', (e) => {
    document.getElementById("profile-name").style.display = "none";
    document.getElementById("edit-name-button").style.display = "none";
    document.getElementById("profile-name-edit-input").style.display = "block";
    document.getElementById("save-name-changes-button").style.display = "block";
    document.getElementById("discard-name-changes-button").style.display = "block";
});

const showDefault = () => {
    document.getElementById("profile-name-edit-input").style.display = "none";
    document.getElementById("save-name-changes-button").style.display = "none";
    document.getElementById("discard-name-changes-button").style.display = "none";
    document.getElementById("profile-name").style.display = "block";
    document.getElementById("edit-name-button").style.display = "block";
}

saveNameChangesButton.addEventListener('click', () => {
    showDefault();
    socket.emit('saveNameChanges', nameInput.value, baseURL);
});

discardNameChangesButton.addEventListener('click', () => {
    nameInput.value = nameLabel.textContent; // reset input value
    showDefault();
});
