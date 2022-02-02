const socket = io();
let playerOne = false;
let roomID;
let winner = null;
$(function () {
	$("#winner").hide();
	$("#play").hide();
	$("#game").hide();
	$("#newgame").click(function () {
		playerOne = true;
		socket.emit("createGame", { playerOne: $("#userId").text() });
	});
	socket.on("newGame", (data) => {
		roomID = data.room._id;
		$("#home").hide();
		$("#play").show();
		$("#msg").text("Waiting for player 2, room ID is " + data.room._id);
		$("#player1Name").text(data.room.playerOne.name);
		$("#player2Name").text("Player 2");
	});
	$("#joingame").click(function () {
		roomID = $("input[name=room]").val();
		socket.emit("joinGame", {
			playerTwo: $("#userId").text(),
			roomId: roomID,
		});
	});
	//Player 2 Joined
	socket.on("player2Joined", (data) => {
		// if (data.room.playerTwo) {
		// 	$("#player2Name").text(data.room.playerTwo.name);
		// }
		transitionToGame(data);
	});

	//Player 1 Joined
	socket.on("player1Joined", (data) => {
		// if (data.room.playerOne) {
		// 	$("#player1Name").text(data.room.playerOne.name);
		// }
		transitionToGame(data);
	});

	socket.on("startGame", (data) => {
		$("#question").text(data.question.question);
		$("#question_id").text(data.question._id);
		$("#answer_0").text(data.question.propositions[0]);
		$("#answer_1").text(data.question.propositions[1]);
		$("#answer_2").text(data.question.propositions[2]);
		$("#answer_3").text(data.question.propositions[3]);
	});
	socket.on("nextQuestion", (data) => {
		setTimeout(() => {
			$(".choice-container").removeClass("disable");
			$("#question").text(data.question.question);
			$("#question_id").text(data.question._id);
			$("#answer_0").text(data.question.propositions[0]);
			$("#answer_1").text(data.question.propositions[1]);
			$("#answer_2").text(data.question.propositions[2]);
			$("#answer_3").text(data.question.propositions[3]);
		}, 2000);
	});
	const transitionToGame = (data) => {
		setTimeout(() => {
			$("#home").hide();
			$("#play").show();
			$("#game").show();
			$("#msg").hide();
			$("#player1Img").attr("src", data.room.playerOne.avatar);
			$("#player2Img").attr("src", data.room.playerTwo.avatar);
			$("#player1Name").text(data.room.playerOne.name);
			$("#player2Name").text(data.room.playerTwo.name);
			$("#player1Score").text(data.room.playerOneScore);
			$("#player2Score").text(data.room.playerTwoScore);
		}, 500);
	};

	//Select Choice
	$(".choice-container").click(function (e) {
		e.stopPropagation();
		const answer = e.target.id.split("_")[1];
		$(".choice-container").addClass("disable");
		$("#choice_" + answer).addClass("chosen");
		setTimeout(() => {
			socket.emit("choose", {
				choice: answer,
				player: playerOne ? 1 : 2,
				room: roomID,
				question: $("#question_id").text(),
			});
		}, 1000);
	});
	socket.on("result", (data) => {
		setTimeout(() => {
			$(".choice-container").removeClass("chosen");
		}, 500);
		setTimeout(() => {
			$("#choice_" + data.answer).addClass("answer");
			$("#player1Score").text(data.room.playerOneScore);
			$("#player2Score").text(data.room.playerTwoScore);
		}, 1000);
		setTimeout(() => {
			$("#choice_" + data.answer).removeClass("answer");
			if (!winner) {
				socket.emit("getNextQuestion");
			}
		}, 3000);
	});
	socket.on("winner", (data) => {
		winner = data.winner;
		$("#winner").show();
		$("#winnerName").text(winner.name);
		setTimeout(() => {
			$("#winner").hide();
			$("#play").hide();
			$("#home").show();
		}, 5000);
	});
});
