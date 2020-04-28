const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userName: String,
    lastName: String,
    firstName: String,
    email: String,
    githubId: String,
    azureId: String,
});

const User = mongoose.model('user', userSchema);

module.exports = User;