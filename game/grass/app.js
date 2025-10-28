const vertex_shader = `
    attribute vec4 a_position;
    attribute vec2 a_tex_cord;

    varying vec2 v_tex_cord;

    void main() {
        gl_Position = a_position;
        v_tex_cord = a_tex_cord;
    }
`

const fragment_shader = `
    precision mediump float;

    uniform sampler2D u_texture;
    varying vec2 v_tex_cord;

    void main() {
        gl_FragColor = texture2D(u_texture, v_tex_cord);
    }
`

let canvas = undefined
let gl = undefined
let program = undefined

const grassURL = "./grass.png"
let grass
let grassTexture

function rectToTriangles(x, y, shear_dist = 0, scale_x = 0.3, scale_y = 0.17){
    const W = gl.canvas.width
    const H = gl.canvas.height

    const width = grass.width * scale_x
    const height = grass.height * scale_y

    let pos = [
        x, x + width, y, y + height
    ]

    for(let i = 0; i < 4; i++){
        i < 2 ? pos[i] /= W : pos[i] /= H
    }

    pos = pos.map(p => p * 2 - 1)

    const [x1, x2, y1, y2] = pos

    return [
        x1, y1,
        x2, y1,
        x1 + shear_dist, y2,

        x1 + shear_dist, y2,
        x2, y1, 
        x2 + shear_dist, y2,
    ]
}

const tex_cords = [
    0.0,  0.0,
    1.0,  0.0,
    0.0,  1.0,
    0.0,  1.0,
    1.0,  0.0,
    1.0,  1.0,
].reverse();

class Grass {
    get triangles(){
        return rectToTriangles(this.x, this.y, this.shear, undefined, this.scale_y)
    }
    constructor(x, y, shear = 0, isGrowing = false){
        this.x = x
        this.y = y
        this.shear = shear

        this.isGrowing = isGrowing
        if(isGrowing) this.scale_y = 0.001;
        else this.scale_y = 0.17;

        this.maxShear = Math.abs(shear) + rng(0.002, 0, false)
        this.waveDir = 1
        this.waveStep = 0.0007
    }
    move(){
        if(this.isGrowing){
            if(this.scale_y >= 0.17) {
                this.scale_y = 0.17;
                this.isGrowing = false
            } else {
                if(Math.random() < 0.2) this.scale_y += 0.005 + rng(0.0001, 0, false);
                else this.scale_y += 0.0025
            }
        }

        if(Math.abs(this.shear) >= this.maxShear){
            this.waveDir *= -1
        }
        let diff = rng(this.waveStep, 0, false) * this.waveDir
        if(Math.abs(diff) > 0.0007){
            diff = 0.0007 * Math.sign(diff)
        }
        this.shear += diff

        const chance = Math.random()
        if(this.waveStep > 0.0007 || chance < 0.2) {
            this.waveStep -= this.waveStep > 0.0007 ? 0.0007 : 0.0001;
            if(this.waveStep <= 0) this.waveStep = 0.0002;
        }
    }
    moveAway(x){
        const onLeft = (x - this.x) >= 0

        if(onLeft){
            this.waveDir = -1
            this.waveStep = 0.1
        } else {
            this.waveDir = 1
            this.waveStep = 0.1
        }
    }
}

let grassColection = []

function drawFrame() {
    grassColection.forEach(p => p.move())
    bringFloatArrayToGPU(gl, program, grassColection.flatMap(_ => tex_cords), "a_tex_cord", 2)
    const triangleCounts = bringFloatArrayToGPU(gl, program, grassColection.flatMap(p => p.triangles) , "a_position", 2)

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, triangleCounts);

    if(typeof gl.getError === "function"){
        const err = gl.getError()
        if(err) console.log(`Potential error: `, err)
    } else {
        // console.log(`No get error present`)
    }

    requestAnimationFrame(drawFrame)

}

let mouseDownInterval;
let mouseDownCounter = 0;
let scythe;
let scythe_size = 100;

function init(){
    canvas = document.getElementById("main_canvas")
    if(!canvas) return;

    gl = canvas.getContext("webgl")
    if(!gl) return;
    
    program = createProgram(gl, vertex_shader, fragment_shader)
    if(!program) return;

    gl.useProgram(program);

    resizeCanvasToDisplaySize(canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST);

    scythe = document.getElementById("scythe")
    
    grass = new Image()
    grass.src = grassURL
    grass.onload = () => {
        console.log(`Grass loaded`)

        spawnRandomGrass(500, true)

        grassTexture = setupTexture(gl, grass)

        requestAnimationFrame(drawFrame)
    }

    document.addEventListener("pointerdown", (ev => {
        if(ev.pointerType !== "mouse"){
            deleteGrass(ev.x, ev.y)
        } else {
            scythe.classList.add("rotated")
            mouseDownInterval = setInterval(() => mouseDownCounter++, 100)
        }
    }))
    
    document.addEventListener("pointerup", (ev) => {
        clearInterval(mouseDownInterval)
        mouseDownCounter /= 10
        log(`Held mouse down for ${mouseDownCounter} seconds)`)

        if(mouseDownCounter > 0.2){
            deleteGrass(ev.x, ev.y)
        }

        scythe.classList.remove("rotated")
        scythe.classList.remove("shaking")
        scythe.classList.remove("shake_harder")
        
        scythe.style.width = `100px`
        scythe.style.height = `100px`

        mouseDownCounter = 0;
        scythe_size = 100
    })
    
    document.addEventListener("mousemove", (ev => {
        updateGrassVelocity(ev.x, ev.y)
        
        scythe.style.top = `${ev.y - (scythe_size / 2)}px`
        scythe.style.left = `${ev.x - (scythe_size - 70)}px`
    }))
    
    setInterval(
        () => {
            if(Math.random() < 0.1 && grassColection.length < 1000) spawnRandomGrass(Math.ceil(Math.log2(1000 - grassColection.length)))
        }, 10 
    )

    setInterval(
        () => {
            if(mouseDownCounter > 10){
                let k
                if(mouseDownCounter > 20) {
                    k = 200
                    scythe.classList.add("shake_harder")
                } else {
                    k = 150
                    scythe.classList.add("shaking")
                }

                scythe_size = k;

                k = `${k}px`
                scythe.style.width = k
                scythe.style.height = k
            }
        }, 10
    )
}

function binarySearch(arr, comparator, T, forced = false){
    let L = 0
    let R = arr.length - 1

    while(L <= R){
        const M = L + ((R - L) >> 1)
        
        const comparedResult = comparator(arr[M], T, M)
        if(comparedResult === 0) return M;
        if(comparedResult < 0) L = M + 1;
        if(comparedResult > 0) R = M - 1;
    }
    
    return forced ? L : -1; //returns best result if forced
}

function insertionSort(arr, element, comparator){
    const i = binarySearch(
        arr, 
        comparator,
        element,
        true
    )

    if(i >= 0) arr.splice(i, 0, element);
}

function spawnRandomGrass(c = 1, isNew = true){
    const doInsertionSort = c <= 100
    const grassComparitor = (a, b) => b.y - a.y
    while(c--){
        const newGrass = new Grass(
            rng(gl.canvas.width * .87, 0, true), 
            rng(gl.canvas.height * .85, 0, true),
            rng(0.03, -0.03, false),
            isNew,
        )
        doInsertionSort ? insertionSort(grassColection, newGrass, grassComparitor) : grassColection.push(newGrass);
    }
    if(!doInsertionSort) grassColection.sort(grassComparitor);
    
}

function deleteGrass(mx, my){
    const rect = canvas.getBoundingClientRect()

    const keep = []
    
    grassColection.forEach(grass => {
        const d = dist(grass.x, rect.height - grass.y, mx - 1.5 * rect.x, my)
        if(d >= scythe_size) keep.push(grass);
    })

    grassColection = keep
}

function updateGrassVelocity(mx, my){
    const rect = canvas.getBoundingClientRect()
    
    grassColection.forEach(grass => {
        const d = dist(grass.x, rect.height - grass.y, mx - 1.5 * rect.x, my)
        if(d < scythe_size) grass.moveAway(mx - 1.5 * rect.x);
    })
}

function log(...str){
    //disabled to avoid logging :>>

    // str = str.join("\n")
    // const log = document.getElementById("log")
    // let old = log.innerText
    // if(old.length > 5000) old = "";
    // log.innerText = old + "\n" + str
}

function dist(x1, y1, x2, y2){
    return Math.abs(x1 - x2) + Math.abs(y1 - y2)
}

