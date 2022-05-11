const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const passport = require("passport");

// Load Person model
const Person = require("../../models/Person");

// Load Profile model
const Profile = require("../../models/Profile");

// @type POST
// @route /api/profile
// @desc Route for personal profile of users
// @access PRIVATE

router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // check if profile exists or not
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        // if there is no profile
        if (!profile) {
          return res
            .status(400)
            .json({ profilenotfound: "User Profile not found" });
        }
        res.json(profile);
      })
      .catch((err) => console.log("Got some error in profile " + err));
  }
);

// @type POST
// @route /api/profile
// @desc Route for updating/saving personal profile of users
// @access PRIVATE

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const profileValues = {};
    profileValues.user = req.user.id;
    if (req.body.username) profileValues.username = req.body.username;
    if (req.body.website) profileValues.website = req.body.website;
    if (req.body.country) profileValues.country = req.body.country;
    if (req.body.portfolio) profileValues.portfolio = req.body.portfolio;
    if (typeof req.body.languages !== undefined) {
      profileValues.languages = req.body.languages.split(",");
    }

    // Get social links
    profileValues.social = {};
    if (req.body.youtube) profileValues.social.youtube = req.body.youtube;
    if (req.body.facebook) profileValues.social.facebook = req.body.facebook;
    if (req.body.instagram) profileValues.social.instagram = req.body.instagram;

    // Do Datebase stuff
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (profile) {
          Profile.findOneAndUpdate(
            {
              user: req.user.id,
            },
            {
              $set: profileValues,
            },
            {
              new: true,
            }
          )
            .then((profile) => res.send(profile))
            .catch((err) => console.log("Problem in update " + err));
        } else {
          Profile.findOne({ username: profileValues.username })
            .then((profile) => {
              // if somebody is there with that username
              if (profile) {
                res.status(400).json({ username: "Username already exists" });
              }
              // save user
              new Profile(profileValues)
                .save()
                .then((profile) => res.json(profile))
                .catch((err) => console.log(err));
            })
            .catch((err) => console.log(err));
        }
      })
      .catch((err) => console.log("Problem in fetching profile " + err));
  }
);

// @type GET
// @route /api/profile/:username
// @desc Route for getting userprofile based on username
// @access PUBLIC

router.get("/:username", (req, res) => {
  Profile.findOne({ username: req.params.username })
    .populate("user", ["name", "profilepic"])
    .then((profile) => {
      if (!profile) {
        res.status(404).json({ usernotfound: "Profile not found" });
      }

      res.json(profile);
    })
    .catch((err) => console.log("Error in fetching usernane : " + err));
});

// @type GET
// @route /api/profile/:id
// @desc Route for getting userprofile based on id
// @access PUBLIC

router.get("/find/:id", (req, res) => {
  Profile.findOne({ id: req.params.id })
    .populate("user", ["name", "profilepic"])
    .then((profile) => {
      // if there is no profile
      if (!profile) {
        res.status(400).json({ profilenotfound: "User Profile not found" });
      }
      res.json(profile);
    })
    .catch((err) => console.log("Error in fetching user using id : " + err));
});

// @type GET
// @route /api/profile/:everyone
// @desc Route for getting userprofile for everyone
// @access PUBLIC

router.get("/find/everyone", (req, res) => {
  Profile.find()
    .populate("user", ["name", "profilepic"])
    .then((profiles) => {
      // if there is no profile
      if (!profiles) {
        res.status(400).json({ profilenotfound: "No Profile found" });
      }
      res.json(profiles);
    })
    .catch((err) => console.log("Error in fetching user using id : " + err));
});

// @type DELETE
// @route /api/profile/
// @desc Route for deleting userprofile based on id
// @access PRIVATE

router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // grab the profile
    Profile.findOne({ user: req.user.id });
    // remove the profile
    Profile.findOneAndRemove({ user: req.user.id })
      .then(() => {
        Person.findOneAndRemove({ _id: req.user.id })
          .then(() => res.json({ success: "Deleted Successfully" }))
          .catch((err) => console.log("Error in deleting person " + err));
      })
      .catch((err) => console.log(err));
  }
);

// @type POST
// @route /api/profile/workrole
// @desc Route for adding work profile of a person
// @access PRIVATE

router.post(
  "/workrole",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        // if there is no profile
        if (!profile) {
          res.status(400).json({ profilenotfound: "User Profile not found" });
        }

        const newWork = {
          role: req.body.role,
          companry: req.body.companry,
          country: req.body.country,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          details: req.body.details,
        };

        // Pushed into the database
        // There are two ways to do this
        // 1.
        // profile.workrole.push(newWork);

        // 2.
        profile.workrole.unshift(newWork);
        profile
          .save()
          .then((profile) => res.json(profile))
          .catch((err) => console.log("Error in saving workrole " + err));
      })
      .catch((err) => console.log(err));
  }
);

// @type DELETE
// @route /api/profile/workrole/:w_id
// @desc Route for delete a speciafic work profile of a person
// @access PRIVATE

router.delete(
  "/workrole/:w_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // call the profile
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        // assignment to check if the profile is found
        if (!profile) {
          res.status(400).json({ profilenotfound: "User Profile not found" });
        }
        // grab all the id's
        const removethis = profile.workrole
          .map((item) => item.id)
          .indexOf(req.params.w_id);

        profile.workrole.splice(removethis, 1);
        profile
          .save()
          .then((profile) => res.json(profile))
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }
);

module.exports = router;
