require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const cookieParser = require('cookie-parser');

// --- Firebase Admin SDK Initialization ---
let serviceAccount;
try {
    // Attempt to load from environment variable (for production/deployment)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64) {
        const decodedServiceAccount = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf8');
        serviceAccount = JSON.parse(decodedServiceAccount);
        console.log('Firebase serviceAccountKey loaded from environment variable.');
    } else {
        // Fallback to local file (for local development)
        const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
        if (fs.existsSync(serviceAccountPath)) {
            serviceAccount = require(serviceAccountPath);
            console.log('serviceAccountKey.json loaded successfully from local file:', serviceAccountPath);
        } else {
            console.error('Error: serviceAccountKey.json not found locally and FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 env var is missing.');
            console.error('Firebase Admin SDK will not be fully initialized. Session management and secure Firestore access will be limited.');
        }
    }
} catch (error) {
    console.error('Error loading or parsing Firebase service account credentials:', error);
    console.error('Please ensure FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 is valid base64 JSON or serviceAccountKey.json is valid and accessible.');
}

try {
    if (serviceAccount) {
        // Check if app is already initialized to prevent re-initialization in hot-reloading environments
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('Firebase Admin SDK initialized for server-side operations.');
        } else {
            console.log('Firebase Admin SDK already initialized.');
        }
    } else {
        console.warn('Firebase Admin SDK not initialized due to missing or invalid service account credentials.');
    }
} catch (error) {
    console.warn('Firebase Admin SDK initialization caught error:', error.message);
}
const db = admin.firestore();
const authAdmin = admin.auth(); // Get Firebase Admin Auth instance

// Express app setup
const app = express();
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Load liturgical data
const liturgicalData = JSON.parse(fs.readFileSync('./data/liturgical-calendar.json', 'utf-8'));

// Construct Firebase client-side config from environment variables
const firebaseClientConfig = {
    apiKey: process.env.APIKEY,
    authDomain: process.env.AUTHDOMAIN,
    projectId: process.env.PROJECTID,
    storageBucket: process.env.STORAGEBUCKET,
    messagingSenderId: process.env.MESSAGINGSENDERID,
    appId: process.env.APPID,
    measurementId: process.env.MEASUREMENTID // Optional
};

console.log('Firebase Client Config being passed to EJS:', firebaseClientConfig);

// Middleware to make Firebase config and user available to all EJS templates
app.use(async (req, res, next) => {
    res.locals.firebaseConfig = firebaseClientConfig; // Client-side config
    res.locals.user = null; // Default user to null

    const sessionCookie = req.cookies.__session || '';

    // Only attempt session verification if Admin SDK is initialized
    if (admin.apps.length && authAdmin) {
        try {
            if (sessionCookie) {
                const decodedClaims = await authAdmin.verifySessionCookie(sessionCookie, true /** checkRevoked */);
                res.locals.user = await authAdmin.getUser(decodedClaims.uid);
                // console.log('User authenticated via session cookie:', res.locals.user.email); // Commented out for cleaner logs
            }
        } catch (error) {
            console.error('Session cookie verification failed:', error.message);
            res.clearCookie('__session');
        }
    } else {
        console.warn('Firebase Admin SDK not fully initialized. Skipping session cookie verification.');
    }
    next();
});

// Middleware to protect routes that require authentication
const isAuthenticated = (req, res, next) => {
    if (res.locals.user) {
        next(); // User is authenticated, proceed
    } else {
        res.redirect('/login'); // Redirect to login page
    }
};

// --- Authentication Routes ---
app.get('/login', (req, res) => {
    res.render('login', { firebaseConfig: res.locals.firebaseConfig });
});

app.get('/register', (req, res) => {
    res.render('register', { firebaseConfig: res.locals.firebaseConfig });
});

app.post('/sessionLogin', async (req, res) => {
    const idToken = req.body.idToken;
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

    if (!admin.apps.length || !authAdmin) {
        console.error('Firebase Admin SDK not initialized. Cannot create session cookie.');
        return res.status(500).send(JSON.stringify({ status: 'failed', message: 'Server error: Authentication service not ready.' }));
    }

    try {
        const sessionCookie = await authAdmin.createSessionCookie(idToken, { expiresIn });
        const options = { maxAge: expiresIn, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' }; // Use 'secure' in production, 'lax' for development
        res.cookie('__session', sessionCookie, options);
        res.status(200).send(JSON.stringify({ status: 'success' }));
    } catch (error) {
        console.error('Error creating session cookie:', error);
        res.status(401).send(JSON.stringify({ status: 'failed', message: 'Unauthorized: Session creation failed.' }));
    }
});

app.post('/sessionLogout', async (req, res) => {
    res.clearCookie('__session');
    // Optional: Revoke all refresh tokens for the user for stronger security
    // This requires the Admin SDK to be initialized and the user object to be available
    if (admin.apps.length && authAdmin && res.locals.user && res.locals.user.uid) {
        try {
            await authAdmin.revokeRefreshTokens(res.locals.user.uid);
            console.log('Refresh tokens revoked for user:', res.locals.user.uid);
        } catch (error) {
            console.error('Error revoking refresh tokens:', error);
        }
    }
    res.status(200).send(JSON.stringify({ status: 'success' }));
});

// --- Main Routes ---
app.get('/', (req, res) => {
    res.render('home', { user: res.locals.user });
});

// --- Content Overview Page ---
app.get('/content', isAuthenticated, (req, res) => {
    res.render('content', { user: res.locals.user });
});

// --- Liturgical Calendar Routes ---
app.get('/liturgicalCalendar', isAuthenticated, async (req, res) => {
    const requestedDate = req.query.date || new Date().toISOString().slice(0, 10);
    const info = liturgicalData[requestedDate];

    let dailyReflections = [];
    // Only attempt Firestore query if Admin SDK is initialized and user is authenticated
    if (admin.apps.length && res.locals.user) {
        try {
            const reflectionsRef = db.collection('reflections')
                                     .where('userId', '==', res.locals.user.uid)
                                     .where('date', '==', requestedDate);
            const snapshot = await reflectionsRef.get();
            dailyReflections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            dailyReflections.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));
        } catch (err) {
            console.error('Error fetching daily reflections:', err);
        }
    } else {
        console.warn('Firestore query skipped: Admin SDK not initialized or user not authenticated.');
    }

    res.render('liturgicalCalendar', {
        user: res.locals.user,
        info: info,
        dailyReflections: dailyReflections,
        firebaseConfig: res.locals.firebaseConfig,
        requestedDate: requestedDate
    });
});

// Adds a new daily reflection
app.post('/liturgicalCalendar/reflect', isAuthenticated, async (req, res) => {
    const { date, description, hashtags } = req.body;
    const tagsArray = hashtags ? hashtags.split(/[\s,]+/).filter(tag => tag.length > 0).map(tag => ({ name: tag.replace(/^#/, '') })) : [];

    if (!admin.apps.length || !res.locals.user) {
        return res.status(500).send('Server error: Database service not ready or user not authenticated.');
    }

    try {
        await db.collection('reflections').add({
            userId: res.locals.user.uid,
            date: date,
            description: description,
            hashtags: tagsArray,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.redirect(`/liturgicalCalendar?date=${date}`);
    } catch (err) {
        console.error('Error adding daily reflection:', err);
        res.status(500).send('Server Error');
    }
});

// Displays the edit daily reflection page
app.get('/liturgicalCalendar/reflect/edit/:id', isAuthenticated, async (req, res) => {
    if (!admin.apps.length || !res.locals.user) {
        return res.status(500).send('Server error: Database service not ready or user not authenticated.');
    }
    try {
        const reflectionRef = db.collection('reflections').doc(req.params.id);
        const reflectionDoc = await reflectionRef.get();

        if (!reflectionDoc.exists || reflectionDoc.data().userId !== res.locals.user.uid) {
            return res.status(404).send('Reflection not found or unauthorized');
        }

        res.render('editDailyReflection', {
            user: res.locals.user,
            reflection: { id: reflectionDoc.id, ...reflectionDoc.data() },
            firebaseConfig: res.locals.firebaseConfig
        });
    } catch (err) {
        console.error('Error fetching reflection for edit:', err);
        res.status(500).send('Server Error');
    }
});

// Updates a daily reflection
app.post('/liturgicalCalendar/reflect/update/:id', isAuthenticated, async (req, res) => {
    const { date, description, hashtags } = req.body;
    const tagsArray = hashtags ? hashtags.split(/[\s,]+/).filter(tag => tag.length > 0).map(tag => ({ name: tag.replace(/^#/, '') })) : [];

    if (!admin.apps.length || !res.locals.user) {
        return res.status(500).send('Server error: Database service not ready or user not authenticated.');
    }

    try {
        const reflectionRef = db.collection('reflections').doc(req.params.id);
        const reflectionDoc = await reflectionRef.get();

        if (!reflectionDoc.exists || reflectionDoc.data().userId !== res.locals.user.uid) {
            return res.status(404).send('Reflection not found or unauthorized');
        }

        await reflectionRef.update({
            description: description,
            hashtags: tagsArray,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.redirect(`/liturgicalCalendar?date=${date}`);
    } catch (err) {
        console.error('Error updating daily reflection:', err);
        res.status(500).send('Server Error');
    }
});

// Deletes a daily reflection
app.post('/liturgicalCalendar/reflect/delete/:id', isAuthenticated, async (req, res) => {
    const redirectDate = req.query.date || new Date().toISOString().slice(0, 10);
    if (!admin.apps.length || !res.locals.user) {
        return res.status(500).send('Server error: Database service not ready or user not authenticated.');
    }
    try {
        const reflectionRef = db.collection('reflections').doc(req.params.id);
        const reflectionDoc = await reflectionRef.get();

        if (!reflectionDoc.exists || reflectionDoc.data().userId !== res.locals.user.uid) {
            return res.status(404).send('Reflection not found or unauthorized');
        }

        await reflectionRef.delete();
        res.redirect(`/liturgicalCalendar?date=${redirectDate}`);
    } catch (err) {
        console.error('Error deleting daily reflection:', err);
        res.status(500).send('Server Error');
    }
});


// --- Insights Routes ---
// Displays the insights page
app.get('/insights', isAuthenticated, async (req, res) => {
    const searchQuery = req.query.search ? req.query.search.toLowerCase() : '';
    let insights = [];
    if (!admin.apps.length || !res.locals.user) {
        console.warn('Firestore query skipped for insights: Admin SDK not initialized or user not authenticated.');
        return res.render('insights', { user: res.locals.user, insights: [], search: searchQuery });
    }
    try {
        let insightsRef = db.collection('insights').where('userId', '==', res.locals.user.uid);
        let snapshot = await insightsRef.get();

        insights = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Client-side filtering for search query
        if (searchQuery) {
            insights = insights.filter(insight =>
                insight.description.toLowerCase().includes(searchQuery) ||
                insight.hashtags.some(tag => tag.name.toLowerCase().includes(searchQuery))
            );
        }
        insights.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));

    } catch (err) {
        console.error('Error fetching insights:', err);
    }
    res.render('insights', { user: res.locals.user, insights: insights, search: searchQuery });
});

// Adds a new insight
app.post('/insightsCreate', isAuthenticated, async (req, res) => {
    const { description, hashtags } = req.body;
    const tagsArray = hashtags ? hashtags.split(/[\s,]+/).filter(tag => tag.length > 0).map(tag => ({ name: tag.replace(/^#/, '') })) : [];

    if (!admin.apps.length || !res.locals.user) {
        return res.status(500).send('Server error: Database service not ready or user not authenticated.');
    }

    try {
        await db.collection('insights').add({
            userId: res.locals.user.uid,
            description: description,
            hashtags: tagsArray,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.redirect('/insights');
    } catch (err) {
        console.error('Error adding insight:', err);
        res.status(500).send('Server Error');
    }
});

// Displays the edit insight page
app.get('/insights/edit/:id', isAuthenticated, async (req, res) => {
    if (!admin.apps.length || !res.locals.user) {
        return res.status(500).send('Server error: Database service not ready or user not authenticated.');
    }
    try {
        const insightRef = db.collection('insights').doc(req.params.id);
        const insightDoc = await insightRef.get();

        if (!insightDoc.exists || insightDoc.data().userId !== res.locals.user.uid) {
            return res.status(404).send('Insight not found or unauthorized');
        }

        res.render('editInsight', { user: res.locals.user, insight: { id: insightDoc.id, ...insightDoc.data() } });
    } catch (err) {
        console.error('Error fetching insight for edit:', err);
        res.status(500).send('Server Error');
    }
});

// Updates an insight
app.post('/insights/update/:id', isAuthenticated, async (req, res) => {
    const { description, hashtags } = req.body;
    const tagsArray = hashtags ? hashtags.split(/[\s,]+/).filter(tag => tag.length > 0).map(tag => ({ name: tag.replace(/^#/, '') })) : [];

    if (!admin.apps.length || !res.locals.user) {
        return res.status(500).send('Server error: Database service not ready or user not authenticated.');
    }

    try {
        const insightRef = db.collection('insights').doc(req.params.id);
        const insightDoc = await insightRef.get();

        if (!insightDoc.exists || insightDoc.data().userId !== res.locals.user.uid) {
            return res.status(404).send('Insight not found or unauthorized');
        }

        await insightRef.update({
            description: description,
            hashtags: tagsArray,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.redirect('/insights');
    } catch (err) {
        console.error('Error updating insight:', err);
        res.status(500).send('Server Error');
    }
});

// Deletes an insight
app.post('/insights/delete/:id', isAuthenticated, async (req, res) => {
    if (!admin.apps.length || !res.locals.user) {
        return res.status(500).send('Server error: Database service not ready or user not authenticated.');
    }
    try {
        const insightRef = db.collection('insights').doc(req.params.id);
        const insightDoc = await insightRef.get();

        if (!insightDoc.exists || insightDoc.data().userId !== res.locals.user.uid) {
            return res.status(404).send('Insight not found or unauthorized');
        }

        await insightRef.delete();
        res.redirect('/insights');
    } catch (err) {
        console.error('Error deleting insight:', err);
        res.status(500).send('Server Error');
    }
});

// --- Anecdotes Routes ---
// Displays the anecdotes page
app.get('/anecdotes', isAuthenticated, async (req, res) => {
    const searchQuery = req.query.search ? req.query.search.toLowerCase() : '';
    let anecdotes = [];
    if (!admin.apps.length || !res.locals.user) {
        console.warn('Firestore query skipped for anecdotes: Admin SDK not initialized or user not authenticated.');
        return res.render('anecdotes', { user: res.locals.user, anecdotes: [], search: searchQuery });
    }
    try {
        let anecdotesRef = db.collection('anecdotes').where('userId', '==', res.locals.user.uid);
        let snapshot = await anecdotesRef.get();

        anecdotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Client-side filtering for search query
        if (searchQuery) {
            anecdotes = anecdotes.filter(anecdote =>
                anecdote.title.toLowerCase().includes(searchQuery) ||
                anecdote.content.toLowerCase().includes(searchQuery) ||
                anecdote.hashtags.some(tag => tag.name.toLowerCase().includes(searchQuery))
            );
        }
        anecdotes.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));

    } catch (err) {
        console.error('Error fetching anecdotes:', err);
    }
    res.render('anecdotes', { user: res.locals.user, anecdotes: anecdotes, search: searchQuery });
});

// Adds a new anecdote
app.post('/anecdotes/create', isAuthenticated, async (req, res) => {
    const { title, content, hashtags } = req.body;
    const tagsArray = hashtags ? hashtags.split(/[\s,]+/).filter(tag => tag.length > 0).map(tag => ({ name: tag.replace(/^#/, '') })) : [];

    if (!admin.apps.length || !res.locals.user) {
        return res.status(500).send('Server error: Database service not ready or user not authenticated.');
    }

    try {
        await db.collection('anecdotes').add({
            userId: res.locals.user.uid,
            title: title,
            content: content,
            hashtags: tagsArray,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.redirect('/anecdotes');
    } catch (err) {
        console.error('Error adding anecdote:', err);
        res.status(500).send('Server Error');
    }
});

// Displays the edit anecdote page
app.get('/anecdotes/edit/:id', isAuthenticated, async (req, res) => {
    if (!admin.apps.length || !res.locals.user) {
        return res.status(500).send('Server error: Database service not ready or user not authenticated.');
    }
    try {
        const anecdoteRef = db.collection('anecdotes').doc(req.params.id);
        const anecdoteDoc = await anecdoteRef.get();

        if (!anecdoteDoc.exists || anecdoteDoc.data().userId !== res.locals.user.uid) {
            return res.status(404).send('Anecdote not found or unauthorized');
        }

        res.render('editAnecdote', { user: res.locals.user, anecdote: { id: anecdoteDoc.id, ...anecdoteDoc.data() } });
    } catch (err) {
        console.error('Error fetching anecdote for edit:', err);
        res.status(500).send('Server Error');
    }
});

// Updates an anecdote
app.post('/anecdotes/update/:id', isAuthenticated, async (req, res) => {
    const { title, content, hashtags } = req.body;
    const tagsArray = hashtags ? hashtags.split(/[\s,]+/).filter(tag => tag.length > 0).map(tag => ({ name: tag.replace(/^#/, '') })) : [];

    if (!admin.apps.length || !res.locals.user) {
        return res.status(500).send('Server error: Database service not ready or user not authenticated.');
    }

    try {
        const anecdoteRef = db.collection('anecdotes').doc(req.params.id);
        const anecdoteDoc = await anecdoteRef.get();

        if (!anecdoteDoc.exists || anecdoteDoc.data().userId !== res.locals.user.uid) {
            return res.status(404).send('Anecdote not found or unauthorized');
        }

        await anecdoteRef.update({
            title: title,
            content: content,
            hashtags: tagsArray,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.redirect('/anecdotes');
    } catch (err) {
        console.error('Error updating anecdote:', err);
        res.status(500).send('Server Error');
    }
});

// Deletes an anecdote
app.post('/anecdotes/delete/:id', isAuthenticated, async (req, res) => {
    if (!admin.apps.length || !res.locals.user) {
        return res.status(500).send('Server error: Database service not ready or user not authenticated.');
    }
    try {
        const anecdoteRef = db.collection('anecdotes').doc(req.params.id);
        const anecdoteDoc = await anecdoteRef.get();

        if (!anecdoteDoc.exists || anecdoteDoc.data().userId !== res.locals.user.uid) {
            return res.status(404).send('Anecdote not found or unauthorized');
        }

        await anecdoteRef.delete();
        res.redirect('/anecdotes');
    } catch (err) {
        console.error('Error deleting anecdote:', err);
        res.status(500).send('Server Error');
    }
});

// --- Books Routes ---
// Displays the books page
app.get('/books', isAuthenticated, async (req, res) => {
    const searchQuery = req.query.search ? req.query.search.toLowerCase() : '';
    let books = [];
    if (!admin.apps.length || !res.locals.user) {
        console.warn('Firestore query skipped for books: Admin SDK not initialized or user not authenticated.');
        return res.render('books', { user: res.locals.user, books: [], search: searchQuery });
    }
    try {
        let booksRef = db.collection('books').where('userId', '==', res.locals.user.uid);
        let snapshot = await booksRef.get();

        books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Client-side filtering for search query
        if (searchQuery) {
            books = books.filter(book =>
                book.title.toLowerCase().includes(searchQuery) ||
                book.author.toLowerCase().includes(searchQuery) ||
                book.notes.toLowerCase().includes(searchQuery) ||
                book.hashtags.some(tag => tag.name.toLowerCase().includes(searchQuery))
            );
        }
        books.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));

    } catch (err) {
        console.error('Error fetching books:', err);
    }
    res.render('books', { user: res.locals.user, books: books, search: searchQuery });
});

// Adds a new book
app.post('/books/create', isAuthenticated, async (req, res) => {
    const { title, author, notes, link, pdfUrl, hashtags } = req.body;
    const tagsArray = hashtags ? hashtags.split(/[\s,]+/).filter(tag => tag.length > 0).map(tag => ({ name: tag.replace(/^#/, '') })) : [];

    if (!admin.apps.length || !res.locals.user) {
        return res.status(500).send('Server error: Database service not ready or user not authenticated.');
    }

    try {
        await db.collection('books').add({
            userId: res.locals.user.uid,
            title: title,
            author: author,
            notes: notes,
            link: link,
            pdfUrl: pdfUrl,
            hashtags: tagsArray,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.redirect('/books');
    } catch (err) {
        console.error('Error adding book:', err);
        res.status(500).send('Server Error');
    }
});

// Displays the edit book page
app.get('/books/edit/:id', isAuthenticated, async (req, res) => {
    if (!admin.apps.length || !res.locals.user) {
        return res.status(500).send('Server error: Database service not ready or user not authenticated.');
    }
    try {
        const bookRef = db.collection('books').doc(req.params.id);
        const bookDoc = await bookRef.get();

        if (!bookDoc.exists || bookDoc.data().userId !== res.locals.user.uid) {
            return res.status(404).send('Book not found or unauthorized');
        }

        res.render('editBook', { user: res.locals.user, book: { id: bookDoc.id, ...bookDoc.data() } });
    } catch (err) {
        console.error('Error fetching book for edit:', err);
        res.status(500).send('Server Error');
    }
});

// Updates a book
app.post('/books/update/:id', isAuthenticated, async (req, res) => {
    const { title, author, notes, link, pdfUrl, hashtags } = req.body;
    const tagsArray = hashtags ? hashtags.split(/[\s,]+/).filter(tag => tag.length > 0).map(tag => ({ name: tag.replace(/^#/, '') })) : [];

    if (!admin.apps.length || !res.locals.user) {
        return res.status(500).send('Server error: Database service not ready or user not authenticated.');
    }

    try {
        const bookRef = db.collection('books').doc(req.params.id);
        const bookDoc = await bookRef.get();

        if (!bookDoc.exists || bookDoc.data().userId !== res.locals.user.uid) {
            return res.status(404).send('Book not found or unauthorized');
        }

        await bookRef.update({
            title: title,
            author: author,
            notes: notes,
            link: link,
            pdfUrl: pdfUrl,
            hashtags: tagsArray,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.redirect('/books');
    } catch (err) {
        console.error('Error updating book:', err);
        res.status(500).send('Server Error');
    }
});

// Deletes a book
app.post('/books/delete/:id', isAuthenticated, async (req, res) => {
    if (!admin.apps.length || !res.locals.user) {
        return res.status(500).send('Server error: Database service not ready or user not authenticated.');
    }
    try {
        const bookRef = db.collection('books').doc(req.params.id);
        const bookDoc = await bookRef.get();

        if (!bookDoc.exists || bookDoc.data().userId !== res.locals.user.uid) {
            return res.status(404).send('Book not found or unauthorized');
        }

        await bookRef.delete();
        res.redirect('/books');
    } catch (err) {
        console.error('Error deleting book:', err);
        res.status(500).send('Server Error');
    }
});

// --- Web-Links Routes ---
// Displays the weblinks page
app.get('/weblinks', isAuthenticated, async (req, res) => {
    const searchQuery = req.query.search ? req.query.search.toLowerCase() : '';
    let weblinks = [];
    if (!admin.apps.length || !res.locals.user) {
        console.warn('Firestore query skipped for weblinks: Admin SDK not initialized or user not authenticated.');
        return res.render('weblinks', { user: res.locals.user, weblinks: [], search: searchQuery });
    }
    try {
        let weblinksRef = db.collection('weblinks').where('userId', '==', res.locals.user.uid);
        let snapshot = await weblinksRef.get();

        weblinks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Client-side filtering for search query
        if (searchQuery) {
            weblinks = weblinks.filter(weblink =>
                weblink.title.toLowerCase().includes(searchQuery) ||
                weblink.url.toLowerCase().includes(searchQuery) ||
                weblink.notes.toLowerCase().includes(searchQuery) ||
                weblink.hashtags.some(tag => tag.name.toLowerCase().includes(searchQuery))
            );
        }
        weblinks.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));

    } catch (err) {
        console.error('Error fetching weblinks:', err);
    }
    res.render('weblinks', { user: res.locals.user, weblinks: weblinks, search: searchQuery });
});

// Adds a new web-link
app.post('/weblinks/create', isAuthenticated, async (req, res) => {
    const { title, url, notes, hashtags } = req.body;
    const tagsArray = hashtags ? hashtags.split(/[\s,]+/).filter(tag => tag.length > 0).map(tag => ({ name: tag.replace(/^#/, '') })) : [];

    if (!admin.apps.length || !res.locals.user) {
        return res.status(500).send('Server error: Database service not ready or user not authenticated.');
    }

    try {
        await db.collection('weblinks').add({
            userId: res.locals.user.uid,
            title: title,
            url: url,
            notes: notes,
            hashtags: tagsArray,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.redirect('/weblinks');
    } catch (err) {
        console.error('Error adding web-link:', err);
        res.status(500).send('Server Error');
    }
});

// Displays the edit web-link page
app.get('/weblinks/edit/:id', isAuthenticated, async (req, res) => {
    if (!admin.apps.length || !res.locals.user) {
        return res.status(500).send('Server error: Database service not ready or user not authenticated.');
    }
    try {
        const weblinkRef = db.collection('weblinks').doc(req.params.id);
        const weblinkDoc = await weblinkRef.get();

        if (!weblinkDoc.exists || weblinkDoc.data().userId !== res.locals.user.uid) {
            return res.status(404).send('Web-link not found or unauthorized');
        }

        res.render('editWeblink', { user: res.locals.user, weblink: { id: weblinkDoc.id, ...weblinkDoc.data() } });
    } catch (err) {
        console.error('Error fetching web-link for edit:', err);
        res.status(500).send('Server Error');
    }
});

// Updates a web-link
app.post('/weblinks/update/:id', isAuthenticated, async (req, res) => {
    const { title, url, notes, hashtags } = req.body;
    const tagsArray = hashtags ? hashtags.split(/[\s,]+/).filter(tag => tag.length > 0).map(tag => ({ name: tag.replace(/^#/, '') })) : [];

    if (!admin.apps.length || !res.locals.user) {
        return res.status(500).send('Server error: Database service not ready or user not authenticated.');
    }

    try {
        const weblinkRef = db.collection('weblinks').doc(req.params.id);
        const weblinkDoc = await weblinkRef.get();

        if (!weblinkDoc.exists || weblinkDoc.data().userId !== res.locals.user.uid) {
            return res.status(404).send('Web-link not found or unauthorized');
        }

        await weblinkRef.update({
            title: title,
            url: url,
            notes: notes,
            hashtags: tagsArray,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.redirect('/weblinks');
    } catch (err) {
        console.error('Error updating web-link:', err);
        res.status(500).send('Server Error');
    }
});

// Deletes a web-link
app.post('/weblinks/delete/:id', isAuthenticated, async (req, res) => {
    if (!admin.apps.length || !res.locals.user) {
        return res.status(500).send('Server error: Database service not ready or user not authenticated.');
    }
    try {
        const weblinkRef = db.collection('weblinks').doc(req.params.id);
        const weblinkDoc = await weblinkRef.get();

        if (!weblinkDoc.exists || weblinkDoc.data().userId !== res.locals.user.uid) {
            return res.status(404).send('Web-link not found or unauthorized');
        }

        await weblinkRef.delete();
        res.redirect('/weblinks');
    } catch (err) {
        console.error('Error deleting web-link:', err);
        res.status(500).send('Server Error');
    }
});

// --- Grammar Routes ---
// Displays the grammar page
app.get('/grammar', isAuthenticated, async (req, res) => {
    const searchQuery = req.query.search ? req.query.search.toLowerCase() : '';
    let grammarEntries = [];
    if (!admin.apps.length || !res.locals.user) {
        console.warn('Firestore query skipped for grammar: Admin SDK not initialized or user not authenticated.');
        return res.render('grammar', { user: res.locals.user, grammarEntries: [], search: searchQuery });
    }
    try {
        let grammarRef = db.collection('grammar').where('userId', '==', res.locals.user.uid);
        let snapshot = await grammarRef.get();

        grammarEntries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Client-side filtering for search query
        if (searchQuery) {
            grammarEntries = grammarEntries.filter(entry =>
                entry.topic.toLowerCase().includes(searchQuery) ||
                entry.rule.toLowerCase().includes(searchQuery) ||
                (entry.notes && entry.notes.toLowerCase().includes(searchQuery)) ||
                (entry.examples && entry.examples.some(ex => ex.toLowerCase().includes(searchQuery))) ||
                entry.hashtags.some(tag => tag.name.toLowerCase().includes(searchQuery))
            );
        }
        grammarEntries.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));

    } catch (err) {
        console.error('Error fetching grammar entries:', err);
    }
    res.render('grammar', { user: res.locals.user, grammarEntries: grammarEntries, search: searchQuery });
});

// Adds a new grammar entry
app.post('/grammar/create', isAuthenticated, async (req, res) => {
    const { topic, rule, examples, notes, hashtags } = req.body;
    const examplesArray = examples ? examples.split('\n').map(ex => ex.trim()).filter(ex => ex.length > 0) : [];
    const tagsArray = hashtags ? hashtags.split(/[\s,]+/).filter(tag => tag.length > 0).map(tag => ({ name: tag.replace(/^#/, '') })) : [];

    if (!admin.apps.length || !res.locals.user) {
        return res.status(500).send('Server error: Database service not ready or user not authenticated.');
    }

    try {
        await db.collection('grammar').add({
            userId: res.locals.user.uid,
            topic: topic,
            rule: rule,
            examples: examplesArray,
            notes: notes,
            hashtags: tagsArray,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.redirect('/grammar');
    } catch (err) {
        console.error('Error adding grammar entry:', err);
        res.status(500).send('Server Error');
    }
});

// Displays the edit grammar entry page
app.get('/grammar/edit/:id', isAuthenticated, async (req, res) => {
    if (!admin.apps.length || !res.locals.user) {
        return res.status(500).send('Server error: Database service not ready or user not authenticated.');
    }
    try {
        const grammarRef = db.collection('grammar').doc(req.params.id);
        const grammarDoc = await grammarRef.get();

        if (!grammarDoc.exists || grammarDoc.data().userId !== res.locals.user.uid) {
            return res.status(404).send('Grammar entry not found or unauthorized');
        }

        res.render('editGrammar', { user: res.locals.user, grammarEntry: { id: grammarDoc.id, ...grammarDoc.data() } });
    } catch (err) {
        console.error('Error fetching grammar entry for edit:', err);
        res.status(500).send('Server Error');
    }
});

// Updates a grammar entry
app.post('/grammar/update/:id', isAuthenticated, async (req, res) => {
    const { topic, rule, examples, notes, hashtags } = req.body;
    const examplesArray = examples ? examples.split('\n').map(ex => ex.trim()).filter(ex => ex.length > 0) : [];
    const tagsArray = hashtags ? hashtags.split(/[\s,]+/).filter(tag => tag.length > 0).map(tag => ({ name: tag.replace(/^#/, '') })) : [];

    if (!admin.apps.length || !res.locals.user) {
        return res.status(500).send('Server error: Database service not ready or user not authenticated.');
    }

    try {
        const grammarRef = db.collection('grammar').doc(req.params.id);
        const grammarDoc = await grammarRef.get();

        if (!grammarDoc.exists || grammarDoc.data().userId !== res.locals.user.uid) {
            return res.status(404).send('Grammar entry not found or unauthorized');
        }

        await grammarRef.update({
            topic: topic,
            rule: rule,
            examples: examplesArray,
            notes: notes,
            hashtags: tagsArray,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.redirect('/grammar');
    } catch (err) {
        console.error('Error updating grammar entry:', err);
        res.status(500).send('Server Error');
    }
});

// Deletes a grammar entry
app.post('/grammar/delete/:id', isAuthenticated, async (req, res) => {
    if (!admin.apps.length || !res.locals.user) {
        return res.status(500).send('Server error: Database service not ready or user not authenticated.');
    }
    try {
        const grammarRef = db.collection('grammar').doc(req.params.id);
        const grammarDoc = await grammarRef.get();

        if (!grammarDoc.exists || grammarDoc.data().userId !== res.locals.user.uid) {
            return res.status(404).send('Grammar entry not found or unauthorized');
        }

        await grammarRef.delete();
        res.redirect('/grammar');
    } catch (err) {
        console.error('Error deleting grammar entry:', err);
        res.status(500).send('Server Error');
    }
});

// --- Archives Routes ---
// Displays the archives overview page
app.get('/archives', isAuthenticated, async (req, res) => {
    try {
        res.render('archives', { user: res.locals.user, firebaseConfig: res.locals.firebaseConfig });
    } catch (err) {
        console.error('Error fetching archives page:', err);
        res.status(500).send('Server Error');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
