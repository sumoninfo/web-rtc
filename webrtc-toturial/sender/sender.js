const webSocket     = new WebSocket('ws://192.168.88.38:3000');
webSocket.onmessage = (event) => {
    handleSingnallingData(event.data);
}

const handleSingnallingData = (data) => {
    switch (data.type) {
        case 'answer':
            peerConn.setRemoteDescription(new RTCSessionDescription(data.answer));
            break;
        case 'candidate':
            peerConn.addIceCandidate(data.candidate);
            break;
        default:
            break;
    }
}

let username       = '';
const sendUsername = () => {
    username = document.getElementById('username-input').value;
    sendData({
        type: 'store_user'
    });
}

const sendData  = (data) => {
    data.username = username;
    webSocket.send(JSON.stringify(data));
}
let localStream;
let peerConn;
const startCall = () => {
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
        createAndSendOffer();
    }, (error) => {
        console.log(error);
    });
}

const createAndSendOffer = () => {
    peerConn.createOffer((offer) => {
        sendData({
            type : 'store_offer',
            offer: offer
        });

        peerConn.setLocalDescription(offer);
    }, (error) => {
        console.log(error);
    });

}

let isAudio = true

function muteAudio() {
    isAudio                                 = !isAudio
    localStream.getAudioTracks()[0].enabled = isAudio
}

let isVideo = true

function muteVideo() {
    isVideo                                 = !isVideo
    localStream.getVideoTracks()[0].enabled = isVideo
}