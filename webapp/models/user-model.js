const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: String,
    githubId: String,
    azureId: String,
});

const User = mongoose.model('user', userSchema);

module.exports = User;