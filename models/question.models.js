const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const QuestionSchema = new Schema({
	question: { type: String },
	propositions: [{ type: String }],
	answer: { type: String },
	anecdote: { type: String },
});
module.exports = mongoose.model("Question", QuestionSchema);
