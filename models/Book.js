// models/Book.js
const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    notes: {
        type: String
    },
    link: {
        type: String,
        trim: true
    },
    pdfUrl: {
        type: String,
        trim: true
    },
    hashtags: [
        {
            name: {
                type: String,
                lowercase: true,
                trim: true
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update `updatedAt` field on save
BookSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Book', BookSchema);