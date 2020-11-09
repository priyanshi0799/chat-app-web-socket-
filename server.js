const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const {getCurrentUser, userJoin, userLeaves, getRoomUsers}  = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

//Set static folder
app.use(express.static(path.join(__dirname, 'public')))

const botName = 'Chat-cord Bot'

//Run when client connects
io.on('connection', socket => {

    socket.on('joinRoom' , ({username, room}) => {

        const user = userJoin(socket.id, username, room)

        socket.join(user.room)

        //will notify single client
        //welcome current user
        socket.emit('message',formatMessage(botName,'WELCOME TO CHATCORD'))

        //broadcast when user connects
        //will notify everyone except the user itself
        socket.broadcast.to(user.room).emit('message', formatMessage(botName,`${user.username} has joined the chat`))


        //Send user room
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users: getRoomUsers(user.room)
        })
    })

    

    //will notify everyone
    //io.emit()


    //runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeaves(socket.id)
        if(user){
            io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`))

            io.to(user.room).emit('roomUsers',{
                room:user.room,
                users: getRoomUsers(user.room)
            })
        }
        
    })

    //listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => console.log(`Server is running on ${PORT}`));