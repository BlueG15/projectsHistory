const padding_w = 0;
const padding_h = 20;

const width = window.visualViewport.width - padding_w
const height = window.visualViewport.height - padding_h

const grassNumber = 2000
const numberOfGrass = 30//Math.floor((Math.PI * affectRadius * affectRadius) / (width * height));

let grassMap = new Map();
let grassArr = [];
let grassTree = undefined;

function init(){
    var a = ""

    for(var i = 0; i < grassNumber; i++){
        var x = rng(width, padding_w, false)
        var y = rng(height, padding_h, false)
        var id = `${x}:${y}`
        grassArr.push([x, y])

        let t = "";
        let k = rng(0, 2, true);
        //if(k) t = " anim";

        a += `<div id = "${id}" style = "top: ${y}px; left: ${x}px" class = "grass${t}"></div>`
    }

    grassTree = new KDTree(2, grassArr);
    document.getElementById("field").innerHTML = a
    
    grassArr.forEach((i, index) => grassMap[`${i[0]}:${i[1]}`] = { target : document.getElementById(`${i[0]}:${i[1]}`), timeoutID : undefined })
    grassArr = [];

    var grassList = document.getElementsByClassName("grass")
    for(var i = 0; i < grassList.length; i++){
        var rot = rng(30, -30, false)
        grassList[i].style.setProperty('--rot', rot + 'deg');
        grassList[i].style.setProperty('--rot2', rot + 30 + rng(10, 0) + 'deg');
        grassList[i].style.setProperty('--rot3', rot - 35 - rng(10, 0) + 'deg');
        //grassList[i].style.setProperty('--delay', rng(5, 0, true) + 's');
    }

    window.onmousemove = (event) => {
        if(event.movementX == 0) return;
        var grassList2 = grassTree.findKNearestNeighbor([event.x, event.y], numberOfGrass, (p1, p2) => {
            //return p1.reduce((sum, val, i) => sum + (val - p2[i]) ** 2, 0);
            //return Math.max(Math.abs(p1[0] - p2[0]), Math.abs(p1[1] - p2[1]))
            return (event.movementX < 0) ? Math.abs(p2[0] * p2[1] - p1[1] * p1[0]) : Math.abs(p1[0] * p1[1] - p2[1] * p2[0])
        }).map(i => `${i.point[0]}:${i.point[1]}`);
        
        grassList2.forEach(i => {
            if(event.movementX < 0) {
                //let r = rng(100, 0, false);
                var a = 'rotLeft';
            } else {
                //let r = rng(100, 0, false);
                var a = 'rotRight';
            }
            //grassMap[i].target.classList.remove("anim");
            grassMap[i].target.classList.add(a);
            if(grassMap[i].timeoutID) clearTimeout(grassMap[i])
            let timeoutID = setTimeout(() => {
                try{
                    grassMap[i].target.classList.remove("rotRight")
                }catch(err){}
                try{
                    grassMap[i].target.classList.remove("rotLeft")
                }catch(err){}
                grassMap[i].timeoutID = undefined

                // let k = rng(0, 2, true);
                // if(k) grassMap[i].target.classList.add("anim");

            }, rng(900, 300, true))
            grassMap[i].timeoutID = timeoutID;
        })
    }
}

function rng(max, min, round){
    return (round) ? Math.round(Math.random() * (max - min) + min) : Math.random() * (max - min) + min
}