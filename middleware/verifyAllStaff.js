const Cred = require("../models/Credential");
const { Op } = require("sequelize");

// Verify SuperAdmin
function verifyAllStaff(req, res, next) {
  Cred.findOne({
    where: {
      [Op.or]: [
        {
          email: req.userLogger,
          instLinker: req.body.instLinker,
          admin: 1,
          deleted: 0,
        },
        {
          contact: req.userLogger,
          instLinker: req.body.instLinker,
          admin: 1,
          deleted: 0,
        },
        {
          email: req.userLogger,
          instLinker: req.body.instLinker,
          tutor: 1,
          deleted: 0,
        },
        {
          contact: req.userLogger,
          instLinker: req.body.instLinker,
          tutor: 1,
          deleted: 0,
        },
        {
          email: req.userLogger,
          instLinker: req.body.instLinker,
          library: 1,
          deleted: 0,
        },
        {
          contact: req.userLogger,
          instLinker: req.body.instLinker,
          library: 1,
          deleted: 0,
        },
        {
          email: req.userLogger,
          instLinker: req.body.instLinker,
          finance: 1,
          deleted: 0,
        },
        {
          contact: req.userLogger,
          instLinker: req.body.instLinker,
          finance: 1,
          deleted: 0,
        },
      ],
    },
  })
    .then((cred) =>
      cred ? ((req.credLinker = cred.linker), next()) : res.sendStatus(403)
    )
    .catch((err) => res.sendStatus(403));
}

module.exports = verifyAllStaff;
