const router = require("express").Router();
const User = require("../models/user.models");
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const passport = require("passport");
const {
	forwardAuthenticated,
	ensureAuthenticated,
} = require("../middlewares/auth");

router.get("/", forwardAuthenticated, (req, res) => res.render("welcome"));
router.get("/register", forwardAuthenticated, (req, res) =>
	res.render("register")
);

router.get("/login", forwardAuthenticated, (req, res) => res.render("login"));
router.get("/dashboard", ensureAuthenticated, (req, res) =>
	res.render("dashboard", { user: req.user })
);
router.get("/play", ensureAuthenticated, (req, res) => {
	console.log(req.query.room);
	res.render("play", { user: req.user, room: req.query.room });
});
router.post("/register", async (req, res) => {
	const { name, email, password, password2 } = req.body;
	let errors = [];

	if (!name || !email || !password || !password2) {
		errors.push({ msg: "Please enter all fields" });
	}

	if (password != password2) {
		errors.push({ msg: "Passwords do not match" });
	}

	if (password.length < 6) {
		errors.push({ msg: "Password must be at least 6 characters" });
	}
	if (errors.length > 0) {
		res.render("register", {
			errors,
			name,
			email,
			password,
			password2,
		});
	} else {
		try {
			const user = await User.findOne({ email: email });

			if (user) return errors.push({ msg: "Email already exist" });

			const salt = await bcrypt.genSalt(16);
			const hashedPassword = await bcrypt.hash(password, salt);

			const newUser = new User({
				avatar: gravatar.url(email, { s: "100", r: "x", d: "retro" }, true),
				name: name,
				email: email,
				password: hashedPassword,
			});
			await newUser.save();
			req.flash("success_msg", "You are now registered and can log in");
			res.redirect("/login");
		} catch (err) {
			errors.push({ msg: err });
		}
	}
});
router.post("/login", (req, res, next) => {
	passport.authenticate("local", {
		successRedirect: "/dashboard",
		failureRedirect: "/login",
		failureFlash: true,
	})(req, res, next);
});
router.get("/logout", (req, res) => {
	req.logout();
	req.flash("success_msg", "You are logged out");
	res.redirect("/login");
});
module.exports = router;
