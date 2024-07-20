require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
// Database
const db = require("./config/database");
const http = require("http");

const app = express();
const server = http.createServer(app);

app.use(cors());

const socketIo = require("socket.io");
const SocketJoinRoom = require("./utils/SocketJoinRoom");

//create server for io
const io = socketIo(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
		credentials: true,
	},
});

// Test DB
db.authenticate()
	.then(() => console.log("Database connected..."))
	.catch((err) => console.log("Error: " + err));

//json parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

//add socket io middleware
app.use((req, res, next) => {
	req.io = io;
	next();
});

// Index route
app.get("/", (req, res) => res.send("finance techsystem"));

// auth routes
app.use("/auth", require("./routes/auth"));

// institution routes
app.use("/inst", require("./routes/inst"));

// staff routes
app.use("/staff", require("./routes/staff"));

// mode routes
app.use("/mode", require("./routes/mode"));

// setting up online pay
app.use("/online-pay", require("./routes/mpesa/online"));

// initiating online pay by clients
app.use("/client-pay", require("./routes/mpesa/mpesapay"));

//capturing and verifying online payments
app.use("/verify-pay", require("./routes/mpesa/onlinePayments"));

// expenses cats
app.use("/expense-categories", require("./routes/expenseCat"));

// expenses
app.use("/expense", require("./routes/expense"));

//branches
app.use("/branch", require("./routes/branch"));

//groups
app.use("/group", require("./routes/group"));

//accounts
app.use("/account", require("./routes/account"));

//members
app.use("/member", require("./routes/member"));

//entries
app.use("/entry", require("./routes/entry"));

//applications
app.use("/application", require("./routes/application"));

//client
app.use("/client", require("./routes/client"));

// payroll categories
app.use("/payroll-categories", require("./routes/payrollcat"));

// payroll items
app.use("/payroll-items", require("./routes/payrollitems"));

// payroll entries
app.use("/payroll-entries", require("./routes/payrollEntry"));

// notification
app.use("/notification", require("./routes/notifications"));

// sms
app.use("/sms", require("./routes/sms"));

// agent api
app.use("/agent", require("./routes/agents"));

// subs
app.use("/sub", require("./routes/subs"));

//paypal
app.use("/api", require("./routes/paypal"));

//manual activations route
app.use("/activation", require("./routes/activation"));

//online mpesa sub pay
app.use("/pay", require("./routes/mpesaSub"));

//manual activations by system admin
app.use("/pro", require("./routes/pro"));

const PORT = process.env.PORT || 8000;

//app.listen(PORT, console.log(`Server started on port ${PORT}`));

io.on("connection", (socket) => {
	socket.on("joinRoom", (data) => {
		SocketJoinRoom(data, socket);
	});
});

server.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});
