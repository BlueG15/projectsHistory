//like test but this one has multiple waves implementation
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
        if(!data[0]) data[0] = []
        data[0][pos] = {
            'x' : temp.x,
            'y' : temp.y
        }
    }
    return 
}

function calTarget (x, t, damper, desiredY, startpos, dropoff, a, limiter){
    //var sx = startpos.x
    //var sy = startpos.y

    if (dropoff(a(x, t, damper, desiredY), limiter) == 0) return 1;
    else return a(x, t, damper, desiredY) //+ sy
}

function calForce(index, center, mousepos){
    
    
    //stretch here sets public value
    try{
        var stretch = (stretchMul * Math.abs(data[0][center.cindex + 1].x - data[0][center.cindex].x))
    }catch(err){
        var stretch = (stretchMul * Math.abs(data[0][center.cindex].x - data[0][center.cindex - 1].x))
    }
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

        var target = calTarget ((x - center.cx)/(stretch + t * damper2), 1, damper, my - center.cy, temp, dropoff, a, limiter)
        var res = {
            'startpos' : temp,
            'mousepos' : mousepos,
            'center' : center,
            'target' : target,
            'lastTarget' : null,
            'active' : true,
            'debugx' : (x - center.cx)/stretch,
            'stretch' : stretch,
            'debugx2' : x - center.cx,
            't' : t[index],
            'pos' : data[0][pos]

        }
        propertyArray[pos] = res

    }
    return propertyArray
}

function applyForce(){
    for (let index = 1; index < running.length; index++) {
    if(!running[index]) continue
	if(!t[running[index]]) t[running[index]] = 1
		t[running[index]] += deltaT
		    //console.log(`loop ${running[index]} initiated`)
		    var objects = document.getElementsByClassName(classname)
		    if (!objects) {
		        console.log('no objects found')
		        return null;
		    }
		
            var count = 0
		    for (pos = 0; pos < objects.length; pos++) {
		        if (data[running[index]][pos]['active']) {
		            var property = data[running[index]][pos]
		            if (property.target == property.lastTarget) {
		                property.active = false
		                //document.getElementsByClassName(classname)[pos].style.transform = `translateY(0px)`
		                continue
		            }
	                //document.getElementsByClassName(classname)[pos].style.transform = `translateY(${property.target}px)`
		            var newtarget = calTarget((data[running[index]][pos].startpos.x - data[running[index]][pos].center.cx) / (data[running[index]][pos].stretch + t[running[index]] * damper2), t[running[index]], damper, data[running[index]][pos].mousepos.y - data[running[index]][pos].center.cy, data[running[index]][pos].startpos, dropoff, a, limiter)
		            //console.log(`new target for pos ${pos} = 2, ${t}, ${damper}, ${data[running[index]][pos].mousepos.y -data[running[index]][pos].center.cy}, ${dropoff}, ${limiter}}, `)
		            //console.log(newtarget)
                    
                    property.lastTarget = property.target
                    property.target = newtarget
		            data[running[index]][pos] = property
		        } else count++
		    }
            if (count == data[running[index]].length) {
                console.log(`everything in wave ${running[index]} settled`)
                running[index] = undefined
                t[index] = 1
                data[index] = {}
            }
        }
        

        var count = 0
        var all = 0
        var force = []
        for(var index = 1; index < running.length; index++){
            if(!running[index]) continue
            for(var i = 0; i< data[running[index]].length; i++){
                all++
                if(!data[running[index]][i].active) {
                    count ++
                    continue
                }
                if(!force[i]) force[i] = 0
                force[i] = force[i] + data[running[index]][i]['lastTarget']
                //console.log(data[running[index]][i]['lastTarget'])
            }
        }
        //console.log(force)
        for(var i = 0; i< force.length; i++){
            if(!force[i]) continue
            document.getElementsByClassName(classname)[i].style.transform = `translateY(${force[i]}px)`
        }

		if (count == all) {
		    console.log(`everything has settled`)
            clearInterval(timer)
            timer = null
		    running = [0]
		    t = []
		    data = {}
		}


}


function init() {
    calData(classname)
    window.onmousedown = (event => {
        const arr = [0, [1], [2], [1, 2], [4], [1, 4], [2, 4], [1, 2, 4]];
        var mouseButton = arr[event.buttons] || [];
        
        mouseX = event.clientX
        mouseY = event.clientY

         var mousepos = {
             'x' : mouseX,
             'y' : mouseY
         }
        if(mouseButton.includes(1)){  
            console.log('mouse detected : down')          
                var center = getCenterPos(classname, mouseX)
                console.log(`new center = ${JSON.stringify(center)}`)
                var free = findFreeIndex(running)
                console.log(`free index : ${free}`)
                //running[n +1] = free
                //n++
                running[free] = free
                calData(classname)
                data[free] = calForce(free, center, mousepos)
                if(!timer){
                    timer = setInterval(function() {applyForce()},timeStep)
                }
        }        
    })
      
}

function findFreeIndex(arr){
    var i = 1;
    while(true){
        if(!arr[i]) return i;
        else i++
    }
}

//global values

let timer = null
let data = []
//var running = []
var running = [0] // saves indexes of the data of the waves that are running
var classname = 'node'
var damper = 1 // how fast speed decrease over time 
var damper2 = 5 // how fast wave expand over time
var limiter = (damper2 == 0) ? 0.2 : (1/damper2 * 0.2) // if the change is below this, it is 0
var deltaT = 0.2 // the increment of t each interval
var timeStep = 20 // the interval time
var t = []
var stretchMul = 10 // how many nodes are affected by 2 sides of the center node


//maybe add changing colro based on height