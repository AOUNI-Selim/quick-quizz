const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoomSchema = new Schema(
	{
		playerOne: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		playerTwo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		playerOneScore: { type: Number, default: 0 },
		playerTwoScore: { type: Number, default: 0 },
	},
	{ timestamps: true }
);
module.exports = mongoose.model("Room", RoomSchema);
