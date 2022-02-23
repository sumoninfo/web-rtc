const webSocket     = new WebSocket('ws://192.168.88.38:3000');
webSocket.onmessage = (event) => {
    handleSingnallingData(event.data);
}

const handleSingnallingData = (data) => {
    switch (data.type) {
        case 'offer':
            peerConn.setRemoteDescription(new RTCSessionDescription(data.offer));
            createAndSendAnswer()
            break;
        case 'candidate':
            peerConn.addIceCandidate(data.candidate);
            break;
        default:
            break;
    }
}

const createAndSendAnswer = () => {
    peerConn.createAnswer((answer) => {
        peerConn.setLocalDescription(answer);
        sendData({
            type: 'send_answer',
            answer
        })
    }, error => {
        console.log(error);
    })
}

const sendData = (data) => {
    data.username = username;
    webSocket.send(JSON.stringify(data));
}
let localStream;
let peerConn;
let username;

const joinCall = () => {

    username = document.getElementById('username-input').value;

    document.getElementById('video-call-div').style.display = 'inline';

    navigator.getUserMedia({
        video: {
            frameRate  : 24,
            width      : {
                min  : 480,
                max  : 1200,
                ideal: 720
            },
            aspectRatio: 1.33333
        },
        audio: true,
    }, (stream) => {
        localStream                                      = stream;
        document.getElementById('local-video').srcObject = stream;

        let configuration = {
            iceServers: [
                {
                    "urls": [
                        "stun:stun.l.google.com:19302",
                        "stun:stun1.l.google.com:19302",
                        "stun:stun2.l.google.com:19302"
                    ]
                }
            ]
        }
        peerConn          = new RTCPeerConnection(configuration);
        peerConn.addStream(localStream);

        peerConn.onaddtrack = (e) => {
            document.getElementById('remote-video').srcObject = e.streams[0];
        }

        peerConn.onicecandidate = (e) => {
            if (e.candidate == null) {
                return;
            }
            sendData({
                type     : 'candidate',
                candidate: e.candidate
            });
        }

        sendData({
            type: 'join_call'
        });

    }, (error) => {
        console.log(error);
    });
}


let isAudio = true
function muteAudio() {
    isAudio = !isAudio
    localStream.getAudioTracks()[0].enabled = isAudio
}

let isVideo = true
function muteVideo() {
    isVideo = !isVideo
    localStream.getVideoTracks()[0].enabled = isVideo
}