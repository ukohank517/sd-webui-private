// 页面更新时控制其他数据的显示
const BaseUrl = 'http://v118-27-14-73.9ob0.static.cnode.io'

onUiUpdate(function () {
  try {
    const progress = gradioApp().querySelector('#txt2img_results > .progressDiv > .progress');
    const image = gradioApp().querySelector('#txt2img_gallery > .grid-wrap > .grid-container > button > img');
    const showImage = gradioApp().querySelector('#showImage');
    if (image) {
      showImage.src = image.src
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
  await getUserIp()
  window.getRoomInfo = getRoomInfo
  const userIp = gradioApp().querySelector('#user-ip');
  userIp.innerHTML = window.ip || ''
  const promptText = gradioApp().querySelector('#prompt-text');
  const generateBtn = gradioApp().querySelector('#generate-btn');
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
  generateBtn.addEventListener('click', () => {
    t2iGenerateBtn.click()
  })
  if (!cancelBtn || !t2iSkipBtn) {
    return
  }
  cancelBtn.addEventListener('click', () => {
    t2iSkipBtn.click()
  })
})


const getUserIp = async () => {
  const res = await fetch('https://api64.ipify.org?format=json')
  const data = await res.json()
  const { ip = '' } = data
  window.ip = ip
}

const getRoomInfo = async () => {
  const res = await fetch(BaseUrl + '/room/info?' + new URLSearchParams({
    room_id: '99999aa',
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
const upLoadImage = async () => {
  const res = await fetch('http://v118-27-14-73.9ob0.static.cnode.io/')
  const data = await res.json()
  const { ip = '' } = data
  window.ip = ip
}
