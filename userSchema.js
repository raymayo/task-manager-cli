const { connectToMongoDB, closeMongoDBConnection } = require('./mongo.js');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
    },
    taskList: [{
        task: {
            type: String,
        },
        completed: {
            type: Boolean
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
    }]
});

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;