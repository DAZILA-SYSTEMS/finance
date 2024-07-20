const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();
const ExpenseCat = require("../models/ExpenseCat");
const verifyStaff = require("../middleware/verifyStaff");
const { Op } = require("sequelize");

router.post("/add", verifyToken, verifyStaff, (req, res) => {
  //create a expenseCat
  ExpenseCat.create({
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
    .then((expenseCat) => {
      req.io
        .to(req.body.instLinker)
        .emit("message", { ...expenseCat, messageType: "expenseCat" });
      res.json({ expenseCat, status: 201 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "ExpenseCat couldn't be created",
      })
    );
});

//edit expenseCat
router.post("/edit", verifyToken, verifyStaff, (req, res) => {
  ExpenseCat.findOne({
    where: { id: req.body.id, instLinker: req.body.instLinker },
  })
    .then((expenseCat) => {
      if (expenseCat) {
        expenseCat.name = req.body.name ? req.body.name : expenseCat.name;
        expenseCat.details = req.body.details
          ? req.body.details
          : expenseCat.details;
        expenseCat.credLinker = req.credLinker;
        expenseCat.trace = req.body.trace ? req.body.trace : expenseCat.trace;
        expenseCat.live = 1;
        expenseCat.deleted = req.body.deleted
          ? req.body.deleted
          : expenseCat.deleted;
        expenseCat.save();
        req.io
          .to(req.body.instLinker)
          .emit("message", { ...expenseCat, messageType: "expenseCat" });
        res.json({ expenseCat, status: 200 });
      } else {
        res.json({ status: 404, message: "ExpenseCat not found" });
      }
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "ExpenseCat couldn't be edited",
      })
    );
});

//get expenseCats
router.post("/get", verifyToken, verifyStaff, (req, res) => {
  ExpenseCat.findAll({
    where: {
      instLinker: req.body.instLinker,
      trace: { [Op.gt]: req.body.online },
    },
  })
    .then((expenseCats) => {
      res.json({ expenseCats, status: 200 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Unknown error",
      })
    );
});

module.exports = router;
