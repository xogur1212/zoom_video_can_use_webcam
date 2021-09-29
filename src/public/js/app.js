const socket=io(); //automatically find socket server

const welcome =document.getElementById("welcome");
const form =welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden=true;

let roomName;

function addMessage(message){
  const ul=room.querySelector("ul");
  const li=document.createElement("li");
  li.innerText=message;
  ul.appendChild(li);
}

function handleMessageSubmit(event){
  event.preventDefault();
  const input =room.querySelector("#msg input");
  const value= input.value;
  socket.emit("new_message",input.value,roomName,() =>{
    addMessage(`You:${value}`);
  });
  input.value="";
}

function showRoom(){
  welcome.hidden=true;
  room.hidden=false;
  const h3=room.querySelector("h3");
  h3.innerText=`Room ${roomName}`;
  const msgForm=room.querySelector("#msg");
  const nameForm=room.querySelector("#name");
  msgForm.addEventListener("submit",handleMessageSubmit);
  nameForm.addEventListener("submit",handlenicknameSubmit);
}
function handleRoomSubmit(event){
  event.preventDefault();
  const input =form.querySelector("input");
  socket.emit("enter_room",input.value,showRoom);
  roomName=input.value;
  input.value="";
}
function handlenicknameSubmit(event){ 
  event.preventDefault();
  const input =room.querySelector("#name input");
  const value= input.value;
  socket.emit("nickname",value); 
  

  
}
//emit에 마지막 펑션기능을 사용하면 서버에서 호출했을때 
//frontend에서 작동함
form.addEventListener("submit",handleRoomSubmit);


socket.on("welcome",(user,newCount) =>{
  addMessage(`${user} joined`);
  const h3=room.querySelector("h3");
  h3.innerText=`Room ${roomName} (${newCount})`;
});

socket.on("bye",(left,newCount) =>{
  addMessage(`${left} left`);
  const h3=room.querySelector("h3");
  h3.innerText=`Room ${roomName} (${newCount})`;
});

socket.on("new_message",(msg) =>{
  addMessage(msg);
});

socket.on("room_change",(rooms) =>{
  const roomList=welcome.querySelector("ul");
  roomList.innerHTML="";
  if(rooms.length===0){
   
    return;
  }
  rooms.forEach(room => {
    const li =document.createElement("li");
    li.innerText=room;
    roomList.appendChild(li);
  })
});