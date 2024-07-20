const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const constants = require("../utils/const");
const verifyToken = require("../middleware/verifyToken");
const Credential = require("../models/Credential");
const Inst = require("../models/Inst");
const { Op } = require("sequelize");
const mailer = require("../utils/mailer");

//check user logger availability
router.post("/check", (req, res) => {
  User.findOne({
    where: { logger: req.body.logger },
  })
    .then((user) => {
      if (user == null) {
        res.status(200).json({ status: 200, message: "logger available" });
      } else {
        res.status(404).json({ status: 404, message: "logger unavailable" });
      }
    })
    .catch((err) =>
      res.sttus(500).json({ status: 500, message: "error has occured" })
    );
});

//register user
router.post("/register", (req, res) => {
  //check if user logger is registered
  User.findOne({
    where: {
      logger: req.body.logger,
    },
  })
    .then((user) => {
      if (user == null) {
        //hash password
        bcrypt
          .hash(req.body.password, 10)
          .then((hash) => {
            //register user
            User.create({
              logger: req.body.logger,
              password: hash,
              linker: req.body.linker,
              trace: req.body.trace,
              live: 1,
              deleted: 0,
            })
              .then((newUser) => {
                //generate jwt token
                jwt.sign(
                  { user: newUser },
                  constants.jwtKey,
                  { expiresIn: "3000000000s" },
                  (err, token) => {
                    console.log(err);
                    res.status(200).json({
                      token,
                      status: 200,
                      user: newUser,
                    });
                  }
                );
              })
              .catch((err) =>
                res
                  .status(500)
                  .json({ status: 500, message: "User not created" })
              );
          })
          .catch((err) =>
            res.json({ status: 500, message: "User not created" })
          );
      } else {
        res.json({ status: 500, message: "User not created" });
      }
    })
    .catch((err) =>
      res.status(500).json({ status: 500, message: "User not created" })
    );
});

//login user
router.post("/login", (req, res) => {
  //fetch user
  User.findOne({
    where: {
      logger: req.body.logger,
    },
  })
    .then((user) => {
      if (user != null) {
        //hash password
        bcrypt
          .compare(req.body.password, user.password)
          .then((match) => {
            if (match) {
              //generate jwt token
              jwt.sign(
                { user },
                constants.jwtKey,
                { expiresIn: "3000000000s" },
                (err, token) => {
                  res.json({
                    token,
                    user,
                    status: 200,
                  });
                }
              );
            } else {
              res.json({ status: 500, message: "Invalid password" });
            }
          })
          .catch((err) =>
            res.json({ status: 500, message: "Invalid password" })
          );
      } else {
        res.json({ status: 500, message: "Invalid password" });
      }
    })
    .catch((err) => res.json({ status: 500, message: "Invalid password" }));
});

//forgot password
router.post("/forgot", (req, res) => {
  //fetch user
  User.findOne({
    where: {
      logger: req.body.logger,
    },
  })
    .then((user) => {
      if (user != null) {
        let reset = `${Date.now()}`.split("").reverse().join("");
        user.reset = reset;
        user.save();
        mailer(
          `<div>
              <p>Finance techsystem password reset 
                  <a href="https://finance.techsystem.world/reset/${reset}/${req.body.logger}">
                    Click here to reset
                  </a>
              </p>
              <p> If you did not request password reset ignore.</P
          </div>`,
          req.body.logger,
          "Finance Techsystem Password reset"
        );
        //send email or password to resets
        res.json({ status: 200, reset, message: "User reset code sent" });
      } else {
        res.json({ status: 500, message: "User not found" });
      }
    })
    .catch((err) => res.json({ status: 500, message: "User not found" }));
});

//reset password
router.post("/reset", (req, res) => {
  if (req.body.reset == null) {
    res.status(403).json({ message: "Click forgot password first" });
  }
  //fetch user
  User.findOne({
    where: {
      logger: req.body.logger,
      reset: req.body.reset,
    },
  })
    .then((user) => {
      if (user != null) {
        //hash password
        bcrypt
          .hash(req.body.password, 10)
          .then((hash) => {
            //edit user
            user.password = hash;
            user.reset = null;
            user.save();
            //generate jwt token
            jwt.sign(
              { user },
              constants.jwtKey,
              { expiresIn: "3000000000s" },
              (err, token) => {
                res.json({
                  token,
                  status: 200,
                  user,
                });
              }
            );
          })
          .catch((err) =>
            res.json({ status: 500, message: "User not created" })
          );
      } else {
        res.json({ status: 500, message: "User not found" });
      }
    })
    .catch((err) => res.json({ status: 500, message: "User not found" }));
});

//edit user
router.post("/edit", verifyToken, (req, res) => {
  //fetch user
  User.findOne({
    where: {
      id: req.userId,
    },
  })
    .then((user) => {
      if (user != null) {
        //edit user
        user.name = req.body.name ? req.body.name : user.name;
        /*user.logger = req.body.logger ? req.body.logger : user.logger;
        user.photo = req.body.photo ? req.body.photo : user.name;
        user.socket = req.body.socket ? req.body.socket : user.socket;
        user.token = req.body.token ? req.body.token : user.token;*/
        user.trace = req.body.trace ? req.body.trace : user.trace;

        user.save();

        res.json({ status: 200, user });
      } else {
        res.json({ status: 500, message: "User not found" });
      }
    })
    .catch((err) => res.json({ status: 500, message: "User not found" }));
});

//get user creds
router.post("/creds", verifyToken, (req, res) => {
  Credential.findAll({
    where: { email: req.userLogger, deleted: 0 },
  })
    .then((creds) => res.json({ status: 200, creds }))
    .catch((err) => res.json({ status: 500, message: "Error on Fetch" }));
});

//get user insts
router.post("/insts", verifyToken, (req, res) => {
  Inst.findAll({
    where: { linker: { [Op.in]: req.body.instLinkers } },
  })
    .then((insts) => res.json({ status: 200, insts }))
    .catch((err) => res.json({ status: 500, message: "Error on Fetch" }));
});

module.exports = router;
