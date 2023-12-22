const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app);

import {Server} from 'socket.io'

const io = new Server(server , {
    cors: {
        origin : '*',
    },
})

type Point = {x:number , y:number}
type Drawline = {
    prevPoint : Point | null
    currentPoint : Point 
    color : string
}

io.on('connection' , (socket)=>{
    console.log("connection")
    socket.on('draw-line' , ({prevPoint , currentPoint , color}: Drawline) =>{
        socket.broadcast.emit('draw-line' , {prevPoint , currentPoint , color})
    })

    socket.on('clear' , ()=>{io.emit('clear')})
    socket.on('client-ready' , ()=>{
        socket.broadcast.emit('get-canvas-state')
    })
    socket.on('canvas-state' , (state)=>{
        socket.broadcast.emit('canvas-state-from-server' , state);
    })
})




server.listen(3001 , () =>{
    console.log('server listning on port 3001')
})