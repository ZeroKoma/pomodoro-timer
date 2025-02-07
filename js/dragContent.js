document.addEventListener("DOMContentLoaded", () => {    
    const draggable = document.getElementById("draggable");
    const sliders = document.querySelectorAll("input[type='range']");

    let offsetX = 0, offsetY = 0, isDragging = false;

    function startDrag(e) {
        if (e.target.tagName.toLowerCase() === "input" && e.target.type === "range") {
            return;
        }
        isDragging = true;
        offsetX = e.clientX - draggable.offsetLeft;
        offsetY = e.clientY - draggable.offsetTop;
        draggable.style.cursor = "grabbing";
    }

    function onDrag(e) {
        if (!isDragging) return;
        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;
        draggable.style.left = `${x}px`;
        draggable.style.top = `${y}px`;
    }

    function stopDrag() {
        isDragging = false;
        draggable.style.cursor = "grab";
    }

    // Events
    draggable.addEventListener("mousedown", startDrag);
    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", stopDrag);

    // No sliders drag
    sliders.forEach(slider => {
        slider.addEventListener("mousedown", (e) => e.stopPropagation());
        slider.addEventListener("touchstart", (e) => e.stopPropagation());
    });
});
