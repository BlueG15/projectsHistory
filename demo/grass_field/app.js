const grassNumber = 580
const affectRadius = 100
var grassArr = []

var prevMx = 0
var prevMy = 0

function init(){
    const width = window.visualViewport.width
    const height = window.visualViewport.height

    var a = ""
    for(var i = 0; i < grassNumber; i++){
        var x = rng(width + 25, -1, false)
        var y = rng(height + 25, -1, false)
        var id = `${x}:${y}`
        grassArr.push(id)
        a += `<div id = "${id}" style = "top: ${y}px; left: ${x}px" class = "grass"></div>`
    }

    document.getElementById("field").innerHTML = a

    var grassList = document.getElementsByClassName("grass")
    for(var i = 0; i < grassList.length; i++){
        var rot = rng(30, -30, false)
        grassList[i].style.setProperty('--rot', rot + 'deg');
        grassList[i].style.setProperty('--rot2', rot + 20 + 'deg');
        grassList[i].style.setProperty('--rot3', rot - 25 + 'deg');
    }

    window.onmousemove = (event) => {
        var grassList2 = grassArr.slice().filter(i => {
            var x = i.split(':')[0]
            var y = i.split(':')[1]

            var distance = Math.abs(event.x - x) + Math.abs(event.y - y);
            if(distance > affectRadius) return false;
            else return true
        })

        grassList2.forEach(i => {
            if(event.x < prevMx) {
                //let r = rng(100, 0, false);
                var a = 'rotLeft';
            } else {
                //let r = rng(100, 0, false);
                var a = 'rotRight';
            }
            document.getElementById(i).classList.add(a)
            setTimeout((i) => {
                try{
                    document.getElementById(i).classList.remove("rotRight")
                }catch(err){}
                try{
                    document.getElementById(i).classList.remove("rotLeft")
                }catch(err){}
            }, 900, i)
        })
        prevMx = event.x
        prevMy = event.y
    }
}

function rng(max, min, round){
    return (round) ? Math.round(Math.random() * (max - min) + min) : Math.random() * (max - min) + min
}