const http = require('http');
const server = http.createServer(); // 创建HTTP服务器实例
const io = require('socket.io')(server, {
    cors: {
      origin: '*',
    }
  });
  

const PORT = 3001;

server.listen(PORT);
console.log(`Listening on port ${PORT}...`);

let readPlayerCount = 0

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  socket.on('ready', () => {
        
    console.log('Player ready', socket.id);

    readPlayerCount ++ 

    if(readPlayerCount === 2) {
        // broadcast('startGame', socket)
        io.emit('startGame', socket.id)
    }

    socket.on('paddleMove', paddleData => {
        // 此处记录的就是 左右滑动时 这个板的 xPosition 位置
        // 将这个 xPosition 位置  广播 📢 给 多个 客户端用户
        // console.log('paddleData',paddleData);  // paddleData { xPosition: 64 }
        socket.broadcast.emit('paddleMove', paddleData)
    })

    socket.on('ballMove', ballData => { 
        socket.broadcast.emit('ballMove',ballData); 
    })
})
});
