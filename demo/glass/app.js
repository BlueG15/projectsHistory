let img

function update(){
    const [W, H] = getWebglBounds()
    const dims = canvas.getBoundingClientRect()
    let {uv, center, size} = rectToSlicedUV(dims.x, dims.y, dims.width, dims.height, img.width, img.height)
    setUniformParam(gl, program, center, "u_center_uv")
    setUniformParam(gl, program, [W, H], "u_texSize")
    setUniformParam(gl, program, size, "u_window_size")
    drawFullScreenTri(uv)
}

async function init(){
    initWebGL(
        "m", 
        shader.vertex.img, 
        shader.fragment.img_glass,
    )

    RegisterDraggables([canvas])

    img = await initImg("/demo/glass/landscape.jpg")
    update()
}