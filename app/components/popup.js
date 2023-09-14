export function load_popup() {
  let isDragging = false;
  let offsetX, offsetY;

  document
    .querySelector("#windowHeader")
    .addEventListener("mousedown", function (e) {
      isDragging = true;
      offsetX =
        e.clientX - document.getElementById("draggableWindow").offsetLeft;
      offsetY =
        e.clientY - document.getElementById("draggableWindow").offsetTop;
    });

  document.addEventListener("mouseup", function () {
    isDragging = false;
  });

  document.addEventListener("mousemove", function (e) {
    if (isDragging) {
      document.getElementById("draggableWindow").style.left =
        e.clientX - offsetX + "px";
      document.getElementById("draggableWindow").style.top =
        e.clientY - offsetY + "px";
    }
  });

  //select下拉

  fetch(`/api/digital-man/digital_humans`)
    .then((response) => response.json())
    .then((data) => {
      const selectElement = document.getElementById("digman-select");
      data.forEach((item) => {
        const optionElement = document.createElement("option");
        optionElement.text = item.name;
        optionElement.value = item.value;
        selectElement.add(optionElement);
      });
      selectElement.addEventListener("change", (event) => {
        // 获取被选定的option元素
        // let selectedOption = event.target;
        // prepare_show(selectedOption.value);
      });
    });
}

export function showPopup() {
  document.getElementById("draggableWindow").style.display = "block";
  document.getElementById("minimizedWindow").style.display = "none";
}

export function hidePopup() {
  document.getElementById("draggableWindow").style.display = "none";
  document.getElementById("minimizedWindow").style.display = "block";
}
