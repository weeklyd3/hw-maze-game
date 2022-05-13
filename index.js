const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const config = require('./config');
const io = new Server(server);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
app.get("/script.js", function(req, res) {
    res.sendFile(__dirname + "/script.js");
});
app.get("/coin.svg", function(req, res) {
    res.sendFile(__dirname + "/coin.svg");
});
app.get("/mine.svg", function(req, res) {
    res.sendFile(__dirname + "/mine.svg");
});
var coinNumbers = {};
var places = [];
var rows = 10;
for (var i = 0; i < rows; i++) {
    var row = [];
    for (var j = 0; j < rows; j++) {
        var obj = {};
        obj.here = [];
        obj.coords = [j, i];
        row.push(obj);
    }
    places.push(row);
}
function randomInt(max) {
  return Math.floor(Math.random() * max);
}
setInterval(function() {
    var newCoinRow = randomInt(10);
    var newCoinCol = randomInt(10);
    var r = Math.random();
    var coinOrMine = 'coin';
    if (r < config.probabilityOfMine) coinOrMine = 'mine';
    if (!places[newCoinRow][newCoinCol].here.length) places[newCoinRow][newCoinCol].here.push(coinOrMine);
    io.emit('coins', places);
}, 5000);
var people = [];
class Person {
    constructor(name) {
        this.property = [];
        this.name = name;
        this.position = [config.defaultX, config.defaultY];
        this.coins = config.defaultCoinNumber;
    }
}
var names = [];
io.on("connection", (socket) => {
    var name = socket.handshake.query.name;
    if (names.indexOf(name) > -1) {
        socket.emit("taken", name);
        return;
    }
    coinNumbers[name] = config.defaultCoinNumber;
    io.emit('coinNumbers', coinNumbers);
    io.emit("chatMessage", name, "...has joined");
    names.push(name);
    people.push(new Person(name));
    console.log('A person has joined:');
    console.log(people);
    io.emit('people', people);
    socket.on("message", function(message) {
        console.log(name + ":");
        console.log(message);
        io.emit("chatMessage", name, message);
    });
    socket.on("positionChange", function(x, y) {
        var nameIndex;
        for (var i = 0; i < people.length; i++) {
            if (people[i].name === name) nameIndex = i;
        }
        var person = people[nameIndex];
        console.log("Position changed:", `${name} is now in [${x}, ${y}]`);
        person.position = [x, y];
        io.emit('people', people);
        console.log(places[y][x]);
        if (places[y][x].here.indexOf('mine') > -1) {
            coinNumbers[name]--;
            io.emit('coinNumbers', coinNumbers);
            people[nameIndex].coins--;
            socket.emit('coin', people[nameIndex].coins);
            console.log('Removing mine.');
            places[y][x].here.splice(places[y][x].here.indexOf('mine'), 1);
            io.emit('coins', places);
        }
        if (places[y][x].here.indexOf('coin') > -1) {
            coinNumbers[name]++;
            io.emit('coinNumbers', coinNumbers);
            people[nameIndex].coins++;
            socket.emit('coin', people[nameIndex].coins);
            console.log('Removing coin.');
            places[y][x].here.splice(places[y][x].here.indexOf('coin'), 1);
            io.emit('coins', places);
        }
    });
    socket.on("disconnect", function() {
        names.splice(names.indexOf(name), 1);
        var nameIndex;
        for (var i = 0; i < people.length; i++) {
            if (people[i].name === name) nameIndex = i;
        }
        people.splice(nameIndex, 1);
        io.emit("chatMessage", name, "...has left");
        console.log('A person has left. Remaining people:');
        delete coinNumbers[name];
        io.emit('coinNumbers', coinNumbers);
        console.log(people);
        io.emit('people', people);
    });
});

server.listen(8888, () => console.log("listening on *:8888"));
