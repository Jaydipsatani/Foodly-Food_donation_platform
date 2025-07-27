const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user.js");
const passport = require("passport");
const middleware = require("../middleware/index.js")
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "fooddonation258@gmail.com",
        pass: "jtdf obez jdic xjzw"
    }
});


function generateOTP() {
    return crypto.randomInt(100000, 999999).toString(); 
}


router.get("/auth/forgotPassword",  middleware.ensureNotLoggedIn,  (req,res) => {
	res.render("auth/forgotPassword", { title: "User forgot password" });
});


router.post("/auth/forgotPassword", middleware.ensureNotLoggedIn, async (req, res) => {
    const { email } = req.body;
    console.log("this email", email)

    try {
        const user = await User.findOne({ email });

        if (!user) {
            req.flash("error", "No user found with that email address.");
            return res.redirect("/auth/forgotPassword");
        }

        req.session.resetPasswordEmail = email;

        const otp = generateOTP();
        req.session.forgotPasswordOTP = otp;

        const mailOptions = {
            from: "princegoti11@gmail.com",
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP for password reset is: ${otp}`
        };

        await transporter.sendMail(mailOptions);
        req.flash("success", "An OTP has been sent to your email address.");
        res.redirect("/auth/verifyCode");
    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to send OTP. Please try again later.");
        res.redirect("/auth/forgotPassword");
    }
});

router.get("/auth/verifyCode", middleware.ensureNotLoggedIn, (req, res) => {
    res.render("auth/verifyCode", { title: "Verify OTP" });
});


router.post("/auth/verifyCode", middleware.ensureNotLoggedIn, (req, res) => {
    const { otp } = req.body;
console.log(req.session.forgotPasswordOTP)
console.log("new otp", otp)
    if (req.session.forgotPasswordOTP === otp) {
        res.redirect("/auth/resetPassword");
    } else {
        req.flash("error", "Invalid OTP. Please try again.");
        res.redirect("/auth/verifyCode");
    }
});


router.post("/auth/resendOTP", middleware.ensureNotLoggedIn, async (req, res) => {
    const { resend } = req.body;
    const email = req.session.resetPasswordEmail;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/auth/forgotPassword");
        }

        const otp = generateOTP();
        req.session.forgotPasswordOTP = otp;

        const mailOptions = {
            from: "princegoti11@gmail.com",
            to: resend,
            subject: "Password Reset OTP",
            text: `Your OTP for password reset is: ${otp}`
        };

        await transporter.sendMail(mailOptions);
        req.flash("success", "An OTP has been sent to your email address.");
        res.redirect("/auth/verifyCode");
    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to send OTP. Please try again later.");
        res.redirect("/auth/forgotPassword");
    }
});


router.get("/auth/resetPassword",middleware.ensureNotLoggedIn,   (req,res) => {
	res.render("auth/resetPassword", { title: "User forgot password" });
});

router.post("/auth/resetPassword", middleware.ensureNotLoggedIn, async (req, res) => {
    const { otp, newPassword, confirmPassword } = req.body;

    try {
        if (newPassword !== confirmPassword) {
            req.flash("error", "Passwords do not match.");
            return res.redirect("/auth/verifyCode");
        }


        const email = req.session.resetPasswordEmail;

        const user = await User.findOne({ email });

        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/auth/forgotPassword");
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(newPassword, salt);
        user.password = hash;
        await user.save();

        req.flash("success", "Password reset successful. You can now log in with your new password.");
        res.redirect("/auth/login");
    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to reset password. Please try again later.");
        res.redirect("/auth/forgotPassword");
    }
});



router.get("/auth/signup", middleware.ensureNotLoggedIn, (req,res) => {
	res.render("auth/signup", { title: "User Signup" });
});	

router.post("/auth/signup", middleware.ensureNotLoggedIn, async (req,res) => {
	
	const { firstName, lastName, email, password1, password2, role } = req.body;
	let errors = [];
	
	if (!firstName || !lastName || !email || !password1 || !password2) {
		errors.push({ msg: "Please fill in all the fields" });
	}	
	if (password1 != password2) {
		errors.push({ msg: "Passwords are not matching" });
	}	
	if (password1.length < 4) {
		errors.push({ msg: "Password length should be atleast 4 characters" });
	}	
	if(errors.length > 0) {
		return res.render("auth/signup", {
			title: "User Signup",
			errors, firstName, lastName, email, password1, password2
		});	
	}	
	
	try
	{
		const user = await User.findOne({ email: email });
		if(user)
		{
			errors.push({msg: "This Email is already registered. Please try another email."});
			return res.render("auth/signup", {
				title: "User Signup",
				firstName, lastName, errors, email, password1, password2
			});	
		}	
		
		const newUser = new User({ firstName, lastName, email, password:password1, role });
		const salt = bcrypt.genSaltSync(10);
		const hash = bcrypt.hashSync(newUser.password, salt);
		newUser.password = hash;
		await newUser.save();
		req.flash("success", "You are successfully registered and can log in.");
		res.redirect("/auth/login");
	}	
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}	
	
});	

router.get("/auth/login", middleware.ensureNotLoggedIn, (req,res) => {
	res.render("auth/login", { title: "User login" });
});	

// router.post("/auth/login", middleware.ensureNotLoggedIn,
// 	passport.authenticate('local', {
// 		failureRedirect: "/auth/login",
// 		failureFlash: true,
// 		successFlash: true
// 	}), (req,res) => { 
// 		res.redirect(req.session.returnTo || `/${req.user.role}/dashboard`);
// 	}	
// );	


router.post("/auth/login", middleware.ensureNotLoggedIn,
    passport.authenticate('local', {
        failureRedirect: "/auth/login",
        failureFlash: true
    }), (req, res) => {
        console.log(req.user.is_admin ,req.user.role)
        if (req.user.is_admin === true && req.user.role === "admin") {
            res.redirect('/admin/dashboard');
        } else {
            res.redirect(req.session.returnTo || `/${req.user.role}/dashboard`);
        }
    }
);




router.get("/auth/logout", (req,res) => {
	req.logout();
	req.flash("success", "Logged-out successfully")
	res.redirect("/");
});


module.exports = router;