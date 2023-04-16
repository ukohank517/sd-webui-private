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
window.roomId = window.location.search.replaceAll('?room_id=', '') || ''
console.log('roomId', window.roomId);
window.lastImgSrc = ''
window.chatHistoryLength = 0
onUiUpdate(async function () {
  try {
    const progress = gradioApp().querySelector('#txt2img_results > .progressDiv > .progress');
    const image = gradioApp().querySelector('#txt2img_gallery > .grid-wrap > .grid-container > button > img');
    const showImage = gradioApp().querySelector('#showImage');
    const progressContainer = gradioApp().querySelector('.progress-container');
    const showProgress = gradioApp().querySelector('.active-line-number > input');
    const activeLineValue = gradioApp().querySelector('.active-line-number');
    const activeLine = gradioApp().querySelector('.active-line');
    if (image) {
      if (image.src !== window.lastImgSrc) {
        showImage.src = image.src
        window.lastImgSrc = image.src
        const res = await upLoadImage(image.src)
        progressContainer.style.display = 'none'
        showProgress.value = '0%'
        activeLine.style.width = '0%'
        activeLineValue.style.left = '0%'
        return
      }
    }
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

  // const chatRoomHistory = gradioApp().querySelector('.chat-room-history');
  // const leftBox = gradioApp().querySelector('.left-box');
  // const boundingClient = leftBox.getBoundingClientRect()
  // chatRoomHistory.style.height = `${boundingClient?.height - 310}px`
  document.addEventListener('keydown', async (e) => {
    if (e.code === 'Enter') {
      await sendMessage()
      initChatHistory()
    }
  })
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
    await sendMessage()
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
  try {
    const res = await fetch('https://api64.ipify.org?format=json')
    const data = await res.json()
    const { ip = '' } = data
    window.ip = ip
  } catch (error) {
    console.log('getUserIp', error);
  }
}

const getRoomInfo = async () => {
  try {
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
  } catch (error) {
    console.log('getRoomInfo', error);
  }
}

const sendMessage = async () => {
  const sendMessageInput = gradioApp().querySelector('#send-message');
  const message = sendMessageInput.value
  if (!message) {
    alert('message empty')
    return
  }
  sendMessageInput.value = ''
  try {
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
  } catch (error) {
    console.log('sendMessage', error);
  }
}

const upLoadImage = async (url) => {
  try {
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
  } catch (error) {
    console.log('upLoadImage', error);
  }
}

const updateImageInfo = async () => {
  try {
    const res = await fetch(BaseUrl + '/image/get?' + new URLSearchParams({
      room_id: window.roomId,
    }))
    const json = await res.json()
    const { image_url, prompt, room_id } = json
    if (window.userId !== 0) {
      const promptText = gradioApp().querySelector('#prompt-text');
      promptText.value = prompt
      const showImage = gradioApp().querySelector('#showImage');
      if (image_url) {
        showImage.src = image_url
      }
    }
  } catch (error) {
    console.log('updateImageInfo', error);
  }
}
const initImage = async () => {
  try {
    const res = await fetch(BaseUrl + '/image/get?' + new URLSearchParams({
      room_id: window.roomId,
    }))
    const json = await res.json()
    const { image_url, prompt, room_id } = json
    const promptText = gradioApp().querySelector('#prompt-text');
    promptText.value = prompt
    const showImage = gradioApp().querySelector('#showImage');
    if (image_url) {
      showImage.src = image_url
    }
  } catch (error) {
    console.log('initImage', error);
  }
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

const updateChatHistory = async () => {
  try {
    const res = await fetch(BaseUrl + '/chat/history?' + new URLSearchParams({
      room_id: window.roomId,
    }))
    const data = await res.json()
    const { chat_history } = data
    if (!chat_history.length) {
      return
    }
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
  } catch (error) {
    console.log('updateChatHistory', error);
  }
}

const initChatHistory = async () => {
  try {
    const res = await fetch(BaseUrl + '/chat/history?' + new URLSearchParams({
      room_id: window.roomId,
    }))
    const data = await res.json()
    const { chat_history } = data
    if (!chat_history.length) {
      return
    }
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
  } catch (error) {
    console.log('initChatHistory', error);
  }
}