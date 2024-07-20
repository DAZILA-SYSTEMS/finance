const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();
const PayrollCat = require("../models/PayrollCat");
const { Op } = require("sequelize");
const verifyAdmin = require("../middleware/verifyAdmin");
const verifyStaff = require("../middleware/verifyStaff");

router.post("/add", verifyToken, verifyAdmin, (req, res) => {
  //create a payrollCat
  PayrollCat.create({
    name: req.body.name,
    type: req.body.type,
    credLinker: req.credLinker,
    instLinker: req.body.instLinker,
    live: 1,
    linker: req.body.linker,
    trace: req.body.trace,
    deleted: req.body.deleted || 0,
    status: 0,
  })
    .then((payrollCat) => {
      req.io
        .to(req.body.instLinker)
        .emit("message", { ...payrollCat, messageType: "payrollCat" });
      res.json({ payrollCat, status: 201 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "PayrollCat couldn't be created",
      })
    );
});

//edit payrollCat
router.post("/edit", verifyToken, verifyAdmin, (req, res) => {
  PayrollCat.findOne({
    where: { id: req.body.id, instLinker: req.body.instLinker },
  })
    .then((payrollCat) => {
      if (payrollCat) {
        payrollCat.name = req.body.name ? req.body.name : payrollCat.name;
        payrollCat.type = req.body.type ? req.body.type : payrollCat.type;
        payrollCat.credLinker = req.credLinker;
        payrollCat.trace = req.body.trace ? req.body.trace : payrollCat.trace;
        payrollCat.live = 1;
        payrollCat.deleted = req.body.deleted
          ? req.body.deleted
          : payrollCat.deleted;
        payrollCat.save();
        req.io
          .to(req.body.instLinker)
          .emit("message", { ...payrollCat, messageType: "payrollCat" });
        res.json({ payrollCat, status: 200 });
      } else {
        res.json({ status: 404, message: "PayrollCat not found" });
      }
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "PayrollCat couldn't be edited",
      })
    );
});

//get payrollCats
router.post("/get", verifyToken, verifyStaff, (req, res) => {
  PayrollCat.findAll({
    where: {
      instLinker: req.body.instLinker,
      trace: { [Op.gt]: req.body.online },
    },
  })
    .then((payrollCats) => {
      res.json({ payrollCats, status: 200 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Unknown error",
      })
    );
});

module.exports = router;
