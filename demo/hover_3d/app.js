function init(){
    const element = document.getElementsByClassName('picture')[0]
    element.style.setProperty('--url', "url(https://i.ibb.co/hVns4Sf/110554709-p0.png)");
    element.onmousemove = (event) => {
      var mouseX = event.x
      var mouseY = event.y

      var data = element.getBoundingClientRect()
      var eleX = data.left + data.width/2
      var eleY = data.top + data.height/2

      var dy = mouseY - eleY
      var dx = mouseX - eleX

      var len = Math.hypot(dy, dx)
      var maxlen = Math.hypot(data.width, data.height) / 2

      function smooth(x, max, limit) {
        var d = .3
        var c = (max * limit * d) / (limit - d)
        return -c/(x + c/limit) + limit
      }

      if(Math.sign(dy) < 0) {
        var rot1 = smooth(len, maxlen, 30) * Math.sign(dx)
        var rot2 = Math.PI - Math.atan(dx/dy)
      } else {
        var rot1 = smooth(len, maxlen, 30) * Math.sign(dx)
        var rot2 = Math.atan(dx/-dy) + 2*Math.PI
      }

      element.style.setProperty('--axisx', -dy);
      element.style.setProperty('--axisy', dx);

      element.style.setProperty('--rot', rot1 + 'deg');
      element.style.setProperty('--rot2', rot2 + 'rad');
    }
    // element.onmouseleave = (event) => {
    //   element.style = ``
    // }
}

function transferLink(){
  
  let link = document.getElementById("link-input").value;
  if(isValidUrl(link)){
    document.getElementsByClassName("picture")[0].style.setProperty(`--url`, `url(${link})`);
  }
}

const isValidUrl = urlString=> {
  try { 
      return Boolean(new URL(urlString)); 
  }
  catch(e){ 
      return false; 
  }
}
