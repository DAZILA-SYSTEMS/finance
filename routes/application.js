const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const verifyStaff = require("../middleware/verifyStaff");
const router = express.Router();
const Application = require("../models/Application");
const { Op } = require("sequelize");

router.post("/add", verifyToken, verifyStaff, (req, res) => {
  //create a application
  Application.create({
    clientLinker: req.body.clientLinker,
    accountLinker: req.body.accountLinker,
    appliedAmount: req.body.appliedAmount,
    approvedAmount: req.body.approvedAmount,
    disbursedAmount: req.body.disbursedAmount,
    disburseDate: req.body.disburseDate,
    security: req.body.security,
    guarantors: req.body.guarantors,
    period: req.body.period,
    principal: req.body.principal,
    details: req.body.details,
    credLinker: req.credLinker,
    branchLinker: req.branchLinker,
    instLinker: req.body.instLinker,
    live: 1,
    linker: req.body.linker,
    trace: req.body.trace,
    deleted: req.body.deleted || 0,
    status: req.body.status,
  })
    .then((application) => {
      req.io
        .to(req.body.instLinker)
        .emit("message", { ...application, messageType: "application" });
      res.json({ application, status: 201 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Application couldn't be created",
      })
    );
});

//edit application
router.post("/edit", verifyToken, verifyStaff, (req, res) => {
  Application.findOne({
    where: { id: req.body.id, instLinker: req.body.instLinker },
  })
    .then((application) => {
      if (application) {
        application.clientLinker = req.body.clientLinker
          ? req.body.clientLinker
          : application.clientLinker;
        application.accountLinker = req.body.accountLinker
          ? req.body.accountLinker
          : application.accountLinker;
        application.appliedAmount = req.body.appliedAmount
          ? req.body.appliedAmount
          : application.appliedAmount;
        application.approvedAmount = req.body.approvedAmount
          ? req.body.approvedAmount
          : application.approvedAmount;
        application.disburseDate = req.body.disburseDate
          ? req.body.disburseDate
          : application.disburseDate;
        application.disbursedAmount = req.body.disbursedAmount
          ? req.body.disbursedAmount
          : application.disbursedAmount;
        application.security = req.body.security
          ? req.body.security
          : application.security;
        application.guarantors = req.body.guarantors
          ? req.body.guarantors
          : application.guarantors;
        application.principal = req.body.principal
          ? req.body.principal
          : application.principal;
        application.period = req.body.period
          ? req.body.period
          : application.period;
        application.details = req.body.details
          ? req.body.details
          : application.details;
        application.credLinker = req.credLinker;
        application.branchLinker = req.branchLinker;
        application.trace = req.body.trace ? req.body.trace : application.trace;
        application.status = req.body.status
          ? req.body.status
          : application.status;
        application.live = 1;
        application.deleted = req.body.deleted
          ? req.body.deleted
          : application.deleted;
        application.save();
        req.io
          .to(req.body.instLinker)
          .emit("message", { ...application, messageType: "application" });
        res.json({ application, status: 200 });
      } else {
        res.json({ status: 404, message: "Application not found" });
      }
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Application couldn't be edited",
      })
    );
});

//get applications
router.post("/get", verifyToken, (req, res) => {
  Application.findAll({
    where: {
      instLinker: req.body.instLinker,
      trace: { [Op.gt]: req.body.online },
    },
  })
    .then((applications) => {
      res.json({ applications, status: 200 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Unknown error",
      })
    );
});

module.exports = router;
