

const website = [
'https://image.daapi.repl.co/',
'https://streams.daapi.repl.co/',
'https://color.daapi.repl.co/',
'https://data.daapi.repl.co/'
]

/*
const check = (link) => new Promise(async (resolve, reject) => {   
    request.get(link)
    
    .then(function (data){
         //console.log(data.status)
         var res = {}
         res.status = true
         res.link = link
         resolve(res)
     })
     .catch(function (err){
        //console.log('fail')
        var res = {}
        res.status = null
        res.link = link
        resolve(res)
      })
})

Promise.all([
  check(website[0]), 
  check(website[1]),
  check(website[2]),
  check(website[3]),
  
]).then((data) => {
    var str = ""
    data.forEach((i) => {
        str += i.link + ' is ' + ((i.status) ? ' working' : ' not working') + "\n"
    })
    console.log(str)
});
*/

function main() {
    console.log('ok')
    alert('ok')
    fetch('https://data.daapi.repl.co/').then(function (data){
        console.log(data)
    })
    .catch(function (err){
        console.log ('fuck')
    })
}

