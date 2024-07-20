const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const verifyStaff = require("../middleware/verifyStaff");
const router = express.Router();
const Notification = require("../models/Notification");
const { Op } = require("sequelize");

router.post("/add", verifyToken, verifyStaff, (req, res) => {
  //create a notification
  Notification.create({
    title: req.body.title,
    note: req.body.note,
    credLinker: req.credLinker,
    instLinker: req.body.instLinker,
    live: 1,
    linker: req.body.linker,
    trace: req.body.trace,
    deleted: req.body.deleted || 0,
    status: 0,
  })
    .then((notification) => {
      req.io
        .to(req.body.instLinker)
        .emit("message", { ...notification, messageType: "notification" });
      res.json({ notification, status: 201 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Notification couldn't be created",
      })
    );
});

//edit notification
router.post("/edit", verifyToken, verifyStaff, (req, res) => {
  Notification.findOne({
    where: { id: req.body.id, instLinker: req.body.instLinker },
  })
    .then((notification) => {
      if (notification) {
        notification.title = req.body.title
          ? req.body.title
          : notification.title;
        notification.note = req.body.note ? req.body.note : notification.note;
        notification.credLinker = req.credLinker;
        notification.trace = req.body.trace
          ? req.body.trace
          : notification.trace;
        notification.live = 1;
        notification.deleted = req.body.deleted
          ? req.body.deleted
          : notification.deleted;
        notification.save();
        req.io
          .to(req.body.instLinker)
          .emit("message", { ...notification, messageType: "notification" });
        res.json({ notification, status: 200 });
      } else {
        res.json({ status: 404, message: "Notification not found" });
      }
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Notification couldn't be edited",
      })
    );
});

//get notifications
router.post("/get", verifyToken, (req, res) => {
  Notification.findAll({
    where: {
      instLinker: req.body.instLinker,
      trace: { [Op.gt]: req.body.online },
    },
  })
    .then((notifications) => {
      res.json({ notifications, status: 200 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Unknown error",
      })
    );
});

module.exports = router;
