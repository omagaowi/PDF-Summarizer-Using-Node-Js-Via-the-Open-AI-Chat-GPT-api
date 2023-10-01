const fileInput = document.querySelector('#file')
const fileForm = document.querySelector('.send-form')
const loadingWindow = document.querySelector('.loading')
const fileready = document.querySelector('.fileready')
const submitBtn = document.querySelector('.submitBtn')

fileInput.addEventListener('change', (e)=>{
    // console.log('change')
    const file = e.target.files[0]
    if(file.type == 'application/pdf'){
         console.log(file)
         loadingWindow.classList.add('active')
         setTimeout(function(){
             loadingWindow.classList.remove('active')
             fileready.classList.add('show')
             submitBtn.classList.add('active')
             document.querySelector('.fileReady p').innerText = file.name
             document.querySelector('.fileReady i').addEventListener('click', ()=>{
                fileready.classList.remove('show')
                submitBtn.classList.remove('active')
             })
         }, 1700)
         submitBtn.addEventListener('click', ()=>{
            fileForm.submit()
         })
    }else{
        alert('FILE MUST BE PDF !!')
    }
})