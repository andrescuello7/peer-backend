let stateSticker = false
let soundState = localStorage.getItem('soundState') | true
let nameStorage = localStorage.getItem('username') ?? 'Anonymous';
document.querySelector('.chat[data-chat=person2]').classList.add('active-chat')

const idSound = document.getElementById("idSound")
const input = document.getElementById("input")
const stickersCss = document.getElementById("stickersCss")
const wsocket = new WebSocket('ws://localhost:4000');
// wsocket.onopen = () => document.getElementById('sendButton').disabled = false;
// wsocket.onclose = () => console.log('WebSocket cerrado');
// wsocket.onerror = (error) => console.error('WebSocket error:', error);

let notSound = `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="text-secondary bi bi-volume-mute" viewBox="0 0 16 16">
  <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06M6 5.04 4.312 6.39A.5.5 0 0 1 4 6.5H2v3h2a.5.5 0 0 1 .312.11L6 10.96zm7.854.606a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0"/>
</svg>`

let sound = `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="text-secondary bi bi-volume-up" viewBox="0 0 16 16">
  <path d="M11.536 14.01A8.47 8.47 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-.708.707A7.48 7.48 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303z"/>
  <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.48 5.48 0 0 1 11.025 8a5.48 5.48 0 0 1-1.61 3.89z"/>
  <path d="M10.025 8a4.5 4.5 0 0 1-1.318 3.182L8 10.475A3.5 3.5 0 0 0 9.025 8c0-.966-.392-1.841-1.025-2.475l.707-.707A4.5 4.5 0 0 1 10.025 8M7 4a.5.5 0 0 0-.812-.39L3.825 5.5H1.5A.5.5 0 0 0 1 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 7 12zM4.312 6.39 6 5.04v5.92L4.312 9.61A.5.5 0 0 0 4 9.5H2v-3h2a.5.5 0 0 0 .312-.11"/>
</svg>`

let soundsEnum = [
    { path: './sound/ap_notify.mp3', name: 'Apple Notification' },
    { path: './sound/ds_call.mp3', name: 'Discord Call' },
    { path: './sound/mn_experience.mp3', name: 'Minecraft' },
    { path: './sound/mr_money.mp3', name: 'Mario Money' },
    { path: './sound/ds_notify.mp3', name: 'Discord Notification' },
    { path: './sound/ws_error.mp3', name: 'Windows Error' },
    { path: './sound/quack.mp3', name: 'Quack' },
    { path: './sound/cristiano.mp3', name: 'Cristiano R' },
    { path: './sound/messi.mp3', name: 'Encara Messi' },
    { path: './sound/no-hay-plata.mp3', name: 'No Hay Plata' },
    { path: './sound/victoria.mp3', name: 'Winner' },
    { path: './sound/half.mp3', name: 'Half Haif' },
    { path: './sound/mn_hurt.mp3', name: 'Minecraft Hurt' },
    { path: './sound/sumbido.mp3', name: 'sumbido' },
]

document.getElementById("send").addEventListener("click", () => handleEnter())
input.addEventListener('keydown', (event) => { if (event.keyCode === 13) handleEnter() });

wsocket.onmessage = (event) => {
    let { username, message, voice } = JSON.parse(event.data)
    const body = document.getElementById("body")

    if (username !== nameStorage) {
        if (localStorage.getItem('sound_state')) {
            let notify;
            if (notify) {
                notify.pause();
                notify.currentTime = 0;
            }

            notify = new Audio(voice);
            notify.play().catch(error => console.warn('Error playing the sound:', error));
            if (voice == './sound/sumbido.mp3') {
                let container = document.getElementById("container");
                container.classList.add("shake");
                setTimeout(() => { container.classList.remove("shake") }, 1000);
            }
        }
        if (username !== undefined && message !== undefined) {
            body.innerHTML += `<div class="bubble you"><b>${username}</b></br>${message}</div>`;
        }
    } else {
        body.innerHTML += `<div class="bubble me">${message}</div>`;
        stickersCss.innerHTML = '<div></div>'
    }
};

function handleEnter() {
    try {
        if (input.value != "" && input.value != undefined) {
            wsocket.send(JSON.stringify({
                port: 4001,
                host: '127.0.0.1',
                username: localStorage.getItem('username') ?? 'Anonymous',
                message: input.value,
                voice: './sound/ds_notify.mp3',
                type: "MESSAGE"
            }));
            input.value = "";
        }
    } catch (error) {
        console.error('WebSocket no está listo para enviar mensajes.', error);
    }
}

function soundSend(sound_music, name) {
    try {
        wsocket.send(JSON.stringify({
            port: 4001,
            host: '127.0.0.1',
            username: localStorage.getItem('username') ?? 'Anonymous',
            message: name,
            voice: sound_music,
            type: "MESSAGE"
        }));
    } catch (error) {
        console.error('WebSocket no está listo para enviar mensajes.', error);
    }
}

function soundList() {
    if (stateSticker) {
        stickersCss.innerHTML = '<div></div>'
    } else {
        stickersCss.innerHTML = `
            <div class="floating-menu">
                <ul>
                    ${soundsEnum.map((item, i) => `
                        <li key=${i} onclick="soundSend('${item.path}','${item.name}')"> ${item.name == 'sumbido' ? 
                        `<span style="color: rgb(217, 34, 34);">${item.name}</span>` :`<span>${item.name}</span>`}</li>`).join('')}
                </ul>
            </div>
        `
    }
    stateSticker = !stateSticker
}

const saveUsername = () => {
    const userName = document.getElementById("userName")
    if (userName.value !== "") {
        localStorage.setItem('username', userName.value)
        userName.value = ""
    }
    userName.placeholder = localStorage.getItem('username') ?? 'Anonymous'
}

idSound.addEventListener('click', () => {
    if (soundState === true) {
        idSound.innerHTML = notSound
    } else {
        idSound.innerHTML = sound
    }
    soundState = !soundState
    localStorage.setItem('soundState', soundState)
})

const connectPeer = () => {
    const inputConnection = document.getElementById("peerConnection")
    try {
        if (inputConnection.value !== "") {
            wsocket.send(JSON.stringify({
                port: 4001,
                host: '127.0.0.1',
                username: localStorage.getItem('username') ?? 'Anonymous',
                message: inputConnection.value,
                voice: './sound/ds_notify.mp3',
                type: "CONNECTION"
            }));
            inputConnection.placeholder = inputConnection.value
        }
    } catch (error) {
        alert(`Error: Host y el Port ${error}`)
    }
    inputConnection.value = ""
}

saveUsername()
idSound.innerHTML = sound
