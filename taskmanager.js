// Global
let tasks = [];
let taskIdCounter = 0;

function createTaskCard(taskObj) {
  const li = document.createElement("li");
  li.classList.add("taskCard");
  li.setAttribute("data-id", taskObj.id);

  // Title
  const titleDiv = document.createElement("div");
  titleDiv.classList.add("taskTitle");
  titleDiv.textContent = taskObj.title;

  // Description
  const descDiv = document.createElement("div");
  descDiv.classList.add("taskDesc");
  descDiv.textContent = taskObj.description;

  // Priority badge
  const priorityDiv = document.createElement("div");
  priorityDiv.classList.add("taskPriority", taskObj.priority);
  priorityDiv.textContent = taskObj.priority;

  // Due date
  const dateDiv = document.createElement("div");
  dateDiv.classList.add("taskDate");
  dateDiv.textContent = taskObj.dueDate ? `Due: ${taskObj.dueDate}` : "";

  // Edit button
  const editBtn = document.createElement("button");
  editBtn.classList.add("editBtn");
  editBtn.setAttribute("data-action", "edit");
  editBtn.setAttribute("data-id", taskObj.id);
  editBtn.textContent = "Edit";

  // Delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("deleteBtn");
  deleteBtn.setAttribute("data-action", "delete");
  deleteBtn.setAttribute("data-id", taskObj.id);
  deleteBtn.textContent = "Delete";

  // Append all parts
  li.appendChild(titleDiv);
  li.appendChild(descDiv);
  li.appendChild(priorityDiv);
  li.appendChild(dateDiv);
  li.appendChild(editBtn);
  li.appendChild(deleteBtn);

  return li;
}

function addTask(columnId, taskObj) {
  taskObj.id = ++taskIdCounter;
  tasks.push(taskObj);
  const card = createTaskCard(taskObj);
  document.getElementById(columnId + "List").appendChild(card);
  updateBadge();
}

function deleteTask(taskId) {
  const card = document.querySelector(`[data-id='${taskId}']`);
  if (!card) return;
  card.classList.add("fadeOut");
  card.addEventListener("animationend", () => {
    card.remove();
    tasks = tasks.filter(t => t.id !== taskId);
    updateBadge();
  });
}

function editTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  document.getElementById("taskTitle").value = task.title;
  document.getElementById("taskDescription").value = task.description;
  document.getElementById("taskPriority").value = task.priority;
  document.getElementById("taskDueDate").value = task.dueDate;
  const modal = document.getElementById("taskModal");
  modal.style.display = "block";
  modal.dataset.editId = taskId;
}

function updateTask(taskId, updatedData) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  task.title = updatedData.title;
  task.description = updatedData.description;
  task.priority = updatedData.priority;
  task.dueDate = updatedData.dueDate;

  const card = document.querySelector(`[data-id='${taskId}']`);
  if (card) {
    card.querySelector(".taskTitle").textContent = task.title;
    card.querySelector(".taskDesc").textContent = task.description;
    const priorityDiv = card.querySelector(".taskPriority");
    priorityDiv.textContent = task.priority;
    priorityDiv.className = "taskPriority " + task.priority;
    card.querySelector(".taskDate").textContent = task.dueDate ? `Due: ${task.dueDate}` : "";
  }
}

function updateBadge() {
  document.getElementById("taskBadge").textContent = tasks.length;
}
