
//we now implement 2 canvases, 1 for caching
//switching between the 2 will probably avoid having to redraw a bunch of lines

let defaultLineThiccness = 3;
let toUpdate = [];

//update from left to right, big to small

function init() {

    //the shit below removes blurry lines by scaling the canvas to the device pixel ratio
    //so thats the reason for the 3.333333
    // Get the DPR and size of the canvas
    const dpr = window.devicePixelRatio;
    var temp = document.getElementsByClassName('pain')
    for(var i = 0; i < temp.length; i++){
        const rect = temp[i].getBoundingClientRect();

        // Set the "actual" size of the canvas
        temp[i].width = rect.width * dpr;
        temp[i].height = rect.height * dpr;
        const ctx = temp[i].getContext('2d');
        // Scale the context to ensure correct drawing operations
        ctx.scale(dpr, dpr);

        // Set the "drawn" size of the canvas
        temp[i].style.width = `${rect.width}px`;
        temp[i].style.height = `${rect.height}px`;
    }
    


    const arr = [0, [1], [2], [1, 2], [4], [1, 4], [2, 4], [1, 2, 4]];
    window.onmousedown = (event => {   
        var mouseButton = arr[event.buttons] || [];
        
        mX = event.clientX
        mY = event.clientY

        if(mouseButton.includes(1)){ 
            toUpdate.push(new box(mX, mY, rng(5, 300), rng(5, 150), generateColorString(rng(255, 0, true), rng(255, 0, true), rng(255, 0, true), rng(1, 0, true))))
        }
    })

    setInterval(redrawAllBox, 1000/30)
}

function redrawAllBox(){
    clearCanvas("paint");
    toUpdate.forEach(i => {
        i.move();
        i.drawSelf();
    })
}

class box {
    constructor(x, y, w, h, color){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;

        this.velocity = [rng(-10, 10, true), rng(-10, 10, true)];
    }

    drawSelf(){
        defaultLineThiccness = rng(5, 20);
        drawBox([this.x, this.y], this.w, this.h, "paint", false, this.color);
    }

    move(){
        let newX = this.x + this.velocity[0];
        let newY = this.y + this.velocity[1];
        if(newX - this.w/2 < 0) {newX = this.w/2; this.velocity[0] *= -1};
        if(newY - this.h/2 < 0) {newY = this.h/2; this.velocity[1] *= -1};
        if(newX + this.w/2 > window.visualViewport.width) {newX = window.visualViewport.width - this.w/2; this.velocity[0] *= -1};
        if(newY + this.h/2 > window.visualViewport.height) {newY = window.visualViewport.height - this.h/2; this.velocity[1] *= -1};

        this.x = newX;
        this.y = newY;
    }
}

function generateColorString(r, g, b, a){
    if(a){
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    } else {
        return `rgb(${r}, ${g}, ${b})`;
    }
}

function drawBox(center, width, height, id, clear, color){
    //width and height is inner measurement, not accounting for the lineWidth
    if (clear) clearCanvas(id);
    const p1 = [center[0] - width/2, center[1] - height/2];
    const p2 = [center[0] + width/2, center[1] - height/2];
    const p3 = [center[0] + width/2, center[1] + height/2];
    const p4 = [center[0] - width/2, center[1] + height/2];

    const arr = [
        [p1[0], p1[1], p2[0], p2[1]],
        [p2[0], p2[1], p3[0], p3[1]],
        [p3[0], p3[1], p4[0], p4[1]],
        [p4[0], p4[1], p1[0], p1[1]]
    ]

    drawAllLines(arr, id, false, color);
    drawAllDots([p1, p2, p3, p4], id, false, color);
}

//the arr has the form of
//[[startx, starty, endx, endy], [...], [...]]
function drawAllLines(arr, id, clear, color) {
    const canvas = document.getElementById(id);
    var data = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d');
    if (clear) ctx.clearRect(data.top, data.left, data.width, data.height)

    ctx.lineWidth = defaultLineThiccness
    ctx.strokeStyle = color
    ctx.beginPath();
    arr.forEach(i => {
        ctx.moveTo(Math.round(i[0]), Math.round(i[1]));
        ctx.lineTo(Math.round(i[2]), Math.round(i[3]));
        ctx.stroke()
        
        //console.log(`supposedly drawn line from [${i[0]}, ${i[1]}] to [${i[2]}, ${i[3]}]`)
        //if(id == 'paint') document.getElementById('box').innerText = document.getElementById('box').innerText + `\ndrawn line from [${i[0]}, ${i[1]}] to [${i[2]}, ${i[3]}]`
    })                 
}

function drawDot(x, y, radius, id, clear, color) {
    const canvas = document.getElementById(id);
    var data = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (clear) ctx.clearRect(data.top, data.left, data.width, data.height);

    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.beginPath();

    ctx.moveTo(Math.round(x + radius), Math.round(y));
    ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
    ctx.stroke();
    ctx.fill();
}

//arr has teh form [[x, y], [x, y], ...]
function drawAllDots(arr, id, clear, color){
    if(clear) clearCanvas(id);
    arr.forEach(i => {
        drawDot(i[0], i[1], defaultLineThiccness / 2, id, false, color); 
    })
}

function drawAllLinesFromPointArr(id, clear){
    //[[startx, starty, endx, endy], [...], [...]]
    if(clear) clearCanvas(id);
    let res = [];
    for(let i = 0; i < pointArr.length; i++){
        let nextPos = ((i + 1) >= pointArr.length) ? 0 : i + 1
        res.push([pointArr[i][0], pointArr[i][1], pointArr[nextPos][0], pointArr[nextPos][1]]);
    }
    drawAllLines(res, id, false)
}

//?? clear isnt a function?
function clearCanvas(id){
    const canvas = document.getElementById(id);
    var data = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d');
    ctx.clearRect(data.top, data.left, data.width, data.height)
}

function degBetween2Vector(vec1, vec2){ //unsigned always possitive
    var a = radToDeg(Math.acos(dotProduct(vec1, vec2) / (Math.hypot(...vec1) * Math.hypot(...vec2))))
    if(isNaN(a)) return 0
    return a
}

function dotProduct (vec1, vec2){
    return (vec1[0] * vec2[0]) + (vec1[1] * vec2[1]) 
}

function crossProduct (vec1, vec2){
    return [(vec1[1] * vec2[2]) - (vec1[2] * vec2[1]), (vec1[2] * vec2[0]) - (vec1[0] * vec2[2]), (vec1[0] * vec2[1]) - (vec1[1] * vec2[0])]
}

function determinant (vec1, vec2){
    //2d only
    return vec1[0]*vec2[1] - vec1[1]*vec2[0]
}

function radToDeg(x){
    return x * (180 / Math.PI)
}

function degToRad(deg){
    return (Math.PI/180) * deg
}

function getDegClockwise2d(vec1, vec2){
    return Math.atan2(determinant(vec1, vec2), dotProduct(vec1, vec2));
}

function mergeAndRemoveDuplicates(...arrays) {
    // Merge all arrays into one using the spread operator
    const mergedArray = [].concat(...arrays);
    
    // Remove duplicates by converting to a Set and back to an array
    return [...new Set(mergedArray)];
}

function log(str){
    console.log(str);
}

function rng(max, min, round){
    return (round) ? Math.round(Math.random() * (max - min) + min) : Math.random() * (max - min) + min
}