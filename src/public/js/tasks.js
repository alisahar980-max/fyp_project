// ============================================================
// STUDENT TASK MANAGER - TASK.JS
// ============================================================

const STORAGE_KEY = "studentTasks";
const SETTINGS_KEY = "studentSettings";

const DEFAULT_SETTINGS = {
    darkMode: false,
    notifications: true,
    emailNotifications: false,
    taskReminders: true,
    defaultPriority: "medium",
    defaultView: "list"
};

let tasks = [];
let currentSettings = {
    ...DEFAULT_SETTINGS
};


// ============================================================
// INITIALIZE
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    checkLoginAndInitialize();
});


// ============================================================
// AUTHENTICATION
// ============================================================

async function checkLoginAndInitialize() {

    try {

        const response = await api.get("/api/auth/me");

        if (!response || !response.user) {

            console.error("No logged-in user found.");

            return;
        }

        localStorage.setItem(
            "user",
            JSON.stringify(response.user)
        );

        localStorage.setItem(
            "username",
            response.user.name || "Student"
        );

        initializeTasks();

    } catch (error) {

        console.error(
            "Authentication error:",
            error
        );
    }
}


// ============================================================
// INITIALIZE TASK PAGE
// ============================================================

function initializeTasks() {

    loadUsername();

    loadSettings();

    loadTasks();

    setupEvents();

    applyTaskView();

    applyDarkMode();

    renderTasks();
}


// ============================================================
// USERNAME
// ============================================================

function loadUsername() {

    const usernameElement =
        document.getElementById("username");

    if (!usernameElement) {
        return;
    }

    try {

        const user =
            JSON.parse(
                localStorage.getItem("user") || "{}"
            );

        usernameElement.textContent =
            user.name ||
            localStorage.getItem("username") ||
            "Student";

    } catch {

        usernameElement.textContent =
            localStorage.getItem("username") ||
            "Student";
    }
}


// ============================================================
// SETTINGS
// ============================================================

function loadSettings() {

    try {

        const storedSettings =
            localStorage.getItem(SETTINGS_KEY);

        if (!storedSettings) {

            currentSettings = {
                ...DEFAULT_SETTINGS
            };

            return;
        }

        const parsedSettings =
            JSON.parse(storedSettings);

        if (
            !parsedSettings ||
            typeof parsedSettings !== "object"
        ) {

            currentSettings = {
                ...DEFAULT_SETTINGS
            };

            return;
        }

        currentSettings = {
            ...DEFAULT_SETTINGS,
            ...parsedSettings
        };

    } catch (error) {

        console.error(
            "Unable to load settings:",
            error
        );

        currentSettings = {
            ...DEFAULT_SETTINGS
        };
    }
}


// ============================================================
// APPLY DARK MODE
// ============================================================

function applyDarkMode() {

    document.body.classList.toggle(
        "dark-mode",
        Boolean(currentSettings.darkMode)
    );
}


// ============================================================
// LOAD TASKS
// ============================================================

function loadTasks() {

    try {

        const storedTasks =
            localStorage.getItem(STORAGE_KEY);

        if (!storedTasks) {

            tasks = [];

            return;
        }

        const parsedTasks =
            JSON.parse(storedTasks);

        tasks =
            Array.isArray(parsedTasks)
                ? parsedTasks
                : [];

    } catch (error) {

        console.error(
            "Unable to load tasks:",
            error
        );

        tasks = [];
    }
}


// ============================================================
// SAVE TASKS
// ============================================================

function saveTasks() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(tasks)
        );

    } catch (error) {

        console.error(
            "Unable to save tasks:",
            error
        );
    }
}


// ============================================================
// SETUP EVENTS
// ============================================================

function setupEvents() {

    const addTaskButton =
        document.getElementById(
            "add-task-btn"
        );

    const taskForm =
        document.getElementById(
            "task-form"
        );

    const searchTask =
        document.getElementById(
            "searchTask"
        );

    const statusFilter =
        document.getElementById(
            "statusFilter"
        );

    const priorityFilter =
        document.getElementById(
            "priorityFilter"
        );

    const modalClose =
        document.getElementById(
            "modal-close"
        );

    const modalCancel =
        document.getElementById(
            "modal-cancel"
        );

    const modal =
        document.getElementById(
            "task-modal"
        );

    const taskTableBody =
        document.getElementById(
            "tasksTableBody"
        );


    // ADD TASK

    if (addTaskButton) {

        addTaskButton.addEventListener(
            "click",
            openAddModal
        );
    }


    // FORM SUBMIT

    if (taskForm) {

        taskForm.addEventListener(
            "submit",
            saveTask
        );
    }


    // SEARCH

    if (searchTask) {

        searchTask.addEventListener(
            "input",
            renderTasks
        );
    }


    // STATUS FILTER

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            renderTasks
        );
    }


    // PRIORITY FILTER

    if (priorityFilter) {

        priorityFilter.addEventListener(
            "change",
            renderTasks
        );
    }


    // CLOSE MODAL

    if (modalClose) {

        modalClose.addEventListener(
            "click",
            closeModal
        );
    }


    if (modalCancel) {

        modalCancel.addEventListener(
            "click",
            closeModal
        );
    }


    // CLICK OUTSIDE MODAL

    if (modal) {

        modal.addEventListener(
            "click",
            (event) => {

                if (
                    event.target === modal
                ) {

                    closeModal();
                }
            }
        );
    }


    // TASK ACTIONS

    if (taskTableBody) {

        taskTableBody.addEventListener(
            "click",
            handleTaskAction
        );
    }


    // ESC KEY

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                modal &&
                modal.classList.contains("show")
            ) {

                closeModal();
            }
        }
    );


    // VIEW BUTTONS

    setupViewButtons();
}


// ============================================================
// VIEW BUTTONS
// ============================================================

function setupViewButtons() {

    const listButtons =
        document.querySelectorAll(
            '[data-view="list"], #listViewBtn'
        );

    const gridButtons =
        document.querySelectorAll(
            '[data-view="grid"], #gridViewBtn'
        );


    listButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    currentSettings.defaultView =
                        "list";

                    saveCurrentSettings();

                    applyTaskView();

                    showNotification(
                        "List view selected."
                    );
                }
            );
        }
    );


    gridButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    currentSettings.defaultView =
                        "grid";

                    saveCurrentSettings();

                    applyTaskView();

                    showNotification(
                        "Grid view selected."
                    );
                }
            );
        }
    );
}


// ============================================================
// APPLY TASK VIEW
// ============================================================

function applyTaskView() {

    const table =
        document.querySelector(
            ".tasks-table"
        );

    const taskContainer =
        document.querySelector(
            ".tasks-container"
        );

    const listView =
        document.querySelector(
            "#listView"
        );

    const gridView =
        document.querySelector(
            "#gridView"
        );


    // If project has separate list/grid containers

    if (listView && gridView) {

        if (
            currentSettings.defaultView ===
            "grid"
        ) {

            listView.classList.add(
                "hidden"
            );

            gridView.classList.remove(
                "hidden"
            );

        } else {

            listView.classList.remove(
                "hidden"
            );

            gridView.classList.add(
                "hidden"
            );
        }
    }


    // Add class to main task container

    if (taskContainer) {

        taskContainer.classList.toggle(
            "grid-view",
            currentSettings.defaultView ===
                "grid"
        );

        taskContainer.classList.toggle(
            "list-view",
            currentSettings.defaultView !==
                "grid"
        );
    }


    // Add class to table

    if (table) {

        table.classList.toggle(
            "grid-view",
            currentSettings.defaultView ===
                "grid"
        );
    }


    updateViewButtons();
}


// ============================================================
// UPDATE VIEW BUTTONS
// ============================================================

function updateViewButtons() {

    const listButtons =
        document.querySelectorAll(
            '[data-view="list"], #listViewBtn'
        );

    const gridButtons =
        document.querySelectorAll(
            '[data-view="grid"], #gridViewBtn'
        );


    listButtons.forEach(
        (button) => {

            button.classList.toggle(
                "active",
                currentSettings.defaultView ===
                    "list"
            );
        }
    );


    gridButtons.forEach(
        (button) => {

            button.classList.toggle(
                "active",
                currentSettings.defaultView ===
                    "grid"
            );
        }
    );
}


// ============================================================
// SAVE CURRENT SETTINGS
// ============================================================

function saveCurrentSettings() {

    try {

        localStorage.setItem(
            SETTINGS_KEY,
            JSON.stringify(
                currentSettings
            )
        );

    } catch (error) {

        console.error(
            "Unable to save task settings:",
            error
        );
    }
}


// ============================================================
// RENDER TASKS
// ============================================================

function renderTasks() {

    const tableBody =
        document.getElementById(
            "tasksTableBody"
        );

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";


    const searchInput =
        document.getElementById(
            "searchTask"
        );

    const statusFilter =
        document.getElementById(
            "statusFilter"
        );

    const priorityFilter =
        document.getElementById(
            "priorityFilter"
        );


    const searchValue =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const selectedStatus =
        statusFilter
            ? statusFilter.value.toLowerCase()
            : "all";


    const selectedPriority =
        priorityFilter
            ? priorityFilter.value.toLowerCase()
            : "all";


    const filteredTasks =
        tasks.filter(
            (task) => {

                const searchableText = [

                    task.title,

                    task.description,

                    task.category,

                    task.priority,

                    task.status

                ]
                    .join(" ")
                    .toLowerCase();


                const matchesSearch =
                    searchableText.includes(
                        searchValue
                    );


                const displayStatus =
                    getDisplayStatus(
                        task
                    ).toLowerCase();


                const matchesStatus =
                    selectedStatus === "all" ||
                    displayStatus ===
                        selectedStatus;


                const taskPriority =
                    String(
                        task.priority || ""
                    ).toLowerCase();


                const matchesPriority =
                    selectedPriority === "all" ||
                    taskPriority ===
                        selectedPriority;


                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesPriority
                );
            }
        );


    if (filteredTasks.length === 0) {

        showEmptyState(
            tableBody
        );

        updateSummary();

        return;
    }


    filteredTasks.forEach(
        (task) => {

            const row =
                document.createElement(
                    "tr"
                );


            const displayStatus =
                getDisplayStatus(
                    task
                );


            const priorityClass =
                String(
                    task.priority ||
                    "low"
                ).toLowerCase();


            const statusClass =
                displayStatus.toLowerCase();


            row.className =
                "task-row";


            row.dataset.id =
                task.id;


            row.innerHTML = `

                <td>

                    <div class="task-name">

                        <strong>
                            ${escapeHTML(
                                task.title
                            )}
                        </strong>

                        ${
                            task.description
                                ? `
                                    <small>
                                        ${escapeHTML(
                                            task.description
                                        )}
                                    </small>
                                `
                                : ""
                        }

                    </div>

                </td>


                <td>

                    <span class="task-category">

                        ${escapeHTML(
                            task.category ||
                            "Other"
                        )}

                    </span>

                </td>


                <td>

                    <span
                        class="priority-badge ${priorityClass}"
                    >

                        ${escapeHTML(
                            task.priority ||
                            "Low"
                        )}

                    </span>

                </td>


                <td>

                    <span
                        class="${
                            displayStatus ===
                            "Overdue"
                                ? "overdue-date"
                                : ""
                        }"
                    >

                        ${formatDate(
                            task.dueDate
                        )}

                    </span>

                </td>


                <td>

                    <span
                        class="status-badge ${statusClass}"
                    >

                        ${displayStatus}

                    </span>

                </td>


                <td>

                    <div class="task-actions">

                        <button
                            type="button"
                            class="task-action-btn complete-btn"
                            data-action="toggle"
                            data-id="${task.id}"
                            title="${
                                task.status ===
                                "Completed"
                                    ? "Mark as pending"
                                    : "Mark as completed"
                            }"
                        >

                            <i class="fas ${
                                task.status ===
                                "Completed"
                                    ? "fa-rotate-left"
                                    : "fa-check"
                            }"></i>

                        </button>


                        <button
                            type="button"
                            class="task-action-btn edit-btn"
                            data-action="edit"
                            data-id="${task.id}"
                            title="Edit task"
                        >

                            <i class="fas fa-pen"></i>

                        </button>


                        <button
                            type="button"
                            class="task-action-btn delete-btn"
                            data-action="delete"
                            data-id="${task.id}"
                            title="Delete task"
                        >

                            <i class="fas fa-trash"></i>

                        </button>

                    </div>

                </td>

            `;


            tableBody.appendChild(
                row
            );
        }
    );


    updateSummary();
}


// ============================================================
// EMPTY STATE
// ============================================================

function showEmptyState(
    tableBody
) {

    const row =
        document.createElement(
            "tr"
        );


    row.innerHTML = `

        <td
            colspan="6"
            class="empty-state"
        >

            <i class="fas fa-clipboard-list"></i>

            <h3>No tasks found</h3>

            <p>

                ${
                    tasks.length === 0
                        ? "Add your first academic task to get started."
                        : "Try changing your search or filters."
                }

            </p>


            ${
                tasks.length === 0
                    ? `

                        <button
                            type="button"
                            class="primary-btn"
                            id="empty-add-task-btn"
                        >

                            <i class="fas fa-plus"></i>

                            Add Task

                        </button>

                    `
                    : ""
            }

        </td>

    `;


    tableBody.appendChild(
        row
    );


    const emptyAddButton =
        document.getElementById(
            "empty-add-task-btn"
        );


    if (emptyAddButton) {

        emptyAddButton.addEventListener(
            "click",
            openAddModal
        );
    }
}


// ============================================================
// STATUS
// ============================================================

function getDisplayStatus(
    task
) {

    if (
        task.status === "Completed" ||
        task.status === "completed" ||
        task.completed === true
    ) {

        return "Completed";
    }


    if (isOverdue(task)) {

        return "Overdue";
    }


    return "Pending";
}


// ============================================================
// SUMMARY
// ============================================================

function updateSummary() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            (task) =>
                task.status ===
                    "Completed" ||
                task.status ===
                    "completed" ||
                task.completed ===
                    true
        ).length;


    const overdue =
        tasks.filter(
            (task) =>
                isOverdue(task)
        ).length;


    const pending =
        tasks.filter(
            (task) =>
                getDisplayStatus(
                    task
                ) === "Pending"
        ).length;


    setElement(
        "totalTaskCount",
        total
    );

    setElement(
        "pendingTaskCount",
        pending
    );

    setElement(
        "completedTaskCount",
        completed
    );

    setElement(
        "overdueTaskCount",
        overdue
    );
}


// ============================================================
// SET ELEMENT
// ============================================================

function setElement(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;
    }
}


// ============================================================
// OPEN ADD MODAL
// ============================================================

function openAddModal() {

    const modal =
        document.getElementById(
            "task-modal"
        );

    const form =
        document.getElementById(
            "task-form"
        );


    if (!modal || !form) {

        return;
    }


    form.reset();


    const taskId =
        document.getElementById(
            "task-id"
        );

    if (taskId) {

        taskId.value = "";
    }


    const modalTitle =
        document.getElementById(
            "modal-title"
        );

    if (modalTitle) {

        modalTitle.textContent =
            "Add New Task";
    }


    const modalSubtitle =
        document.getElementById(
            "modal-subtitle"
        );

    if (modalSubtitle) {

        modalSubtitle.textContent =
            "Create an academic task";
    }


    // ========================================================
    // USE DEFAULT PRIORITY FROM SETTINGS
    // ========================================================

    const priorityInput =
        document.getElementById(
            "task-priority"
        );


    if (priorityInput) {

        priorityInput.value =
            currentSettings.defaultPriority ||
            "medium";
    }


    // DEFAULT STATUS

    const statusInput =
        document.getElementById(
            "task-status"
        );


    if (statusInput) {

        statusInput.value =
            "Pending";
    }


    const taskMessage =
        document.getElementById(
            "task-message"
        );


    if (taskMessage) {

        taskMessage.textContent =
            "";

        taskMessage.className =
            "task-message";
    }


    modal.classList.add(
        "show"
    );


    setTimeout(
        () => {

            document
                .getElementById(
                    "task-title"
                )
                ?.focus();

        },
        100
    );
}


// ============================================================
// OPEN EDIT MODAL
// ============================================================

function openEditModal(
    id
) {

    const task =
        tasks.find(
            (item) =>
                String(item.id) ===
                String(id)
        );


    if (!task) {

        return;
    }


    const modal =
        document.getElementById(
            "task-modal"
        );


    if (!modal) {

        return;
    }


    setInputValue(
        "task-id",
        task.id
    );

    setInputValue(
        "task-title",
        task.title || ""
    );

    setInputValue(
        "task-description",
        task.description || ""
    );

    setInputValue(
        "task-category",
        task.category || ""
    );

    setInputValue(
        "task-priority",
        task.priority ||
            currentSettings.defaultPriority ||
            "medium"
    );

    setInputValue(
        "task-due-date",
        task.dueDate || ""
    );


    const statusInput =
        document.getElementById(
            "task-status"
        );


    if (statusInput) {

        statusInput.value =
            task.status === "Completed"
                ? "Completed"
                : "Pending";
    }


    const modalTitle =
        document.getElementById(
            "modal-title"
        );


    if (modalTitle) {

        modalTitle.textContent =
            "Edit Task";
    }


    const modalSubtitle =
        document.getElementById(
            "modal-subtitle"
        );


    if (modalSubtitle) {

        modalSubtitle.textContent =
            "Update your academic task";
    }


    const taskMessage =
        document.getElementById(
            "task-message"
        );


    if (taskMessage) {

        taskMessage.textContent =
            "";

        taskMessage.className =
            "task-message";
    }


    modal.classList.add(
        "show"
    );


    setTimeout(
        () => {

            document
                .getElementById(
                    "task-title"
                )
                ?.focus();

        },
        100
    );
}


// ============================================================
// SET INPUT VALUE
// ============================================================

function setInputValue(
    id,
    value
) {

    const input =
        document.getElementById(
            id
        );


    if (input) {

        input.value =
            value;
    }
}


// ============================================================
// CLOSE MODAL
// ============================================================

function closeModal() {

    const modal =
        document.getElementById(
            "task-modal"
        );

    const form =
        document.getElementById(
            "task-form"
        );

    const taskMessage =
        document.getElementById(
            "task-message"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );
    }


    if (form) {

        form.reset();
    }


    if (taskMessage) {

        taskMessage.textContent =
            "";

        taskMessage.className =
            "task-message";
    }
}


// ============================================================
// SAVE TASK
// ============================================================

function saveTask(
    event
) {

    event.preventDefault();


    const taskId =
        document.getElementById(
            "task-id"
        );

    const titleInput =
        document.getElementById(
            "task-title"
        );

    const descriptionInput =
        document.getElementById(
            "task-description"
        );

    const categoryInput =
        document.getElementById(
            "task-category"
        );

    const priorityInput =
        document.getElementById(
            "task-priority"
        );

    const dueDateInput =
        document.getElementById(
            "task-due-date"
        );

    const statusInput =
        document.getElementById(
            "task-status"
        );


    if (
        !titleInput ||
        !categoryInput ||
        !priorityInput ||
        !dueDateInput ||
        !statusInput
    ) {

        console.error(
            "Task form elements missing."
        );

        return;
    }


    const title =
        titleInput.value.trim();


    if (!title) {

        showMessage(
            "Please enter a task title.",
            "error"
        );

        return;
    }


    if (!categoryInput.value) {

        showMessage(
            "Please select a category.",
            "error"
        );

        return;
    }


    if (!priorityInput.value) {

        showMessage(
            "Please select a priority.",
            "error"
        );

        return;
    }


    if (!dueDateInput.value) {

        showMessage(
            "Please select a due date.",
            "error"
        );

        return;
    }


    const id =
        taskId
            ? taskId.value
            : "";


    const taskData = {

        title,

        description:
            descriptionInput
                ? descriptionInput.value.trim()
                : "",

        category:
            categoryInput.value,

        priority:
            priorityInput.value,

        dueDate:
            dueDateInput.value,

        status:
            statusInput.value,

        completed:
            statusInput.value ===
            "Completed",

        updatedAt:
            new Date().toISOString()
    };


    // ========================================================
    // UPDATE EXISTING TASK
    // ========================================================

    if (id) {

        const index =
            tasks.findIndex(
                (task) =>
                    String(task.id) ===
                    String(id)
            );


        if (index !== -1) {

            tasks[index] = {

                ...tasks[index],

                ...taskData
            };
        }


        showNotification(
            "Task updated successfully."
        );


    }

    // ========================================================
    // ADD NEW TASK
    // ========================================================

    else {

        tasks.unshift({

            id:
                Date.now().toString(),

            ...taskData,

            createdAt:
                new Date().toISOString()
        });


        showNotification(
            "Task added successfully."
        );
    }


    saveTasks();

    renderTasks();

    closeModal();
}


// ============================================================
// TASK ACTIONS
// ============================================================

function handleTaskAction(
    event
) {

    const button =
        event.target.closest(
            "button[data-action]"
        );


    if (!button) {

        return;
    }


    const action =
        button.dataset.action;


    const id =
        button.dataset.id;


    if (action === "edit") {

        openEditModal(id);
    }


    if (action === "delete") {

        deleteTask(id);
    }


    if (action === "toggle") {

        toggleTaskStatus(id);
    }
}


// ============================================================
// TOGGLE TASK STATUS
// ============================================================

function toggleTaskStatus(
    id
) {

    const task =
        tasks.find(
            (item) =>
                String(item.id) ===
                String(id)
        );


    if (!task) {

        return;
    }


    const completed =
        task.status === "Completed" ||
        task.status === "completed" ||
        task.completed === true;


    if (completed) {

        task.status =
            "Pending";

        task.completed =
            false;

        delete task.completedAt;


        showNotification(
            "Task marked as pending."
        );


    } else {

        task.status =
            "Completed";

        task.completed =
            true;

        task.completedAt =
            new Date().toISOString();


        showNotification(
            "Task marked as completed."
        );
    }


    task.updatedAt =
        new Date().toISOString();


    saveTasks();

    renderTasks();
}


// ============================================================
// DELETE TASK
// ============================================================

function deleteTask(
    id
) {

    const task =
        tasks.find(
            (item) =>
                String(item.id) ===
                String(id)
        );


    if (!task) {

        return;
    }


    const confirmed =
        window.confirm(
            `Are you sure you want to delete "${task.title}"?`
        );


    if (!confirmed) {

        return;
    }


    tasks =
        tasks.filter(
            (item) =>
                String(item.id) !==
                String(id)
        );


    saveTasks();

    renderTasks();


    showNotification(
        "Task deleted successfully."
    );
}


// ============================================================
// OVERDUE
// ============================================================

function isOverdue(
    task
) {

    if (
        !task.dueDate ||
        task.status === "Completed" ||
        task.status === "completed" ||
        task.completed === true
    ) {

        return false;
    }


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    const dueDate =
        new Date(
            `${task.dueDate}T00:00:00`
        );


    return dueDate <
        today;
}


// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(
    dateString
) {

    if (!dateString) {

        return "-";
    }


    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;
    }


    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// ============================================================
// FORM MESSAGE
// ============================================================

function showMessage(
    message,
    type
) {

    const taskMessage =
        document.getElementById(
            "task-message"
        );


    if (!taskMessage) {

        return;
    }


    taskMessage.textContent =
        message;


    taskMessage.className =
        `task-message ${type}`;
}


// ============================================================
// NOTIFICATION
// ============================================================

function showNotification(
    message
) {

    // ========================================================
    // SETTINGS -> TASK NOTIFICATIONS
    // ========================================================

    loadSettings();


    // If notifications are OFF,
    // don't display task notifications.

    if (
        currentSettings.notifications ===
        false
    ) {

        console.log(
            "Task notification disabled:",
            message
        );

        return;
    }


    let notification =
        document.getElementById(
            "task-notification"
        );


    if (!notification) {

        notification =
            document.createElement(
                "div"
            );

        notification.id =
            "task-notification";

        document.body.appendChild(
            notification
        );
    }


    notification.innerHTML = `

        <i class="fas fa-circle-check"></i>

        <span>
            ${escapeHTML(message)}
        </span>

    `;


    notification.classList.add(
        "show"
    );


    clearTimeout(
        notification.hideTimer
    );


    notification.hideTimer =
        setTimeout(
            () => {

                notification.classList.remove(
                    "show"
                );

            },
            2500
        );
}


// ============================================================
// LISTEN FOR SETTINGS CHANGES
// ============================================================

window.addEventListener(
    "storage",
    (event) => {

        if (
            event.key ===
            SETTINGS_KEY
        ) {

            loadSettings();

            applyDarkMode();

            applyTaskView();

            renderTasks();
        }


        if (
            event.key ===
                "username" ||
            event.key ===
                "user"
        ) {

            loadUsername();
        }


        if (
            event.key ===
            STORAGE_KEY
        ) {

            loadTasks();

            renderTasks();
        }
    }
);