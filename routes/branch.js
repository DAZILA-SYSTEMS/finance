const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const router = express.Router();
const Branch = require("../models/Branch");
const { Op } = require("sequelize");

router.post("/add", verifyToken, verifyAdmin, (req, res) => {
  //create a branch
  Branch.create({
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
    .then((branch) => {
      req.io
        .to(req.body.instLinker)
        .emit("message", { ...branch, messageType: "branch" });
      res.json({ branch, status: 201 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Branch couldn't be created",
      })
    );
});

//edit branch
router.post("/edit", verifyToken, verifyAdmin, (req, res) => {
  Branch.findOne({
    where: { id: req.body.id, instLinker: req.body.instLinker },
  })
    .then((branch) => {
      if (branch) {
        branch.name = req.body.name ? req.body.name : branch.name;
        branch.details = req.body.details ? req.body.details : branch.details;
        branch.credLinker = req.credLinker;
        branch.trace = req.body.trace ? req.body.trace : branch.trace;
        branch.live = 1;
        branch.deleted = req.body.deleted ? req.body.deleted : branch.deleted;
        branch.save();
        req.io
          .to(req.body.instLinker)
          .emit("message", { ...branch, messageType: "branch" });
        res.json({ branch, status: 200 });
      } else {
        res.json({ status: 404, message: "Branch not found" });
      }
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Branch couldn't be edited",
      })
    );
});

//get branchs
router.post("/get", verifyToken, (req, res) => {
  Branch.findAll({
    where: {
      instLinker: req.body.instLinker,
      trace: { [Op.gt]: req.body.online },
    },
  })
    .then((branchs) => {
      res.json({ branchs, status: 200 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Unknown error",
      })
    );
});

module.exports = router;
