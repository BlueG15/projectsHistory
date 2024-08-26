const scalingF = 2; //scales the canvas so 1 pixel canvas space is very damn big screen space
var func = "return null" //stores the function string, removes repeated validation

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
}


function drawDot(x, y, radius, id, clear) {
    const canvas = document.getElementById(id);
    var data = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (clear) ctx.clearRect(data.top, data.left, data.width, data.height);
  
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgb(173, 216, 230)`;
    ctx.fillStyle = `rgb(173, 216, 230)`;
    ctx.beginPath();
  
    ctx.moveTo(Math.round(x + radius), Math.round(y));
    ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
    ctx.stroke();
    ctx.fill();
}
  
function drawbox(x, y, width, height, color, id, clear) {
    const canvas = document.getElementById(id);
    var data = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (clear) ctx.clearRect(data.top, data.left, data.width, data.height);
  
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
    var data = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (clear) ctx.clearRect(data.top, data.left, data.width, data.height);
  
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
async function drawAllLines(arr, id, clear) {
    const canvas = document.getElementById(id);
    var data = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d');
    if (clear) ctx.clearRect(data.top, data.left, data.width, data.height)

    ctx.lineWidth = 1
    ctx.strokeStyle = `rgb(173, 216, 230)`
    ctx.beginPath();
    
    var speed = 1
    for(var i = 0; i < arr.length-1; i++) {
        if(Math.abs(arr[i][1] - arr[i+1][1]) >= 0.4*canvas.height) continue
        // ctx.moveTo(arr[i][0], arr[i][1]);
        // ctx.lineTo(arr[i+1][0], arr[i+1][1]);
        // ctx.stroke()
        speed = await animateLine(arr[i][0], arr[i][1], arr[i+1][0], arr[i+1][1], 'graphArea', 1, .03, speed, .05)
        speed = Math.max(speed, 3)
        //console.log(`supposedly drawn line from [${i[0]}, ${i[1]}] to [${i[2]}, ${i[3]}]`)
        //if(id == 'paint') document.getElementById('box').innerText = document.getElementById('box').innerText + `\ndrawn line from [${i[0]}, ${i[1]}] to [${i[2]}, ${i[3]}]`
    }    
}
  
function clearCanvas(id) {
    const canvas = document.getElementById(id);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);   
}

function draw(id, diff){
    const canvas = document.getElementById(id);
    var x = Number(document.getElementById('xinput').value)
    var y = Number(document.getElementById('yinput').value)
    var diff = (diff) ? diff : .03
    if(isNaN(x) || isNaN(y)) return
    drawbox(x, y, 1, 1, `rgb(255, 0, 0)`, id, false)

    var xoffset = -x
    var yoffset = -y

    for(var i = 0; i <= canvas.width + diff; i+=diff ){
        var tempdata = canvasToGraphCoor(i, 0, xoffset, yoffset)
        var tempx = tempdata.x
        var tempres = equate(tempx)
        if((!tempres && tempres != 0) || isNaN(tempres)) {
            continue
        }
        var tempy = graphToCanvasCoor(0, tempres, xoffset, yoffset).y
        if(tempy > canvas.height || tempy < 0) {
            continue
        }
        drawbox(i, tempy, 1, 1, `rgb(0, 255, 0)`, id, false)      
    }
}

//draw lines instead of squares

function drawv2(id, diff){
    var already = []
    const canvas = document.getElementById(id);
    var x = document.getElementById('xinput').value
    var y = document.getElementById('yinput').value
    if(!x.length) x = 140;
    else x = Number(x);
    if(!y.length) y = 150;
    else y = Number(y);
    var diff = (diff) ? diff : .03
    if(isNaN(x) || isNaN(y)) return
    drawbox(x, y, 1, 1, `rgb(255, 0, 0)`, id, false)

    var xoffset = -x
    var yoffset = -y

    for(var i = 0; i <= canvas.width; i+=diff ){
        var tempdata = canvasToGraphCoor(i, 0, xoffset, yoffset)
        var tempx = tempdata.x
        var tempres = equate(tempx)
        if((!tempres && tempres != 0) || isNaN(tempres)) {
            continue
        }
        var tempy = graphToCanvasCoor(0, tempres, xoffset, yoffset).y
        // if(tempy > canvas.height || tempy < 0) {
        //     continue
        // }
        already.push([i, tempy])      
    }
    
    //these 2 lines draw the axis
    drawline(x, 0, x, canvas.height, 1, `rgb(255, 0, 0)`, 'graphArea', false)
    drawline(0, y, canvas.width, y, 1, `rgb(255, 0, 0)`, 'graphArea', false)

    drawAllLines(already, 'graphArea', false)
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

const scalex = 30
const scaley = 30

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

function roundToNearestMultiple(x, multiple){
    return Math.round(x/multiple)
}

function distance(x, y){
    return Math.sqrt(x*x + y*y)
}

//old alogrithm
//pick a square, repeatedly moves in the most beneficial direction, doesnt even work
// var offset = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]]

//     //id:
//     //[0][1][2]
//     //[3][x][4]
//     //[5][6][7]
//     for(var l = 0; l <= 100; l++){
//         var res = []
//         offset.forEach((i, index) => {
//             var available = 1
//             var a = equate(x + i[0], y + i[1])
//             var temp = `${x + i[0]}, ${y + i[1]}`
//             if(already.includes(temp)) available = .5
//             if(x + i[0] < 0 || y + i[1] < 0 || x + i[0] > canvas.width || y + i[1] > canvas.height) available = .5
//             res.push([a, available, x + i[0], y + i[1], temp])
//         })
//         res = res.sort((a, b) => {return a[0]-b[0]})
//         res.filter(i => {return i[1] == 0})
//         var count = 0
//         if(res[0][1] == .5) {
//             count++
//             already.push(res[0][4])
//         } else {
//             var c = (res[0][0] <= maxdy) ? `rgb(0, 255, 0)` : `rgb(255, 0, 0)`
//             drawbox(res[0][2], res[0][3], 1, 1, c, id, false)
//             x = res[0][2]
//             y = res[0][3]
//             already.push(res[0][4])
//             continue
//         }
//         if(res[1][1] == .5) {
//             count++
//             already.push(res[1][4])
//         } else {
//             var c = (res[1][0] <= maxdy) ? `rgb(0, 255, 0)` : `rgb(255, 0, 0)`
//             drawbox(res[1][2], res[1][3], 1, 1, c, id, false)
//             x = res[1][2]
//             y = res[1][3]
//             already.push(res[1][4])
//             continue
//         }
//         if(count == 2) console.log('done 1 side')
//         //note to self: check the last and 1st entry of the already array now, if both are out of bounds, gud; if not, bein searching again at the one that isnt out of bounds
//         return
//     }
function updateFunction(){
    var str = document.getElementById('equationInput').value
    if(!str.length) return
    if(str.match(/(alert)|(>)|(<)|(\?)|(\!)|(&)|(@)|(eval)|(")|(`)|(')|(for)|(while)|(const)|(var)|(let)|(try)|(document)|(console)|(\{)|(\[)|(y)/gi)) return 

    func = parser(str)
    clearCanvas('graphArea')
    drawv2('graphArea', 5)
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
    str = str.replace(/round/gi, "Math.round")
    str = str.replace(/random/gi, "Math.random")


    str = str.replace(/pow/gi, "Math.pow")
    str = str.replace(/\^/gi, "**")
    str = str.replace(/lg/gi, "log")
    str = str.replace(/ln/gi, "Math.log")

    str = str.replace(/(Math\.)+/gi, "Math.")

    return str
}

async function animateLine(x1, y1, x2, y2, id, min_d, delay, starting_speed, acceleration){
    var diff = (diff) ? diff : 1
    var n = starting_speed 
    while(n < 10000){
        var diffx = x2 - x1
        var diffy = y2 - y1
        var d = Math.hypot(diffx, diffy)
        if(d <= min_d * n){
            drawline(x1, y1, x2 , y2 , 1, `rgb(0, 255, 0)`, 'graphArea')
            break
        }
        //times n to mimic sort of an acceleration
        var xtarget = (diffx * min_d * n) / d + x1
        var ytarget = (diffy * min_d * n) / d + y1

        drawline(x1, y1, xtarget, ytarget, 1, `rgb(0, 255, 0)`, 'graphArea')
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