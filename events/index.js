const Room = require("../models/room.models");
const Question = require("../models/question.models");
let choice1 = "",
	choice2 = "";
let currentQuestion = null;
let numberOfQuestions = 1;
let isDraw = false;
let winner = null;
module.exports = function (socket) {
	//Create Game Listener

	socket.on("createGame", async function (data) {
		winner = null;
		isDraw = false;
		numberOfQuestions = 1;
		const room = new Room({
			playerOne: data.playerOne,
		});
		let savedRoom = await room.save();
		savedRoom = await savedRoom.populate("playerOne");
		await socket.join(savedRoom._id);
		currentQuestion = await getQuestion();
		socket.emit("newGame", {
			room: savedRoom,
		});
	});
	//Join Game Listener
	socket.on("joinGame", async function (data) {
		const room = await Room.findById(data.roomId);
		if (room) {
			if (room.playerOne && room.playerTwo) {
				socket.emit("err", { message: "Sorry, The room is full!" });
			} else {
				await socket.join(room._id);
				room.playerTwo = data.playerTwo;
				await room.save();
				const savedRoom = await room.populate("playerOne playerTwo");

				socket.broadcast.emit("player1Joined", {
					room: savedRoom,
				});
				socket.emit("player2Joined", {
					room: savedRoom,
				});
				socket.broadcast.emit("startGame", {
					question: currentQuestion,
				});
				socket.emit("startGame", {
					question: currentQuestion,
				});
			}
		} else {
			socket.emit("err", { message: "Invalid Room Key" });
		}
	});

	socket.on("choose", function (data) {
		if (data.player === 1) {
			choice1 = data.choice;
		} else {
			choice2 = data.choice;
		}
		if (choice1 && choice2) {
			result(data.room, data.question);
		}
	});

	const result = async (roomID, questionID) => {
		let room = await Room.findById(roomID).populate("playerOne playerTwo");
		let question = await Question.findById(questionID);
		if (question.propositions[choice1] === question.answer) {
			room.playerOneScore++;
		}
		if (question.propositions[choice2] === question.answer) {
			room.playerTwoScore++;
		}
		if (isDraw && room.playerOneScore !== room.playerTwoScore) {
			winner =
				room.playerOneScore > room.playerTwoScore
					? room.playerOne
					: room.playerTwo;
		}
		if (
			numberOfQuestions === 10 &&
			room.playerOneScore !== room.playerTwoScore
		) {
			winner =
				room.playerOneScore > room.playerTwoScore
					? room.playerOne
					: room.playerTwo;
		}
		if (
			numberOfQuestions >= 10 &&
			room.playerOneScore === room.playerTwoScore
		) {
			isDraw = true;
		}
		await room.save();
		if (winner) {
			socket.emit("winner", {
				room: room,
				winner: winner,
			});
			socket.broadcast.emit("winner", {
				room: room,
				winner: winner,
			});
		}
		socket.emit("result", {
			room: room,
			answer: question.propositions.indexOf(question.answer),
		});
		socket.broadcast.emit("result", {
			room: room,
			answer: question.propositions.indexOf(question.answer),
		});
		choice1 = "";
		choice2 = "";
	};
	socket.on("getNextQuestion", async () => {
		currentQuestion = await getQuestion();
		numberOfQuestions++;
		socket.broadcast.emit("nextQuestion", {
			question: currentQuestion,
		});
		socket.emit("nextQuestion", {
			question: currentQuestion,
		});
	});
};

async function getQuestion() {
	const count = await Question.count();
	const random = Math.floor(Math.random() * count);
	const question = await Question.findOne().skip(random);
	return question;
}
