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

function updateBadge() {
    counter.textContent = `${tasks.length} tasks`;
}

function createTaskCard(taskObj) {
    const li = document.createElement("li");
    li.classList.add("task-card");
    li.setAttribute("data-id", taskObj.id);
    li.setAttribute("data-priority", taskObj.priority);

    // Title with inline edit capability
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
    editBtn.setAttribute("data-action", "edit"); // For event delegation
    editBtn.textContent = "Edit";

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("deleteBtn");
    deleteBtn.setAttribute("data-id", taskObj.id);
    deleteBtn.setAttribute("data-action", "delete"); // For event delegation
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
    
    modal.classList.remove("hidden");
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
        // IMPORTANT: Update data-priority attribute so filter works after editing
        card.setAttribute("data-priority", task.priority);
        card.querySelector(".task-title").textContent = task.title;
        card.querySelector(".task-desc").textContent = task.desc;
        card.querySelector(".priority-badge").textContent = task.priority;
        card.querySelector(".task-date").textContent = task.date ? `Due: ${task.date}` : "";
    }
}

function inlineEdit(taskId, divTitle) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = divTitle.textContent;
    divTitle.replaceWith(input);
    input.focus();

    const commitChange = () => {
        const task = tasks.find(t => t.id == taskId);
        if (task) {
            task.title = input.value.trim() || "Untitled Task";
            const newTitleDiv = document.createElement("div");
            newTitleDiv.classList.add("task-title");
            newTitleDiv.textContent = task.title;
            newTitleDiv.addEventListener("dblclick", () => inlineEdit(taskId, newTitleDiv));
            input.replaceWith(newTitleDiv);
        }
    };

    input.addEventListener("blur", commitChange);
    input.addEventListener("keydown", e => {
        if (e.key === "Enter") input.blur();
    });
}

// Global Filter Logic
filter.addEventListener("change", () => {
    const val = filter.value;
    document.querySelectorAll(".task-card").forEach(card => {
        const match = (val === "allPriorities" || card.getAttribute("data-priority") === val);
        card.classList.toggle("is-hidden", !match);
    });
});

// "Add Task" buttons
document.querySelectorAll("button[data-column]").forEach(btn => {
    btn.addEventListener("click", () => {
        titleInput.value = "";
        descInput.value = "";
        priorityInput.value = "medium";
        dateInput.value = "";
        modal.classList.remove("hidden");
        modal.dataset.columnId = btn.getAttribute("data-column");
        delete modal.dataset.editId;
    });
});

saveBtn.addEventListener("click", () => {
    const editId = modal.dataset.editId;
    const columnId = modal.dataset.columnId || "todo";
    const data = {
        title: titleInput.value.trim() || "New Task",
        desc: descInput.value.trim(),
        priority: priorityInput.value,
        date: dateInput.value
    };

    if (editId) {
        updateTask(editId, data);
    } else {
        addTask(columnId, data);
    }
    modal.classList.add("hidden");
});

cancelBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
});

clearAllBtn.addEventListener("click", () => {
    const doneList = document.querySelector("#done ul");
    const cards = doneList.querySelectorAll(".task-card");

    if (cards.length === 0) return;
    
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add("fadeOut");
            card.addEventListener("animationend", () => {
                const cardId = parsent(card.getAttribute("data-id"),10);
                tasks = tasks.filter(t => t.id != cardId);
                card.remove();
                updateBadge();
            });
        }, index * 100); // Staggered effect
    });
});

// Event delegation on the <ul> containers
document.querySelectorAll("section ul").forEach(ul => {
    ul.addEventListener("click", e => {
        const action = e.target.getAttribute("data-action");
        const id = e.target.getAttribute("data-id");
        if (action === "delete") deleteTask(id);
        if (action === "edit") editTask(id);
    });
});