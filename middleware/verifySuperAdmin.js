const Inst = require("../models/Inst");

// Verify SuperAdmin
function verifySuperAdmin(req, res, next) {
  Inst.findOne({
    where: { userLinker: req.userLinker, linker: req.body.instLinker },
  })
    .then((inst) => (inst ? next() : res.sendStatus(403)))
    .catch((err) => res.sendStatus(403));
}

module.exports = verifySuperAdmin;
