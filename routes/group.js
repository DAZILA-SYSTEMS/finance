const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const router = express.Router();
const Group = require("../models/Group");
const { Op } = require("sequelize");

router.post("/add", verifyToken, verifyAdmin, (req, res) => {
  //create a group
  Group.create({
    name: req.body.name,
    details: req.body.details,
    credLinker: req.credLinker,
    instLinker: req.body.instLinker,
    live: 1,
    linker: req.body.linker,
    trace: req.body.trace,
    deleted: req.body.deleted || 0,
    status: 0,
  })
    .then((group) => {
      req.io
        .to(req.body.instLinker)
        .emit("message", { ...group, messageType: "group" });
      res.json({ group, status: 201 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Group couldn't be created",
      })
    );
});

//edit group
router.post("/edit", verifyToken, verifyAdmin, (req, res) => {
  Group.findOne({
    where: { id: req.body.id, instLinker: req.body.instLinker },
  })
    .then((group) => {
      if (group) {
        group.name = req.body.name ? req.body.name : group.name;
        group.details = req.body.details ? req.body.details : group.details;
        group.credLinker = req.credLinker;
        group.trace = req.body.trace ? req.body.trace : group.trace;
        group.live = 1;
        group.deleted = req.body.deleted ? req.body.deleted : group.deleted;
        group.save();
        req.io
          .to(req.body.instLinker)
          .emit("message", { ...group, messageType: "group" });
        res.json({ group, status: 200 });
      } else {
        res.json({ status: 404, message: "Group not found" });
      }
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Group couldn't be edited",
      })
    );
});

//get groups
router.post("/get", verifyToken, (req, res) => {
  Group.findAll({
    where: {
      instLinker: req.body.instLinker,
      trace: { [Op.gt]: req.body.online },
    },
  })
    .then((groups) => {
      res.json({ groups, status: 200 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Unknown error",
      })
    );
});

module.exports = router;
