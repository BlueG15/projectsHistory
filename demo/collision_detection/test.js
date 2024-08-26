
//we now implement 2 canvases, 1 for caching
//switching between the 2 will probably avoid having to redraw a bunch of lines

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
        //repurpose to "pick up" a nearby point
        //console.log('mouse detected: down')        
        var mouseButton = arr[event.buttons] || [];
        
        mouseX = event.clientX
        mouseY = event.clientY

        if(mouseButton.includes(1)){ 
            
            let index = -1;
            for(let i = 0; i < pointArr.length; i++){
                //type of i : [x, y]
                let k = pointArr[i];
                if(Math.hypot(k[0] - mouseX, k[1] - mouseY) <= globalDetectionRange){
                    //....slice that point out of the array?
                    //push to temporary canvas?
                    index = i;
                    break;
                }
            }
            if(index >= 0){
                //found some point
                tempPoint = pointArr.splice(index, 1);
                tempPointOriginalPos = index
                //redraw the canvas?
                //to get rid of the picked uo point
                drawAllDots(pointArr, "paint", true);
            }

            mdown = true
            //drawAllLines([[ 0, 0, mouseX, mouseY]], 'paint', false)
           
        } 
    })

    window.onmouseup = (event => {
        //draw all lines
        //ok, now to redirect this to draw points instead
        //('mouse detected: up')        
        var mouseButton = arr[event.buttons] || [];
        
        mouseX = event.clientX
        mouseY = event.clientY

        if(mdown == true){ 

            if(!tempPoint || !tempPointOriginalPos) pointArr.push([mouseX, mouseY]);
            else {
                pointArr.splice(tempPointOriginalPos, 0, tempPoint);
                tempPoint = undefined;
                tempPointOriginalPos = undefined;
            }
            clearCanvas("paint2");
            if(pointArr.length <= 3) drawAllDots(pointArr, "paint", true);
            else {
                drawAllLinesFromPointArr("paint", true);
                //ima keep the points drawn for the rounded corners
                drawAllDots(pointArr, "paint", false);
            }
            //i mean the intention is
            //clear the old canvas
            //draw all the points again
            log(pointArr) //<- why this dont activate
            //it got stuck?
            //paint2 is used as cache
            //paint2 is ontop of paint
            //paint is supposed to be draw to in the move event since it got refresh more
            //then move to paint to finalize
            mdown = false


        } 
    })


    window.onmousemove = (event => {
        //moves the temp point to the mouse location
        //console.log('mouse detected: move')        
        var mouseButton = arr[event.buttons] || [];
        const canvas = document.getElementById('paint');
        var data = canvas.getBoundingClientRect()

        //totally inconsistent namning scheme
        //past me is dum
        var mX = event.clientX
        var mY = event.clientY

        //document.getElementById('box').innerText = `data: ${JSON.stringify(data, null, 1)}` + `mx: ${mX}; my: ${mY}`
        if(mdown == true){
            tempPoint = [mX, mY];
            drawDot(tempPoint[0], tempPoint[1], globalDotSize + 5, "paint2", true);
        }
        
        globalLogValues.mousePos = [mX, mY]
        globalLogValues.mouseInPolygon = isPointInPolygon([mX, mY], pointArr);
        log();
    })
}

let globalDetectionRange = 13;
let globalDotSize = 15;
var startx = null
var starty = null
var lines = []
let tempPoint = undefined;
let tempPointOriginalPos = undefined
var pointArr = [] //totally useful definition right here
var mdown = false



let globalLogValues = {
    "mouseInPolygon" : false,
    "polygon-vertices": pointArr,
    "mousePos": []
}

function setStart(x, y) {
    startx = x
    starty = y
}

//the arr has the form of
//[[startx, starty, endx, endy], [...], [...]]
function drawAllLines(arr, id, clear) {
    const canvas = document.getElementById(id);
    var data = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d');
    if (clear) ctx.clearRect(data.top, data.left, data.width, data.height)

    ctx.lineWidth = globalDotSize
    ctx.strokeStyle = `rgb(173, 216, 230)`
    ctx.beginPath();
    arr.forEach(i => {
        ctx.moveTo(Math.round(i[0]), Math.round(i[1]));
        ctx.lineTo(Math.round(i[2]), Math.round(i[3]));
        ctx.stroke()
        
        console.log(`supposedly drawn line from [${i[0]}, ${i[1]}] to [${i[2]}, ${i[3]}]`)
        if(id == 'paint') document.getElementById('box').innerText = document.getElementById('box').innerText + `\ndrawn line from [${i[0]}, ${i[1]}] to [${i[2]}, ${i[3]}]`
    })                 
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

//arr has teh form [[x, y], [x, y], ...]
function drawAllDots(arr, id, clear){
    if(clear) clearCanvas(id);
    arr.forEach(i => {
        drawDot(i[0], i[1], globalDotSize, id, false); 
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

function isPointInPolygon(point, polygonPoints){


    let linesPassedArr = [];
    //obvious case;
    let topHalfCount = 0;
    let bottomHalfCount = 0;
    let leftHalfCount = 0;
    let rightHalfCount = 0;

    for(let i = 0; i < polygonPoints.length; i++){
        let v = polygonPoints[i];
        if(v[1] >= point[1]) topHalfCount++;
        else bottomHalfCount++;

        if(v[0] >= point[0]) rightHalfCount++;
        else leftHalfCount++;
        if(
            rightHalfCount > 0 &&
            leftHalfCount > 0 &&
            topHalfCount > 0 &&
            bottomHalfCount > 0 
        ) break;
    }

    if(
        rightHalfCount == 0 ||
        leftHalfCount == 0 ||
        topHalfCount == 0 ||
        bottomHalfCount == 0 
    ) return false;
    //end of obvious case

    let started = false;
    for(let l = 0; l < polygonPoints.length; l++){
        let currentX = polygonPoints[l][0];
        let currentY = polygonPoints[l][1];

        let nextPos = (l + 1) % polygonPoints.length
        let nextX = polygonPoints[nextPos][0];
        let nextY = polygonPoints[nextPos][1];

        // if(nextX < point[0] && currentX < point[0]) {
        //     if(!started) continue;
        //     else break;
        // }
        // started = true;

        let passRegion = false;
        if(currentY <= point[1] && nextY >= point[1]) passRegion = true;
        if(currentY >= point[1] && nextY <= point[1]) passRegion = true;

        if(passRegion){
            //region switch
            if(currentX < point[0] && nextX < point[0]) continue
            if(currentX >= point[0] && nextX >= point[0]){
                linesPassedArr.push(JSON.stringify([l, nextPos]));
                continue;
            }
            //we get to case 1 behind and 1 in front
            //if the two vectors draw from the point to current and next point
            //forms an angle less than 180 deg clockwise
            //linesPassed +1

            let vec1 = [currentX - point[0], currentY - point[1]];
            let vec2 = [nextX - point[0], nextY - point[1]];

            //console.log(`vec1 : ${vec1}, vec2: ${vec2}`)

            let angle = (currentY >= nextY) ? getDegClockwise2d(vec1, vec2) : getDegClockwise2d(vec2, vec1)
            //console.log(angle)
            if(angle <= 0) {
                linesPassedArr.push(JSON.stringify([l, nextPos]));
            }
        }
    }

    linesPassedArr = mergeAndRemoveDuplicates(linesPassedArr);
    globalLogValues.linesPassed = linesPassedArr.length;
    globalLogValues.linesPassedArr = linesPassedArr
    return (linesPassedArr.length % 2 == 1);
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
    //let a = document.getElementById("box").innerHTML
    document.getElementById("box").innerHTML = JSON.stringify(globalLogValues, null, 4);
}