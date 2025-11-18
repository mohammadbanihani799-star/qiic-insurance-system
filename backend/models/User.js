const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    ip: { type: String, required: true, unique: true },
    flag: { type: Boolean, default: false },
    currentPage: { type: String, default: '/' },
    lastSeenAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
