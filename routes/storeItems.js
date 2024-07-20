const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();
const StoreItem = require("../models/StoreItem");
const verifyStaff = require("../middleware/verifyStaff");
const { Op } = require("sequelize");

router.post("/add", verifyToken, verifyStaff, (req, res) => {
  //create an storeItem
  StoreItem.create({
    name: req.body.name,
    details: req.body.details,
    credLinker: req.credLinker,
    catLinker: req.body.catLinker,
    instLinker: req.body.instLinker,
    live: 1,
    linker: req.body.linker,
    trace: req.body.trace,
    deleted: req.body.deleted || 0,
    status: 0,
  })
    .then((storeItem) => {
      req.io
        .to(req.body.instLinker)
        .emit("message", { ...storeItem, messageType: "storeItem" });
      res.json({ storeItem, status: 201 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "StoreItem couldn't be created",
      })
    );
});

//edit storeItem
router.post("/edit", verifyToken, verifyStaff, (req, res) => {
  StoreItem.findOne({
    where: { id: req.body.id, instLinker: req.body.instLinker },
  })
    .then((storeItem) => {
      if (storeItem) {
        storeItem.name = req.body.name ? req.body.name : storeItem.name;
        storeItem.details = req.body.details
          ? req.body.details
          : storeItem.details;
        storeItem.catLinker = req.body.catLinker
          ? req.body.catLinker
          : storeItem.catLinker;
        storeItem.credLinker = req.credLinker;
        storeItem.trace = req.body.trace ? req.body.trace : storeItem.trace;
        storeItem.live = 1;
        storeItem.deleted = req.body.deleted
          ? req.body.deleted
          : storeItem.deleted;
        storeItem.save();
        req.io.to(req.body.instLinker).emit("message", {
          ...storeItem,
          messageType: "storeItem",
        });
        res.json({ storeItem, status: 200 });
      } else {
        res.json({ status: 404, message: "StoreItem not found" });
      }
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "StoreItem couldn't be edited",
      })
    );
});

//get storeItems
router.post("/get", verifyToken, verifyStaff, (req, res) => {
  StoreItem.findAll({
    where: {
      instLinker: req.body.instLinker,
      trace: { [Op.gt]: req.body.online },
    },
  })
    .then((storeItems) => {
      res.json({ storeItems, status: 200 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Unknown error",
      })
    );
});

module.exports = router;
