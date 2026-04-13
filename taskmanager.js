let tasks = [];
let taskIdCounter = 0;

// DOM references
const counter = document.getElementById("taskCounter");
const filter = document.getElementById("priorityFilter");
const modal = document.getElementById("taskModal");
const saveBtn = document.getElementById("saveTaskBtn");
const cancelBtn = document.getElementById("cancelTaskBtn");
const titleInput = document.getElementById("taskTitle");
const descInput = document.getElementById("taskDesc");
const priorityInput = document.getElementById("taskPriority");
const dateInput = document.getElementById("taskDate");
const clearAllBtn = document.getElementById("clearAllBtn");

function createTaskCard(taskObj) {
  const li = document.createElement("li");
  li.classList.add("task-card");
  li.setAttribute("data-id", taskObj.id);
  li.setAttribute("data-priority", taskObj.priority);

  const titleDiv = document.createElement("div");
  titleDiv.classList.add("task-title");
  titleDiv.textContent = taskObj.title;
  titleDiv.addEventListener("dblclick", () => inlineEdit(taskObj.id, titleDiv));

  const descDiv = document.createElement("div");
  descDiv.classList.add("task-desc");
  descDiv.textContent = taskObj.desc || "(no description)";

  const priorityDiv = document.createElement("div");
  priorityDiv.classList.add("priority-badge");
  priorityDiv.textContent = taskObj.priority;

  const dateDiv = document.createElement("div");
  dateDiv.classList.add("task-date");
  dateDiv.textContent = taskObj.date ? `Due: ${taskObj.date}` : "";

  const editBtn = document.createElement("button");
  editBtn.classList.add("editBtn");
  editBtn.setAttribute("data-id", taskObj.id);
  editBtn.textContent = "Edit";

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("deleteBtn");
  deleteBtn.setAttribute("data-id", taskObj.id);
  deleteBtn.textContent = "Delete";

  [titleDiv, descDiv, priorityDiv, dateDiv, editBtn, deleteBtn].forEach(el => li.appendChild(el));
  return li;
}

function addTask(columnId, taskObj) {
  taskObj.id = ++taskIdCounter;
  tasks.push(taskObj);
  const card = createTaskCard(taskObj);
  document.querySelector(`#${columnId} ul`).appendChild(card);
  updateBadge();
}

function deleteTask(taskId) {
  const card = document.querySelector(`[data-id='${taskId}']`);
  if (!card) return;
  card.classList.add("fadeOut");
  card.addEventListener("animationend", () => {
    card.remove();
    tasks = tasks.filter(t => t.id != taskId);
    updateBadge();
  });
}

function editTask(taskId) {
  const task = tasks.find(t => t.id == taskId);
  if (!task) return;
  titleInput.value = task.title;
  descInput.value = task.desc;
  priorityInput.value = task.priority;
  dateInput.value = task.date;
  modal.style.display = "flex"; // show modal center
  modal.dataset.editId = taskId;
}

function updateTask(taskId, updatedData) {
  const task = tasks.find(t => t.id == taskId);
  if (!task) return;
  task.title = updatedData.title;
  task.desc = updatedData.desc;
  task.priority = updatedData.priority;
  task.date = updatedData.date;

  const card = document.querySelector(`[data-id='${taskId}']`);
  if (card) {
    card.querySelector(".task-title").textContent = task.title;
    card.querySelector(".task-desc").textContent = task.desc;
    card.querySelector(".priority-badge").textContent = task.priority;
    card.querySelector(".task-date").textContent = task.date ? `Due: ${task.date}` : "";
  }
}

function updateBadge() {
  counter.textContent = `${tasks.length} tasks`;
}

function inlineEdit(taskId, divTitle) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = divTitle.textContent;
  divTitle.replaceWith(input);
  input.focus();

  input.addEventListener("blur", () => {
    const task = tasks.find(t => t.id == taskId);
    if (task) {
      task.title = input.value.trim();
      const newTitleDiv = document.createElement("div");
      newTitleDiv.classList.add("task-title");
      newTitleDiv.textContent = task.title;
      newTitleDiv.addEventListener("dblclick", () => inlineEdit(taskId, newTitleDiv));
      input.replaceWith(newTitleDiv);
    }
  });

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") input.blur();
  });
}

// Priority filter
filter.addEventListener("change", () => {
  const val = filter.value;
  document.querySelectorAll(".task-card").forEach(card => {
    const match = val === "allPriorities" || card.getAttribute("data-priority") === val;
    card.classList.toggle("is-hidden", !match);
  });
});

// Add Task buttons
document.querySelectorAll("button[data-column]").forEach(btn => {
  btn.addEventListener("click", () => {
    titleInput.value = "";
    descInput.value = "";
    priorityInput.value = "medium";
    dateInput.value = "";
    modal.style.display = "flex";
    modal.dataset.columnId = btn.getAttribute("data-column");
    delete modal.dataset.editId;
  });
});

// Save button
saveBtn.addEventListener("click", () => {
  const editId = modal.dataset.editId;
  const columnId = modal.dataset.columnId || "todo";
  if (editId) {
    updateTask(editId, {
      title: titleInput.value.trim(),
      desc: descInput.value.trim(),
      priority: priorityInput.value,
      date: dateInput.value
    });
    modal.style.display = "none";
    delete modal.dataset.editId;
  } else {
    addTask(columnId, {
      title: titleInput.value.trim(),
      desc: descInput.value.trim(),
      priority: priorityInput.value,
      date: dateInput.value
    });
    modal.style.display = "none";
    delete modal.dataset.columnId;
  }
});

// Cancel button
cancelBtn.addEventListener("click", () => {
  modal.style.display = "none";
  delete modal.dataset.editId;
});

// Clear All button
clearAllBtn.addEventListener("click", () => {
  document.querySelectorAll(".task-card").forEach(card => {
    card.classList.add("fadeOut");
    card.addEventListener("animationend", () => card.remove());
  });
  tasks = [];
  updateBadge();
});

// Event delegation for Edit/Delete
document.addEventListener("click", e => {
  if (e.target.classList.contains("deleteBtn")) {
    deleteTask(e.target.dataset.id);
  }
  if (e.target.classList.contains("editBtn")) {
    editTask(e.target.dataset.id);
  }
});
