<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login | Library of Thoughts</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="/css/styles.css">
    <link rel="stylesheet" href="/css/home.css">
    <!-- Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        /* Page Layout */
        body {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            background-color: var(--primary-light);
        }
        /* Sign-in Form Container */
        .form-signin {
            width: 100%;
            max-width: 400px;
            padding: 15px;
            margin: auto;
        }
        /* Input Field Spacing */
        .form-signin .form-floating:focus-within {
            z-index: 2;
        }
        .form-signin input[type="email"] {
            margin-bottom: -1px;
            border-bottom-right-radius: 0;
            border-bottom-left-radius: 0;
        }
        .form-signin input[type="password"] {
            margin-bottom: 10px;
            border-top-left-radius: 0;
            border-top-right-radius: 0;
        }
        /* Alert Message Styling */
        .alert-message {
            margin-top: 1rem;
            text-align: center;
        }
    </style>
</head>
<body class="d-flex align-items-center">
    <main class="form-signin text-center">
        <form id="loginForm">
            <i class="fas fa-brain text-primary-color mb-4" style="font-size: 3rem;"></i>
            <h1 class="h3 mb-3 fw-normal text-primary-color">Please sign in</h1>

            <div class="form-floating mb-2">
                <input type="email" class="form-control" id="floatingInput" placeholder="name@example.com" required>
                <label for="floatingInput">Email address</label>
            </div>
            <div class="form-floating">
                <input type="password" class="form-control" id="floatingPassword" placeholder="Password" required>
                <label for="floatingPassword">Password</label>
            </div>

            <button class="w-100 btn btn-lg btn-primary" type="submit">Sign in</button>
            <p class="mt-3 mb-0 text-muted">Don't have an account? <a href="/register">Register here</a></p>
            <div id="errorMessage" class="alert alert-danger alert-message d-none" role="alert"></div>
            <div id="successMessage" class="alert alert-success alert-message d-none" role="alert"></div>
        </form>
    </main>

    <!-- Bootstrap JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

    <!-- Hidden script tag to pass Firebase config as JSON -->
    <script id="firebase-config-data" type="application/json">
        <%- JSON.stringify(firebaseConfig) %>
    </script>

    <script type="module">
        // Firebase SDK imports
        import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
        import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

        // Retrieve Firebase config from the hidden script tag
        const firebaseConfigElement = document.getElementById('firebase-config-data');
        let firebaseConfig = {};
        if (firebaseConfigElement && firebaseConfigElement.textContent) {
            try {
                firebaseConfig = JSON.parse(firebaseConfigElement.textContent);
            } catch (e) {
                console.error('Error parsing Firebase config from EJS:', e);
            }
        }

        console.log('Using Firebase Config (login):', firebaseConfig);

        let auth;
        // Initialize Firebase Auth if config is valid
        if (firebaseConfig.apiKey && firebaseConfig.projectId) {
            const app = initializeApp(firebaseConfig);
            auth = getAuth(app);
        } else {
            console.error('Firebase config is incomplete. Login functionality will not work.');
        }

        // DOM elements
        const loginForm = document.getElementById('loginForm');
        const emailInput = document.getElementById('floatingInput');
        const passwordInput = document.getElementById('floatingPassword');
        const errorMessageDiv = document.getElementById('errorMessage');
        const successMessageDiv = document.getElementById('successMessage');

        // Handle login form submission
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMessageDiv.classList.add('d-none');
            successMessageDiv.classList.add('d-none');

            if (!auth) {
                errorMessageDiv.textContent = 'Firebase not initialized. Please check console for errors.';
                errorMessageDiv.classList.remove('d-none');
                return;
            }

            const email = emailInput.value;
            const password = passwordInput.value;

            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const idToken = await userCredential.user.getIdToken(); // Get ID Token

                // Send ID token to server to create a session cookie
                const response = await fetch('/sessionLogin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken })
                });

                if (response.ok) {
                    successMessageDiv.textContent = 'Login successful! Redirecting...';
                    successMessageDiv.classList.remove('d-none');
                    setTimeout(() => {
                        window.location.href = '/'; // Redirect to home on success
                    }, 1500);
                } else {
                    errorMessageDiv.textContent = 'Failed to establish session on server.';
                    errorMessageDiv.classList.remove('d-none');
                }
            } catch (error) {
                // Display user-friendly error messages
                let message = 'An unknown error occurred.';
                switch (error.code) {
                    case 'auth/invalid-email':
                        message = 'Invalid email address format.';
                        break;
                    case 'auth/user-disabled':
                        message = 'This user account has been disabled.';
                        break;
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                    case 'auth/invalid-credential':
                        message = 'Invalid email or password.';
                        break;
                    default:
                        message = error.message;
                }
                errorMessageDiv.textContent = message;
                errorMessageDiv.classList.remove('d-none');
                console.error('Firebase Auth Error:', error);
            }
        });
    </script>
</body>
</html>
