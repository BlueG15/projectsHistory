//turn mouse pos into the nearest node
function getCenterPos(classname, mousex){
    console.log(`mouseX : ${mousex}`)
    var min = Infinity
    currentx = 0
    currenty = 0
    currentIndex = -1
    var objects = document.getElementsByClassName(classname)
    if (!objects) {
        console.log('no objects found')
        return null;
    }

    for(pos = 0; pos < objects.length; pos++) {
        var data = objects[pos].getBoundingClientRect()
        var a = Math.abs(data.x - mousex)
        if(a <= min){
            min = a
            currentIndex = pos
            currentx = data.x
            currenty = data.y
        }
    }

    var temp = {
        'cindex' : currentIndex,
        'cx' : currentx,
        'cy' : currenty,
    }
    console.log(`temp : ${JSON.stringify(temp)}`)
    return temp
}

function w(x) {return (((Math.pow(x, 2) * -1) / (Math.pow(x, 2) + 1)) + 1) * 3} //modified sigmoid function
//w is a modified sigmoid function
function g(x, t, damper) {return Math.cos(w(x) * t) * (1/ (Math.pow(t, damper)))} //decaying motion function
//g is decaying motion function
function a(x, t, damper, desiredY) {
    var m = desiredY / (Math.pow(w(0), 2) * g(0, 1, damper))
    return Math.pow(w(x), 2) * g(x, t, damper) * m
}

function dropoff(x, limiter) {
    if (!x) return 0
    if(Math.abs(x) < limiter) return 0; else return x;
}

function calData(classname){
    var objects = document.getElementsByClassName(classname)
    if (!objects) return null;

    for(pos = 0; pos < objects.length; pos++)  {
        var node = objects[pos]
        var temp = node.getBoundingClientRect()
        data[pos] = {
            'x' : temp.x,
            'y' : temp.y
        }
    }
    return 
}

function calTarget (x, t, damper, desiredY, startpos, dropoff, a, limiter){
    //var sx = startpos.x
    //var sy = startpos.y

    if (dropoff(a(x, t, damper, desiredY), limiter) == 0) return 0;
    else return a(x, t, damper, desiredY) //+ sy
}

function calForce(classname, dropoff, center, mousepos, a, damper, limiter){
    stretch = (stretch * Math.abs(data[center.cindex].x - data[center.cindex - 1].x)) || (stretch * Math.abs(data[center.cindex + 1].x - data[center.cindex].x))
    console.log(`stretch : ${stretch}`)

    var objects = document.getElementsByClassName(classname)
    if (!objects) return null;

    var propertyArray = new Array(objects.length).fill({})
    for(pos = 0; pos < objects.length; pos++)  {
        var node = objects[pos]
        var temp = node.getBoundingClientRect()
        temp = (pos == center.cindex) ? {'x' : center.cx, 'y' : center.cy} : {'x' : temp.x, 'y' : temp.y} 
        
        var x = temp.x 
        //var y = temp.y

        //var mx = mousepos.x
        var my = mousepos.y

        var target = calTarget ((x - center.cx)/stretch, 1, damper, my - center.cy, temp, dropoff, a, limiter)
        var res = {
            'startpos' : temp,
            'mousepos' : mousepos,
            'center' : center,
            'target' : target,
            'lastTarget' : 0,
            'active' : true,
            'debugx' : (x - center.cx)/stretch,
            'stretch' : stretch,
            'debugx2' : x - center.cx,
            't' : t

        }
        propertyArray[pos] = res

    }
    return propertyArray
}

function applyForce(classname, timer, damper, dropoff, deltaT, a, limiter){
    t += deltaT
    console.log('loop initiated')
    var objects = document.getElementsByClassName(classname)
    if (!objects) {
        console.log('no objects found')
        return null;
    }

    for(pos = 0; pos < objects.length; pos++) {
        if(data[pos]['active']) {
            var property = data[pos]
            if(property.target == property.lastTarget){
                property.active = false
                document.getElementsByClassName(classname)[pos].style.transform = `translateY(0px)`
                continue
            }
            document.getElementsByClassName(classname)[pos].style.transform = `translateY(${property.target}px)`
            var newtarget = calTarget ((data[pos].startpos.x - data[pos].center.cx)/stretch, t, damper, data[pos].mousepos.y - data[pos].center.cy, data[pos].startpos, dropoff, a, limiter)
            //console.log(`new target for pos ${pos} = ${(data[pos].startpos.x - data[pos].center.cx)/stretch}, ${t}, ${damper}, ${data[pos].mousepos.y}, ${dropoff}, ${limiter}}, `)
            property.target = newtarget
            data[pos] = property
        }        
    }

    var count = 0
        data.forEach(i => {
            if (!i.active) count ++
        })
        if(count == data.length){
            console.log('everything has settled')
            clearInterval(timer)
            running = false
            t = 1
            data = {}
            lastMbutton = []
            mousepos = {}
            centerpos = {}
            stretch = 1
        }
}


function init() {
    
    window.onmousedown = (event => {
        const arr = [0, [1], [2], [1, 2], [4], [1, 4], [2, 4], [1, 2, 4]];
        var mouseButton = arr[event.buttons] || [];
        lastMbutton = mouseButton
        
        mouseX = event.clientX
        mouseY = event.clientY

        mousepos = {
            'x' : mouseX,
            'y' : mouseY
        }
        if(lastMbutton.includes(1)){  
            console.log('mouse detected : down')          
            if(!running){
                var center = getCenterPos(classname, mouseX)
                console.log(`center = ${JSON.stringify(center)}`)
                calData(classname)
                data = calForce(classname, dropoff, center, mousepos, a, stretch, damper, limiter)

                applyForce(classname, timer, damper, dropoff, deltaT, a, limiter)
                timer = setInterval(function() {applyForce(classname, timer, damper, dropoff, deltaT, a, limiter)},timeStep)
                running = true
            } else {
                console.log('already running, no more run')
            }
        }        
    })
    
}

//global values

let timer = null
let data = {}
var running = false
var classname = 'node'
var damper = 2/3
var limiter = 0.8
var deltaT = 0.1
var timeStep = 50
var t = 1
var stretch = 1
var lastMbutton = []
var mousepos = {}
var centerpos = {}
