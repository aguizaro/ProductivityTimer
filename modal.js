/* Access functions to use in sketch.js

- setupModal()
- openModal()
- closeModal()
- clearModal()
- applyModalData(timer)
- isModalOpen()

*/

let modal;
let taskNameInput;
let taskDescInput;

function setupModal() {
  // modal elements
  modal = createElement("div", "").addClass("modal").id("myModal");
  let modalContent = createElement("div", "").addClass("modal-content");
  let closeSpan = createElement("span", "&times;").addClass("close");
  let form = createElement("form", "").id("modalForm");

  // form elements
  let nameLabel = createElement("label", "Task Name:").id("nameLabel");
  taskNameInput = createElement("input", "")
    .attribute("type", "text")
    .id("taskNameInput")
    .attribute("maxlength", "20") // no more than 20 characters
    .attribute("placeholder", timer.name);

  let br1 = createElement("br");
  let br2 = createElement("br");

  let descLabel = createElement("label", "Task Description:").id("descLabel");
  taskDescInput = createElement("textarea", "")
    .id("descInput")
    .attribute("placeholder", timer.description || "description of task ...");

  let br3 = createElement("br");
  let br4 = createElement("br");

  let submitBtn = createElement("button", "Submit")
    .attribute("type", "button")
    .id("submitBtn");

  form.child(nameLabel);
  form.child(taskNameInput);
  form.child(br1);
  form.child(br2);
  form.child(descLabel);
  form.child(taskDescInput);
  form.child(br3);
  form.child(br4);
  form.child(submitBtn);
  modalContent.child(closeSpan);
  modalContent.child(form);
  modal.child(modalContent);
  select("body").child(modal);

  modal.style("display", "none");

  // close modal when use clicks on (x)
  closeSpan.mousePressed(() => {
    closeModal();
  });

  // close modal when user clicks outside of the modal box
  window.onclick = function (event) {
    if (event.target == modal.elt) {
      closeModal();
    }
  };

  // form submission
  submitBtn.mousePressed(() => {
    clickSFX.play();
    applyModalData(timer);
  });
}

function openModal() {
  console.log("open modal");
  clickSFX.play();
  taskNameInput.attribute("placeholder", timer.name);
  taskDescInput.attribute(
    "placeholder",
    timer.description || "description of task ..."
  );

  modal.style("display", "block");

  taskNameInput.elt.focus();
}

function closeModal() {
  clickSFX.play();
  console.log("close modal");
  modal.style("display", "none");
}

function clearModal() {
  taskNameInput.value("");
  taskDescInput.value("");
}

// returns true if any input was applied - false otherwise
function applyModalData(timer) {
  let appliedChanges = false;
  if (isValidString(taskNameInput.value())) {
    timer.name = taskNameInput.value();
    appliedChanges = true;
  }
  if (isValidString(taskDescInput.value())) {
    timer.description = taskDescInput.value();
    appliedChanges = true;
  }
  closeModal();
  clearModal();

  if (appliedChanges) {
    styleButton(resetButton, resetColor);
    localStorage.setItem("currentTimer", JSON.stringify(timer));
  }
}

function isModalOpen() {
  if (!modal) return false;
  return modal.style("display") === "block";
}
