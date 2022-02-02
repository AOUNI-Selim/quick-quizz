const events = require("../events");
module.exports = function (io) {
	io.on("connection", (socket) => {
		socket.io = io;
		events(socket);
		console.log("User with socketId %s connected", socket.id);
	});
};
