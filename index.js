require("dotenv").config();
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const mongoose = require("mongoose");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
require('./middlewares/passport')(passport);
mongoose.connect(process.env.MONGO_DB);
mongoose.connection.on("connected", () => {
	console.log("DB Connected");
});
mongoose.connection.on("error", (err) => {
	console.log("DB Connection failed with - ", err);
});
mongoose.connection.on("disconnected", () => {
	console.log("DB Disconnected");
});
// Import socket related
const initListener = require("./listeners");
// Import routes
const routers = require("./routes");
app.use(expressLayouts);
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
	session({
		secret: "secret",
		resave: true,
		saveUninitialized: true,
	})
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function (req, res, next) {
	res.locals.success_msg = req.flash("success_msg");
	res.locals.error_msg = req.flash("error_msg");
	res.locals.error = req.flash("error");
	next();
});
// Websocket
initListener(io);
// Routes middleware
app.use("/", routers);
// Server run
const port = process.env.PORT || 8000 ;

server.listen(port, () => {
	console.log(`Server is up and running on port number ${port}`);
});
