const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const router = express.Router();
const Account = require("../models/Account");
const { Op } = require("sequelize");

router.post("/add", verifyToken, verifyAdmin, (req, res) => {
  //create a account
  Account.create({
    name: req.body.name,
    details: req.body.details,
    type: req.body.type,
    rate: req.body.rate,
    credLinker: req.credLinker,
    instLinker: req.body.instLinker,
    live: 1,
    linker: req.body.linker,
    trace: req.body.trace,
    deleted: req.body.deleted || 0,
    status: req.body.status,
  })
    .then((account) => {
      req.io
        .to(req.body.instLinker)
        .emit("message", { ...account, messageType: "account" });
      res.json({ account, status: 201 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Account couldn't be created",
      })
    );
});

//edit account
router.post("/edit", verifyToken, verifyAdmin, (req, res) => {
  Account.findOne({
    where: { id: req.body.id, instLinker: req.body.instLinker },
  })
    .then((account) => {
      if (account) {
        account.name = req.body.name ? req.body.name : account.name;
        account.details = req.body.details ? req.body.details : account.details;
        account.credLinker = req.credLinker;
        account.trace = req.body.trace ? req.body.trace : account.trace;
        account.status = req.body.status ? req.body.status : account.status;
        account.type = req.body.type ? req.body.type : account.type;
        account.rate = req.body.rate ? req.body.rate : account.rate;
        account.live = 1;
        account.deleted = req.body.deleted ? req.body.deleted : account.deleted;
        account.save();
        req.io
          .to(req.body.instLinker)
          .emit("message", { ...account, messageType: "account" });
        res.json({ account, status: 200 });
      } else {
        res.json({ status: 404, message: "Account not found" });
      }
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Account couldn't be edited",
      })
    );
});

//get accounts
router.post("/get", verifyToken, (req, res) => {
  Account.findAll({
    where: {
      instLinker: req.body.instLinker,
      trace: { [Op.gt]: req.body.online },
    },
  })
    .then((accounts) => {
      res.json({ accounts, status: 200 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Unknown error",
      })
    );
});

module.exports = router;
