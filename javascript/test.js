// 页面更新时控制其他数据的显示

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


window.addEventListener("DOMContentLoaded", (event) => {
  setTimeout(() => {
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
  }, 2000);
});
