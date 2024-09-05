document.querySelector('.chat[data-chat=person2]').classList.add('active-chat')
let _name = localStorage.getItem('username') ?? 'Anonymous';

const body = document.getElementById("body")
const send = document.getElementById("send")
const input = document.getElementById("input")
const addName = document.getElementById("addName")
const userName = document.getElementById("userName")
const z_stickers_css = document.getElementById("z_stickers_css")
var socket = io();

let SoundsEnum = [
    { path: './mp3/ap_notify.mp3', name: 'Apple Notification' },
    { path: './mp3/ds_call.mp3', name: 'Discord Call' },
    { path: './mp3/mn_experience.mp3', name: 'Minecraft' },
    { path: './mp3/mr_money.mp3', name: 'Mario Money' },
    { path: './mp3/ds_notify.mp3', name: 'Discord Notification' },
    { path: './mp3/ws_error.mp3', name: 'Windows Error' },
    { path: './mp3/quack.mp3', name: 'Quack' },
    { path: './mp3/cristiano.mp3', name: 'Cristiano R' },
    { path: './mp3/messi.mp3', name: 'Encara Messi' },
    { path: './mp3/no-hay-plata.mp3', name: 'No Hay Plata' },
    { path: './mp3/victoria.mp3', name: 'Winner' },
    { path: './mp3/half.mp3', name: 'Half Haif' },
    { path: './mp3/mn_hurt.mp3', name: 'Minecraft Hurt' },
    { path: './mp3/sumbido.mp3', name: 'sumbido' },

]

send.addEventListener("click", () => {
    handleEnter()
})

input.addEventListener('keydown', function (event) {
    if (event.keyCode === 13) {
        handleEnter();
    }
});

function handleEnter() {
    if (input.value != "" && input.value != undefined) {
        socket.emit("message", JSON.stringify({
            'username': localStorage.getItem('username') ?? 'Anonymous',
            'message': input.value,
            'voice': './mp3/ds_notify.mp3'
        }))
        input.value = "";
    }
}

socket.on("new-message", (data) => {
    let _text = JSON.parse(data)
    if (_text.username !== _name) {
        if (localStorage.getItem('sound_state')) {
            let notify;
            if (notify) {
                notify.pause();
                notify.currentTime = 0;
            }

            notify = new Audio(_text.voice);
            notify.play().catch(error => {
                console.warn('Error playing the sound:', error);
            });

            if (_text.voice == './mp3/sumbido.mp3') {
                let container = document.getElementById("container");
                container.classList.add("shake");
                setTimeout(function() {
                    container.classList.remove("shake");
                }, 1000);
            }
        }
        body.innerHTML += `<div class="bubble you"><b>${_text.username}</b></br>${_text.message}</div>`;
    } else {
        body.innerHTML += `<div class="bubble me">${_text.message}</div>`;
        z_stickers_css.innerHTML = '<div></div>'
    }
})

const saveName = () => {
    if (userName.value !== "") {
        localStorage.setItem('username', userName.value)
        userName.value = ""
    }
    userName.placeholder = localStorage.getItem('username') ?? 'Anonymous'
}

let state_sticker = false
function sound_list() {
    if (state_sticker) {
        z_stickers_css.innerHTML = '<div></div>'
    } else {
        z_stickers_css.innerHTML = `
            <div class="floating-menu">
                <ul>
                    ${SoundsEnum.map((item, i) => `
                        <li key=${i} onclick="soundSend('${item.path}','${item.name}')"> ${item.name == 'sumbido' ? 
                        `<span style="color: rgb(217, 34, 34);">${item.name}</span>` :`<span>${item.name}</span>`}</li>`).join('')}
                </ul>
            </div>
        `
    }
    state_sticker = !state_sticker
}

function soundSend(sound_music, name) {
    socket.emit("message", JSON.stringify({
        'username': localStorage.getItem('username') ?? 'Anonymous',
        'message': name,
        'voice': sound_music
    }))
}

function main() {
    saveName()
}

main()