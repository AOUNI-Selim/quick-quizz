const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const User = require("../models/user.models");

module.exports = function (passport) {
	passport.use(
		new LocalStrategy(
			{ usernameField: "email" },
			async (email, password, done) => {
				try {
					const user = await User.findOne({ email: email });

					if (!user) {
						return done(null, false, {
							message: "That email is not registered",
						});
					}
					const validPass = await bcrypt.compare(password, user.password);

					if (validPass) {
						return done(null, user);
					} else {
						return done(null, false, { message: "Password incorrect" });
					}
				} catch (err) {
					return done(null, false, { message: err });
				}
			}
		)
	);
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});
};
