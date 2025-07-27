const express = require("express");
const router = express.Router();

router.get("/donate-money", (req, res) => {
    res.render("money_donor/donate-money"); // if file is in views/money_donor/
});

module.exports = router;
