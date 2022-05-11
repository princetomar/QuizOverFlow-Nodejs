const express = require("express");
const mongoose = require("mongoose");
// for confirming middlewares
const bodyParser = require("body-parser");
const passport = require("passport");

// bring all routes
const auth = require("./routes/api/auth");
const questions = require("./routes/api/questions");
const profile = require("./routes/api/profile");

const app = express();

// middleware for bodyParser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// mongodb config
const db = require("./setup/myurl").mongoURL;

// attempt to connect to database
mongoose
  .connect(db)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log(err));

// Passport middleware
app.use(passport.initialize());

// Config for JWT strategy
require("./stratigies/jsonwtStrategy")(passport);

// creating a route just for testing
// app.get("/", (req, res) => {
//   res.send("Hey there Big Stack");
// });

// Actual Routes
app.use("/api/auth", auth);
app.use("/api/questions", questions);
app.use("/api/profile", profile);

const port = process.env.port || 3000;

app.listen(port, () => console.log(`App is running at ${port}`));
