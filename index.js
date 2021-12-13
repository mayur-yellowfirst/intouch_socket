// var express = require('express'),
//     app = express(),
//     server = require('http').createServer(app),
//     // io = require('socket.io').listen(server),
//     path = require('path');
// server.listen(8094);

var app = require('express')();
var http = require('http').Server(app);
const cors = require('cors');
var io = require('socket.io')(http);


// const io = require("socket.io")(8093, {
//     cors: {
//         origin: '*:*'
//     }
// });

app.use(cors());

let users = [];

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId });
};

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId)
}

const getUser = (userId) => {
    return users.find(user => user.userId === userId)
}

io.on("connection", (socket) => {
    console.log('a user connected', users);

    socket.on("addUser", userId => {
        addUser(userId, socket.id);
        console.log('user added', userId, socket.id);
        io.emit("getUsers", users);

    })

    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
        const user = getUser(receiverId);
        console.log('message sent', user);
        io.to(user.socketId).emit("getMessage", {
            senderId,
            text
        })
    })

    socket.on("disconnect", () => {
        console.log('user disconnect!');
        removeUser(socket.id);
        io.emit("getUsers", users);
    })
})

console.log('here');

http.listen(8093, function () {
    console.log('listening on *:8093');
});
