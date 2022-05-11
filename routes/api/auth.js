const express = require("express");
const router = express.Router();

// to encrypt the password
const bcrypt = require("bcryptjs");
// jsonWebTokens
const jsonwt = require("jsonwebtoken");
const passport = require("passport");

// get secret key from setup/myurl.js
const key = require("../../setup/myurl");

// @type GET
// @route /api/auth
// @desc just for testing
// @access PUBLIC
router.get("/", (req, res) => res.json({ test: "Auth is being tested" }));

// Import schema for Person to register
const Person = require("../../models/Person");

// @type PORT
// @route /api/auth/register
// @desc Route for registration for users
// @access PUBLIC

router.post("/register", (req, res) => {
  // throw a query to databse
  // findOne is gonna find one query based on one element that's provided in the query
  Person.findOne({ email: req.body.email })
    .then((person) => {
      // if person is found
      if (person) {
        return res.status(400).json({ emailerror: "Email is already in use" });
      }
      // if person is not found
      else {
        const newPerson = new Person({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
        });

        // Encrypt the password using bcrypt
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newPerson.password, salt, (err, hash) => {
            // Store has in your password DB

            if (err) throw err;
            newPerson.password = hash;
            newPerson
              .save()
              .then((person) => res.json(person))
              .catch((err) => console.log(err));
          });
        });
      }
    })
    .catch((err) => console.log(err));
});

// @type PORT
// @route /api/auth/login
// @desc Route for login for users
// @access PUBLIC

router.post("/login", (req, res) => {
  // grab email and password
  const email = req.body.email;
  const password = req.body.password;

  // use Person schema to make a query to the database
  Person.findOne({ email })
    .then((person) => {
      // if person is not found
      if (!person) {
        res.status(404).json({ emailerror: "Email is not found" });
      }
      // if person is found
      // compare the password
      bcrypt
        .compare(password, person.password)
        .then((isCorrect) => {
          if (isCorrect) {
            // res.json({ success: "User is logged in" });

            // Use payload and create token for user
            const payload = {
              id: person.id,
              name: person.name,
              email: person.email,
            };

            jsonwt.sign(
              payload,
              key.secret,
              { expiresIn: 3600 },
              (err, token) => {
                res.json({
                  success: true,
                  token: "Bearer " + token,
                });
              }
            );
          } else {
            res.status(400).json({ passworderror: "Password is incorrect" });
          }
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

// @type PORT
// @route /api/auth/profile
// @desc Route for profile for users
// @access PRIVATE

router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // console.log(req);
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      profilepic: req.user.profilepic,
    });
  }
);

module.exports = router;
