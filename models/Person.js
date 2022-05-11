const mongoose = require("mongoose");

// crate schema
const Schema = mongoose.Schema;

const PersonSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
  },
  profilepic: {
    type: String,
    default:
      "https://www.clipartmax.com/png/middle/112-1128092_programming-vector-programmer-icon-software-developer-icon-png.png",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// export this schema

module.exports = Person = mongoose.model("myPerson", PersonSchema);
