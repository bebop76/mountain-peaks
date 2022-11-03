const eyes = document.querySelectorAll('.eye')
const pass = document.querySelectorAll('.psw')

eyes.forEach(eye => {
    eye.addEventListener('mousedown', (e) =>{
      pass[eye.id].setAttribute("type", 'text')
    })
  })
  eyes.forEach(eye => {
    eye.addEventListener('mouseup', (e) =>{
      pass[eye.id].setAttribute("type", 'password')
    })
  })