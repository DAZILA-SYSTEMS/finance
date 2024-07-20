const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();
const Credential = require("../models/Credential");
const verifyStaff = require("../middleware/verifyStaff");
const { Op } = require("sequelize");

//register a client
router.post("/add", verifyToken, verifyStaff, (req, res) => {
  Credential.create({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    surname: req.body.surname,
    clientReg: req.body.clientReg,
    instLinker: req.body.instLinker,
    credLinker: req.credLinker,
    groupLinker: req.body.groupLinker,
    branchLinker: req.body.branchLinker,
    trace: req.body.trace,
    linker: req.body.linker,
    email: req.body.email,
    contact: req.body.contact,
    nokName: req.body.nokName,
    nokContact: req.body.nokContact,
    live: 1,
    client: 1,
    location: req.body.location,
    income: req.body.income,
    details: req.body.details,
    status: req.body.status,
    deleted: 0,
  })
    .then((credential) => {
      req.io
        .to(req.body.instLinker)
        .emit("message", { ...credential, messageType: "client" });
      res.json({ cred: credential, status: 201 });
    })
    .catch((err) => res.json({ status: "500", message: "Error has occured" }));
});

//edit a client
router.post("/edit", verifyToken, verifyStaff, (req, res) => {
  Credential.findOne({
    where: { id: req.body.id, instLinker: req.body.instLinker },
  })
    .then((client) => {
      if (client) {
        client.firstname = req.body.firstname
          ? req.body.firstname
          : client.firstname;
        client.lastname = req.body.lastname
          ? req.body.lastname
          : client.lastname;
        client.surname = req.body.surname ? req.body.surname : client.surname;
        client.clientReg = req.body.clientReg
          ? req.body.clientReg
          : client.clientReg;
        client.email = req.body.email ? req.body.email : client.email;
        client.contact = req.body.contact ? req.body.contact : client.contact;
        client.client = req.body.client ? req.body.client : client.client;
        client.groupLinker = req.body.groupLinker
          ? req.body.groupLinker
          : client.groupLinker;
        client.branchLinker = req.body.branchLinker
          ? req.body.branchLinker
          : client.branchLinker;
        client.details = req.body.details ? req.body.details : client.details;
        client.location = req.body.location
          ? req.body.location
          : client.location;
        client.income = req.body.income ? req.body.income : client.income;
        client.nokName = req.body.nokName ? req.body.nokName : client.nokName;
        client.nokContact = req.body.nokContact
          ? req.body.nokContact
          : client.nokContact;
        client.credLinker = req.credLinker;
        client.trace = req.body.trace ? req.body.trace : client.trace;
        client.live = 1;
        client.status = req.body.status ? req.body.status : client.status;
        client.deleted = req.body.deleted ? req.body.deleted : client.deleted;
        client.save();
        req.io
          .to(req.body.instLinker)
          .emit("message", { ...client, messageType: "client" });
        res.json({ cred: client, status: 200 });
      } else {
        res.json({ status: 404, message: "client not found" });
      }
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "client couldn't be edited",
      })
    );
});

//get clients
router.post("/get", verifyToken, verifyStaff, (req, res) => {
  Credential.findAll({
    where: {
      instLinker: req.body.instLinker,
      trace: { [Op.gt]: req.body.online },
      /*[Op.or]: [
        {
          client: 1,
        },
      ],*/
    },
  })
    .then((creds) => {
      res.json({ creds, status: 200 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Unknown error",
      })
    );
});
module.exports = router;
