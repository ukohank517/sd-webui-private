// 页面更新时控制其他数据的显示
const BaseUrl = 'http://v118-27-14-73.9ob0.static.cnode.io'
window.roomId = 'window.roomId'
window.lastImgSrc = ''
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
  console.log('sendBtn', sendBtn);
  const cancelBtn = gradioApp().querySelector('#cancel-btn');
  const t2iGenerateBtn = gradioApp().querySelector('#txt2img_generate');
  const t2iSkipBtn = gradioApp().querySelector('#txt2img_skip');
  if (!promptText) {
    return
  }
  promptText.addEventListener('input', (e) => {
    const txt2imgprompt = gradioApp().querySelector('#txt2img_prompt > label > textarea')
    txt2imgprompt.value = e.target.value
  })
  if (!generateBtn || !t2iGenerateBtn) {
    return
  }
  sendBtn.addEventListener('click', async () => {
    console.log('sendBtn');
    const sendMessageInput = gradioApp().querySelector('#send-message');
    const res = await sendMessage(sendMessageInput.value)
    console.log('res', res);
    getChatHistory()
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
  await getUserIp()
  await getChatHistory()
  await getImage()
  window.getRoomInfo = getRoomInfo
  window.getChatHistory = getChatHistory
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
  })
  const json = await res.json()
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
  })
  const json = await res.json()
  console.log('sendMessage', json);
}

const getImage = async (url) => {
  const res = await fetch(BaseUrl + '/image/get?' + new URLSearchParams({
    room_id: window.roomId,
  }))
  const json = await res.json()
  console.log('sendMessage', json);
}

const getChatHistory = async () => {
  const res = await fetch(BaseUrl + '/chat/history?' + new URLSearchParams({
    room_id: window.roomId,
  }))
  const data = await res.json()
  console.log('getChatHistory', data);
}