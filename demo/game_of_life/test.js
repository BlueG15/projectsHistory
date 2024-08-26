//we now implement 2 canvases, 1 for caching
//switching between the 2 will probably avoid having to redraw a bunch of lines

let stopped = false;

function init() {

  //the shit below removes blurry lines by scaling the canvas to the device pixel ratio
  //so thats the reason for the 3.333333
  // Get the DPR and size of the canvas
  const dpr = window.devicePixelRatio;
  var temp = document.getElementsByClassName("pain");
  for (var i = 0; i < temp.length; i++) {
    const rect = temp[i].getBoundingClientRect();

    // Set the "actual" size of the canvas
    temp[i].width = rect.width * dpr;
    temp[i].height = rect.height * dpr;
    const ctx = temp[i].getContext("2d");
    // Scale the context to ensure correct drawing operations
    ctx.scale(dpr, dpr);

    // Set the "drawn" size of the canvas
    temp[i].style.width = `${rect.width}px`;
    temp[i].style.height = `${rect.height}px`;
    console.log(`temp ${i} with width = ${rect.width}`);
  }

  const arr = [0, [1], [2], [1, 2], [4], [1, 4], [2, 4], [1, 2, 4]];
  window.onmousedown = (event) => {
    console.log("mouse detected: down");
    var mouseButton = arr[event.buttons] || [];

    mX = event.clientX;
    mY = event.clientY;

    if (mouseButton.includes(1)) {
      mdown = true;
      //drawDot(mX, mY, 15, "paint", false);
      drawbox(Math.floor(Math.floor(mX) / range) * range, Math.floor(Math.floor(mY) / range) * range, range, range, `rgba(0, 0, 0, 1)`, "paint", false, false);
    }
  };

  window.onmouseup = (event) => {
    console.log("mouse detected: up");
    var mouseButton = arr[event.buttons] || [];

    mouseX = event.clientX;
    mouseY = event.clientY;

    if (mdown == true) {
      //transfer the confirmed line from paint2 (the cache)
      //to the main
      mdown = false;
    }
  };

  window.onmousemove = (event) => {
    console.log("mouse detected: move");
    var mouseButton = arr[event.buttons] || [];
    const canvas = document.getElementById("paint");
    var data = canvas.getBoundingClientRect();

    var mX = event.clientX;
    var mY = event.clientY;

    //document.getElementById('box').innerText = `data: ${JSON.stringify(data, null, 1)}` + `mx: ${mX}; my: ${mY}`
    if (mdown == true) {
      drawbox(Math.floor(Math.floor(mX) / range) * range, Math.floor(Math.floor(mY) / range) * range, range, range, `rgba(0, 0, 0, 1)`, "paint", false, false);
      //drawDot(mX, mY, 15, "paint", false);
      //drawbox(mX, mY, 15, 15, `rgb(173, 216, 230)`, "paint", false);
    }
  };
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

function drawbox(x, y, width, height, color, id, clear, divide) {
  const dpr = devicePixelRatio
  const canvas = document.getElementById(id);
  var data = canvas.getBoundingClientRect();
  const ctx = canvas.getContext("2d");
  if (clear) ctx.clearRect(x, y, width * dpr +1, height * dpr + 1);

  ctx.lineWidth = 1;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.beginPath();

  if(divide) ctx.fillRect(x/dpr, y/dpr, width, height);
  else ctx.fillRect(x, y, width, height);
  //ctx.stroke();
  //ctx.fill();
}

function drawCell(id, x, y, arr){
  var color = `rgba(${arr.join(',')})`
  const dpr = devicePixelRatio
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext("2d");
  //ctx.clearRect(x, y, range, range);

  ctx.lineWidth = 1;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.beginPath();

  ctx.fillRect(x, y, range, range);
}

function clear(id) {
  const canvas = document.getElementById(id);
  var data = canvas.getBoundingClientRect();
  const ctx = canvas.getContext("2d");
  ctx.clearRect(data.top, data.left, data.width, data.height);
}

const gettop = async (id) =>
  new Promise(async (resolve, reject) => {
    const canvas = document.getElementById(id);
    const ctx = canvas.getContext("2d");
    var y = 0;
    var res = {};
    var stopped = false;
    while (y < canvas.height) {
      var data = ctx.getImageData(0, y, canvas.width, 1).data;
      //console.log(data)
      //log(data.length, true)
      var hmmm = [];
      for (var i = 1; 4 * i - 1 <= data.length; i++) {
        var datum = data[4 * i - 1];
        hmmm.push(datum);
        if (datum != 0 && datum) {
          console.log(`found ${JSON.stringify(datum, null, 0)} in layer ${y}`);
          res[i] = datum;
          stopped = true;
        }
      }
      if (!stopped) {
        console.log(`${y} layer not found, proceeding`);
        //console.log(`${JSON.stringify(hmmm, null, 2)}`)
        y++;
      } else {
        break;
      }
    }
    var res1 = {};
    if (res != {}) {
      res1.x = Object.keys(res);
      res1.y = [y];
      var res2 = [];
      res2.push({
        x: res1.x[0],
        y: y,
      });
      if (res1.x.length > 1) {
        res2.push({
          x: res1.x[res1.x.length - 1],
          y: y,
        });
      }
      res1.point = res2;
      res1.data = res;
    }
    resolve(res1);
});

const getall = async (id) =>
//format of the res return by getall
//hmmm:
// {
//    y : [array of x on that line]
// }
//hmmm2:
// {
//    y : [
//          [red, green, blue, alpha] //each one of these is a number
//          [red, green, blue, alpha] //each one of these is a number
//          [red, green, blue, alpha] //each one of these is a number
//          ...
//        ]
// }
  new Promise(async (resolve, reject) => {
    const dpr = devicePixelRatio
    const canvas = document.getElementById(id);
    const ctx = canvas.getContext("2d");
    var y = 0;
    var hmmm = {};
    var hmmm2 = [];
    var hmmm3 = {}
    var why = 0
    while (y < canvas.height) {
      var data = ctx.getImageData(0, y, canvas.width, 1).data;
      hmmm[y] = [];
      hmmm2.push([])
      hmmm3[y] = []
      //console.log(data)
      //log(data.length, true)

      for (var i = 1; 4 * i - 1 <= data.length; i += Math.floor(range*dpr +1)) {
        var datum = []
        var cindex = 4 * i - 1
        var alpha = data[cindex];
        datum.unshift(alpha)
        datum.unshift(data[cindex - 1]) //blue
        datum.unshift(data[cindex - 2]) //green
        datum.unshift(data[cindex - 3]) //red
        hmmm2[why].push(datum)
        hmmm3[y].push(i)
        if (alpha != 0 && alpha) {
          //console.log(`found ${JSON.stringify(alpha, null, 0)} in layer ${y}`);
          hmmm[y].push(i);
        }
      }

      //console.log(`${y} layer not found, proceeding`);
      y+= Math.floor(range * dpr + 1);
      why++

      if (y == canvas.height) {
        console.log("break hit");
        break;
      }
    }
    resolve({
      'data' : hmmm2,
      'filled' : hmmm,
      'obj' : hmmm3 // this stores the x positions on a line    
    });
});

const advanceFrame = async (id) => {
  const dpr = window.devicePixelRatio;
  document.getElementById("box").innerText = "fetching, please wait";
  var data = await getall(id);
  //console.log('got da data')
  //console.log(data.data)
  //log(data.data, true, false)


  var lol = []
  //draws the checked pixel in red
  var k = Object.keys(data.obj)
  k.forEach(y => {
    for(var x = 0; x <data.obj[y].length; x++){
      //drawbox(data.obj[y][x], y, 15, 15, 'rgb(255, 0, 0)', 'paint1', false, true)
      lol.push({
        'x': data.obj[y][x],
        'y' : y
      })
    }
  })

  var lol2 = []
  for(var ay = 0; ay < data.data.length; ay++){
    for(var ax = 0; ax < data.data[ay].length; ax++){
      var datum = getNeighbor(data.data, ax, ay)
      var temp = pattern(datum)
      //drawCell('paint',Math.floor(data.obj[k[ay]][ax] / range) * range, Math.floor(k[ay] / range) * range, temp)
      //drawbox(data.obj[k[ay]][ax], k[ay], range, range, `rgba(${temp.join(',')})`, 'paint2', true, true)
      lol2.push(temp)
      //console.log(temp)
      //log(datum, true, false)
    }
  }

  lol2.forEach((i, index) => {
    var x = lol[index].x
    var y = lol[index].y
    drawbox(x - 1, y - 1, range, range, `rgba(${i.join(',')})`, 'paint', true, true)
  })
};

function log(x, pass, clear) {
  if (pass) var a = JSON.stringify(x, null, 1);
  else var a = x;
  if(clear) document.getElementById("box").innerText = a;
  else {
    document.getElementById("box").innerText = document.getElementById("box").innerText + a
  }
}

function toggle(id, index) {
  if (show[index]) {
    show[index] = false;
    document.getElementById(id).style.display = "none";
  } else {
    show[index] = true;
    document.getElementById(id).style.display = "flex";
  }
}

function round(num, precision){ return Math.round((num + Number.EPSILON) * Math.pow(10, precision)) / Math.pow(10, precision)}
function angleBetween(x1, y1, x2, y2, x3, y3){
  var mx = x1 - x2
  var my = y1 - y2
  var nx = x3 - x2
  var ny = y3 - y2
      return Math.acos((mx * nx + my * ny) / (Math.sqrt(Math.pow(mx, 2) + Math.pow(my, 2)) * Math.sqrt(Math.pow(nx, 2) + Math.pow(ny, 2)))) * (180 / Math.PI)
}


function drawAll(arr){
  var dpr = devicePixelRatio
  for (var m = 0; m < arr.length; m++) {
    drawbox(
      arr[m].x / dpr,
      arr[m].y / dpr,
      5,
      5,
      "rgb(0, 0, 255)",
      "paint1"
    );
  }
}

function w(x, center) {return (((Math.pow((x - center), 2) * -1) / (Math.pow((x - center), 2) + 1)) + 1) * 3}

const removeDup = (a, func) => {
  const arr = [...a];
  const obj = {};
  
  arr.forEach((a, index) => {
      const i = func(a);
      if (obj[i]) {
          arr.splice(index, 1, 0);
      } else {
          obj[i] = true;
      }
  });  
  
  return arr.filter((a) => a !== 0);
}

//console.log(removeDup(arr, (a) => (JSON.stringify(a).replaceAll(/({|}|\[|\])+/g, "").split(",").sort((x, y) => x > y ? 1 : -1).join(","))));
function getNeighbor(data, x, y){
var offsety = [1, 1, 0, -1, -1, -1, 0, 1];
var offsetx = [0, 1, 1, 1, 0, -1, -1, -1];
//data here is hmmm2 return by the getall function as data.data
//  [5][4][3]  
//  [6][x][2]
//  [7][0][1]
  var count = 0;
  var k = Object.keys(data)
  var res = []
  var redCount = 0
  var greenCount = 0
  var blueCount = 0
  var alphaCount = 0
  for(var i = 0; i < 8; i++){
    var cx = x + offsetx[i]
    var cy = y + offsety[i]
    if(cy < 0 || cy >= k.length || cx < 0 || cx >= data[0].length) res[i] = [0, 0, 0, 0];
    else {
      if (data[cy][cx][3] != 0) count++
      res[i] = data[cy][cx]
      redCount += data[cy][cx][0]
      greenCount += data[cy][cx][1]
      blueCount += data[cy][cx][2]
      alphaCount += data[cy][cx][3]
    }
  }
  var res2 = {}
  res2['neighbor'] = res
  res2['count'] = count
  res2['cappedColor'] = [redCount % 256, greenCount % 256, blueCount % 256, alphaCount % 256]
  res2['avColor'] = [redCount / 8, greenCount / 8, blueCount / 8, alphaCount / 8]
  res2['colorCount'] = [redCount, greenCount, blueCount, alphaCount]
  res2['self'] = data[y][x]
  return res2
}

function pattern(neighbor){
  //game of life rules
  if(neighbor.self[3] != 0) {
    if(neighbor.count < 2 || neighbor.count > 3) return [0, 0, 0, 0];
    else return [0, 0, 0, 1]
  }
  if(neighbor.self[3] == 0){
    if(neighbor.count == 3) return [0, 0, 0, 1]
  }
  return [0, 0, 0, 0]
}

//random color
// var damn = 0
// function pattern(neighbor){
//   if(damn % 100 == 0){
//     var randomRed = Math.random() * 255
//     var randomGreen = Math.random() * 255
//     var randomBlue = Math.random() * 255
//     var randomAlpha = Math.random()
//     damn++
//     return [randomRed, randomGreen, randomBlue, randomAlpha]
//   } else return neighbor.cappedColor  
// }

function test(id, advanceOnce){
  setTimeout((id) => {
    advanceFrame(id)
    loop--
    if(loop > 0){
      log(100 - loop, false, false)
    } else{
      loop = 100
    }
    if(!stopped && !advanceOnce) test(id)
  }, deltaT, id)
}

function toggleStop(id){
  stopped = (stopped) ? false : true;
  if(!stopped) test(id);
}

//global variables
var loop = 100
var deltaT = 100
var show = [true, true, true];
var useMicroDirection = true;
var angleCheckRange = 2;
var angleLimit = 0.5;
var range = 25 //the size of a cell, both width and height

var mdown = false;

var mode = 2; // 1 is line, 2 is dot