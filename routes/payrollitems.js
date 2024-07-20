const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();
const PayrollItem = require("../models/PayrollItem");
const verifyAdmin = require("../middleware/verifyAdmin");
const verifyStaff = require("../middleware/verifyStaff");
const { Op } = require("sequelize");

router.post("/add", verifyToken, verifyAdmin, (req, res) => {
  //create an payrollItem
  PayrollItem.create({
    amount: req.body.amount,
    details: req.body.details,
    credLinker: req.credLinker,
    catLinker: req.body.catLinker,
    staffLinker: req.body.staffLinker,
    instLinker: req.body.instLinker,
    live: 1,
    linker: req.body.linker,
    trace: req.body.trace,
    deleted: req.body.deleted || 0,
    status: 0,
  })
    .then((payrollItem) => {
      req.io
        .to(req.body.instLinker)
        .emit("message", { ...payrollItem, messageType: "payrollItem" });
      res.json({ payrollItem, status: 201 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "PayrollItem couldn't be created",
      })
    );
});

//edit payrollItem
router.post("/edit", verifyToken, verifyAdmin, (req, res) => {
  PayrollItem.findOne({
    where: { id: req.body.id, instLinker: req.body.instLinker },
  })
    .then((payrollItem) => {
      if (payrollItem) {
        payrollItem.amount = req.body.amount
          ? req.body.amount
          : payrollItem.amount;
        payrollItem.details = req.body.details
          ? req.body.details
          : payrollItem.details;
        payrollItem.staffLinker = req.body.staffLinker
          ? req.body.staffLinker
          : payrollItem.staffLinker;
        payrollItem.catLinker = req.body.catLinker
          ? req.body.catLinker
          : payrollItem.catLinker;
        payrollItem.credLinker = req.credLinker;
        payrollItem.trace = req.body.trace ? req.body.trace : payrollItem.trace;
        payrollItem.live = 1;
        payrollItem.deleted = req.body.deleted
          ? req.body.deleted
          : payrollItem.deleted;
        payrollItem.save();
        req.io.to(req.body.instLinker).emit("message", {
          ...payrollItem,
          messageType: "payrollItem",
        });
        res.json({ payrollItem, status: 200 });
      } else {
        res.json({ status: 404, message: "PayrollItem not found" });
      }
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "PayrollItem couldn't be edited",
      })
    );
});

//get payrollItems
router.post("/get", verifyToken, verifyAdmin, (req, res) => {
  PayrollItem.findAll({
    where: {
      instLinker: req.body.instLinker,
      trace: { [Op.gt]: req.body.online },
    },
  })
    .then((payrollItems) => {
      res.json({ payrollItems, status: 200 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Unknown error",
      })
    );
});

//staff get payrollItems
router.post("/staff", verifyToken, verifyStaff, (req, res) => {
  PayrollItem.findAll({
    where: {
      instLinker: req.body.instLinker,
      staffLinker: req.credLinker,
      trace: { [Op.gt]: req.body.online },
    },
  })
    .then((payrollItems) => {
      res.json({ payrollItems, status: 200 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Unknown error",
      })
    );
});

module.exports = router;
