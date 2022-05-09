const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
app.get("/script.js", function(req, res) {
    res.sendFile(__dirname + "/script.js");
});
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
var people = [];
class Person {
    constructor(name) {
        this.property = [];
        this.name = name;
        this.position = [0, 0];
    }
}
var names = [];
io.on("connection", (socket) => {
    var name = socket.handshake.query.name;
    if (names.indexOf(name) > -1) {
        socket.emit("taken", name);
        return;
    }
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
        console.log(people);
        io.emit('people', people);
    });
});

server.listen(8888, () => {
    console.log("listening on *:8888");
});
