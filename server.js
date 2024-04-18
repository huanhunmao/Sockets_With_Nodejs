const server = require('http').createServer();
const io = require('socket.io')(server);

const PORT = 3000;

server.listen(PORT);
console.log(`Server listening on ${PORT}`);

io.on('connection', (socket) => {
    console.log('One user connected');
});
