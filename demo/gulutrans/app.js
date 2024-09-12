const check = ['gu', 'lu', 'glu', 'lgu', 'ggu', 'llu', 'guu', 'luu', 'ggg', 'lll']
var a = ""
var rate = 8.5;

function cow(a) {
    alert(a);
}

function compare(a, b) {
    if (a.length > b.length) return 1; else
        if (a.length < b.length) return -1; else
            return 0;
}
function gulugulutrans(str, check) {
    var s = '';
    var result;
    var str = str.split(' ')
    check.sort(compare)
    var res1 = [];
    var res2 = [];
    var res = [];
    var ris;
    var error = 0;
    var skip = false;
    for (var welp = 0; welp < str.length; welp++) {
        if (str[welp].startsWith('gu') && !str[welp].startsWith('guu')) str[welp] = str[welp].substring(2, str[welp].length)
    }
    console.log(`cut string: ${str}`)

    for (var k = 0; k < str.length; k++) {
        ris = []
        for (let i = 0; i < str[k].length; i += 0) {
            for (var j = check.length - 1; j >= 0; j--) {
                skip = false;
                s = str[k].substr(i, check[j].length);
                //console.log(s)
                if (s === check[j]) {
                    res1.push(check[j])
                    skip = true
                    error = 0;
                    ris.push(j)
                    i += check[j].length
                    break
                } else error += 1;
                if (skip) break;
            }
            if (error >= check.length) {
                //console.log(s)
                console.log(error)
                return ("invalid string")
            }

        }
        res.push(ris)
        //console.log(res1)
        //console.log(ris)
        //res1 is all the chunk of string it detects ex: [glu, gu, lu]
        //res2 is the number split into different words ex: gu lu => [0, 1]
        //the alogrithm prioritizes larger chunk
        //res is the base 3 number ex: 221, 201, 021, etc in array form, split further into differnt array for diffeent words 
        //the formular is base 10 = base^position*number 
        //ex: base:           3
        //    position: 3 2 1 0 
        //    number:   0 0 0 2
        //    base 10:  3^3*0 + 3^2*0 + 3^1*0 + 3^0*2 = 2
        result = 0;
        for (let a = 0; a < ris.length; a++) {
            result += Math.pow(check.length, a) * ris[ris.length - a - 1];
            //this logs out all the equations the machine do
            //console.log(`3 ^ ${a} * ${res[res.length - a - 1]}`)
        }
        res2.push(result)
    }
    var text = "";
    var prev = false;
    var lprev = res2.length + 1
    for (var l = 0; l < res2.length; l++) {
        if (l > lprev + 1) { prev = 0; lprev = res2.length + 1 }
        var char = String.fromCharCode(res2[l]);
        if (char === "\u0000") {
            char = (prev === true) ? '' : ' '
            prev = true
            lprev = l;
        }
        text += char
    }
    return text;
}
function guluguluify(str, check) {
    check.sort(compare)
    var str = str.split(' ')
    const base = check.length
    var result1 = []
    var result = []
    var res = []
    var res1 = []
    var res2 = []
    for (var k = 0; k < str.length; k++) {
        res1 = [];
        for (var i = 0; i < str[k].length; i++) {
            var char = str[k][i]
            res1.push(char.charCodeAt(0))
        }
        res.push(res1)
    }
    for (var m = 0; m < res.length; m++) {
        for (var i = 0; i < res[m].length; i++) {
            res2 = []
            for (var j = res[m][i]; j >= base; j += 0) {
                res2.push(j % base)
                j = Math.floor(j / base)
            }
            res2.push(j)
            var tonk = ""
            for (var n = res2.length - 1; n >= 0; n--) {
                tonk += check[res2[n]]
            }
            result1.push(tonk)
            if (!tonk.startsWith('g')) {
                var lol = 'gu'
                lol += tonk
                tonk = lol
            }
            result.push(tonk)
        }
        result.push(' ')
        result1.push(' ')

    }
    console.log(`cut result: ${result1}`)
    return result.join(' ')
}
function kcheck() {
    document.getElementById("str").addEventListener('keypress', function (e) {
        if (e.key === "Enter") {
            re(document.getElementById(`dropbox`).value)
        }
    });

    document.getElementById("dropbox").addEventListener('mouseenter', function () {
        a = document.getElementById(`dropbox`).value
    });
}

function re(a) {
    var str = document.getElementById("str").value
    if (str === '') {
        alert('please enter something')
        return;
    }
    console.log(str)
    if (a === "trans") {
        var res = gulugulutrans(str, check)
        document.getElementById("output").value = res
    } else if (a === "ify") {
        var res = guluguluify(str, check)
        rate = ((res.length / str.length) + rate) / 2
        //document.getElementById("debug").placeholder = rate
        document.getElementById("output").value = res
    } else {
        alert('please choose a mode')
    }
    return
}

function cls() {
    document.getElementById('str').value = ''
    document.getElementById('output').value = ''
}
function save(a) {
    if (a === '') alert('nothing to save');
    else {
      try{
        navigator.clipboard.writeText(a);
        alert(`saved to clipboard`)
      }catch(err){
        try{
          document.getElementById("output").focus()
          document.execCommand('copy')
          alert(`saved to clipboard`)
        }catch(err){
          alert('failed to copy')
        }
      }
    }
}

function update() {
    var newa = document.getElementById(`dropbox`).value
    if (newa === "trans") document.getElementById('str').placeholder = "Enter gulugulu"
    if (newa === "ify") document.getElementById('str').placeholder = "Enter text"
    if (a != "none") cls()

}

function ch(e) {
    document.getElementById("str").style.fontSize = e.value;
    document.getElementById("output").style.fontSize = e.value;
}

function se() {
  document.getElementById(`output`).focus( function() {
    document.getElementById(`output`).select()
  })
}