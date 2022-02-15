const app    = require('express')();
const server = require('http').createServer(app);
const cros   = require('cors');

const io = require('socket.io')(server, {
    cros: {
        origin : '*',
        methods: ["GET", "POST"]
    }
});

app.use(cros());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send("Server is running");
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.emit('me', socket.id)

    socket.on('disconnect', () => {
        socket.broadcast.emit('callEnded');
    });

    socket.on('callUser', ({userToCall, signalData, from, name}) => {
        io.to(userToCall).emit('callUser', {signal: signalData, from, name});
    });

    socket.on('answerCall', (data) => {
        io.on(data.to).emit('callAccepted', data.signal);
    })
});


server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});