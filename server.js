const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

//Set static folder
app.use(express.static(path.join(__dirname, 'public')))

//Run when client connects
io.on('connection', socket => {

    //will notify single client
    //welcome current user
    socket.emit('message','WELCOME TO CHATCORD')

    //broadcast when user connects
    //will notify everyone except the user itself
    socket.broadcast.emit('message', 'A user has joined the chat')

    //will notify everyone
    //io.emit()


    //runs when client disconnects
    socket.on('disconnect', () => {
        io.emit('message','A user has left the chat')
    })

    //listen for chatMessage
    socket.on('chatMessage', (msg) => {
        io.emit('message', msg)
    })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => console.log(`Server is running on ${PORT}`));