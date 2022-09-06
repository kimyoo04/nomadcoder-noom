// 브라우저가 서버로 연결하는 코드
const socket = new WebSocket(`ws://${window.location.host}`);

// 서버와 연결되면 작동
socket.addEventListener("open", () => {
  console.log("Connected to Server ✅");
});

// 서버에서 브라우저로 메시지를 보내면 작동
socket.addEventListener("message", (message) => {
  console.log("New message: ", message.data);
});

// 서버가 닫히면 작동
socket.addEventListener("close", () => {
  console.log("Disconnected from Server ❌");
});

// 10초 후 서버로 메시지 보내기
setTimeout(() => {
  socket.send("hello from the browser!");
}, 10000);
