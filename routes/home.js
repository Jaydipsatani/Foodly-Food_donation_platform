const express = require("express");
const router = express.Router();

router.get("/", (req,res) => {
	res.render("home/welcome");
});

router.get("/home/about-us", (req,res) => {
	res.render("home/aboutUs", { title: "About Us | Food Aid" });
});

router.get("/home/mission", (req,res) => {
	res.render("home/mission", { title: "Our mission | Food Aid" });
});

router.get("/home/contact-us", (req,res) => {
	res.render("home/contactUs", { title: "Contact us | Food Aid" });
});

// Add this line below existing routes
router.get("/money_donor/donate-money", (req, res) => {
    res.render("money_donor/donate-money"); // this will render views/donate-money.ejs
});


module.exports = router;