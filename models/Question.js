const mongoose = require("mongoose");

// user - refer from the user
// text1 - grab question
// text2 - grab code
// username
// comment - array of comments
// date

const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "myPerson",
  },
  name: {
    type: String,
  },
  // collection of users if some upvote
  upvote: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "myPerson",
      },
    },
  ],
  answers: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "myPerson",
      },
      text: {
        type: String,
        required: true,
      },
      name: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  textone: {
    type: String,
    required: true,
  },
  texttwo: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Question = mongoose.model("myQuestion", QuestionSchema);
