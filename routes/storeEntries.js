const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();
const StoreEntry = require("../models/StoreEntry");
const verifyStaff = require("../middleware/verifyStaff");
const { Op } = require("sequelize");

router.post("/add", verifyToken, verifyStaff, (req, res) => {
  //create an storeEntry
  StoreEntry.create({
    type: req.body.type,
    details: req.body.details,
    amount: req.body.amount,
    supplier: req.body.supplier,
    quantity: req.body.quantity,
    itemLinker: req.body.itemLinker,
    patientLinker: req.body.patientLinker,
    credLinker: req.credLinker,
    instLinker: req.body.instLinker,
    live: 1,
    linker: req.body.linker,
    trace: req.body.trace,
    deleted: req.body.deleted || 0,
    status: 0,
  })
    .then((storeEntry) => {
      req.io
        .to(req.body.instLinker)
        .emit("message", { ...storeEntry, messageType: "storeEntry" });
      res.json({ storeEntry, status: 201 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "StoreEntry couldn't be created",
      })
    );
});

//edit storeEntry
router.post("/edit", verifyToken, verifyStaff, (req, res) => {
  StoreEntry.findOne({
    where: { id: req.body.id, instLinker: req.body.instLinker },
  })
    .then((storeEntry) => {
      if (storeEntry) {
        storeEntry.type = req.body.type ? req.body.type : storeEntry.type;
        storeEntry.details = req.body.details
          ? req.body.details
          : storeEntry.details;
        storeEntry.supplier = req.body.supplier
          ? req.body.supplier
          : storeEntry.supplier;
        storeEntry.quantity = req.body.quantity
          ? req.body.quantity
          : storeEntry.quantity;
        storeEntry.itemLinker = req.body.itemLinker
          ? req.body.itemLinker
          : storeEntry.itemLinker;
        storeEntry.credLinker = req.credLinker;
        storeEntry.trace = req.body.trace ? req.body.trace : storeEntry.trace;
        storeEntry.live = 1;
        storeEntry.deleted = req.body.deleted
          ? req.body.deleted
          : storeEntry.deleted;
        storeEntry.save();
        req.io.to(req.body.instLinker).emit("message", {
          ...storeEntry,
          messageType: "storeEntry",
        });
        res.json({ storeEntry, status: 200 });
      } else {
        res.json({ status: 404, message: "StoreEntry not found" });
      }
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "StoreEntry couldn't be edited",
      })
    );
});

//get storeEntrys
router.post("/get", verifyToken, verifyStaff, (req, res) => {
  StoreEntry.findAll({
    where: {
      instLinker: req.body.instLinker,
      trace: { [Op.gt]: req.body.online },
    },
  })
    .then((storeEntries) => {
      res.json({ storeEntries, status: 200 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Unknown error",
      })
    );
});

module.exports = router;
