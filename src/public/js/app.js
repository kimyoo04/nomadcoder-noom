const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form");

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

function handleSubmit(event) {
  // 새로고침 방지
  event.preventDefault();
  const input = messageForm.querySelector("input");

  // 서버로 form에 입력했던 값(메시지)를 전송
  socket.send(input.value);

  // 입력 창 초기화
  input.value = "";
}

//form의 submit이 일어나면 함수 실행
messageForm.addEventListener("submit", handleSubmit);
