function move(elem, x, y){
    const dims = elem.getBoundingClientRect()

    //get center
    dims.x = x - dims.width / 2
    dims.y = y - dims.height / 2

    elem.style.top = `${dims.y}px`
    elem.style.left = `${dims.x}px`
}

function RegisterDraggables(elems){
    elems = Array.from(elems)
    if(!elems) return;
    elems.forEach(e => {
        e.draggable = "true"

        e.addEventListener('dragstart', 
            (e) => {
                const img = new Image();
                img.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='; // 1x1 transparent GIF
                e.dataTransfer.setDragImage(img, 0, 0)

                e.target.classList.add("dragging")
            }
        );

        e.addEventListener("drag",
            (e => {
                e.preventDefault()
                const elem = e.target
                if(e.x !== 0 && e.y !== 0) move(elem, e.x, e.y);
                update()
            })
        )

        //drag over needed to preventy default to allow dropping anywhere
        e.addEventListener("dragover",
            (e => {
                e.preventDefault()
            })
        )
        
        e.addEventListener("drop",
            (e => {
                e.preventDefault()
                e.target.classList.remove("dragging")
            })
        )
    })
}