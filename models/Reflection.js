// models/Reflection.js
const mongoose = require('mongoose');

const ReflectionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Link to the User model
        ref: 'User',
        required: true
    },
    date: {
        type: String, // Storing date as 'YYYY-MM-DD' string for easy lookup with liturgical data
        required: true
    },
    description: {
        type: String,
        required: true
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
ReflectionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Reflection', ReflectionSchema);