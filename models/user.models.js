const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
	{
		avatar: { type: String },
		name: { type: String },
		email: {
			type: String,
			required: [true, "can't be blank"],
			index: true,
			lowercase: true,
			unique: true,
		},
		password: { type: String },
	},
	{ timestamps: true }
);
UserSchema.plugin(uniqueValidator, { message: "is already taken." });
module.exports = mongoose.model("User", UserSchema);
