document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const profilePic = document.getElementById('profilePic').files[0];

    try {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('profilePic', profilePic);

        const response = await fetch('/register', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            window.location.href = `/welcome?username=${username}`;
        } else {
            console.error(`Failed to register: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error during registration:', error);
    }
});
