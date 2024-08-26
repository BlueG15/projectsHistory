const delay = (ms) => new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(1);
    }, ms);
});

var phone = false;
var ok = false;

const number = [
    [0, 1, 2, 4, 5, 6],
    [2, 5],
    [0, 2, 3, 4, 6],
    [0, 2, 3, 5, 6],
    [1, 2, 3, 5],
    [0, 1, 3, 5, 6],
    [0, 1, 3, 4, 5, 6],
    [0, 2, 5],
    [0, 1, 2, 3, 4, 5, 6],
    [0, 1, 2, 3, 5, 6],

]

const random = () => {
    const rng = (min, max) => {
        //The maximum is exclusive and the minimum is inclusive
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);

    }
    for (let i = 0; i <= 100; i++) {
        refreshDisplay(number[rng(0, 10)]);
    }
    ok = true
    document.getElementById("timer").innerText = "00:00:00"
    document.getElementById("counter").innerText = "m"
    if (!phone) document.getElementById("counter").className = "counterm"
    clearInterval(timer)
}

const refreshDisplay = (arr) => {
    for (let i = 0; i <= 6; i++) {
        const cur = document.getElementById(`id-${i}`);

        if (cur) {
            if (arr.includes(i)) {
                cur.className = (cur.className === "segment active") ? "segment" : "segment active";
            }
        }
    };
}

const init = async () => {  
    random();
    document.addEventListener("keypress", (e) => {
        if (!number[e.key]) return;
        if(ok) {
            initTimer('not a freaking number') 
            ok = false;
        }
        refreshDisplay(number[e.key]);
        if(complete()){
            clearInterval(timer)
    
        }
    })

    var w = document.getElementById('document').clientWidth
    var h = document.getElementById('document').clientHeight

    if(h > w){
        phone = true;
        document.getElementsByClassName("body")[0].className = "vbody"
        document.getElementsByClassName("screen")[0].className = "vscreen"
        document.getElementsByClassName("keypad")[0].className = "vkeypad"
        document.getElementsByClassName("number")[0].className = "vnumber"
        document.getElementsByClassName("timer")[0].className = "vtimer"
        document.getElementById("counter").classList.add("vcounter")

        for(var i = 0; i <= 9; i++){
            document.getElementsByClassName(`numpad ${i} key`)[0].className = `numpad ${i} vkey`
        }

        document.getElementsByClassName("bigkey key")[0].className = "vbigkey vkey"
        document.getElementsByClassName("clear key")[0].className = "clear vkey"
        document.getElementsByClassName("key")[0].className = "vkey"
    }


}

const stopPlay = () => {
    clone.remove()
}

let clone;

const startPlay = () => {
    
    clone = document.getElementById("clickSound").cloneNode(false)
    clone.play()
}

function reee(f, para){
    startPlay()
    f(para)

}


const re = (num) => {
   
    
    if(ok) {
        initTimer('not a freaking number') 
        ok = false;
    }
    if (isNaN(num)) return
    if (num <= 9 && num >= 0){
        refreshDisplay(number[num])
    }
    if(complete()){
        clearInterval(timer)

    }
}

let timer; 

function complete(){
    var a = document.getElementsByClassName("segment active")
    if(!a.length) return true; else return false
}

function initTimer(num) {
    if (isNaN(num)){
        var begin = Date.now();
        timer = setInterval(() => {
            var time = Date.now() - begin
            var a = ms_to_ms(time);
            //console.log(a.length)
            
                switch(a.length){
                    case 4: {
                        if(!phone) document.getElementById("counter").className = "counterm"
                        document.getElementById("counter").innerText = "m"
                        break
                    }
                    case 1:{
                        if(!phone) document.getElementById("counter").className = "counterms"
                        document.getElementById("counter").innerText = "ms"
                        break
                    }
                    case 2: {
                        if(!phone) document.getElementById("counter").className = "counters"
                        document.getElementById("counter").innerText = "s"
                        break
                    }
                    default: {
                        if(!phone) document.getElementById("counter").className = "counterh"
                        document.getElementById("counter").innerText = "h"
                        break
                    }
                }
            
            document.getElementById("timer").innerText = a.join('');
            //console.clear()
            //console.log(`a is: `+ a)
        }, 1);
    }
}


function refresh(){
    ok = false
    clearInterval(timer)
    console.clear()
    document.getElementById('timer').innerText = "00:00:00"
    document.getElementById("counter").innerText = "m"
    if (!phone) document.getElementById("counter").className = "counterm"
    for (let i = 0; i <= 6; i++) {
        const cur = document.getElementById(`id-${i}`);

        if (cur) {
            cur.className = (cur.className === "segment active") ? "segment" : "segment";           
        }
    };
    console.log('cleared')
}




const ms_to_ms = (a) => {
    const q = Number(a);
    
    var h = 0;
    const m = Math.floor(q / 60000);
    const s = Math.floor((q - (m * 60000)) / 1000);
    let ms = q - (m * 60000) - (s * 1000);
    
    if (ms < 10) {
        ms = "00" + ms;
    } else if (ms < 100) {
        ms = "0" + ms;
    }
    
    if (ms == 1000){
        m += 1
        ms = 0
    }

    if (m > 59) {
        h = m / 60
        m = m - (60*h)
    }
    
    

    var res = []
    
    res.unshift(`.${ms}`)
    if (s != 0 || m != 0) res.unshift(`${(s < 10) ? "0" + s : s}`)
    if (m != 0 || h != 0) {
        if (m != 0) res.unshift(':')
        res.unshift(`${(m < 10) ? "0" + m : m}`)
    }
    if (h != 0) {
        res.unshift(':')
        res.unshift(h)
    }
    return res
}