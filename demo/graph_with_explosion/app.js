var player = {
        player1 : {
            color : `rgb(78, 230, 149)`,
            lineW : 10,
            deviate : 0, //the result of the eval function is then ^ (Math.random() * deviate)   
            data : []
        },
        player2 : {
            color : `rgb(146, 78, 230)`,
            lineW : 10,
            deviate : 0, //the result of the eval function is then ^ (Math.random() * deviate)   
            data : []
        }  
}
var cPlayer = 1


var func = "return null" //stores the function string, removes repeated validation
var trueW = 0 //got updated after init, true width and height of the canvas 
var trueH = 0 //instead ofcanvas.width and canvas.height
var statis= {}
var lastStr = ""


const scalingF = .5; //scales the canvas so 1 pixel canvas space is very damn big screen space
const scalex = 10
const scaley = 10
var diff = .1 //sample rate

function canvasToGraphCoor(x, y, xoffset, yoffset){
    var x = (x + xoffset) / scalex
    var y = (-y -yoffset) / scaley
    return {'x' : x, 'y': y}
}

function graphToCanvasCoor(x, y, xoffset, yoffset){
    var x = (x*scalex) - xoffset
    var y = -(y*scaley) -yoffset
    return {'x' : x, 'y': y}
}

function findCollision(data, dataToShiftThru){
    if (!dataToShiftThru.length) return -1;
    console.log(`dataToShiftThru is not empty`)
    var cow = [].concat(...dataToShiftThru)
    for(var i = 0; i < data.length; i++){
        var lol = cow.filter(n => n[0] == data[i][0])
        if(!lol.length) continue;
        for(var k = 0; k < lol.length; k++){
            if (Math.abs(lol[k][1] - data[i][1]) <= 5) return i
        }
    }
    return -1
}

/* 
a multithread engine for calculating on long arrays
*/
const calPortion = (n, d) => new Promise((resolve, reject) => {
    //console.log(`no ${n} called \n`)
    var a = []
    var start = 0 + n*d
    var end = start + (d-1)

    for(var i = start; i <= end; i++){
        //console.log(`calculating element ${diff*i}\n`)
        var tempdata = canvasToGraphCoor(diff*i, 0, -trueW/2, -trueH/2)
        var tempx = tempdata.x
        var tempres = equate(tempx)
        if((!tempres && tempres != 0) || isNaN(tempres)) {
            continue
        }
        tempres = tempres*(Math.random() * player[`player${cPlayer}`].deviate + 1)
        var tempy = graphToCanvasCoor(0, tempres, -trueW/2, -trueH/2).y
        a.push([diff*i, tempy])
    }
    resolve(a)
})

const loop = (layer, d) => new Promise(async (resolve, reject) => {
   
    try{
        let fArr = new Array(Math.round(layer / d)).fill(0)

        Promise.all((fArr.map((t, n) => {
            return calPortion(n, d);
        }))).then(res => {
           resolve(res)
        });
        
        }catch(err){
            console.log(err)
            console.log(layer)
            resolve(null)
        }

        //resolve(layer)

})

const main = (l) => new Promise((resolve, reject) => {
    var largest_number = l //it loops from 0 to this number
    var split = 5 //length of each segment to compute
    loop(largest_number, split).then(res => {                
        console.log("complete")   
        var cow = [].concat(...res)
        var cow2 = []
        // for(var i = 0; i < cow.length - 1; i++){
        //     if(((cow[i+1][1] >= 0 && Math.abs(cow[i+1][1]) < trueH) && (cow[i][1] < 0 || Math.abs(cow[i][1]) > trueH)) || (cow[i - 1] && (cow[i-1][1] >= 0 && Math.abs(cow[i-1][1]) < trueH) && (cow[i][1] < 0 || Math.abs(cow[i][1]) > trueH)) || (cow[i][1] >= 0 && Math.abs(cow[i][1]) < trueH)){
        //         cow2.push(cow[i])
        //     }
        // }
        //new version: if it goes out of bound, it stops
        var encounteredInBound = false
        for(var i = 0; i < cow.length - 1; i++){
            //out of bound : (cow[i][1] < 0 || Math.abs(cow[i][1]) > trueH || Math.abs(cow[i][1] - cow[i+1][1]) >= 0.4*trueH)
            //in bound: (cow[i][1] >= 0 && Math.abs(cow[i][1]) < trueH && Math.abs(cow[i][1] - cow[i+1][1]) < 0.4*trueH)
            if((cow[i][1] >= 0 && Math.abs(cow[i][1]) < trueH && Math.abs(cow[i][1] - cow[i+1][1]) < 0.4*trueH)){
                if(!encounteredInBound){
                    if(cow[i - 1]) cow2.push(cow[i - 1]);
                    encounteredInBound = true
                }
                cow2.push(cow[i])
            }
            if((cow[i][1] < 0 || Math.abs(cow[i][1]) > trueH || Math.abs(cow[i][1] - cow[i+1][1]) >= 0.4*trueH)){
                if(encounteredInBound) {
                    cow2.push(cow[i])
                    break
                }
            }
        }
        var endI = findCollision(cow2, player[`player${cPlayer}`].data)        
        console.log(`supposed collision at ${endI}`)
        if(endI >= 0) cow2 = cow2.slice(0, endI)
        if(!cow2.length) return cow2
        var finalx = cow2[cow2.length -1][0]
        var finaly = cow2[cow2.length -1][1]
        //var cow3 = cow2.filter(i => Math.hypot(i[0] - finalx, i[1] - finaly) > 50)
        player[`player${!(cPlayer - 1) + 1}`].data.push(cow2)
        player.player1.data.forEach((n, index) => {
            player.player1.data[index] = n.filter(i => Math.hypot(i[0] - finalx, i[1] - finaly) > 50)
        })
        player.player2.data.forEach((n, index) => {
            player.player2.data[index] = n.filter(i => Math.hypot(i[0] - finalx, i[1] - finaly) > 50)
        })
        
        resolve(cow2)        
    })
})

function init() {
    //the shit below removes blurry lines by scaling the canvas to the device pixel ratio
    //so thats the reason for the 3.333333
    // Get the DPR and size of the canvas
    const dpr = window.devicePixelRatio;
    var temp = document.getElementsByClassName("canvas");
    for (var i = 0; i < temp.length; i++) {
      const rect = temp[i].getBoundingClientRect();
  
      // Set the "actual" size of the canvas
      temp[i].width = rect.width * dpr ;
      temp[i].height = rect.height * dpr ;
      const ctx = temp[i].getContext("2d");
      // Scale the context to ensure correct drawing operations
      ctx.scale(dpr * scalingF, dpr * scalingF);
  
      // Set the "drawn" size of the canvas
      temp[i].style.width = `${rect.width}px`;
      temp[i].style.height = `${rect.height}px`;
      console.log(`temp ${i} with width = ${rect.width}`);
    }

    trueW = temp[0].width / (scalingF * window.devicePixelRatio)
    trueH = temp[0].height / (scalingF * window.devicePixelRatio)
}


function drawDot(x, y, radius, id, color, clear) {
    const canvas = document.getElementById(id);
    //var data = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (clear) ctx.globalCompositeOperation = 'destination-out';
    else ctx.globalCompositeOperation = 'source-over'
  
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.beginPath();
  
    ctx.moveTo(Math.round(x + radius), Math.round(y));
    ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
    ctx.stroke();
    ctx.fill();
}
  
function drawbox(x, y, width, height, color, id, clear) {
    const canvas = document.getElementById(id);
    //var data = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (clear) ctx.globalCompositeOperation = 'destination-out';
    else ctx.globalCompositeOperation = 'source-over'
  
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.beginPath();
  
    ctx.fillRect(x, y, width, height);
    //ctx.stroke();
    //ctx.fill();
}

function drawline(x1, y1, x2, y2, width, color, id, clear) {
    const canvas = document.getElementById(id);
    //var data = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (clear) ctx.globalCompositeOperation = 'destination-out';
    else ctx.globalCompositeOperation = 'source-over'
  
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.beginPath();
  
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke()
    //ctx.stroke();
    //ctx.fill();
}

//the arr has the form of the already array
async function drawAllLines(str, arr, id, color, clear, Lwidth) {
    console.log(`drawAllLines triggered`)
    statis[`${str}`] = true
    const canvas = document.getElementById(id);
    var data = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d');
    if (clear) ctx.clearRect(data.top, data.left, data.width, data.height)

    ctx.lineWidth = 10 //these 3 are ununsed
    ctx.strokeStyle = `rgb(173, 216, 230)` 
    ctx.beginPath();
    
    var speed = 1

    var desired_t = 2000
    var skip = 10
    var lastVar = -1
    for(var i = 0; i < arr.length-1; i++) {
        //if(Math.abs(arr[i][1] - arr[i+1][1]) >= 0.4*trueH) continue
        // ctx.moveTo(arr[i][0], arr[i][1]);
        // ctx.lineTo(arr[i+1][0], arr[i+1][1]);
        // ctx.stroke()
        if(statis[`${str}`]){
            if(Math.floor(i/skip) == lastVar){
                speed = await animateLine(arr[i][0], arr[i][1], arr[i+1][0], arr[i+1][1], 'graphArea', .07, 1/1000, speed, 3, str, color, Lwidth, true)
                //animateLine(x1, y1, x2, y2, id, min_d, delay, starting_speed, acceleration, str, color, Lwidth)
                speed = Math.min(speed, 3500)
            } else {
                lastVar = Math.floor(i/skip)
                speed = await animateLine(arr[i][0], arr[i][1], arr[i+1][0], arr[i+1][1], 'graphArea', .07, 1/1000, speed, 3, str, color, Lwidth, false)
                //animateLine(x1, y1, x2, y2, id, min_d, delay, starting_speed, acceleration, str, color, Lwidth)
                speed = Math.min(speed, 3500)
            }
        }
        //console.log(`supposedly drawn line from [${i[0]}, ${i[1]}] to [${i[2]}, ${i[3]}]`)
        //if(id == 'paint') document.getElementById('box').innerText = document.getElementById('box').innerText + `\ndrawn line from [${i[0]}, ${i[1]}] to [${i[2]}, ${i[3]}]`
    }    
    delete statis[`${str}`]
}
  
function clearCanvas(id) {
    delete statis[`${lastStr}`]
    const canvas = document.getElementById(id);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, trueW, trueH);   
}

//unused function (for now)
function draw(id, diff){
    const canvas = document.getElementById(id);
    var x = Number(document.getElementById('xinput').value)
    var y = Number(document.getElementById('yinput').value)
    var diff = (diff) ? diff : .03
    if(isNaN(x) || isNaN(y)) return
    drawbox(x, y, 1, 1, `rgb(255, 0, 0)`, id, false)

    var xoffset = -x
    var yoffset = -y

    for(var i = 0; i <= trueW + diff; i+=diff ){
        var tempdata = canvasToGraphCoor(i, 0, xoffset, yoffset)
        var tempx = tempdata.x
        var tempres = equate(tempx)
        if((!tempres && tempres != 0) || isNaN(tempres)) {
            continue
        }
        var tempy = graphToCanvasCoor(0, tempres, xoffset, yoffset).y
        if(tempy > trueH || tempy < 0) {
            continue
        }
        drawbox(i, tempy, 1, 1, `rgb(0, 255, 0)`, id, false)      
    }
}


//draw lines instead of squares
async function drawv2(str, id, color, Lwidth){
    //var x = trueW / 2
    //var y = trueH / 2
    main(trueW/diff + 5).then(async already => {
        if(!already.length) return
        console.log(`already got, alredy is ${JSON.stringify(already)}`)
        //player[`player${cPlayer}`].data.push(already)
        //these 2 lines draw the axis
        //drawline(x, 0, x, trueH * 2, 1, `rgb(255, 0, 0)`, 'graphArea', false)
        //drawline(0, y, trueW * 2, y, 1, `rgb(255, 0, 0)`, 'graphArea', false)

        await drawAllLines(str, already, id, color, false, Lwidth)
        await explode(already[already.length - 1][0], already[already.length - 1][1], 'graphArea', player[`player${!(cPlayer -1) + 1}`].color, str, player)
    })
}

//limit all function to y = f(x), makes it have only 1 solution per vertical strips
//to do: make f(x) possible to return array of solutions
// function equate(x){
//     return (x == 0) ? null : Math.sqrt(2**2 - (x +1)**2) -1
// }

//cause canvas coors and actual graphing coor is different
//why? 
//1. the y of canvas coors is reverse, going down is possitive, which is dum
//2. the actual graph coors is offset so that the initial point is treated as (0, 0)
//3. the x and y axis in graph coors are scaled 

function roundToNearestMultiple(x, multiple){
    return Math.round(x/multiple)
}

function distance(x, y){
    return Math.sqrt(x*x + y*y)
}

async function updateFunction(){
    var str = document.getElementById('equationInput').value
    if(!str.length) return
    if(str.match(/(alert)|(>)|(<)|(\?)|(\!)|(&)|(@)|(eval)|(")|(`)|(')|(for)|(while)|(const)|(var)|(let)|(try)|(document)|(console)|(\{)|(\[)|(y)/gi)) return 

    func = parser(str)
    //clearCanvas('graphArea')
    lastStr = `${str}~${cPlayer}`
    drawv2(`${str}~${cPlayer}`, 'graphArea', player[`player${cPlayer}`].color, player[`player${cPlayer}`].lineW)      
    cPlayer = Number((!(cPlayer - 1))) + 1
}

function equate(k){
    var x = k
    try{
        var res = eval(func)
    }catch(err){
        return null
    }
    if(isNaN(res) || (!res && res != 0) || res == Infinity || res == -Infinity) return null;
    else return res
}

const cot = (x = 0) => {return 1/Math.tan(x)}
const log = (base = 10, x) => {return (x) ? (Math.log(x) / Math.log(base)) : (Math.log(base) / Math.log(10)) }

function parser(str){
    str = str = str.replace(/e(?!i)/gi, "Math.E")
    str = str.replace(/pi/gi, "Math.PI")
    str = str.replace(/sqrt/gi, "Math.sqrt")

    str = str.replace(/cos/gi, "Math.cos")
    str = str.replace(/sin/gi, "Math.sin")
    str = str.replace(/tan/gi, "Math.tan")

    str = str.replace(/abs/gi, "Math.abs")
    str = str.replace(/floor/gi, "Math.floor")
    str = str.replace(/ceil(ling)*/gi, "Math.ceil")
    str = str.replace(/sign/gi, "Math.sign")
    str = str.replace(/max/gi, "Math.max")
    str = str.replace(/min/gi, "Math.min")
    str = str.replace(/round/gi, "roundToNearestMultiple")


    str = str.replace(/pow/gi, "Math.pow")
    str = str.replace(/\^/gi, "**")
    str = str.replace(/lg/gi, "log")
    str = str.replace(/ln/gi, "Math.log")

    str = str.replace(/(Math\.)+/gi, "Math.")

    return str
}

async function animateLine(x1, y1, x2, y2, id, min_d, delay, starting_speed, acceleration, str, color, Lwidth, instant){
    if (instant){
        if (statis[`${str}`]) drawline(x1, y1, x2 , y2 , Lwidth, color, id)
        return starting_speed
    }
    var n = starting_speed 
    while(n < 10000){
        var diffx = x2 - x1
        var diffy = y2 - y1
        var d = Math.hypot(diffx, diffy)
        if(d <= min_d * n){
            await sleep(delay * 1/n * 1000)
            if (statis[`${str}`]) drawline(x1, y1, x2 , y2 , Lwidth, color, id)
            break
        }
        //times n to mimic sort of an acceleration
        var xtarget = (diffx * min_d * n) / d + x1
        var ytarget = (diffy * min_d * n) / d + y1

        if (statis[`${str}`]) drawline(x1, y1, xtarget, ytarget, Lwidth, color, id)
        x1 = xtarget
        y1 = ytarget
        n+=acceleration
        await sleep(delay * 1000)         
    }
    return n
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//unused code, switched to a data based collision detection
// //find 1st pixel below thats
// //1. different color than x0, y0 's color
// //2. not transparent
// function findBelow(id, x0, y0){
//     var ctx = document.getElementById(id).getContext("2d")
//     var olddata = ctx.getImageData(0, 0, 1, trueH).data.join('~')
//     var data = ctx.getImageData(x0, y0, 1, trueH).data
//     for(var i = 0; i <= data.length; i+=4){
//         var cPixel = [data[i], data[i + 1], data[i + 2], data[i + 3]]
//         if(cPixel[3] != 0 && cPixel.join("~") != olddata) {
//             console.log(`found pixel at ${i} with data ${cPixel.join("~")}, data length is ${data.length}`)
//             return i
//         }
//     }
//     return -1
// }


async function animateExplode(x, y, r, endr, id, delay, starting_speed, acceleration, str, color){
    var n = starting_speed
    var doneOuter = false 
    var innerRatio = .1   
    var innerAccel = .07
    while(n < 5000000){
        if (!doneOuter) {
            if(r >= endr){
                await sleep(delay * 1000)
                drawDot(x, y, endr, id, color, false)
                doneOuter = true
                continue
            }
            drawDot(x, y, r, id, color, false)
            r+=n
            n+=acceleration
            await sleep(delay * 1000) 
        }
        if(innerRatio >= 1) {
            await sleep(delay * 1000)
            drawDot(x, y, endr, id, `rgb(255, 0, 0)`, true)
            break
        }
        var innerR = innerRatio * r
        drawDot(x, y, innerR, id, `rgb(255, 0, 0)`, true)       
        innerRatio+=innerAccel
        await sleep(delay * 1000)         
    }
    return n
}

async function explode(x, y, id, color, str){
    await animateExplode(x, y, 0, 50, id, .03, 1, 1, str, color)
    // var k = Object.keys(player)
    // k.forEach(n => {
    //     player[n].data.forEach(o => {
    //         o = 1
    //         // o.forEach(i => {
    //         //     i = Math.hypot(i[0] - x, i[1] - y)
    //         // })
    //     })
    // })    
}


