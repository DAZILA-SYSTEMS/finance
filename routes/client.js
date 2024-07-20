const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();
const verifyUser = require("../middleware/verifyUser");
const Entry = require("../models/Entry");
const Application = require("../models/Application");

//client entries
router.post("/entries", verifyToken, verifyUser, (req, res) => {
  Entry.findAll({
    where: {
      instLinker: req.body.instLinker,
      clientLinker: req.credLinker,
    },
  })
    .then((entries) => {
      res.json({ entries, status: 200 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Unknown error",
      })
    );
});

//client applications
router.post("/applications", verifyToken, verifyUser, (req, res) => {
  Application.findAll({
    where: {
      instLinker: req.body.instLinker,
      clientLinker: req.credLinker,
    },
  })
    .then((applications) => {
      res.json({ applications, status: 200 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Unknown error",
      })
    );
});

//client apply
router.post("/add", verifyToken, verifyUser, (req, res) => {
  //create a application
  Application.create({
    clientLinker: req.credLinker,
    accountLinker: req.body.accountLinker,
    appliedAmount: req.body.appliedAmount,
    details: req.body.details,
    instLinker: req.body.instLinker,
    live: 1,
    linker: Date.now(),
    trace: Date.now(),
    deleted: req.body.deleted || 0,
    status: "inReview",
  })
    .then((application) => {
      req.io
        .to(req.body.instLinker)
        .emit("message", { ...application, messageType: "application" });
      res.json({ application, status: 201 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Application couldn't be created",
      })
    );
});

//edit application
router.post("/edit", verifyToken, verifyUser, (req, res) => {
  Application.findOne({
    where: {
      id: req.body.id,
      instLinker: req.body.instLinker,
      clientLinker: req.credLinker,
    },
  })
    .then((application) => {
      if (application) {
        application.appliedAmount = req.body.appliedAmount
          ? req.body.appliedAmount
          : application.appliedAmount;
        application.details = req.body.details
          ? req.body.details
          : application.details;
        application.live = 1;
        application.trace = Date.now();
        application.save();
        req.io
          .to(req.body.instLinker)
          .emit("message", { ...application, messageType: "application" });
        res.json({ application, status: 201 });
      } else {
        res.json({ status: 404, message: "Application not found" });
      }
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Application couldn't be edited",
      })
    );
});

module.exports = router;
