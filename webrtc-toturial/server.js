

const httpServer = require("http").createServer();
const webSocket = require("socket.io")(httpServer, {
    // ...
});


httpServer.listen(3000, () => {
    console.log('Server is running on port 3000');
});
let users = [];


webSocket.on('request', (request) => {
    const connection = request.accept(null, request.origin);
    connection.on('message', (message) => {
        const data = JSON.parse(message.utf8Data);

        const user = findUser(data.username)

        switch (data.type) {
            case 'store_user':
                if (user != null) {
                    return
                }
                const newUser = {
                    id  : data.id,
                    name: data.name,
                    conn: connection
                };
                users.push(newUser);
                console.log(newUser.username + ' has joined the chat');
                break;
            case 'store_offer':
                if (user == null) {
                    return
                }
                user.offer = data.offer;
                break
            case 'store_candidate':
                if (user == null) {
                    return
                }
                if (user.candidate == null) {
                    user.candidates = [];
                }
                user.candidates.push(data.candidate);
                break
            case 'send_candidate':
                if (user == null) {
                    return
                }
                sendData({
                    type  : 'candidate',
                    answer: user.answer
                }, user.conn);
                break
            case 'join_call':
                if (user == null) {
                    return
                }
                sendData({
                    type  : 'offer',
                    answer: user.offer
                }, connection);
                user.condidates.forEach(candidate => {
                    sendData({
                        type  : 'candidate',
                        answer: candidate
                    }, connection);
                });
                break
        }
    });
    connection.on('close', (reasonCode, description) => {
        users.forEach((user, index) => {
            if (user.conn == connection) {
                console.log(user.username + ' has left the chat');
                users.splice(users.indexOf(user), 1);
            }
        });
    });

    const sendData = (data, conn) => {
        conn.send(JSON.stringify(data));
    }

    const findUser = (username) => {
        for (let i = 0; i < users.length; i++) {
            if (users[i].username === username)
                return users[i];
        }
    }
});