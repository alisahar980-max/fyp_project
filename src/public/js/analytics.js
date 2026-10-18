document.addEventListener("DOMContentLoaded", () => {
    initializeAnalytics();
});

async function initializeAnalytics() {
    try {
        const response = await api.get("/api/auth/me");

        if (!response || !response.user) {
            handleAuthenticationFailure();
            return;
        }

        const user = response.user;

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("username", user.name || "Student");

        updateAnalyticsUser(user);
        loadAnalytics();

    } catch (error) {
        console.error("Analytics authentication error:", error);

        if (error.status === 401) {
            handleAuthenticationFailure();
        }
    }
}

function handleAuthenticationFailure() {
    localStorage.removeItem("user");
    localStorage.removeItem("username");

    window.location.href = "/index.html";
}

function updateAnalyticsUser(user) {
    const name = user.name || "Student";

    document.querySelectorAll(
        "#username, #user-name, #welcome-name, .username, .user-name"
    ).forEach(element => {
        element.textContent = name;
    });

    document.querySelectorAll(
        "#user-initial, .user-initial"
    ).forEach(element => {
        element.textContent = name.charAt(0).toUpperCase();
    });
}

function loadAnalytics() {
    const tasks = getAnalyticsTasks();

    updateSummary(tasks);
    updateProgress(tasks);
    updatePriority(tasks);
    updateProductivity(tasks);
}

function getAnalyticsTasks() {
    try {
        const storedTasks = localStorage.getItem("studentTasks");

        if (!storedTasks) {
            return [];
        }

        const tasks = JSON.parse(storedTasks);

        return Array.isArray(tasks) ? tasks : [];

    } catch (error) {
        console.error("Could not load analytics tasks:", error);
        return [];
    }
}

function isCompleted(task) {
    return (
        task.status === "Completed" ||
        task.status === "completed" ||
        task.completed === true
    );
}

function updateSummary(tasks) {
    const total = tasks.length;

    const completed = tasks.filter(task =>
        isCompleted(task)
    ).length;

    const pending = total - completed;

    const completionRate = total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    setText("totalTasks", total);
    setText("completedTasks", completed);
    setText("pendingTasks", pending);
    setText("completionRate", `${completionRate}%`);
}

function updateProgress(tasks) {
    const total = tasks.length;

    const completed = tasks.filter(task =>
        isCompleted(task)
    ).length;

    const pending = total - completed;

    const completedPercent = total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    const pendingPercent = total > 0
        ? Math.round((pending / total) * 100)
        : 0;

    setText("completedPercent", `${completedPercent}%`);
    setText("pendingPercent", `${pendingPercent}%`);

    const completedProgress =
        document.getElementById("completedProgress");

    const pendingProgress =
        document.getElementById("pendingProgress");

    if (completedProgress) {
        completedProgress.style.width =
            `${completedPercent}%`;
    }

    if (pendingProgress) {
        pendingProgress.style.width =
            `${pendingPercent}%`;
    }
}

function updatePriority(tasks) {
    const high = tasks.filter(task =>
        String(task.priority || "").toLowerCase() === "high"
    ).length;

    const medium = tasks.filter(task =>
        String(task.priority || "").toLowerCase() === "medium"
    ).length;

    const low = tasks.filter(task =>
        String(task.priority || "").toLowerCase() === "low"
    ).length;

    setText("highTasks", high);
    setText("mediumTasks", medium);
    setText("lowTasks", low);
}

function updateProductivity(tasks) {
    const total = tasks.length;

    const completed = tasks.filter(task =>
        isCompleted(task)
    ).length;

    const pending = total - completed;

    const rate = total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    setText("circleRate", `${rate}%`);
    setText("detailTotal", total);
    setText("detailCompleted", completed);
    setText("detailPending", pending);

    const circle =
        document.getElementById("productivityCircle");

    if (circle) {
        circle.style.setProperty(
            "--progress",
            `${rate}%`
        );
    }
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

window.addEventListener("storage", event => {
    if (event.key === "studentTasks") {
        loadAnalytics();
    }
});