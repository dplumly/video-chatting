const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  key: 'peerjs',
  host: 'video-chatting-app.herokuapp.com//',
  secure: true,
  port: 443
})

// Creating the <video> tag and muting the audio of your own feed
const myVideo = document.createElement('video')
myVideo.muted = true

const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)

  // answering the call and sending your stream
  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})
// connect to new users and adding their video
function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })

  // removes video from grid once they dissconnect
  call.on('close', () => {
    video.remove()
  })
  peers[userId] = call
}

// connect your video and append to grid
function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

// button to kill video
let muteVideo = () => myVideo.srcObject.getVideoTracks().forEach(toggle => toggle.enabled = !toggle.enabled);
// button to kill audio
let muteMicrophone = () => myVideo.srcObject.getAudioTracks().forEach(toggle => toggle.enabled = !toggle.enabled);
// button to end call
// let endCall = () => myVideo.srcObject.getTracks().forEach(track => track.stop())


function colorchange(id) {
  var background = document.getElementById(id).style.backgroundColor;
  if (background == "rgb(3, 175, 255)") {
    document.getElementById(id).style.background = "rgb(255,0,56)";
  } else {
    document.getElementById(id).style.background = "rgb(3,175,255)";
  }
}