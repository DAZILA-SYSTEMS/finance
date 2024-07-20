const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();
const Expense = require("../models/Expense");
const { Op } = require("sequelize");
const verifyStaff = require("../middleware/verifyStaff");

router.post("/add", verifyToken, verifyStaff, (req, res) => {
  //create an expense
  Expense.create({
    name: req.body.name,
    details: req.body.details,
    amount: req.body.amount,
    code: req.body.code,
    mode: req.body.mode,
    credLinker: req.credLinker,
    catLinker: req.body.catLinker,
    branchLinker: req.body.branchLinker,
    instLinker: req.body.instLinker,
    live: 1,
    linker: req.body.linker,
    trace: req.body.trace,
    deleted: req.body.deleted || 0,
    status: 0,
  })
    .then((expense) => {
      req.io
        .to(req.body.instLinker)
        .emit("message", { ...expense, messageType: "expense" });
      res.json({ expense, status: 201 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Expense couldn't be created",
      })
    );
});

//edit expense
router.post("/edit", verifyToken, verifyStaff, (req, res) => {
  Expense.findOne({
    where: { id: req.body.id, instLinker: req.body.instLinker },
  })
    .then((expense) => {
      if (expense) {
        expense.name = req.body.name ? req.body.name : expense.name;
        expense.details = req.body.details ? req.body.details : expense.details;
        expense.amount = req.body.amount ? req.body.amount : expense.amount;
        expense.code = req.body.code ? req.body.code : expense.code;
        expense.mode = req.body.mode ? req.body.mode : expense.mode;
        expense.catLinker = req.body.catLinker
          ? req.body.catLinker
          : expense.catLinker;
        expense.credLinker = req.credLinker;
        expense.trace = req.body.trace ? req.body.trace : expense.trace;
        expense.live = 1;
        expense.deleted = req.body.deleted ? req.body.deleted : expense.deleted;
        expense.save();
        req.io.to(req.body.instLinker).emit("message", {
          ...expense,
          messageType: "expense",
        });
        res.json({ expense, status: 200 });
      } else {
        res.json({ status: 404, message: "Expense not found" });
      }
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Expense couldn't be edited",
      })
    );
});

//get expenses
router.post("/get", verifyToken, verifyStaff, (req, res) => {
  Expense.findAll({
    where: {
      instLinker: req.body.instLinker,
      trace: { [Op.gt]: req.body.online },
    },
  })
    .then((expenses) => {
      res.json({ expenses, status: 200 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Unknown error",
      })
    );
});

module.exports = router;
