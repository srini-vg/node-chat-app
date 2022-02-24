const socket = io()

//Elements
const $messageForm=document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $sendLocationButton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

//Templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationMessageTemplate=document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscrool = ()=>{
 //new message element
 const $newMessage=$messages.lastElementChild

 //height of new message
 const newMessageStyles = getComputedStyle($newMessage)
 const newMessageMargin = parseInt(newMessageStyles.marginBottom) 
 const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

 //visible height
 const visibleHeight= $messages.offsetHeight

 //height of messages container
 const containerHeight= $messages.scrollHeight

 //How far have I scrolled ?
 const scrollOffset = $messages.scrollTop + visibleHeight

 if(containerHeight - newMessageHeight <= scrollOffset){    
    $messages.scrollTop = $messages.scrollHeight
 }

 console.log(newMessageStyles)
};

socket.on('message',(msg)=>{
    console.log(msg)
    const html=Mustache.render(messageTemplate,{
        username: msg.username,
        message: msg.text,
        createdAt: moment(msg.createdAt).format('LTS')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscrool()
})

socket.on('locationMessage',(message)=>{
   
    const html=Mustache.render(locationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt: moment(message.createdAt).format('LTS')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscrool()
})

socket.on('roomData',({room,users})=>{
   const html=Mustache.render(sidebarTemplate,{
       room,
       users
   })
   document.querySelector('#sidebar').innerHTML=html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    //disable
    const message=e.target.elements.message.value;
    if(!message)
        return alert('Please enter message before send')
    socket.emit('sendMessage',message,(err)=>{
        //enable
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus();
        if(err){
            return console.log(err)            
        }
        console.log('Message Delivered!')
    })
})

$sendLocationButton.addEventListener('click',()=>{   
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{       
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },(msg)=>{
            console.log('Location Shared!')
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})


socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
});