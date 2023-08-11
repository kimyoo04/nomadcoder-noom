const socket = io();
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;
let myDataChannel;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      // 카메라 선택 옵션 생성
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;

      // 현재 카메라를 선택한 카메라로 설정
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }

      // 카메라 선택 옵션 추가
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMedia(deviceId) {
  // 기본 카메라 설정
  const initialConstrains = {
    audio: true,
    video: { facingMode: "user" },
  };

  // 선택한 카메라 설정
  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };

  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstrains
    );

    myFace.srcObject = myStream;

    // 카메라를 선택하지 않았을 경우 카메라 선택 옵션 생성
    if (!deviceId) await getCameras();
  } catch (e) {
    console.log(e);
  }
}

function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}

function handleCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Turn Camera On";
    cameraOff = true;
  }
}

// 카메라 변경 이벤트
async function handleCameraChange() {
  await getMedia(camerasSelect.value);
  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack); // 카메라 스트리밍 보내는 것을 변경
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// Welcome Form (join a room)
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

// 카메라 공유 시작
async function initCall() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

// 방 입장 이벤트
async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  await initCall();
  socket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket Code
socket.on("welcome", async () => {
  // Data Channel 생성
  myDataChannel = myPeerConnection.createDataChannel("chat"); // Data Channel 생성
  myDataChannel.addEventListener(
    "message",
    (event) => console.log(event.data) //TODO: 메시지 UI 생성 로직 추가
  );
  console.log("create data channel");

  // offer를 생성
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("create & sent the offer");
  // offer를 보냄
  socket.emit("offer", offer, roomName);
});

// offer를 받음
socket.on("offer", async (offer) => {
  myPeerConnection.addEventListener("datachannel", (event) => {
    myDataChannel = event.channel; // 이미 있는 Data Channel 연결
    myDataChannel.addEventListener(
      "message",
      (event) => console.log(event.data) //TODO: 메시지 UI 생성 로직 추가
    );
  });

  console.log("received the offer");
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);

  // answer를 보냄
  socket.emit("answer", answer, roomName);
  console.log("create & sent the answer");
});

// answer를 받음
socket.on("answer", (answer) => {
  console.log("received the answer");
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  console.log("received candidate");
  myPeerConnection.addIceCandidate(ice);
});

// RTC Code
function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("addstream", handleAddStream);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
  console.log("create & sent candidate");
  socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data) {
  const peerFace = document.getElementById("peerFace");
  peerFace.srcObject = data.stream;
}
