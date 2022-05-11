const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Load Person model
const Person = require("../../models/Person");

// Load Profile model
const Profile = require("../../models/Profile");

const Question = require("../../models/Question");

// @type GET
// @route /api/questions
// @desc Route for showing all questions
// @access PUBLIC

router.get("/", (req, res) => {
  Question.find()
    .sort("-date")
    .then((questions) => res.json(questions))
    .catch((err) => console.log("No Questions to display " + err));
});

// @type POST
// @route /api/questions/
// @desc Route for submitting questions of users
// @access PRIVATE

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const newQuestion = new Question({
      textone: req.body.textone,
      texttwo: req.body.texttwo,
      user: req.user.id,
      name: req.user.name,
    });

    // push in our datavase
    newQuestion
      .save()
      .then((question) => res.json(question))
      .catch((err) =>
        console.log("Unable to push question to database : " + err)
      );
  }
);

// @type POST
// @route /api/answers/:id
// @desc Route for submitting answers to questions of users
// @access PRIVATE

router.post(
  "/answers/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Question.findById(req.params.id)
      .then((question) => {
        const newAnswer = {
          user: req.user.id,
          name: req.body.name,
          text: req.body.text,
        };
        // push this into array
        question.answers.unshift(newAnswer);
        // save in the database
        question
          .save()
          .then((question) => res.json(question))
          .catch((err) =>
            console.log("Unable to push answer to database : " + err)
          );
      })
      .catch((err) => console.log(err));
  }
);

// @type POST
// @route /api/questions/upvote/:id
// @desc Route for upvoting questions of users
// @access PRIVATE

router.post(
  "/upvote/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        Question.findById(req.params.id)
          .then((question) => {
            if (
              question.upvotes?.filter(
                (upvote) => upvote.user.toString() === req.user.id.toString()
              ).length > 0
            ) {
              return res.status(400).json({ noupvote: "User already upvoted" });
            }
            question.upvotes.unshift({ user: req.user.id });
            question
              .save()
              .then((question) => res.json(question))
              .catch((err) => console.log(err));
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }
);

module.exports = router;
