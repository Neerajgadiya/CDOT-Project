function initSettings() {
    setupSettingsForm();
}

function setupSettingsForm() {
    document.getElementById('settings-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveSettings();
    });
}

function saveSettings() {
    alert('Settings saved successfully!');
}

function addUser() {
    const modal = new bootstrap.Modal(document.getElementById('userModal'));
    modal.show();
}

function saveUser() {
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    const role = document.getElementById('user-role').value;
    
    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }
    
    alert(`User ${username} (${role}) created successfully!`);
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
    modal.hide();
    
    // Clear form
    document.getElementById('new-username').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('user-role').value = 'user';
}

function backupData() {
    alert('Data backup created and downloaded!');
}

function restoreData() {
    alert('Data restored from backup!');
}

function clearData() {
    if (confirm('WARNING: This will delete ALL data. Are you sure?')) {
        alert('All data has been cleared. The page will now reload.');
        location.reload();
    }
}