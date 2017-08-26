var express = require('express');
var fs = require("fs");
app = express();
server = require('http').createServer(app);
io = require('socket.io').listen(server);

app.use('/',express.static(__dirname + '/'));
server.listen(8081);
var users = [];
var usernum = 0;

var data = {
	flag: 0, //当前的状态：0是可买状态，1是开奖状态
	curStartTime: 0,	 //当期开始的时间戳
	numbers: 0 //期号
}

//读取用户信息
var userdata = {};
fs.readFile('./data/user.json', function (err, data) {
   if (err) {
       return console.error(err);
   }
   userdata = data.toString();
   console.log(userdata)
});

data.curStartTime = new Date().getTime();
curtime = new Date().getTime();
setInterval(function(){
	data.numbers++;

	data.curStartTime = curtime + data.numbers*50*1000;
},50000)



io.on('connection',function(socket){

	socket.on("connectGame", function(){
		console.log(data.curStartTime + " " + data.numbers)
		//var nowTime = new Date().getTime();
		// var qi = parseInt((nowTime-data.curStartTime)/1000/45);
		// data.curStartTime = 1503649704540 + qi*45*1000;
		socket.emit("userinfo",userdata);
		var serveTime = new Date().getTime();
		//console.log(serveTime)
		console.log("connectGame again")
		socket.emit("getinfo", data.curStartTime, data.flag, serveTime);


		socket.userIndex = users.length;
		usernum++;
		socket.uname = "player"+usernum;
		users.push(socket.uname);
		socket.emit("sendmyname",socket.uname);
		socket.emit("showOthers",users)
		socket.broadcast.emit("showOthers",users)
	})

	socket.on('disconnect',function(){
		console.log("lose")
		users.splice(socket.userIndex,1);
		console.log(users);
		socket.broadcast.emit("showOthers",users)
	});

	socket.on('userclip',function(param,stake){
		console.log("server get user clip"+param)
		socket.broadcast.emit("othersClip",param,stake)
	})
});	