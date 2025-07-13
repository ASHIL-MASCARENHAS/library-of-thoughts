// server.js
require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const path = require('path');
const mongoose = require('mongoose'); // Mongoose for MongoDB interaction
const session = require('express-session'); // For managing user sessions
const MongoStore = require('connect-mongo'); // To store sessions in MongoDB
const passport = require('passport'); // Authentication middleware
const LocalStrategy = require('passport-local').Strategy; // Local authentication strategy
const bcrypt = require('bcryptjs'); // For password hashing

// Import Mongoose Models
const User = require('./models/user');
const Reflection = require('./models/Reflection');
const Insight = require('./models/insight');
const Anecdote = require('./models/Anecdote');
const Book = require('./models/Book');
const Weblink = require('./models/Weblink');
const Grammar = require('./models/Grammar');

const app = express();

// Define the base path for the application.
const BASE_PATH = process.env.BASE_PATH || '/libraryOfThoughts'; // Default to /libraryOfThoughts

// --- MongoDB Connection ---
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/libraryofthoughts';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- Middleware Setup ---
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(express.json()); // For parsing application/json
app.use(BASE_PATH,express.static(path.join(__dirname, 'public'))); // Serve static files
app.set('view engine', 'ejs'); // Set EJS as the view engine
app.set('views', path.join(__dirname, 'views')); // Specify views directory

// Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecretkey', // Use a strong secret from environment variables
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: MONGODB_URI,
        collectionName: 'sessions', // Collection to store sessions
        ttl: 14 * 24 * 60 * 60 // Session TTL (14 days)
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true // Prevent client-side JavaScript from accessing cookies
    }
}));

// Passport.js Initialization
app.use(passport.initialize());
app.use(passport.session());

// Passport Local Strategy Configuration
passport.use(new LocalStrategy(
    { usernameField: 'email' }, // Use 'email' as the username field
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email: email });
            if (!user) {
                return done(null, false, { message: 'Incorrect email or password.' });
            }
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return done(null, false, { message: 'Incorrect email or password.' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

// Passport Serialization and Deserialization
passport.serializeUser((user, done) => {
    done(null, user.id); // Store user ID in the session
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).select('-password'); // Fetch user by ID, exclude password
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// Middleware to make user object and BASE_PATH available to all EJS templates
app.use((req, res, next) => {
    res.locals.user = req.user; // Passport adds `req.user` if authenticated
    res.locals.BASE_PATH = BASE_PATH;
    next();
});

// Middleware to protect routes (ensure user is authenticated)
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect(`${BASE_PATH}/login`); // Redirect to login if not authenticated
}

// --- Routes ---

// Home Page
app.get(`${BASE_PATH}/`, (req, res) => {
    res.render('home');
});

// Login Page
app.get(`${BASE_PATH}/login`, (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect(`${BASE_PATH}/`); // Redirect to home if already logged in
    }
    res.render('login');
});

// Register Page
app.get(`${BASE_PATH}/register`, (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect(`${BASE_PATH}/`); // Redirect to home if already logged in
    }
    res.render('register');
});

// Handle User Registration
app.post(`${BASE_PATH}/register`, async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('Email already in use.');
        }
        const newUser = new User({ email, password });
        await newUser.save();

        // Log the user in immediately after registration
        req.login(newUser, (err) => {
            if (err) {
                console.error('Error logging in after registration:', err);
                return res.status(500).send('Registration successful, but login failed.');
            }
            // Redirect to home page after successful registration and login
            res.redirect(`${BASE_PATH}/`);
        });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).send('Server Error during registration.');
    }
});

// Handle User Login
app.post(`${BASE_PATH}/login`, passport.authenticate('local', {
    successRedirect: `${BASE_PATH}/`,
    failureRedirect: `${BASE_PATH}/login`, // This will redirect back to login on failure
    failureFlash: false // We'll handle flash messages manually in the EJS for simplicity
}));

// Handle User Logout
app.post(`${BASE_PATH}/logout`, (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return next(err);
            }
            res.clearCookie('connect.sid'); // Clear the session cookie
            res.redirect(`${BASE_PATH}/login`);
        });
    });
});


// --- Liturgical Calendar Routes ---
const liturgicalData = require('./data/liturgical-calendar.json'); // Load static liturgical data

app.get(`${BASE_PATH}/liturgicalCalendar`, isAuthenticated, async (req, res) => {
    try {
        const requestedDate = req.query.date || new Date().toISOString().slice(0, 10); // Default to today
        const info = liturgicalData[requestedDate];
        
        // Fetch daily reflections for the current user and selected date
        const dailyReflections = await Reflection.find({
            userId: req.user._id,
            date: requestedDate
        }).sort({ createdAt: -1 }); // Sort by most recent

        res.render('liturgicalCalendar', {
            info: info,
            requestedDate: requestedDate,
            dailyReflections: dailyReflections
        });
    } catch (err) {
        console.error('Error fetching liturgical calendar:', err);
        res.status(500).send('Server Error');
    }
});

// Add Daily Reflection
app.post(`${BASE_PATH}/liturgicalCalendar/reflect`, isAuthenticated, async (req, res) => {
    try {
        const { date, description, hashtags } = req.body;
        const hashtagArray = hashtags ? hashtags.split(/[\s,]+/).filter(tag => tag.length > 0).map(tag => ({ name: tag.replace(/^#/, '') })) : [];

        const newReflection = new Reflection({
            userId: req.user._id,
            date,
            description,
            hashtags: hashtagArray
        });
        await newReflection.save();
        res.redirect(`${BASE_PATH}/liturgicalCalendar?date=${date}`);
    } catch (err) {
        console.error('Error adding daily reflection:', err);
        res.status(500).send('Server Error');
    }
});

// Edit Daily Reflection - GET
app.get(`${BASE_PATH}/liturgicalCalendar/reflect/edit/:id`, isAuthenticated, async (req, res) => {
    try {
        const reflection = await Reflection.findOne({ _id: req.params.id, userId: req.user._id });
        if (!reflection) {
            return res.status(404).send('Reflection not found or unauthorized');
        }
        res.render('editDailyReflection', { reflection: reflection, requestedDate: req.query.date });
    } catch (err) {
        console.error('Error fetching reflection for edit:', err);
        res.status(500).send('Server Error');
    }
});

// Update Daily Reflection - POST
app.post(`${BASE_PATH}/liturgicalCalendar/reflect/update/:id`, isAuthenticated, async (req, res) => {
    try {
        const { description, hashtags, date } = req.body;
        const hashtagArray = hashtags ? hashtags.split(/[\s,]+/).filter(tag => tag.length > 0).map(tag => ({ name: tag.replace(/^#/, '') })) : [];

        const updatedReflection = await Reflection.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { description, hashtags: hashtagArray, updatedAt: Date.now() },
            { new: true } // Return the updated document
        );

        if (!updatedReflection) {
            return res.status(404).send('Reflection not found or unauthorized');
        }
        res.redirect(`${BASE_PATH}/liturgicalCalendar?date=${date}`);
    } catch (err) {
        console.error('Error updating daily reflection:', err);
        res.status(500).send('Server Error');
    }
});

// Delete Daily Reflection - POST
app.post(`${BASE_PATH}/liturgicalCalendar/reflect/delete/:id`, isAuthenticated, async (req, res) => {
    try {
        const { date } = req.query; // Get date from query string
        const deletedReflection = await Reflection.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!deletedReflection) {
            return res.status(404).send('Reflection not found or unauthorized');
        }
        res.redirect(`${BASE_PATH}/liturgicalCalendar?date=${date}`);
    } catch (err) {
        console.error('Error deleting daily reflection:', err);
        res.status(500).send('Server Error');
    }
});


// --- Insights Routes ---
app.get(`${BASE_PATH}/insights`, isAuthenticated, async (req, res) => {
    try {
        const searchTerm = req.query.search;
        let query = { userId: req.user._id };

        if (searchTerm) {
            // Search by description or hashtag
            query.$or = [
                { description: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive search
                { 'hashtags.name': { $regex: searchTerm.replace(/^#/, ''), $options: 'i' } }
            ];
        }

        const insights = await Insight.find(query).sort({ createdAt: -1 });
        res.render('insights', { insights: insights, search: searchTerm || '' });
    } catch (err) {
        console.error('Error fetching insights:', err);
        res.status(500).send('Server Error');
    }
});

// Add Insight
app.post(`${BASE_PATH}/insightsCreate`, isAuthenticated, async (req, res) => {
    try {
        const { description, hashtags } = req.body;
        const hashtagArray = hashtags ? hashtags.split(/[\s,]+/).filter(tag => tag.length > 0).map(tag => ({ name: tag.replace(/^#/, '') })) : [];

        const newInsight = new Insight({
            userId: req.user._id,
            description,
            hashtags: hashtagArray
        });
        await newInsight.save();
        res.redirect(`${BASE_PATH}/insights`);
    } catch (err) {
        console.error('Error adding insight:', err);
        res.status(500).send('Server Error');
    }
});

// Edit Insight - GET
app.get(`${BASE_PATH}/insights/edit/:id`, isAuthenticated, async (req, res) => {
    try {
        const insight = await Insight.findOne({ _id: req.params.id, userId: req.user._id });
        if (!insight) {
            return res.status(404).send('Insight not found or unauthorized');
        }
        res.render('editInsight', { insight: insight });
    } catch (err) {
        console.error('Error fetching insight for edit:', err);
        res.status(500).send('Server Error');
    }
});

// Update Insight - POST
app.post(`${BASE_PATH}/insights/update/:id`, isAuthenticated, async (req, res) => {
    try {
        const { description, hashtags } = req.body;
        const hashtagArray = hashtags ? hashtags.split(/[\s,]+/).filter(tag => tag.length > 0).map(tag => ({ name: tag.replace(/^#/, '') })) : [];

        const updatedInsight = await Insight.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { description, hashtags: hashtagArray, updatedAt: Date.now() },
            { new: true }
        );

        if (!updatedInsight) {
            return res.status(404).send('Insight not found or unauthorized');
        }
        res.redirect(`${BASE_PATH}/insights`);
    } catch (err) {
        console.error('Error updating insight:', err);
        res.status(500).send('Server Error');
    }
});

// Delete Insight - POST
app.post(`${BASE_PATH}/insights/delete/:id`, isAuthenticated, async (req, res) => {
    try {
        const deletedInsight = await Insight.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!deletedInsight) {
            return res.status(404).send('Insight not found or unauthorized');
        }
        res.redirect(`${BASE_PATH}/insights`);
    } catch (err) {
        console.error('Error deleting insight:', err);
        res.status(500).send('Server Error');
    }
});

// --- Anecdotes Routes ---
app.get(`${BASE_PATH}/anecdotes`, isAuthenticated, async (req, res) => {
    try {
        const searchTerm = req.query.search;
        let query = { userId: req.user._id };

        if (searchTerm) {
            query.$or = [
                { title: { $regex: searchTerm, $options: 'i' } },
                { content: { $regex: searchTerm, $options: 'i' } },
                { 'hashtags.name': { $regex: searchTerm.replace(/^#/, ''), $options: 'i' } }
            ];
        }

        const anecdotes = await Anecdote.find(query).sort({ createdAt: -1 });
        res.render('anecdotes', { anecdotes: anecdotes, search: searchTerm || '' });
    } catch (err) {
        console.error('Error fetching anecdotes:', err);
        res.status(500).send('Server Error');
    }
});

// Add Anecdote
app.post(`${BASE_PATH}/anecdotes/create`, isAuthenticated, async (req, res) => {
    try {
        const { title, content, hashtags } = req.body;
        const hashtagArray = hashtags ? hashtags.split(/[\s,]+/).filter(tag => tag.length > 0).map(tag => ({ name: tag.replace(/^#/, '') })) : [];

        const newAnecdote = new Anecdote({
            userId: req.user._id,
            title,
            content,
            hashtags: hashtagArray
        });
        await newAnecdote.save();
        res.redirect(`${BASE_PATH}/anecdotes`);
    } catch (err) {
        console.error('Error adding anecdote:', err);
        res.status(500).send('Server Error');
    }
});

// Edit Anecdote - GET
app.get(`${BASE_PATH}/anecdotes/edit/:id`, isAuthenticated, async (req, res) => {
    try {
        const anecdote = await Anecdote.findOne({ _id: req.params.id, userId: req.user._id });
        if (!anecdote) {
            return res.status(404).send('Anecdote not found or unauthorized');
        }
        res.render('editAnecdote', { anecdote: anecdote });
    } catch (err) {
        console.error('Error fetching anecdote for edit:', err);
        res.status(500).send('Server Error');
    }
});

// Update Anecdote - POST
app.post(`${BASE_PATH}/anecdotes/update/:id`, isAuthenticated, async (req, res) => {
    try {
        const { title, content, hashtags } = req.body;
        const hashtagArray = hashtags ? hashtags.split(/[\s,]+/).filter(tag => tag.length > 0).map(tag => ({ name: tag.replace(/^#/, '') })) : [];

        const updatedAnecdote = await Anecdote.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { title, content, hashtags: hashtagArray, updatedAt: Date.now() },
            { new: true }
        );

        if (!updatedAnecdote) {
            return res.status(404).send('Anecdote not found or unauthorized');
        }
        res.redirect(`${BASE_PATH}/anecdotes`);
    } catch (err) {
        console.error('Error updating anecdote:', err);
        res.status(500).send('Server Error');
    }
});

// Delete Anecdote - POST
app.post(`${BASE_PATH}/anecdotes/delete/:id`, isAuthenticated, async (req, res) => {
    try {
        const deletedAnecdote = await Anecdote.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!deletedAnecdote) {
            return res.status(404).send('Anecdote not found or unauthorized');
        }
        res.redirect(`${BASE_PATH}/anecdotes`);
    } catch (err) {
        console.error('Error deleting anecdote:', err);
        res.status(500).send('Server Error');
    }
});


// --- Books Routes ---
app.get(`${BASE_PATH}/books`, isAuthenticated, async (req, res) => {
    try {
        const searchTerm = req.query.search;
        let query = { userId: req.user._id };

        if (searchTerm) {
            query.$or = [
                { title: { $regex: searchTerm, $options: 'i' } },
                { author: { $regex: searchTerm, $options: 'i' } },
                { notes: { $regex: searchTerm, $options: 'i' } },
                { 'hashtags.name': { $regex: searchTerm.replace(/^#/, ''), $options: 'i' } }
            ];
        }

        const books = await Book.find(query).sort({ createdAt: -1 });
        res.render('books', { books: books, search: searchTerm || '' });
    } catch (err) {
        console.error('Error fetching books:', err);
        res.status(500).send('Server Error');
    }
});

// Add Book
app.post(`${BASE_PATH}/books/create`, isAuthenticated, async (req, res) => {
    try {
        const { title, author, notes, link, pdfUrl, hashtags } = req.body;
        const hashtagArray = hashtags ? hashtags.split(/[\s,]+/).filter(tag => tag.length > 0).map(tag => ({ name: tag.replace(/^#/, '') })) : [];

        const newBook = new Book({
            userId: req.user._id,
            title,
            author,
            notes,
            link,
            pdfUrl,
            hashtags: hashtagArray
        });
        await newBook.save();
        res.redirect(`${BASE_PATH}/books`);
    } catch (err) {
        console.error('Error adding book:', err);
        res.status(500).send('Server Error');
    }
});

// Edit Book - GET
app.get(`${BASE_PATH}/books/edit/:id`, isAuthenticated, async (req, res) => {
    try {
        const book = await Book.findOne({ _id: req.params.id, userId: req.user._id });
        if (!book) {
            return res.status(404).send('Book not found or unauthorized');
        }
        res.render('editBook', { book: book });
    } catch (err) {
        console.error('Error fetching book for edit:', err);
        res.status(500).send('Server Error');
    }
});

// Update Book - POST
app.post(`${BASE_PATH}/books/update/:id`, isAuthenticated, async (req, res) => {
    try {
        const { title, author, notes, link, pdfUrl, hashtags } = req.body;
        const hashtagArray = hashtags ? hashtags.split(/[\s,]+/).filter(tag => tag.length > 0).map(tag => ({ name: tag.replace(/^#/, '') })) : [];

        const updatedBook = await Book.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { title, author, notes, link, pdfUrl, hashtags: hashtagArray, updatedAt: Date.now() },
            { new: true }
        );

        if (!updatedBook) {
            return res.status(404).send('Book not found or unauthorized');
        }
        res.redirect(`${BASE_PATH}/books`);
    } catch (err) {
        console.error('Error updating book:', err);
        res.status(500).send('Server Error');
    }
});

// Delete Book - POST
app.post(`${BASE_PATH}/books/delete/:id`, isAuthenticated, async (req, res) => {
    try {
        const deletedBook = await Book.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!deletedBook) {
            return res.status(404).send('Book not found or unauthorized');
        }
        res.redirect(`${BASE_PATH}/books`);
    } catch (err) {
        console.error('Error deleting book:', err);
        res.status(500).send('Server Error');
    }
});

// --- Web-Links Routes ---
app.get(`${BASE_PATH}/weblinks`, isAuthenticated, async (req, res) => {
    try {
        const searchTerm = req.query.search;
        let query = { userId: req.user._id };

        if (searchTerm) {
            query.$or = [
                { title: { $regex: searchTerm, $options: 'i' } },
                { url: { $regex: searchTerm, $options: 'i' } },
                { notes: { $regex: searchTerm, $options: 'i' } },
                { 'hashtags.name': { $regex: searchTerm.replace(/^#/, ''), $options: 'i' } }
            ];
        }

        const weblinks = await Weblink.find(query).sort({ createdAt: -1 });
        res.render('weblinks', { weblinks: weblinks, search: searchTerm || '' });
    } catch (err) {
        console.error('Error fetching web-links:', err);
        res.status(500).send('Server Error');
    }
});

// Add Web-Link
app.post(`${BASE_PATH}/weblinks/create`, isAuthenticated, async (req, res) => {
    try {
        const { title, url, notes, hashtags } = req.body;
        const hashtagArray = hashtags ? hashtags.split(/[\s,]+/).filter(tag => tag.length > 0).map(tag => ({ name: tag.replace(/^#/, '') })) : [];

        const newWeblink = new Weblink({
            userId: req.user._id,
            title,
            url,
            notes,
            hashtags: hashtagArray
        });
        await newWeblink.save();
        res.redirect(`${BASE_PATH}/weblinks`);
    } catch (err) {
        console.error('Error adding web-link:', err);
        res.status(500).send('Server Error');
    }
});

// Edit Web-Link - GET
app.get(`${BASE_PATH}/weblinks/edit/:id`, isAuthenticated, async (req, res) => {
    try {
        const weblink = await Weblink.findOne({ _id: req.params.id, userId: req.user._id });
        if (!weblink) {
            return res.status(404).send('Web-Link not found or unauthorized');
        }
        res.render('editWeblink', { weblink: weblink });
    } catch (err) {
        console.error('Error fetching web-link for edit:', err);
        res.status(500).send('Server Error');
    }
});

// Update Web-Link - POST
app.post(`${BASE_PATH}/weblinks/update/:id`, isAuthenticated, async (req, res) => {
    try {
        const { title, url, notes, hashtags } = req.body;
        const hashtagArray = hashtags ? hashtags.split(/[\s,]+/).filter(tag => tag.length > 0).map(tag => ({ name: tag.replace(/^#/, '') })) : [];

        const updatedWeblink = await Weblink.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { title, url, notes, hashtags: hashtagArray, updatedAt: Date.now() },
            { new: true }
        );

        if (!updatedWeblink) {
            return res.status(404).send('Web-Link not found or unauthorized');
        }
        res.redirect(`${BASE_PATH}/weblinks`);
    } catch (err) {
        console.error('Error updating web-link:', err);
        res.status(500).send('Server Error');
    }
});

// Delete Web-Link - POST
app.post(`${BASE_PATH}/weblinks/delete/:id`, isAuthenticated, async (req, res) => {
    try {
        const deletedWeblink = await Weblink.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!deletedWeblink) {
            return res.status(404).send('Web-Link not found or unauthorized');
        }
        res.redirect(`${BASE_PATH}/weblinks`);
    } catch (err) {
        console.error('Error deleting web-link:', err);
        res.status(500).send('Server Error');
    }
});


// --- Grammar Routes ---
app.get(`${BASE_PATH}/grammar`, isAuthenticated, async (req, res) => {
    try {
        const searchTerm = req.query.search;
        let query = { userId: req.user._id };

        if (searchTerm) {
            query.$or = [
                { topic: { $regex: searchTerm, $options: 'i' } },
                { rule: { $regex: searchTerm, $options: 'i' } },
                { notes: { $regex: searchTerm, $options: 'i' } },
                { 'hashtags.name': { $regex: searchTerm.replace(/^#/, ''), $options: 'i' } }
            ];
        }

        const grammarEntries = await Grammar.find(query).sort({ createdAt: -1 });
        res.render('grammar', { grammarEntries: grammarEntries, search: searchTerm || '' });
    } catch (err) {
        console.error('Error fetching grammar entries:', err);
        res.status(500).send('Server Error');
    }
});

// Add Grammar Entry
app.post(`${BASE_PATH}/grammar/create`, isAuthenticated, async (req, res) => {
    try {
        const { topic, rule, examples, notes, hashtags } = req.body;
        const hashtagArray = hashtags ? hashtags.split(/[\s,]+/).filter(tag => tag.length > 0).map(tag => ({ name: tag.replace(/^#/, '') })) : [];
        const exampleArray = examples ? examples.split('\n').map(ex => ex.trim()).filter(ex => ex.length > 0) : [];

        const newGrammarEntry = new Grammar({
            userId: req.user._id,
            topic,
            rule,
            examples: exampleArray,
            notes,
            hashtags: hashtagArray
        });
        await newGrammarEntry.save();
        res.redirect(`${BASE_PATH}/grammar`);
    } catch (err) {
        console.error('Error adding grammar entry:', err);
        res.status(500).send('Server Error');
    }
});

// Edit Grammar Entry - GET
app.get(`${BASE_PATH}/grammar/edit/:id`, isAuthenticated, async (req, res) => {
    try {
        const grammarEntry = await Grammar.findOne({ _id: req.params.id, userId: req.user._id });
        if (!grammarEntry) {
            return res.status(404).send('Grammar entry not found or unauthorized');
        }
        res.render('editGrammar', { grammarEntry: grammarEntry });
    } catch (err) {
        console.error('Error fetching grammar entry for edit:', err);
        res.status(500).send('Server Error');
    }
});

// Update Grammar Entry - POST
app.post(`${BASE_PATH}/grammar/update/:id`, isAuthenticated, async (req, res) => {
    try {
        const { topic, rule, examples, notes, hashtags } = req.body;
        const hashtagArray = hashtags ? hashtags.split(/[\s,]+/).filter(tag => tag.length > 0).map(tag => ({ name: tag.replace(/^#/, '') })) : [];
        const exampleArray = examples ? examples.split('\n').map(ex => ex.trim()).filter(ex => ex.length > 0) : [];

        const updatedGrammarEntry = await Grammar.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { topic, rule, examples: exampleArray, notes, hashtags: hashtagArray, updatedAt: Date.now() },
            { new: true }
        );

        if (!updatedGrammarEntry) {
            return res.status(404).send('Grammar entry not found or unauthorized');
        }
        res.redirect(`${BASE_PATH}/grammar`);
    } catch (err) {
        console.error('Error updating grammar entry:', err);
        res.status(500).send('Server Error');
    }
});

// Delete Grammar Entry - POST
app.post(`${BASE_PATH}/grammar/delete/:id`, isAuthenticated, async (req, res) => {
    try {
        const deletedGrammarEntry = await Grammar.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!deletedGrammarEntry) {
            return res.status(404).send('Grammar entry not found or unauthorized');
        }
        res.redirect(`${BASE_PATH}/grammar`);
    } catch (err) {
        console.error('Error deleting grammar entry:', err);
        res.status(500).send('Server Error');
    }
});

// --- Archives Routes ---
app.get(`${BASE_PATH}/archives`, isAuthenticated, (req, res) => {
    res.render('archives');
});

// --- Content Page ---
app.get(`${BASE_PATH}/content`, isAuthenticated, (req, res) => {
    res.render('content');
});

// Catch-all for undefined routes
app.use((req, res) => {
    res.status(404).send('Page Not Found');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the application at http://localhost:${PORT}${BASE_PATH}/`);
});
