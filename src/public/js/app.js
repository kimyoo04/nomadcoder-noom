const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");

// 브라우저가 서버로 연결하는 코드
const socket = new WebSocket(`ws://${window.location.host}`);

// 서버와 연결되면 작동
socket.addEventListener("open", () => {
  console.log("Connected to Server ✅");
});

// 서버에서 브라우저로 메시지를 보내면 작동
socket.addEventListener("message", (message) => {
  const li = document.createElement("li");
  li.innerText = message.data;
  messageList.append(li);
});

// 서버가 닫히면 작동
socket.addEventListener("close", () => {
  console.log("Disconnected from Server ❌");
});

function handleSubmit(event) {
  event.preventDefault(); // 새로고침 방지
  const input = messageForm.querySelector("input");
  // 서버로 form에 입력했던 값(메시지)를 서버로 string으로 변환 후 전송
  socket.send(makeMessage("new_message", input.value));
  input.value = ""; // 입력 창 초기화
}

function handleNickSubmit(event) {
  event.preventDefault(); // 새로고침 방지
  const input = nickForm.querySelector("input");
  // 서버로 form에 입력했던 값(메시지)를 서버로 string으로 변환 후 전송
  socket.send(makeMessage("nickname", input.value));
  input.value = ""; // 입력 창 초기화
}

// json type ==> string
function makeMessage(type, payload) {
  const msg = {type: type, payload: payload};
  return JSON.stringify(msg);
}

//form의 submit이 일어나면 함수 실행
messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);

/*
===================================== 작동 순서 =====================================
1. form의 input에 메시지나 닉네임 입력 및 button 클릭
2. addEventListener 작동 
3. handleSubmit 작동
4. socket.send를 통해 서버로 메시지 문자열 전송
5. 서버가 메시지를 받았을 때 json 전환 및 type 별 작동 구분
6. type이 new_message 일 때 다시 브라우저로 payload만 메시지 전송
7. 브라우저는 메시지를 받은 것을 messageList에 li테그로 append시켜 화면에 출력
====================================================================================
*/
