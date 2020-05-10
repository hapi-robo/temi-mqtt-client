const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const DeviceSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  serial: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now()
  }
});

const UserSchema = new Schema({
  date: {
    type: Date,
    default: Date.now
  },
  userName: {
    type: String,
    required: false
  },
  lastName: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  githubId: {
    type: String,
    required: false
  },
  azureId: {
    type: String,
    required: false
  },
  devices: [DeviceSchema]
});

const User = mongoose.model("user", UserSchema);

module.exports = User;
