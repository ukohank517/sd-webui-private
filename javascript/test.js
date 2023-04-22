const AvatarMap = {
  0: "./file=html/avatar0.svg",
  1: "./file=html/avatar1.svg",
  2: "./file=html/avatar2.svg",
  3: "./file=html/avatar3.svg",
  4: "./file=html/avatar4.svg",
  5: "./file=html/avatar5.svg",
  6: "./file=html/avatar6.svg",
}

let langMenu = 'hide'
// 页面更新时控制其他数据的显示
const BaseUrl = 'http://v118-27-14-73.9ob0.static.cnode.io'
window.roomId = window.location.search.replaceAll('?room_id=', '') || ''
console.log('roomId', window.roomId);
window.lastImgSrc = ''
window.chatHistoryLength = 0

const TextMap = {
  'en': {
    title: 'Promptcoin - Artificial Intelligence and Human Intelligence Collaboration Platform',
    modelTip: 'Select model here',
    ower: 'room owner',
    user: 'user',
    chatroom: 'Chat room',
    generate: 'generate',
    send: 'send',
    sendmessage: 'Send a message',
    infoTip: 'INTRODUCING ONIX',
    desc: 'Offering you and your community AI tools with social features, collaboratively creating personalized content,and rewarding participants with tokens. Soon to be launched model library: NFT creation model, market forecasting model, media sentiment analysis model, KOL content generation model, and more.'
  },
  'jp': {
    title: 'Promptcoin - 人工知能と人間智能の協業プラットフォーム',
    modelTip: 'ここでモデルを選択してください',
    ower: '部屋のオーナー',
    user: 'ユーザー',
    chatroom: 'チャットルーム',
    generate: '生成する',
    send: '送信する',
    sendmessage: 'メッセージを送信する',
    infoTip: 'ONIXを紹介します',
    desc: 'AIツールとソーシャル機能を備えたコミュニティ向けのONIXを提供し、参加者にトークンで報酬を与えながら、共同でパーソナライズされたコンテンツを作成することができます。近日中にモデルライブラリーを発表予定です。NFT作成モデル、市場予測モデル、メディア感情分析モデル、KOLコンテンツ生成モデルなどがあります。'
  },
  'zh': {
    title: 'Promptcoin - 人工智能與人類智能協作平台',
    modelTip: '在這裡選擇模型',
    ower: '房主',
    user: '用户',
    chatroom: '聊天室',
    generate: '生成',
    send: '傳送',
    sendmessage: '傳送訊息',
    infoTip: '介紹ONIX',
    desc: '為您和您的社群提供具有社交功能的AI工具，合作創建個性化內容，並通過代幣獎勵參與者。即將推出的模型庫包括：NFT創建模型，市場預測模型，媒體情感分析模型，KOL內容生成模型等。'
  },
}
const changeLang = (lang = 'en') => {
  const promptcoinTitle = gradioApp().querySelector('#promptcoin-title');
  const generateBtn = gradioApp().querySelector('#generate-btn');
  const sendButton = gradioApp().querySelector('#send-message-button');
  const modelTip = gradioApp().querySelector('#setting_sd_model_checkpoint > label > .svelte-1gfkn6j');
  const infoTip = gradioApp().querySelector('.wrap-info .left-box .tips');
  const infoTitle = gradioApp().querySelector('.wrap-info .left-box #title');
  const desc = gradioApp().querySelector('.wrap-info .left-box .desc');
  const chatroom = gradioApp().querySelector('.chat-room-header > h2 ');
  const sendMessage = gradioApp().querySelector('.send-message-header > span ');
  promptcoinTitle.innerHTML = TextMap[lang].title
  modelTip.innerHTML = TextMap[lang].modelTip
  chatroom.innerHTML = TextMap[lang].chatroom
  generateBtn.innerHTML = TextMap[lang].generate
  sendButton.innerHTML = TextMap[lang].send
  sendMessage.innerHTML = TextMap[lang].sendmessage
  infoTitle.innerHTML = TextMap[lang].title
  infoTip.innerHTML = TextMap[lang].infoTip
  desc.innerHTML = TextMap[lang].desc
  initChatHistory()
}

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
  const langIcon = gradioApp().querySelector('#lang-icon');
  const langMenuDom = gradioApp().querySelector('#lang-menu');
  const setEnDom = gradioApp().querySelector('#set-en');
  const setJpDom = gradioApp().querySelector('#set-jp');
  const setZhDom = gradioApp().querySelector('#set-zh');
  const langStore = localStorage.getItem('lang') || 'en'
  changeLang(langStore)
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
  langIcon.addEventListener('click', async () => {
    const lang = localStorage.getItem('lang') || 'en'
    if (lang === 'en') {
      setEnDom.style.border = '1px solid #fff';
    } else {
      setEnDom.style.border = 'none'
    }
    if (lang === 'jp') {
      setJpDom.style.border = '1px solid #fff';
    } else {
      setJpDom.style.border = 'none'
    }
    if (lang === 'zh') {
      setZhDom.style.border = '1px solid #fff';
    } else {
      setZhDom.style.border = 'none'
    }
    if (langMenu === 'show') {
      langMenu = 'hide'
      langMenuDom.style.opacity = 0
    } else {
      langMenu = 'show'
      langMenuDom.style.opacity = 1
    }
  })
  setEnDom.addEventListener('click', () => {
    langMenuDom.style.opacity = 0
    langMenu = 'hide'
    localStorage.setItem('lang', 'en')
    window.location.reload()
  })
  setJpDom.addEventListener('click', () => {
    langMenuDom.style.opacity = 0
    langMenu = 'hide'
    localStorage.setItem('lang', 'jp')
    window.location.reload()
  })
  setZhDom.addEventListener('click', () => {
    langMenuDom.style.opacity = 0
    langMenu = 'hide'
    localStorage.setItem('lang', 'zh')
    window.location.reload()
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

const getUserName = (id) => {
  const lang = localStorage.getItem('lang')
  if (id === 0) {
    return TextMap[lang].ower
  }
  return `${TextMap[lang].user} ${id}`
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
      messageName.innerHTML = getUserName(chat_history[i].user_id)
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