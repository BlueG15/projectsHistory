//the highest points of the wave function, 40 entries (dont change if strength muliplier change (k))
//i planed to not calculate based on the actual position of the nodes but rather
//choosing 1 as the center and use the preset locations instead
//more pronounced result
//if require more than 40 entries, can estimate very fucking close using pi/2 + k*pi where k is the needed index (cos(x) = 0)
//const preset = [-61.245,-58.102,-54.96,-51.817,-48.674,-45.531,-42.388,-39.244,-36.101,-32.956,-29.812,-26.666,-23.519,-20.371,-17.221,-14.066,-10.904,-7.726,-4.515,-1.385,1.385,4.515,7.726,10.904,14.066,17.221,20.371,23.519,26.666,29.812,32.956,36.101,39.244,42.388,45.531,48.674,51.817,54.96,58.102,61.245]


//turn mouse pos into the nearest node
function getCenterPos(classname, mousex){
    console.log(`mouseX : ${mousex}`)
    var min = Infinity
    currentx = 0
    currenty = 0
    currentIndex = -1
    var objects = getTarget(classname)
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

    return {
        'cindex' : currentIndex,
        'cx' : currentx,
        'cy' : currenty,
    }
}


//target is y
function calTarget (maxpos, pos, indexzero, dropoff, strength, multiplier){
    
    if(pos == indexzero){
        return dropoff(wave(preset[21], strength, multiplier))
    } else {
        //return dropoff(wave(preset[pos - indexzero + 21] * (pos-indexzero)/10 , strength, multiplier))
        if(pos < indexzero){
            return dropoff(strength, multiplier)
        }
        
    }
    
    
}

//these 3 are functions so that it can be replaced

//yes this function is just a simplified sigmoid function
function strength(x, multiplier) {
    
    return ((Math.pow(x, 2) / (1 + Math.pow(x, 2)) * -1) + 1) * multiplier
}

//if the calaculated pos is less than m then it returns 0
function dropoff(x) {
    if (!x) return 0
    var m = 0.65;
    if(Math.abs(x) < m) return 0; else return x;
}

//the wave function
//mousex should be startx as in the start center of the wave but ehhh
function wave(stronk, multiplier){
    
     if (x == 0) return 0 ; 
     return Math.sin(x) * stronk(x, multiplier) * (1/(x)) 
}

function getTarget(classname) {
    return document.getElementsByClassName(classname)
}

//smooth will dictate how many frames to finish the animation
function calForce(classname, dropoff, strength, smooth, mousey, indexzero){
    var objects = getTarget(classname)
    if (!objects) return null;

    var propertyArray = new Array(objects.length).fill({})
    for(pos = 0; pos < objects.length; pos++)  {
        var node = objects[pos]
        var data = node.getBoundingClientRect()
        var x = data.x 
        var y = data.y
        var multiplier =  1 / Math.abs(y - mousey) || 1.2

        var target = calTarget(objects.length, pos, indexzero, dropoff, strength, multiplier)
        //distance per step (assume movement is linear)
        var step = Math.round(smooth)
        var disPerStep = target / step
        var res = {
            'x' : x,
            'y' : y,
            'target' : target + y,
            'step' : step,
            'disPerStep' : disPerStep,
            'lastDis' : 0,
            'active' : true
        }
        propertyArray[pos] = res

    }
    return propertyArray
}

//starts an short term interval to animate
//damper is the ammount of force lost upon repeated call
//assume linear movement
function applyForce(classname, data, timer, damper, dropoff){
    console.log('loop initiated')
    var objects = getTarget(classname)
    if (!objects) {
        console.log('no objects found')
        return null;
    }

    for(pos = 0; pos < objects.length; pos++) {
        var node = objects[pos]
        if(data[pos]['active']) {
            //console.log(`${pos} active`)
            var update = node.getBoundingClientRect()
            var x = update.x
            var y = update.y
            var property = data[pos]
            property['x'] = x
            property['y'] = y
            //dis here is distance per step
            var dis = property['disPerStep']
            var target = property['target']
            if(Math.abs(y + dis) >= Math.abs(target) ) {
                console.log('safety belt triggered')
                document.getElementsByClassName(classname)[pos].style.transform = `translateY(${target}px)`
                
                if(dropoff(target) == 0 || Math.abs(target) < damper) {
                    document.getElementsByClassName(classname)[pos].style.transform = `translateY(0px)`
                    property['active'] = false
                    console.log(`node no ${pos} has settled`)
                } else {
                    var target = property['target']*-1*damper
                }
                property['target'] = target
                property['disPerStep'] = (target - y) / property['step']
            } else {
                document.getElementsByClassName(classname)[pos].style.transform = `translateY(${y-dis}px)`
            } 
                property['lastDis'] = dis
                data[pos] = property
            
        }
        var count = 0
        data.forEach(i => {
            if (!i.active || (i.disPerStep == 0 && i.lastDis == 0)) count ++
        })
        if(count == data.length){
            console.log('everything has settled')
            clearInterval(timer)
            running = false
        }
    }


}


var classname = 'node'
//see the wave function to see which uses where
//restricter is used for the power of t so it might be easier
var damper = 0.3
var restricter = 1/3
var t = 0
var smooth = 40

var data = []
var timer = 0

var mouseX = 0
var mouseY = 0
var indexzero = -1
//used to prevent applying multiple calculations at once
var running = false
function init() {window.onmousedown = (event => {
        const arr = [0, [1], [2], [1, 2], [4], [1, 4], [2, 4], [1, 2, 4]];
        var mouseButton = arr[event.buttons] || [];
        mouseX = event.clientX
        mouseY = event.clientY

        if(mouseButton.includes(1)){
            console.log('mouse detected')
            if(!running){
                indexzero = getCenterPos(classname, mouseX)
                console.log(`index zero = ${indexzero}`)
                data = calForce(classname, dropoff, strength, smooth, mouseY, indexzero)
                timer = setInterval(function() {applyForce(classname, data, timer, damper, dropoff)},70)
                running = true
            }else console.log('still running')
            
        }
        
    })
}
//var data = calForce(classname, dropoff, strength, smooth)
//var timer = setInterval(function() {applyForce(classname, timer, damper, dropoff)}, 1000)

