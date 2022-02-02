require("dotenv").config();
const Question = require("./models/question.models");
const fs = require("fs");
const mongoose = require("mongoose");

const loadQuestions = async (questions) => {
	try {
		await Question.insertMany(questions);
		console.log("Done!");
		process.exit();
	} catch (e) {
		console.log(e);
	}
};
mongoose.connect("mongodb+srv://projectBack:27HjFsxyDGjUKFMS@projet2.bwdmk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority");
mongoose.connection.on("connected", () => {
	fs.readFile("questions.json", (err, data) => {
		if (err) throw err;
		const questions = JSON.parse(data);
		loadQuestions(questions);
	});
});
