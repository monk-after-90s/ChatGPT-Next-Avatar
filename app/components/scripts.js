export function load_popup() {
    let isDragging = false;
    let offsetX, offsetY;

    document.querySelector('#windowHeader').addEventListener('mousedown', function (e) {
        isDragging = true;
        offsetX = e.clientX - document.getElementById('draggableWindow').offsetLeft;
        offsetY = e.clientY - document.getElementById('draggableWindow').offsetTop;
    });

    document.addEventListener('mouseup', function () {
        isDragging = false;
    });

    document.addEventListener('mousemove', function (e) {
        if (isDragging) {
            document.getElementById('draggableWindow').style.left = (e.clientX - offsetX) + "px";
            document.getElementById('draggableWindow').style.top = (e.clientY - offsetY) + "px";
        }
    });
}

export function showPopup() {
    document.getElementById('draggableWindow').style.display = 'block';
    document.getElementById('minimizedWindow').style.display = 'none';
}

export function hidePopup() {
    document.getElementById('draggableWindow').style.display = 'none';
    document.getElementById('minimizedWindow').style.display = 'block';
}
