// models/Grammar.js
const mongoose = require('mongoose');

const GrammarSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    topic: {
        type: String,
        required: true,
        trim: true
    },
    rule: {
        type: String,
        required: true
    },
    examples: [
        {
            type: String,
            trim: true
        }
    ],
    notes: {
        type: String
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
GrammarSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Grammar', GrammarSchema);