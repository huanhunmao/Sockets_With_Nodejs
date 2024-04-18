const http = require('http');
const server = http.createServer(); // 创建HTTP服务器实例
const io = require('socket.io')(server, {
    cors: {
      origin: '*',
    }
  });
  

const PORT = 3000;

server.listen(PORT);
console.log(`Listening on port ${PORT}...`);

io.on('connection', (socket) => {
  console.log('a user connected');
});
