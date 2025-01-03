const padding_w = 0;
const padding_h = 20;

const width = window.visualViewport.width - padding_w
const height = window.visualViewport.height - padding_h

const dotNumber = 5000
const numberOfdot = 10;

let dotMap = new Map();
let dotArr = [];
let dotTree = undefined;

let count = 0;
let maxMouseVelocity = 20; //exceed this and the timer returns 70;

let c = [100, 100, 100]
let d =[false, false, false];

function init(){
    var a = ""

    for(var i = 0; i < dotNumber; i++){
        var x = rng(width, padding_w)
        var y = rng(height, padding_h)
        var id = `${x}:${y}`
        dotArr.push([x, y]);
        a += `<div id = "${id}" style = "top: ${y}px; left: ${x}px" class = "dot"></div>`
    }

    dotTree = new KDTree(2, dotArr);
    document.getElementById("field").innerHTML = a
    
    dotArr.forEach((i, index) => dotMap[`${i[0]}:${i[1]}`] = { target : document.getElementById(`${i[0]}:${i[1]}`), timeoutID : undefined })
    dotArr = [];

    var dotList = document.getElementsByClassName("dot")
    for(var i = 0; i < dotList.length; i++){
        var r = rng(8, 0, false)
        dotList[i].style.setProperty('--radius', r + 'px');

        var t = rng(2, 0, true);
        var v = rng(2, 0, true);
        var x = rng(1, 0, true);
        if(d[t]) v *= -1;
        c[t] += v;
        if(c[t] <= 0 || c[t] >= 255) d[t] = !d[t];
        else if(c[t] <= 100 || c[t] >= 170) { if(x) d[t] = !d[t] }
        c[t] = Math.min(Math.max(c[t], 0), 255);
        dotList[i].style.setProperty('--r', c[0]);
        dotList[i].style.setProperty('--g', c[1]);
        dotList[i].style.setProperty('--b', c[2]);
    }

    window.onmousemove = (event) => {

        const mSpeed = Math.abs(event.movementX) + Math.abs(event.movementY);

        if(event.movementX == 0) return;
        var dotList2 = dotTree.findKNearestNeighbor([event.x, event.y], numberOfdot, (p1, p2) => {
            return p1.reduce((sum, val, i) => sum + (val - p2[i]) ** 2, 0);
            //return Math.max(Math.abs(p1[0] - p2[0]), Math.abs(p1[1] - p2[1]))
            //return (event.movementX < 0) ? Math.abs(p2[0] * p2[1] - p1[1] * p1[0]) : Math.abs(p1[0] * p1[1] - p2[1] * p2[0])
        }).map(i => `${i.point[0]}:${i.point[1]}`);
        
        dotList2.forEach(i => {

            let timer = Math.min(Math.max((400 * sigmoid(mSpeed, maxMouseVelocity, 1)), 70), 900) + rng(50, -50, true);

            dotMap[i].target.classList.add("glow");
            if(dotMap[i].timeoutID) clearTimeout(dotMap[i])
            let timeoutID = setTimeout(() => {
                try{
                    dotMap[i].target.classList.remove("glow")
                }catch(err){}
                dotMap[i].timeoutID = undefined
                count--;
            }, timer)
            dotMap[i].timeoutID = timeoutID;
            count++;
        })
    }
}

function sigmoid(x, center, max){
    return max / (1 + Math.pow(Math.E, x - center));
}

function rng(max, min, round){
    return (round) ? Math.round(Math.random() * (max - min) + min) : Math.random() * (max - min) + min
}

function rngSkewCenter(max, min, stdDevFactor = 0.17, round = false) {
    // stdDevFactor  : how spread out everthing is
    // Box-Muller transform to generate Gaussian distribution
    const center = (min + max) / 2;
    const stdDev = (max - min) * stdDevFactor;
    
    // Generate two independent random numbers
    const u1 = Math.random();
    const u2 = Math.random();
    
    // Box-Muller transform
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    
    // Scale and shift the value
    let value = center + z0 * stdDev;
    
    // Ensure the value is within the specified range
    value = Math.max(min, Math.min(max, value));
    
    if(round) value = Math.round(value);
    return value;
}