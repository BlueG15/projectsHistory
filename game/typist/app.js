class word {
    constructor(x) {
        this.str = x;
        this.top = rng(0, window.visualViewport.height / 5, true);
        this.left = rng(50, window.visualViewport.width - 50, true);
        this.speed = rng(3, 0.2, false);
        this.typedNumber = 0;
        this.explode = false;
    }

}

function rng(max, min, round){
    return (round) ? Math.round(Math.random() * (max - min) + min) : Math.random() * (max - min) + min
}

let wordArr = ['aaaaa', 'haha', 'aghh', 'nuuu', 'raccoon']
let wordObjArr = [];
let wordObjGrave = [];

function init(){
    wordArr.forEach((i, index)=> {wordObjArr.push(new word(i));})
    drawBoxes();
    setInterval(update, 1000/30)
};

function drawBoxes(){
    let str = "";
    wordObjArr.forEach((i, index)=> {
        str += `<div style = "top : ${i.top}px; left : ${i.left}px"  id = "box${index}" class = "box"}"><div class = "typed">${i.str.slice(0, i.typedNumber)}</div>${i.str.slice(i.typedNumber)}</div>`
        str += "  \n  ";
    })
    
    document.getElementById("boxContatainer").innerHTML = str;
}
function updateBoxes(){
    wordObjArr.forEach((i, index)=> {
        document.getElementById('box' + index).style.top = i.top + 'px';
        document.getElementById('box' + index).style.width = i.width + 'px';
        document.getElementById('box' + index).innerHTML = `<div class = "typed">${i.str.slice(0, i.typedNumber)}</div>${i.str.slice(i.typedNumber)}`;
    })
}
function focus(x){
    document.getElementById(x).focus();
}
function update(){
    let a = document.getElementById('input0').value;

    wordObjArr.forEach((i, index) => {
        i.top += i.speed;
        let b = getMaxSubStrInStr(a, i.str);
        i.typedNumber = b;
        if(i.typedNumber >= i.str.length) explode('box' + index, index);
    })
    //drawBoxes();
    updateBoxes();
}

function explode(id, index){
    setTimeout(() => {
        //document.getElementById(id).classList.remove('explode');
        let a = wordObjArr.splice(index, 1);
        //document.getElementById(id).classList.add('invis');
    }, 700)
}

function getMaxSubStrInStr(str1, str2){
    if(str1.includes(str2)) return str2.length;
    if(!str1.includes(str2[0])) return 0;

    let l = 1;
    while(l < str2.length){
        if(str1.includes(str2.slice(0, l))){
            l++;
        } else {
            return l;
        }
    }
    return l;
}