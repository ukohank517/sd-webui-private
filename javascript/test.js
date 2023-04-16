const NameMap = {
  0: '房主',
  1: '用户1',
  2: '用户2',
  3: '用户3',
  4: '用户4',
  5: '用户5',
  6: '用户6',
}
const AvatarMap = {
  0: "./file=html/avatar0.svg",
  1: "./file=html/avatar1.svg",
  2: "./file=html/avatar2.svg",
  3: "./file=html/avatar3.svg",
  4: "./file=html/avatar4.svg",
  5: "./file=html/avatar5.svg",
  6: "./file=html/avatar6.svg",
}


// 页面更新时控制其他数据的显示
const BaseUrl = 'http://v118-27-14-73.9ob0.static.cnode.io'
window.roomId = '9999'
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
    initChatHistory()
  })
  generateBtn.addEventListener('click', () => {
    if (window.userId === 0) {
      t2iGenerateBtn.click()
    } else {
      alert('Only the roomowner supports this operation')
    }
  })
  if (!cancelBtn || !t2iSkipBtn) {
    return
  }
  cancelBtn.addEventListener('click', () => {
    t2iSkipBtn.click()
  })
  await getUserIp()
  userIp.innerHTML = window.ip || ''
  await getRoomInfo()
  await getMemberNumber()
  await initChatHistory()
  initImage()
  setInterval(() => {
    initChatHistory()
    updateImageInfo()
    getMemberNumber()
  }, 3000)
})


const getUserIp = async () => {
  const res = await fetch('https://api64.ipify.org?format=json')
  const data = await res.json()
  const { ip = '' } = data
  window.ip = ip
}

const getRoomInfo = async () => {
  const res = await fetch(BaseUrl + '/room/info?' + new URLSearchParams({
    room_id: window.roomId,
    ip_address: window.ip
  }))
  const data = await res.json()
  const { user_id } = data
  window.userId = user_id
  const promptText = gradioApp().querySelector('#prompt-text');
  const generateBtn = gradioApp().querySelector('#generate-btn');
  if (user_id !== 0) {
    promptText.disabled = true
    generateBtn.disabled = true
  } else {
    promptText.disabled = false
    generateBtn.disabled = false
  }
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
    user_id: window.userId,
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
  // 滑动到底部
  const domWrapper = gradioApp().querySelector('.chat-room-history');
  (function smoothscroll() {
    const currentScroll = domWrapper.scrollTop;   // 已经被卷掉的高度
    const clientHeight = domWrapper.offsetHeight; // 容器高度
    const scrollHeight = domWrapper.scrollHeight; // 内容总高度
    if (scrollHeight - 10 > currentScroll + clientHeight) {
      window.requestAnimationFrame(smoothscroll);
      domWrapper.scrollTo(0, currentScroll + (scrollHeight - currentScroll - clientHeight) / 2);
    }
  })();
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

const updateImageInfo = async () => {
  const res = await fetch(BaseUrl + '/image/get?' + new URLSearchParams({
    room_id: window.roomId,
  }))
  const json = await res.json()
  const { image_url, prompt, room_id } = json
  if (window.userId !== 0) {
    const promptText = gradioApp().querySelector('#prompt-text');
    promptText.value = prompt
    const showImage = gradioApp().querySelector('#showImage');
    showImage.src = image_url
  }
}
const initImage = async () => {
  const res = await fetch(BaseUrl + '/image/get?' + new URLSearchParams({
    room_id: window.roomId,
  }))
  const json = await res.json()
  const { image_url, prompt, room_id } = json
  const promptText = gradioApp().querySelector('#prompt-text');
  promptText.value = prompt
  const showImage = gradioApp().querySelector('#showImage');
  showImage.src = image_url
}
const getMemberNumber = async (url) => {
  try {
    const res = await fetch(BaseUrl + '/member/number?' + new URLSearchParams({
      room_id: window.roomId,
    }))
    const json = await res.json()
    const { member_num } = json
    if (member_num === window.memberNum) {
      return
    }
    if (!member_num) {
      return
    }
    const userIn = gradioApp().querySelector('.user-in');
    userIn.innerHTML = ''
    for (let i = 0; i < member_num; i++) {
      const image = document.createElement('img')
      image.src = AvatarMap[i]
      userIn.appendChild(image)
    }
    window.memberNum = member_num
  } catch (error) {
    console.log('getMemberNumber', error);
  }
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
  for (let i = (chat_history.length - 1); i >= 0; i--) {
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
  // 滑动到底部
  const domWrapper = gradioApp().querySelector('.chat-room-history');
  (function smoothscroll() {
    const currentScroll = domWrapper.scrollTop;   // 已经被卷掉的高度
    const clientHeight = domWrapper.offsetHeight; // 容器高度
    const scrollHeight = domWrapper.scrollHeight; // 内容总高度
    if (scrollHeight - 10 > currentScroll + clientHeight) {
      window.requestAnimationFrame(smoothscroll);
      domWrapper.scrollTo(0, currentScroll + (scrollHeight - currentScroll - clientHeight) / 2);
    }
  })();
}