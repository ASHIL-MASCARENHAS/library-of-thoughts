<nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-2 py-lg-3">
    <div class="container-fluid">
        <!-- Brand Logo and Title -->
        <a class="navbar-brand text-primary-color" href="/">
            <i class="fas fa-brain me-2"></i>Library of Thoughts
        </a>
        <!-- Navbar Toggler for Mobile -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <!-- Navbar Links -->
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto align-items-center">
                <li class="nav-item mx-1 mx-lg-2">
                    <a class="nav-link <%= typeof activePage !== 'undefined' && activePage === 'home' ? 'active' : '' %>" href="/">Home</a>
                </li>
                <li class="nav-item mx-1 mx-lg-2">
                    <a class="nav-link <%= typeof activePage !== 'undefined' && (activePage === 'liturgicalCalendar' || activePage === 'insights' || activePage === 'anecdotes' || activePage === 'books' || activePage === 'weblinks' || activePage === 'grammar' || activePage === 'archives') ? 'active' : '' %>" href="/liturgicalCalendar">Content</a>
                </li>
                <li class="nav-item mx-1 mx-lg-2">
                    <a class="nav-link" href="#">Resources</a>
                </li>
                <!-- User Authentication Status (Dynamic) -->
                <li class="nav-item mx-1 mx-lg-2" id="auth-status-container">
                    <% if (user) { %>
                        <div class="dropdown">
                            <a class="nav-link dropdown-toggle" href="#" id="profileDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="fas fa-user-circle me-1"></i><%= user.email || 'Profile' %>
                            </a>
                            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                                <li><a class="dropdown-item" href="#">Settings</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item" href="#" id="logout-button">Logout</a></li>
                            </ul>
                        </div>
                    <% } else { %>
                        <a class="btn btn-outline-primary btn-sm px-3" href="/login">
                            <i class="fas fa-sign-in-alt me-1"></i>Sign In
                        </a>
                    <% } %>
                </li>
            </ul>
        </div>
    </div>
</nav>

<script type="module">
    // Firebase SDK imports
    import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
    import { getAuth, signOut, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
    import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

    // Use server-passed Firebase config, fallback to Canvas-provided, or a warning
    // IMPORTANT: Use <%- to prevent HTML escaping of the JSON string
    const firebaseConfig = typeof <%- JSON.stringify(firebaseConfig) %> !== 'undefined' && Object.keys(<%- JSON.stringify(firebaseConfig) %>).length > 0
                           ? <%- JSON.stringify(firebaseConfig) %>
                           : (typeof __firebase_config !== 'undefined' && Object.keys(JSON.parse(__firebase_config)).length > 0
                               ? JSON.parse(__firebase_config)
                               : null); // Fallback to null if no config is found

    console.log('Using Firebase Config (navbar):', firebaseConfig);

    let auth;
    let db;
    let app;

    // Initialize Firebase if config is valid
    if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId) {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        // Listen for authentication state changes
        onAuthStateChanged(auth, async (user) => {
            const authStatusContainer = document.getElementById('auth-status-container');
            if (authStatusContainer) {
                if (user) {
                    // User is signed in: Update UI to show profile/email
                    authStatusContainer.innerHTML = `
                        <div class="dropdown">
                            <a class="nav-link dropdown-toggle" href="#" id="profileDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="fas fa-user-circle me-1"></i>${user.email || 'Profile'}
                            </a>
                            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                                <li><a class="dropdown-item" href="#">Settings</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item" href="#" id="logout-button">Logout</a></li>
                            </ul>
                        </div>
                    `;
                    // Attach logout event listener
                    document.getElementById('logout-button')?.addEventListener('click', async (e) => {
                        e.preventDefault();
                        try {
                            await signOut(auth); // Sign out from Firebase client
                            await fetch('/sessionLogout', { method: 'POST' }); // Notify server to clear session cookie
                            window.location.href = '/login'; // Redirect to login after logout
                        } catch (error) {
                            console.error('Error signing out:', error);
                        }
                    });

                    // Refresh and send ID token to server to maintain session
                    try {
                        const idToken = await user.getIdToken(true); // true forces a refresh
                        await fetch('/sessionLogin', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ idToken })
                        });
                        console.log('Session cookie updated with fresh ID token.');
                    } catch (error) {
                        console.error('Error refreshing or setting session cookie:', error);
                    }

                } else {
                    // User is signed out: Update UI to show sign-in button
                    authStatusContainer.innerHTML = `
                        <a class="btn btn-outline-primary btn-sm px-3" href="/login">
                            <i class="fas fa-sign-in-alt me-1"></i>Sign In
                        </a>
                    `;

                    // Attempt anonymous sign-in if no user and no custom token (for local dev)
                    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
                    if (!initialAuthToken) {
                         signInAnonymously(auth)
                            .then((anonUserCredential) => {
                                console.log('Signed in anonymously (no existing user):', anonUserCredential.user.uid);
                            })
                            .catch((error) => {
                                console.error('Error signing in anonymously (no existing user):', error);
                            });
                    }
                }
            }
        });
    } else {
        console.error('Firebase config is incomplete or missing. Firebase will not be initialized. Please ensure your .env file is correctly set up and passed from the server, or that __firebase_config is available in the Canvas environment.');
    }
</script>
