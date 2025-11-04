let canvas;
let gl;
let program;

const vertext_shader = {
    blank : `void main(){}`,
    point_simple : `
        attribute vec4 a_position; 

        void main(){
            gl_Position = a_position;
            gl_PointSize = 10.0;
        }
    `,
    img : `
        attribute vec4 a_position;
        attribute vec2 a_texCord;
        varying vec2 v_texCord;

        void main(){
            gl_Position = a_position;
            v_texCord = a_texCord;
        }
    `
}

const fragment_shader = {
    const_color : `
        precision mediump float;

        void main(){
            float max = 255.0;
            vec3 color = vec3(255, 0, 0);
            gl_FragColor = vec4(color / max, 1.0);
        }
    `,
    img : `
        precision mediump float;

        uniform sampler2D u_texture;
        varying vec2 v_texCord;

        void main(){
            gl_FragColor = texture2D(u_texture, v_texCord);
        }
    `,
    img_blur : `
        precision mediump float;

        uniform sampler2D u_texture;
        uniform vec2 u_texSize;
        uniform float u_blur_strength;

        varying vec2 v_texCord;

        void main(){
            vec3 center = texture2D(u_texture, v_texCord).rgb;

            //Blur
            vec3 sum = vec3(0, 0, 0.0);
            float count = 0.0;
            for (int x = -1; x <= 1; ++x) {
                for (int y = -1; y <= 1; ++y) {
                    vec2 offset = vec2(float(x), float(y)) / u_texSize;
                    sum += texture2D(u_texture, v_texCord + offset).rgb;
                    count += 1.0;
                }
            }

            sum = sum / count;

            vec3 diff = (sum - center) * u_blur_strength;
            sum = center + diff;

            gl_FragColor = vec4(sum, 1.0);
        }
    `,
    img_glass : `
        precision mediump float;

        uniform sampler2D u_texture;

        uniform vec2 u_window_size;
        uniform vec2 u_texSize;
        uniform vec2 u_center_uv;

        varying vec2 v_texCord;

        vec2 norm(vec2 a){
            vec2 sizeV = vec2(a.x, a.y);
            sizeV = abs(sizeV);
            float size = sizeV.x * sizeV.x + sizeV.y * sizeV.y;
            return a / size; 
        }

        float dist(vec2 a){
            a = a - u_center_uv;
            a = abs(a) * 2.;

            float h = a.y;
            float w = a.x;

            vec2 unitRect = u_window_size;

            //grow a rectangle to fit a.y
            float growFactor = h / unitRect.y;
            vec2 rect = unitRect * growFactor;

            if(rect.x >= w){
                //valid
                return growFactor;
            }

            //grow to fit x too
            growFactor = w / unitRect.x;
            return growFactor;
        }

        void render(vec3 sum, vec3 center){
            // Blur more towards the edge
            float d = dist(v_texCord);

            float out_d = 0.;

            float check_d = 1.;
            float end_d = .2;
            // vec3 color = vec3(1.0, 0.0, 1.0);
            float done = 0.0;

            int i_mod_3 = 0;
            float st = (1. - .6) / 25.;

            for (int i = 0; i < 25; i++) {
                check_d -= st;
                if(check_d > 0.){
                    i_mod_3++;
                    if(i_mod_3 >= 3) i_mod_3 = 0;
    
                    float cond = step(check_d, d);     // 1.0 if (d >= check_d)
                    float trigger = cond * (1.0 - done); // only trigger once
    
                    // Pick a color cycling through R, G, B
                    // vec3 newColor =
                    //     i_mod_3 == 0 ? vec3(1.0, 0.0, 0.0) :      // red
                    //     i_mod_3 == 1 ? vec3(0.0, 1.0, 0.0) :     // green
                    //                 vec3(0.0, 0.0, 1.0);       // blue
                    
                    float new_d = 
                        // i == 23 ? 30. :
                        // i == 24 ? 1. :
                        float(50 - (i * 2)) * 0.5;
    
                    out_d = mix(out_d, new_d, trigger)   ;             
                    // color = mix(color, newColor, trigger);
     
                    done = max(done, trigger);
                }
            }

            if(done <= 0.5){
                out_d = d * 1.;
            }

            vec3 diff = (sum - center) * out_d * 0.1;
            sum = (center + diff) * 0.6; //Darkening

            gl_FragColor = vec4(sum, 0.7);
        }

        
        void main(){
            vec3 center = texture2D(u_texture, v_texCord).rgb;

            //Blur
            vec3 sum = vec3(0, 0, 0.0);
            float count = 0.0;
            for (int x = -1; x <= 1; ++x) {
                for (int y = -1; y <= 1; ++y) {
                    vec2 offset = vec2(float(x), float(y)) / u_texSize;
                    sum += texture2D(u_texture, v_texCord + offset).rgb;
                    count += 1.0;
                }
            }

            sum = sum / count;

            render(sum, center);
        }
    `
}

const shader = {
    vertex : vertext_shader,
    fragment : fragment_shader,
}

function isWebglInitiated(){
    return canvas !== undefined && gl !== undefined && program !== undefined
}

function getWebglBounds(){
    if(!gl) return [0, 0]
    return [gl.canvas.width, gl.canvas.height]
}

async function initWebGL(
    id, 
    sd_vertex, 
    sd_fragment, 
    enableOverlappingDraws, 
){
    const ele = document.getElementById(id)
    if(!ele) {
        console.log(`No element with id ${id}`)
        return
    };

    const gl_temp = ele.getContext("webgl")
    if(!gl_temp) {
        console.log(`No webgl context`)
        return
    };

    const program_temp = createProgram(gl_temp, sd_vertex, sd_fragment)
    if(!program_temp) {
        console.log(`Fails to compiles`)
        return
    };

    canvas = ele;
    gl = gl_temp;
    program = program_temp;

    gl.useProgram(program);

    resizeCanvasToDisplaySize(canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    if(enableOverlappingDraws){
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.disable(gl.DEPTH_TEST);
    }
}

function initImg(url){
    return new Promise((resolve, _) => {
        const img = new Image()
        img.src = url
        img.onload = () => {
            setupAndBindTexture(gl, img)
            resolve(img)
        }
    })
}

function randPoints(numPoint){
    if(!isWebglInitiated) return [];
    const res = []
    while(numPoint--){
        res.push(rng(1, -1, false), rng(1, -1, false))
    }
    return res
}

function toScreenSpace(arr){
    if (!isWebglInitiated) return [];

    const [W, H] = getWebglBounds()

    if(Array.isArray(arr)){
        if(!arr.length) return arr;
        //assume arr is either [number, number][] or number[]

        const res = []
        for(let i = 0; i < arr.length;){
            let k = arr[i]
            if(typeof k === "number") k = [k, arr[i+1]];
            i += k.length

            const [x, y] = k
            const x_new = ((x + 0.5) / (W - 2)) * 2 - 1
            const y_new = ((y + 0.5) / (H - 2)) * 2 - 1
            res.push(x_new, y_new)
        }
    }

    return []
}

function clearGL(){
    if(!isWebglInitiated()) return;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function drawPoints(points){
    if(!isWebglInitiated()) return;
    if(typeof points === "number") points = randPoints(points);
    const num_p = bringFloatArrayToGPU(gl, program, points, "a_position", 2)
    clearGL()
    gl.drawArrays(gl.POINTS, 0, num_p);
}

//text cords ranges from 0 to 1
const full_screen_tex_cords = [
    1, 1, 
    0, 1, 
    1, 0, 

    1, 0, 
    0, 1, 
    0, 0
]

const fullScreenRect = [
    -1, -1,
    1, -1,
    -1, 1,

    -1, 1,
    1, -1, 
    1, 1,
]

//Assume width and height < image width and height
function rectToSlicedUV(x, y, width, height, imageWidth, imageHeight){
    if(!isWebglInitiated()) return;

    const W = imageWidth
    const H = imageHeight

    let pos = [
        x, x + width, y, y + height
    ]

    for(let i = 0; i < 4; i++){
        i < 2 ? pos[i] /= W : pos[i] /= H;
    }

    let [x1, x2, y2, y1] = pos

    return {
        uv: [
            x1, y1,   
            x2, y1,  
            x1, y2, 

            x1, y2,  
            x2, y1,  
            x2, y2, 
        ],
        center: [(x1 + x2) / 2, (y1 + y2) / 2],
        size : [Math.abs(x2 - x1), Math.abs(y2 - y1)]
    }

 }

function drawFullScreenTri(uv = full_screen_tex_cords){
    if(!isWebglInitiated()) return;

    bringFloatArrayToGPU(gl, program, uv, "a_texCord", 2)
    const triCount = bringFloatArrayToGPU(gl, program, fullScreenRect, "a_position", 2)

    clearGL()
    gl.drawArrays(gl.TRIANGLES, 0, triCount);
}

function createShader(gl, type, sourceCode) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) return shader;

    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(
    gl, 
    vertex_shader_source_code, 
    fragment_shader_source_code
) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertex_shader_source_code)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragment_shader_source_code)

    if(!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) return program;

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function resizeCanvasToDisplaySize(canvas, multiplier) {
    multiplier = multiplier || 1;
    const width  = canvas.clientWidth  * multiplier | 0;
    const height = canvas.clientHeight * multiplier | 0;
    if (canvas.width !== width ||  canvas.height !== height) {
        canvas.width  = width;
        canvas.height = height;
        return true;
    }
    return false;
}

function bringFloatArrayToGPU(gl, program, data, attrName, partioningSize){
    const attr_ptr = gl.getAttribLocation(program, attrName)
    const buffer = gl.createBuffer()

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(attr_ptr);
    gl.vertexAttribPointer(
        attr_ptr, partioningSize, gl.FLOAT, false, 0, 0
    );

    let res = 0
    res = data.length
    return res / partioningSize
}

function setUniformParam(gl, program, data, name){
    const attr_ptr = gl.getUniformLocation(program, name)
    if(!Array.isArray(data)) data = [data];
    switch(data.length){
        case 1 : {
            gl.uniform1f(attr_ptr, data[0])
            return
        }
        case 2: {
            gl.uniform2f(attr_ptr, ...data)
            return
        }
        case 3: {
            gl.uniform3f(attr_ptr, ...data)
            return
        }
        case 4: {
            gl.uniform4f(attr_ptr, ...data)
            return
        }
    }
}

function setupAndBindTexture(gl, image) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Upload image data
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,               // level
        gl.RGBA,         // internal format
        gl.RGBA,         // source format
        gl.UNSIGNED_BYTE,// type
        image            // image source
    );

    // Set texture parameters so it displays correctly
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    return texture
}

function rng(max, min, round){
    return (round) ? Math.round(Math.random() * (max - min) + min) : Math.random() * (max - min) + min
}