const webSocket = new WebSocket("ws://localhost:3000")

webSocket.onmessage = (event) => {
    handleSignallingData(JSON.parse(event.data))
}

function handleSignallingData(data) {
    switch (data.type) {
        case "answer":
            peerConn.setRemoteDescription(data.answer)
            break
        case "offer":
            peerConn.setRemoteDescription(data.offer)
            createAndSendAnswer()
            break
        case "candidate":
            peerConn.addIceCandidate(data.candidate)
    }
}

let phone

const sendUsername = () => {
    phone = document.getElementById('username-input').value;
    sendData({
        type: 'store_user'
    });
}

const setLocalstorageData = (name, phone) => {
    localStorage.setItem('user', JSON.stringify({
        name, phone
    }))
    localStorage.setItem('phone', phone)
}


function createAndSendAnswer() {
    peerConn.createAnswer((answer) => {
        peerConn.setLocalDescription(answer)
        sendData({
            type: "send_answer", answer: answer
        })
    }, error => {
        console.log(error)
    })
}

function sendData(data) {
    console.log(data, 'sendData')
    data.phone = phone
    data.name  = name
    webSocket.send(JSON.stringify(data))
}

let localStream
let peerConn

async function startCall() {
    document.getElementById("video-call-div").style.display = "inline"

    let stream = null;
    try {
        stream                                           = await navigator.mediaDevices.getUserMedia({
            video   : {
                frameRate     : 24, width: {
                    min: 480, ideal: 720, max: 1280
                }, aspectRatio: 1.33333
            }, audio: true
        });
        localStream                                      = stream
        document.getElementById("local-video").srcObject = localStream

        let configuration = {
            iceServers: [
                {
                    "urls": [
                        "stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"
                    ]
                }
            ]
        }

        peerConn = new RTCPeerConnection(configuration)
        peerConn.addStream(localStream)

        peerConn.onaddstream = (e) => {
            document.getElementById("remote-video").srcObject = e.stream
        }

        peerConn.onicecandidate = ((e) => {
            if (e.candidate == null) return
            sendData({
                type: "store_candidate", candidate: e.candidate
            })
        })

        createAndSendOffer()
    } catch (err) {
        console.log(err, 'err')
    }
}

async function joinCall() {

    phone = document.getElementById('username-input').value;

    document.getElementById("video-call-div").style.display = "inline"

    let stream = null;

    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video   : {
                frameRate     : 24, width: {
                    min: 480, ideal: 720, max: 1280
                }, aspectRatio: 1.33333
            }, audio: true
        });

        localStream                                      = stream
        document.getElementById("local-video").srcObject = localStream

        let configuration = {
            iceServers: [
                {
                    "urls": [
                        "stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"
                    ]
                }
            ]
        }

        peerConn = new RTCPeerConnection(configuration)
        peerConn.addStream(localStream)

        peerConn.onaddstream = (e) => {
            document.getElementById("remote-video").srcObject = e.stream
        }

        peerConn.onicecandidate = ((e) => {
            if (e.candidate == null) return

            sendData({
                type: "send_candidate", candidate: e.candidate
            })
        })

        sendData({
            type: "join_call"
        })
    } catch (err) {
        console.log(err, 'err')
    }
}

function createAndSendOffer() {
    peerConn.createOffer((offer) => {
        sendData({
            type: "store_offer", offer: offer
        })

        peerConn.setLocalDescription(offer)
    }, (error) => {
        console.log(error)
    })
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