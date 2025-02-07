document.addEventListener("DOMContentLoaded", () => {
    const draggable = document.getElementById("draggable");
    const sliders = document.querySelectorAll("input[type='range']");

    let offsetX = 0, offsetY = 0, isDragging = false;

    draggable.addEventListener("mousedown", (e) => {
        if (e.target.tagName.toLowerCase() === "input" && e.target.type === "range") {
            return;
        }
        isDragging = true;
        offsetX = e.clientX - draggable.offsetLeft;
        offsetY = e.clientY - draggable.offsetTop;
        draggable.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            let x = e.clientX - offsetX;
            let y = e.clientY - offsetY;
            console.log('x: ',x )
            console.log('y: ',y)

            // Limits
            // const maxX = window.innerWidth - draggable.offsetWidth;
            // const maxY = window.innerHeight - draggable.offsetHeight;

            // x = Math.max(0, Math.min(x, maxX));
            // y = Math.max(0, Math.min(y, maxY));

            draggable.style.left = x + "px";
            draggable.style.top = y + "px";
        }
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        draggable.style.cursor = "grab";
    });

    sliders.forEach(slider => {
        slider.addEventListener("mousedown", (e) => e.stopPropagation());
    });

});