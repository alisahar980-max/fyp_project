document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await api.get("/api/auth/me");

        if (!response || !response.user) {
            redirectToLogin();
            return;
        }

        const user = response.user;

        localStorage.setItem(
            "username",
            user.name || "Student"
        );

        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );

        loadDashboard();

        window.addEventListener(
            "storage",
            event => {
                if (event.key === "studentTasks") {
                    loadDashboard();
                }
            }
        );

    } catch (error) {
        console.error(
            "Dashboard authentication error:",
            error
        );

        if (error.status === 401) {
            redirectToLogin();
        }
    }
});

function redirectToLogin() {
    localStorage.removeItem("user");
    localStorage.removeItem("username");

    window.location.href = "/index.html";
}

function loadDashboard() {
    loadUsername();

    const tasks = getTasks();

    updateStatistics(tasks);
    createWeeklyChart(tasks);
    createCategoryChart(tasks);
}

function loadUsername() {
    const usernameElement =
        document.getElementById("username");

    if (!usernameElement) {
        return;
    }

    try {
        const user = JSON.parse(
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

function getTasks() {
    try {
        const storedTasks =
            localStorage.getItem("studentTasks");

        if (!storedTasks) {
            return [];
        }

        const tasks = JSON.parse(storedTasks);

        return Array.isArray(tasks)
            ? tasks
            : [];

    } catch {
        return [];
    }
}

function updateStatistics(tasks) {
    const total = tasks.length;

    const completed = tasks.filter(task =>
        task.status === "Completed" ||
        task.status === "completed" ||
        task.completed === true
    ).length;

    const pending = tasks.filter(task =>
        task.status !== "Completed" &&
        task.status !== "completed" &&
        task.completed !== true
    ).length;

    const today = new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );

    const overdue = tasks.filter(task => {
        if (
            !task.dueDate ||
            task.status === "Completed" ||
            task.status === "completed" ||
            task.completed === true
        ) {
            return false;
        }

        const dueDate =
            new Date(`${task.dueDate}T00:00:00`);

        return dueDate < today;
    }).length;

    const completionRate =
        total > 0
            ? Math.round(
                (completed / total) * 100
            )
            : 0;

    setText(
        "totalTasks",
        total
    );

    setText(
        "completedTasks",
        completed
    );

    setText(
        "pendingTasks",
        pending
    );

    setText(
        "overdueTasks",
        overdue
    );

    setText(
        "completionRate",
        `${completionRate}%`
    );
}

function setText(id, value) {
    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

function createWeeklyChart(tasks) {
    const canvas =
        document.getElementById(
            "weeklyChart"
        );

    if (
        !canvas ||
        typeof Chart === "undefined"
    ) {
        return;
    }

    const existingChart =
        Chart.getChart(canvas);

    if (existingChart) {
        existingChart.destroy();
    }

    const labels = [];
    const completedData = [];
    const pendingData = [];

    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const date =
            new Date(today);

        date.setDate(
            today.getDate() - i
        );

        labels.push(
            date.toLocaleDateString(
                "en-US",
                {
                    weekday: "short"
                }
            )
        );

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");

        const dateString =
            `${year}-${month}-${day}`;

        let completed = 0;
        let pending = 0;

        tasks.forEach(task => {
            const taskDate =
                task.completedAt ||
                task.updatedAt ||
                task.dueDate ||
                task.createdAt;

            if (!taskDate) {
                return;
            }

            const normalizedDate =
                String(taskDate).slice(0, 10);

            if (normalizedDate !== dateString) {
                return;
            }

            if (
                task.status === "Completed" ||
                task.status === "completed" ||
                task.completed === true
            ) {
                completed++;
            } else {
                pending++;
            }
        });

        completedData.push(completed);
        pendingData.push(pending);
    }

    new Chart(canvas, {
        type: "bar",
        data: {
            labels,
            datasets: [
                {
                    label: "Completed",
                    data: completedData
                },
                {
                    label: "Pending",
                    data: pendingData
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function createCategoryChart(tasks) {
    const canvas =
        document.getElementById(
            "categoryChart"
        );

    if (
        !canvas ||
        typeof Chart === "undefined"
    ) {
        return;
    }

    const existingChart =
        Chart.getChart(canvas);

    if (existingChart) {
        existingChart.destroy();
    }

    const categoryData = {};

    tasks.forEach(task => {
        const category =
            task.category ||
            "General";

        if (!categoryData[category]) {
            categoryData[category] = {
                total: 0,
                completed: 0
            };
        }

        categoryData[category].total++;

        if (
            task.status === "Completed" ||
            task.status === "completed" ||
            task.completed === true
        ) {
            categoryData[category].completed++;
        }
    });

    const labels =
        Object.keys(categoryData);

    const data =
        labels.map(
            category =>
                categoryData[category].total
        );

    new Chart(canvas, {
        type: "doughnut",
        data: {
            labels,
            datasets: [
                {
                    data
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}