let typeBreak = [];
let typeStop = [];
let windowToMove = undefined;
let mdown = false;
let mdownPos = [];
let originalWinPos = undefined;
let pDistance = 1000;

let mPos = [-1, -1];
let lockVelocity = 50;
let lockTime = 80;

let tempTimeOut = "";

const allWindowsID = ["window-top-welcome", "window-top-demo", "window-top-game"]

let projectList = {
    demo: {
        "collision_detection" : {
            url: "/demo/collision_detection/main.html",
            name: "Collision detection",
            desc: "Demo of a [Is point in a polygon] test, allow for both convex and concave, O(n).----------------------------------------Algo desciption: Project a beam to the right of the test point, if it crosses an odd number of lines, test point is in polygon, otherwise not."
        },
        "fps" : {
            url: "/demo/fps/main.html",
            name: "No canvas fps",
            desc: "Demo of a fps camera using css rotate3d.----------------------------------------Controls: Move using WASD.--------------------Rotate camara with arrow keys.----------------------------------------Note: very jank, even the collision detection is jank, granted this is the 1st time I deal with 3d maths and this is just a concept to see if the idea works."
        },
        "game_of_life" : {
            url: "/demo/game_of_life/main.html",
            name: "Conway's game of life",
            desc: "Demo of any cellular automaton, the code rn is config to conway game of life.----------------------------------------Note: Somehow the user input canvas and the simulation canvas is offset, idk why and the code is too old at this point to try to understand and fix, pls let me know if you found the cause."
        },
        "graph" : {
            url: "/demo/graph/main.html",
            name: "Graph calc",
            desc: "Demo of a graphing calculator.----------------------------------------Note: Leave offset blank to have it be the defaualt position, offset of the top left corner is 0, down is y+ and right is x+--------------------Technically the input is ANY js function that returns a number, I have support for common math ops + random without typing Math.----------------------------------------Yes the input is being sanitized, im not dum, though I may be dum enough to not sanitize all possible bad code."
        },
        "graph_with_explosion" : {
            url: "/demo/graph_with_explosion/main.html",
            name: "Graph calc with explosion",
            desc: "Demo of the game graph wars, just...input some functions and find out.----------------------------------------Notes: This is a folk of the graphing calculator demo, all notes of that project applies here too."
        },
        "grass_field" : {
            url: "/demo/grass_field/main.html",
            name: "Grass field",
            desc: "Demo of a grassy field that reacts to mouse movement.----------------------------------------Notes: I wonder how I can apply this as wallpaper"
        },
        "hover_3d" : {
            url: "/demo/hover_3d/main.html",
            name: "Hover 3d",
            desc: "Demo of a 3d card that rotates in 3d to your mouse cursor.----------------------------------------Notes: I made this b4 someone told me this is what steam tradin card looks like.--------------------This is the simplest demo code wise so far, just math."
        },
        "wave_sim" : {
            url: "/demo/wave_sim/main.html",
            name: "Wave simulator",
            desc: "Demo of wave physics.----------------------------------------Controls: Left click to send a shockwave away from it, proportional to how far the mouse is from the element----------------------------------------Notes: This was made as a study of how multiple waves interact--------------------There are like a bunch of values that can be tweak like how fast the wave should damp, how strong the force is, etc----------------------------------------No I will not make a slider for every single of them, sorry."
        }
    },
    game : {
        "calculator" : {
            url: "/game/calculator/main.html",
            name: "That one calculator game",
            desc: "The calculator game I demo to the qp community a while back.----------------------------------------Rules and Controls: Each number toggles the lights that number occupies in a 7 segment display, (on -> off and vice versa).--------------------The goal is given a random reachable state, turn off all the lights.----------------------------------------[Shuffle] button enters speedrun mode and [Clear] button disables it, I completely dont know what the [Enter] button do tbh, doesnt seem to affect anything----------------------------------------Notes: You can get a 00:00:00 time.--------------------This is very similar to [Lights out] and since that was solved using linear algebra, this probably can be as well.--------------------I wonder if any possible state is solvable."
        }
    }
}

function init(){
    let text1 = "Welcome to blu's demo galery, (this itself is a demo of a UI)";
    let text2 = "Where do you want to go?";
    let text3 = "Double click to go to project";
    type([text1, text2], ["welcome1", "welcome2"], 40)
    type([text3], ["footnote-demo"])

    let str = `<div id = "demo-list" class = "list">`;
    Object.keys(projectList.demo).forEach((i, index) => {
        str += generateItemHtmlStr(projectList.demo[i], index) + " ";
        if(index % 5 == 4) str += `</div> <div id = "demo-list" class = "list">`
    })
    str += `</div>`
    document.getElementById("demoWindow").innerHTML = str + document.getElementById("demoWindow").innerHTML;

    Object.keys(projectList.demo).forEach((i, index) => {
        type([projectList.demo[i].name], [`item-name-${index}`], 80)
    })

    str = `<div id = "game-list" class = "list">`;
    Object.keys(projectList.game).forEach((i, index) => {
        str += generateItemHtmlStr(projectList.game[i], index + 1000) + " ";
        if(index % 5 == 4) str += `</div> <div id = "game-list" class = "list">`
    })
    str += `</div>`
    document.getElementById("gameWindow").innerHTML = str + document.getElementById("gameWindow").innerHTML;

    Object.keys(projectList.game).forEach((i, index) => {
        type([projectList.game[i].name], [`item-name-${index + 1000}`], 80)
    })

    const arr = [0, [1], [2], [1, 2], [4], [1, 4], [2, 4], [1, 2, 4]];
    window.onmousedown = (event => {
        var mouseButton = arr[event.buttons] || [];
        if(mouseButton.includes(1)) {
            mdown = true;
            mdownPos = [event.clientX, event.clientY];
            if(windowToMove) originalWinPos = document.getElementById(windowToMove).parentElement.getBoundingClientRect();
            if(windowToMove){
                document.getElementById(windowToMove).parentElement.style['z-index'] = 5;
            }
        };
    })

    window.onmouseup = (event => {
        var mouseButton = arr[event.buttons] || [];
        if(!mouseButton.includes(1) && mdown) {
            mdown = false;
            mdownPos = [];
            originalWinPos = undefined;
        };
    })

    window.onmousemove = (event => {
        if(mdown && windowToMove){
            document.getElementById(windowToMove).parentElement.style.top = originalWinPos.y + event.clientY - mdownPos[1] + "px";
            document.getElementById(windowToMove).parentElement.style.left = originalWinPos.x + event.clientX - mdownPos[0] + "px";
            document.getElementById(windowToMove).parentElement.style['z-index'] = 5;

            //move(windowToMove, allWindowsID.filter(i => i != windowToMove)[0])
        }
        let a = event.clientY - 200;
        let b = event.clientX - 400;

        if(a < 0) a = window.visualViewport.height * 40/100 + a;
        if(b < 0) b = window.visualViewport.width * 40/100 + b;

        a = Math.round(a);
        b = Math.round(b);
        document.getElementById("window-desc").style.top = a + "px";
        document.getElementById("window-desc").style.left = b + "px";

        if(mPos.length < 2){
            mPos.push([event.clientX, event.clientY]);
        } else {
            mPos[0] = mPos[1];
            mPos[1] = [event.clientX, event.clientY];
        }
    })

    let c = 0;
    setInterval(() => {
        for(let i = 0; i < allWindowsID.length; i++){
            for(let l = 0; l < allWindowsID.length; l++){
                if(allWindowsID[l] == windowToMove) continue;
                moveBasic(allWindowsID[i], allWindowsID[l]);
            }
        }

        if(mPos.length == 2){
            if(Math.hypot(mPos[0][0] - mPos[1][0], mPos[0][1] - mPos[1][1]) > lockVelocity){
                document.getElementById('window-desc-cover').classList.add('invi');
            } else {
                if(c >= lockTime){
                    document.getElementById('window-desc-cover').classList.remove('invi');
                    typeBreak = typeBreak.filter(i => i != "window-desc");
                    c = 0;
                } else {
                    typeBreak.push("window-desc");
                    c++;
                }
            }           
        }

    }, 1000/30)
}

async function type(strArr, idArr, customTime){
    let c = 0;
    if(!customTime) customTime = 100
    for(let i = 0; i < strArr.length; i++){
        for(let k = 0; k <= strArr[i].length; k++){
            let a = document.getElementById(idArr[i]).innerText;
            if(!strArr[i].startsWith(a)) return;
            if(typeBreak.includes(idArr[i])) break;

            document.getElementById(idArr[i]).innerText = strArr[i].slice(0, k);

            await sleep(customTime);
            c++
            if(c % 50 == 49) customTime = Math.max(5, customTime - 1.2);
        }
        if(typeBreak.includes(idArr[i])){
            document.getElementById(idArr[i]).innerText = strArr[i];
            continue;
        }
        await sleep(5 * customTime)
    }

    typeBreak = [];
}

function setTypeBreak(idArr){
    typeBreak = idArr;
}

//sleep dont freeze the website
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//freeze straight up pauses everything
function freeze(ms) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < ms);
}

function addWindowToMove(str){
    if(!mdown){
        windowToMove = str;
    }
}

function removeMarkedWindow(){
    if (!mdown){
        if(windowToMove){
            document.getElementById(windowToMove).parentElement.style['z-index'] = 0;
        }
        windowToMove = undefined
    }
}

let movedID = [];
function moveBasic(sourceID, moverID){
    //console.log("moveTriggered with sourceID, moverID = " + sourceID + " "+ moverID);
    let sData = document.getElementById(sourceID).parentElement.getBoundingClientRect();
    let mData = document.getElementById(moverID).parentElement.getBoundingClientRect();

    if((mData.y + mData.height) < (sData.top - 50)) return;
    if((mData.y) > (sData.top + sData.height + 50)) return; 
    if((mData.x + mData.width) < (sData.left - 50)) return;
    if((mData.x) > (sData.left + sData.width + 50)) return; 

    let sCenter = [sData.x + sData.width/2, sData.y + sData.height/2];
    let mCenter = [mData.x + mData.width/2, mData.y + mData.height/2];

    let v = [mCenter[0] - sCenter[0], mCenter[1] - sCenter[1]]
    let d = Math.hypot(...v);
    v = normalize(v, (1 - d/pDistance) * 10);
    if(d <= pDistance){
        document.getElementById(moverID).parentElement.style.top = (mData.y + v[1]) + "px"
        document.getElementById(moverID).parentElement.style.left = (mData.x + v[0]) + "px"
    }
    // let arr = allWindowsID.filter(i => !( movedID.includes(i) || i == moverID) );
    // if(!arr.length) return;
    //move(moverID, arr[0]);

}

function normalize(arr, factor){
    let r = Math.hypot(...arr);
    return arr.map(i => (i * factor)/r);
}

let descStr = "";
async function toggleDescOn(str, id){
    typeBreak.push("window-desc");
    await sleep(100);
    typeBreak = typeBreak.slice(0, -1);
    document.getElementById("window-desc").classList.remove("invi");
    if(str != descStr) {
        descStr = str;
        document.getElementById("desc-area").innerText = "";
    }
    await type([str], [id], 30);
}

async function toggleDescOff(){
    document.getElementById("window-desc").classList.add("invi");
    document.getElementById("desc-area").innerText = "";
    typeBreak.push("desc-area");
    await sleep(1);
    typeBreak = typeBreak.slice(0, -1);
}

function alertRandom(){
    alert("ok")
}

function redirect(url){
    if(!url) return
    if(url.startsWith("http")){
        window.location.href = url;
        return;
    } else if(url.startsWith("/")) {
        window.location.href = window.location.href.replace("/main.html", url);
    }
}

function generateItemHtmlStr(item, index){
    return `<div class = "item" ondblclick="redirect('${item.url}')" onmouseenter="toggleDescOn('${item.desc}', 'desc-area')" onmouseleave="toggleDescOff()"> <div class = "item-image">🖹</div> <div class = "item-name" id = "item-name-${index}"></div> </div>`
}