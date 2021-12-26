const path = require("path");
//const http = require("http");
const express = require("express");
//const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {userJoin,getCurrentUser,userLeave,getRoomUsers } = require("./utils/users");


const http = require('http').Server(app);
const io = require('socket.io')(http)



const app = express();
//const server = http.createServer(app);
//const io = socketio(server);

// get index/chat folder live
app.use(express.static(path.join(__dirname, "public")));
const botName = "Bot";

// run when client connects
io.on("connect", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
   const user = userJoin(socket.id,username, room);

   socket.join(user.room)
    //console.log('new WS Connection...')
    socket.emit("message", formatMessage(botName, "welcome to chatbox"));

    // broadcast when a user connects
    socket.broadcast.to(user.room).emit(
      "message",
      formatMessage(botName, `${user.username} has joined the chat`)
    );
    
    
    // send users and room info
      io.to(user.room).emit('roomUsers',{
        room: user.room,
        users:getRoomUsers(user.room)
      })

  });

  // Lisen for message
  socket.on("chatMessage", (msg) => {
    const user =getCurrentUser(socket.id)
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  //  show when user dissconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id)
    if(user){
      io.to(user.room).emit("message", formatMessage(botName, `${user.username} left the chat`));

       // send users and room info
       io.to(user.room).emit('roomUsers',{
        room: user.room,
        users:getRoomUsers(user.room)
      });
    }
    
  });
});
// const PORT =process.env.PORT || 3000 ;
// server.listen(PORT, () => console.log(`Server running on Port ${PORT}`));


app.get("/", (req, res)=> ews.sendFile(__dirname + "./public/index.html"))
http.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})