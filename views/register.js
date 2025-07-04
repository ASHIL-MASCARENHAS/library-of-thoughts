<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register | Library of Thoughts</title>
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
        /* Registration Form Container */
        .form-registration {
            width: 100%;
            max-width: 400px;
            padding: 15px;
            margin: auto;
        }
        /* Input Field Spacing */
        .form-registration .form-floating:focus-within {
            z-index: 2;
        }
        .form-registration input[type="email"] {
            margin-bottom: -1px;
            border-bottom-right-radius: 0;
            border-bottom-left-radius: 0;
        }
        .form-registration input[type="password"] {
            margin-bottom: -1px;
            border-radius: 0;
        }
        .form-registration input[type="password"]:last-of-type {
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
    <main class="form-registration text-center">
        <form id="registerForm">
            <i class="fas fa-brain text-primary-color mb-4" style="font-size: 3rem;"></i>
            <h1 class="h3 mb-3 fw-normal text-primary-color">Register Account</h1>

            <div class="form-floating mb-2">
                <input type="email" class="form-control" id="floatingEmail" placeholder="name@example.com" required>
                <label for="floatingEmail">Email address</label>
            </div>
            <div class="form-floating mb-2">
                <input type="password" class="form-control" id="floatingPassword" placeholder="Password" required>
                <label for="floatingPassword">Password</label>
            </div>
            <div class="form-floating">
                <input type="password" class="form-control" id="floatingConfirmPassword" placeholder="Confirm Password" required>
                <label for="floatingConfirmPassword">Confirm Password</label>
            </div>

            <button class="w-100 btn btn-lg btn-primary" type="submit">Register</button>
            <p class="mt-3 mb-0 text-muted">Already have an account? <a href="/login">Sign in here</a></p>
            <div id="errorMessage" class="alert alert-danger alert-message d-none" role="alert"></div>
            <div id="successMessage" class="alert alert-success alert-message d-none" role="alert"></div>
        </form>
    </main>

    <!-- Bootstrap JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script type="module">
        // Firebase SDK imports
        import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
        import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

        // Use server-passed Firebase config, fallback to Canvas-provided, or a warning
        const firebaseConfig = typeof <%= JSON.stringify(firebaseConfig) %> !== 'undefined' && Object.keys(<%= JSON.stringify(firebaseConfig) %>).length > 0
                               ? <%= JSON.stringify(firebaseConfig) %>
                               : (typeof __firebase_config !== 'undefined' && Object.keys(JSON.parse(__firebase_config)).length > 0
                                   ? JSON.parse(__firebase_config)
                                   : null); // Fallback to null if no config is found

        console.log('Using Firebase Config (register):', firebaseConfig);

        let auth;
        // Initialize Firebase Auth if config is valid
        if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId) {
            const app = initializeApp(firebaseConfig);
            auth = getAuth(app);
        } else {
            console.error('Firebase config is incomplete or missing. Registration functionality will not work. Please ensure your .env file is correctly set up and passed from the server, or that __firebase_config is available in the Canvas environment.');
        }

        // DOM elements
        const registerForm = document.getElementById('registerForm');
        const emailInput = document.getElementById('floatingEmail');
        const passwordInput = document.getElementById('floatingPassword');
        const confirmPasswordInput = document.getElementById('floatingConfirmPassword');
        const errorMessageDiv = document.getElementById('errorMessage');
        const successMessageDiv = document.getElementById('successMessage');

        // Handle registration form submission
        registerForm.addEventListener('submit', async (e) => {
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
            const confirmPassword = confirmPasswordInput.value;

            // Validate matching passwords
            if (password !== confirmPassword) {
                errorMessageDiv.textContent = 'Passwords do not match.';
                errorMessageDiv.classList.remove('d-none');
                return;
            }

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const idToken = await userCredential.user.getIdToken(); // Get ID Token

                // Send ID token to server to create a session cookie
                const response = await fetch('/sessionLogin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken })
                });

                if (response.ok) {
                    successMessageDiv.textContent = 'Registration successful! Redirecting to home...';
                    successMessageDiv.classList.remove('d-none');
                    setTimeout(() => {
                        window.location.href = '/'; // Redirect to home on success
                    }, 1500);
                } else {
                    errorMessageDiv.textContent = 'Registration successful, but failed to establish session.';
                    errorMessageDiv.classList.remove('d-none');
                }

            } catch (error) {
                // Display user-friendly error messages
                let message = 'An unknown error occurred.';
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        message = 'The email address is already in use by another account.';
                        break;
                    case 'auth/invalid-email':
                        message = 'The email address is not valid.';
                        break;
                    case 'auth/operation-not-allowed':
                        message = 'Email/password accounts are not enabled. Please enable them in Firebase Console.';
                        break;
                    case 'auth/weak-password':
                        message = 'The password is too weak. Please choose a stronger password.';
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
