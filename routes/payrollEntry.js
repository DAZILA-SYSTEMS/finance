const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();
const PayrollEntry = require("../models/PayrollEntry");
const { Op } = require("sequelize");
const verifyAdmin = require("../middleware/verifyAdmin");
const verifyStaff = require("../middleware/verifyStaff");

router.post("/add", verifyToken, verifyAdmin, (req, res) => {
  //create an payrollEntry
  PayrollEntry.create({
    month: req.body.month,
    details: req.body.details,
    amount: req.body.amount,
    itemLinker: req.body.itemLinker,
    staffLinker: req.body.staffLinker,
    credLinker: req.credLinker,
    instLinker: req.body.instLinker,
    live: 1,
    linker: req.body.linker,
    trace: req.body.trace,
    deleted: req.body.deleted || 0,
    status: 0,
  })
    .then((payrollEntry) => {
      req.io
        .to(req.body.instLinker)
        .emit("message", { ...payrollEntry, messageType: "payrollEntry" });
      res.json({ payrollEntry, status: 201 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "PayrollEntry couldn't be created",
      })
    );
});

//edit payrollEntry
router.post("/edit", verifyToken, verifyAdmin, (req, res) => {
  PayrollEntry.findOne({
    where: { id: req.body.id, instLinker: req.body.instLinker },
  })
    .then((payrollEntry) => {
      if (payrollEntry) {
        payrollEntry.month = req.body.month
          ? req.body.month
          : payrollEntry.month;
        payrollEntry.details = req.body.details
          ? req.body.details
          : payrollEntry.details;
        payrollEntry.amount = req.body.amount
          ? req.body.amount
          : payrollEntry.amount;
        payrollEntry.itemLinker = req.body.itemLinker
          ? req.body.itemLinker
          : payrollEntry.itemLinker;
        payrollEntry.staffLinker = req.body.staffLinker
          ? req.body.staffLinker
          : payrollEntry.staffLinker;
        payrollEntry.credLinker = req.credLinker;
        payrollEntry.trace = req.body.trace
          ? req.body.trace
          : payrollEntry.trace;
        payrollEntry.live = 1;
        payrollEntry.deleted = req.body.deleted
          ? req.body.deleted
          : payrollEntry.deleted;
        payrollEntry.save();
        req.io.to(req.body.instLinker).emit("message", {
          ...payrollEntry,
          messageType: "payrollEntry",
        });
        res.json({ payrollEntry, status: 200 });
      } else {
        res.json({ status: 404, message: "PayrollEntry not found" });
      }
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "PayrollEntry couldn't be edited",
      })
    );
});

//get payrollEntrys
router.post("/get", verifyToken, verifyAdmin, (req, res) => {
  PayrollEntry.findAll({
    where: {
      instLinker: req.body.instLinker,
      trace: { [Op.gt]: req.body.online },
    },
  })
    .then((payrollEntries) => {
      res.json({ payrollEntries, status: 200 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Unknown error",
      })
    );
});

//staff get payrollEntrys
router.post("/staff", verifyToken, verifyStaff, (req, res) => {
  PayrollEntry.findAll({
    where: {
      instLinker: req.body.instLinker,
      staffLinker: req.credLinker,
      trace: { [Op.gt]: req.body.online },
    },
  })
    .then((payrollEntries) => {
      res.json({ payrollEntries, status: 200 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Unknown error",
      })
    );
});

module.exports = router;
