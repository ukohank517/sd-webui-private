const NameMap = {
  0: '房主',
  1: '用户1',
  2: '用户2',
  3: '用户3',
  4: '用户4',
  5: '用户5',
}
const AvatarMap = {
  0: "./file=html/img.png",
  1: "./file=html/img.png",
  2: "./file=html/img.png",
  3: "./file=html/img.png",
  4: "./file=html/img.png",
  5: "./file=html/img.png",
}


// 页面更新时控制其他数据的显示
const BaseUrl = 'http://v118-27-14-73.9ob0.static.cnode.io'
window.roomId = 'window.roomId'
window.lastImgSrc = ''
window.chatHistoryLength = 0
onUiUpdate(async function () {
  try {
    const progress = gradioApp().querySelector('#txt2img_results > .progressDiv > .progress');
    const image = gradioApp().querySelector('#txt2img_gallery > .grid-wrap > .grid-container > button > img');
    const showImage = gradioApp().querySelector('#showImage');
    if (image) {
      if (image.src !== window.lastImgSrc) {
        console.log('image.src', image.src);
        showImage.src = image.src
        window.lastImgSrc = image.src
        const res = await upLoadImage(image.src)
        console.log('res', res);
      }
    }
    const progressContainer = gradioApp().querySelector('.progress-container');
    const showProgress = gradioApp().querySelector('.active-line-number > input');
    const activeLineValue = gradioApp().querySelector('.active-line-number');
    const activeLine = gradioApp().querySelector('.active-line');
    if (progress && progress.style && progress.style.width) {
      progressContainer.style.display = 'flex'
      showProgress.value = progress.style.width
      activeLineValue.style.left = progress.style.width
      activeLine.style.width = progress.style.width
    } else {
      progressContainer.style.display = 'none'
      showProgress.value = '0%'
      activeLine.style.width = '0%'
      activeLineValue.style.left = '0%'
    }
  } catch (error) {
    console.log('error', error);
  }
});

onUiLoaded(async function () {
  const userIp = gradioApp().querySelector('#user-ip');
  userIp.innerHTML = window.ip || ''
  const promptText = gradioApp().querySelector('#prompt-text');
  const generateBtn = gradioApp().querySelector('#generate-btn');
  const sendBtn = gradioApp().querySelector('#send-message-button');
  const cancelBtn = gradioApp().querySelector('#cancel-btn');
  const t2iGenerateBtn = gradioApp().querySelector('#txt2img_generate');
  const t2iSkipBtn = gradioApp().querySelector('#txt2img_skip');
  if (!promptText) {
    return
  }
  promptText.addEventListener('input', (e) => {
    const txt2imgprompt = gradioApp().querySelector('#txt2img_prompt > label > textarea')
    txt2imgprompt.value = e.target.value

    const inputEvent = new Event('input', {
      bubbles: true,
      cancelable: true,
    });
    txt2imgprompt.dispatchEvent(inputEvent);
  })
  if (!generateBtn || !t2iGenerateBtn) {
    return
  }
  sendBtn.addEventListener('click', async () => {
    const sendMessageInput = gradioApp().querySelector('#send-message');
    const res = await sendMessage(sendMessageInput.value)
    updateChatHistory()
  })
  generateBtn.addEventListener('click', () => {
    t2iGenerateBtn.click()
  })
  if (!cancelBtn || !t2iSkipBtn) {
    return
  }
  cancelBtn.addEventListener('click', () => {
    t2iSkipBtn.click()
  })
  await initChatHistory()
  await getUserIp()
  setInterval(() => {
    updateChatHistory()
    getImage()
    getMemberNumber()
  }, 3000)
  window.getRoomInfo = getRoomInfo
  window.sendMessage = sendMessage
  window.getImage = getImage
})


const getUserIp = async () => {
  const res = await fetch('https://api64.ipify.org?format=json')
  const data = await res.json()
  const { ip = '' } = data
  window.ip = ip
}

const getRoomInfo = async () => {
  const res = await fetch(BaseUrl + '/room/info?' + new URLSearchParams({
    room_id: 'window.roomId',
    ip_address: window.ip
  }))
  const data = await res.json()
  console.log('data', data);
}

const createRoom = async () => {
  const res = await fetch('http://v118-27-14-73.9ob0.static.cnode.io/')
  const data = await res.json()
  const { ip = '' } = data
  window.ip = ip
}

const sendMessage = async (message) => {
  const data = {
    room_id: window.roomId,
    user_id: 0,
    message,
  }
  const res = await fetch(BaseUrl + '/chat/send', {
    body: JSON.stringify(data),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
  const json = await res.json()
  const sendMessageInput = gradioApp().querySelector('#send-message');
  sendMessageInput.value = ''
  console.log('sendMessage', json);
}
const upLoadImage = async (url) => {
  const promptText = gradioApp().querySelector('#prompt-text');
  const data = {
    "room_id": window.roomId,
    "prompt": promptText.value,
    "image_url": url
  }
  const res = await fetch(BaseUrl + '/image/upload', {
    body: JSON.stringify(data),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
  const json = await res.json()
  console.log('upLoadImage', json);
}

const getImage = async (url) => {
  const res = await fetch(BaseUrl + '/image/get?' + new URLSearchParams({
    room_id: window.roomId,
  }))
  const json = await res.json()
  console.log('getImage', json);
}
const getMemberNumber = async (url) => {
  const res = await fetch(BaseUrl + '/member/number?' + new URLSearchParams({
    room_id: window.roomId,
  }))
  const json = await res.json()
  const { member_num } = json
  if (member_num, window.memberNum) {

  }
  window.memberNum = member_num
  console.log('getImage', json);
}

function getTimeShow(time_str) {
  const now = new Date();
  const date = new Date(time_str);
  //计算时间间隔，单位为分钟
  const inter = parseInt((now.getTime() - date.getTime()) / 1000 / 60);
  console.log('inter', inter);
  if (inter == 0) {
    return "刚刚";
  }
  //多少分钟前
  else if (inter < 60) {
    return inter.toString() + "分钟前";
  }
  //多少小时前
  else if (inter < 60 * 24) {
    return parseInt(inter / 60).toString() + "小时前";
  }
  //本年度内，日期不同，取日期+时间  格式如  06-13 22:11
  else if (now.getFullYear() == date.getFullYear()) {
    return (date.getMonth() + 1).toString() + "-" +
      date.getDate().toString() + " " +
      date.getHours() + ":" +
      date.getMinutes();
  }
  else {
    return date.getFullYear().toString().substring(2, 3) + "-" +
      (date.getMonth() + 1).toString() + "-" +
      date.getDate().toString() + " " +
      date.getHours() + ":" +
      date.getMinutes();
  }
}

const updateChatHistory = async () => {
  const res = await fetch(BaseUrl + '/chat/history?' + new URLSearchParams({
    room_id: window.roomId,
  }))
  const data = await res.json()
  const { chat_history } = data
  if (window.chatHistoryLength === chat_history.length) {
    return
  }
  const chatRoomHistory = gradioApp().querySelector('.chat-room-history');
  const messageExample = gradioApp().querySelector('#message-example');
  chatRoomHistory.innerHTML = ''
  // for (let i = 0; i < chat_history.length; i++) {

  //   // messageTime.innerHTML = getTimeShow(chat_history[i].created_at)
  // }
  const i = chat_history.length - 1
  const child = messageExample.cloneNode(true)
  child.style.display = 'flex'
  child.setAttribute('id', `message-item-${i}`)
  await chatRoomHistory.appendChild(child)
  const avatar = child.querySelector(`.avatar-box > img`);
  avatar.src = AvatarMap[chat_history[i].user_id]
  const messageName = child.querySelector(`.message-box > p > .name`);
  const messageTime = child.querySelector(`.message-box > p > .time`);
  const messageText = child.querySelector(`.message-box > .message-text`);
  messageName.innerHTML = NameMap[chat_history[i].user_id]
  messageText.innerHTML = chat_history[i].message
  messageTime.innerHTML = chat_history[i].created_at
  window.chatHistoryLength = chat_history.length

}
const initChatHistory = async () => {
  const res = await fetch(BaseUrl + '/chat/history?' + new URLSearchParams({
    room_id: window.roomId,
  }))
  const data = await res.json()
  const { chat_history } = data
  if (window.chatHistoryLength === chat_history.length) {
    return
  }
  const chatRoomHistory = gradioApp().querySelector('.chat-room-history');
  const messageExample = gradioApp().querySelector('#message-example');
  chatRoomHistory.innerHTML = ''
  for (let i = 0; i < chat_history.length; i++) {
    const child = messageExample.cloneNode(true)
    child.style.display = 'flex'
    child.setAttribute('id', `message-item-${i}`)
    await chatRoomHistory.appendChild(child)
    const avatar = child.querySelector(`.avatar-box > img`);
    avatar.src = AvatarMap[chat_history[i].user_id]
    const messageName = child.querySelector(`.message-box > p > .name`);
    const messageTime = child.querySelector(`.message-box > p > .time`);
    const messageText = child.querySelector(`.message-box > .message-text`);
    messageName.innerHTML = NameMap[chat_history[i].user_id]
    messageText.innerHTML = chat_history[i].message
    messageTime.innerHTML = chat_history[i].created_at
  }
  window.chatHistoryLength = chat_history.length

}