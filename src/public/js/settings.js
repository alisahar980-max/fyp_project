// =====================================================
// STUDENT TASK MANAGER - SETTINGS
// =====================================================

"use strict";

const SETTINGS_KEY = "studentSettings";


// =====================================================
// DEFAULT SETTINGS
// =====================================================

const defaultSettings = {

    // Appearance
    darkMode: false,

    // Notifications
    notifications: true,
    emailNotifications: false,
    taskReminders: true,

    // Task preferences
    defaultPriority: "medium",
    defaultView: "list"
};


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    initializeSettings();

});


// =====================================================
// INITIALIZE SETTINGS
// =====================================================

async function initializeSettings() {

    try {

        const authenticated =
            await loadLoggedInUser();

        if (!authenticated) {
            return;
        }

        loadSettings();

        setupSettingsEvents();

        updateNotificationStatus();

        window.studentSettings =
            getSettings();

        console.log(
            "Settings initialized:",
            getSettings()
        );

    } catch (error) {

        console.error(
            "Settings initialization error:",
            error
        );

    }
}


// =====================================================
// LOAD LOGGED-IN USER
// =====================================================

async function loadLoggedInUser() {

    try {

        const response =
            await api.get("/api/auth/me");

        if (!response || !response.user) {

            handleAuthenticationFailure();

            return false;
        }

        const user =
            response.user;

        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );

        localStorage.setItem(
            "username",
            user.name || "Student"
        );

        updateUsername(user);

        return true;

    } catch (error) {

        console.error(
            "Settings authentication error:",
            error
        );

        if (error.status === 401) {

            handleAuthenticationFailure();

        }

        return false;
    }
}


// =====================================================
// AUTHENTICATION FAILURE
// =====================================================

function handleAuthenticationFailure() {

    localStorage.removeItem("user");

    localStorage.removeItem("username");

    window.location.href =
        "/index.html";
}


// =====================================================
// UPDATE USERNAME
// =====================================================

function updateUsername(user) {

    const name =
        user.name || "Student";


    document.querySelectorAll(
        "#username, #user-name, #welcome-name, .username, .user-name"
    ).forEach(element => {

        element.textContent =
            name;

    });


    document.querySelectorAll(
        "#user-initial, .user-initial"
    ).forEach(element => {

        element.textContent =
            name
                .charAt(0)
                .toUpperCase();

    });
}


// =====================================================
// GET SETTINGS
// =====================================================

function getSettings() {

    try {

        const storedSettings =
            localStorage.getItem(
                SETTINGS_KEY
            );


        if (!storedSettings) {

            return {
                ...defaultSettings
            };

        }


        const savedSettings =
            JSON.parse(
                storedSettings
            );


        if (
            !savedSettings ||
            typeof savedSettings !== "object"
        ) {

            return {
                ...defaultSettings
            };

        }


        return {

            ...defaultSettings,

            ...savedSettings

        };

    } catch (error) {

        console.error(
            "Could not load settings:",
            error
        );

        return {
            ...defaultSettings
        };
    }
}


// =====================================================
// LOAD SETTINGS INTO UI
// =====================================================

function loadSettings() {

    const settings =
        getSettings();


    const darkModeToggle =
        document.getElementById(
            "darkModeToggle"
        );


    const notificationsToggle =
        document.getElementById(
            "notificationsToggle"
        );


    const emailToggle =
        document.getElementById(
            "emailToggle"
        );


    const taskRemindersToggle =
        document.getElementById(
            "taskRemindersToggle"
        );


    const defaultPriority =
        document.getElementById(
            "defaultPriority"
        );


    const defaultView =
        document.getElementById(
            "defaultView"
        );


    // =================================================
    // DARK MODE
    // =================================================

    if (darkModeToggle) {

        darkModeToggle.checked =
            Boolean(
                settings.darkMode
            );

    }


    // =================================================
    // TASK NOTIFICATIONS
    // =================================================

    if (notificationsToggle) {

        notificationsToggle.checked =
            Boolean(
                settings.notifications
            );

    }


    // =================================================
    // EMAIL NOTIFICATIONS
    // =================================================

    if (emailToggle) {

        emailToggle.checked =
            Boolean(
                settings.emailNotifications
            );

    }


    // =================================================
    // TASK REMINDERS
    // =================================================

    if (taskRemindersToggle) {

        taskRemindersToggle.checked =
            Boolean(
                settings.taskReminders
            );

    }


    // =================================================
    // DEFAULT PRIORITY
    // =================================================

    if (defaultPriority) {

        defaultPriority.value =
            settings.defaultPriority;

    }


    // =================================================
    // DEFAULT VIEW
    // =================================================

    if (defaultView) {

        defaultView.value =
            settings.defaultView;

    }


    // =================================================
    // APPLY DARK MODE
    // =================================================

    applyDarkMode(
        settings.darkMode
    );
}


// =====================================================
// SETUP SETTINGS EVENTS
// =====================================================

function setupSettingsEvents() {

    const darkModeToggle =
        document.getElementById(
            "darkModeToggle"
        );


    const notificationsToggle =
        document.getElementById(
            "notificationsToggle"
        );


    const emailToggle =
        document.getElementById(
            "emailToggle"
        );


    const taskRemindersToggle =
        document.getElementById(
            "taskRemindersToggle"
        );


    const saveButton =
        document.getElementById(
            "saveSettingsBtn"
        );


    const resetButton =
        document.getElementById(
            "resetSettingsBtn"
        );


    const clearTasksButton =
        document.getElementById(
            "clearTasksBtn"
        );


    const testNotificationButton =
        document.getElementById(
            "testNotificationBtn"
        );


    // =================================================
    // DARK MODE
    // =================================================

    if (darkModeToggle) {

        darkModeToggle.addEventListener(
            "change",
            function () {

                const settings =
                    getSettings();

                settings.darkMode =
                    this.checked;

                saveSettingsToStorage(
                    settings
                );

                applyDarkMode(
                    settings.darkMode
                );

                showSettingsMessage(
                    settings.darkMode
                        ? "Dark mode enabled."
                        : "Dark mode disabled."
                );

            }
        );

    }


    // =================================================
    // TASK NOTIFICATIONS
    // =================================================

    if (notificationsToggle) {

        notificationsToggle.addEventListener(
            "change",
            async function () {

                const settings =
                    getSettings();

                settings.notifications =
                    this.checked;

                saveSettingsToStorage(
                    settings
                );

                window.studentSettings =
                    settings;

                updateNotificationStatus();


                if (
                    this.checked &&
                    "Notification" in window
                ) {

                    await requestNotificationPermission();

                }


                showSettingsMessage(

                    this.checked
                        ? "Task notifications enabled."
                        : "Task notifications disabled."

                );

            }
        );

    }


    // =================================================
    // EMAIL REMINDERS
    // =================================================

    if (emailToggle) {

        emailToggle.addEventListener(
            "change",
            function () {

                const settings =
                    getSettings();

                settings.emailNotifications =
                    this.checked;

                saveSettingsToStorage(
                    settings
                );

                window.studentSettings =
                    settings;


                showSettingsMessage(

                    this.checked
                        ? "Email reminders enabled."
                        : "Email reminders disabled."

                );

            }
        );

    }


    // =================================================
    // TASK REMINDERS
    // =================================================

    if (taskRemindersToggle) {

        taskRemindersToggle.addEventListener(
            "change",
            function () {

                const settings =
                    getSettings();

                settings.taskReminders =
                    this.checked;

                saveSettingsToStorage(
                    settings
                );

                window.studentSettings =
                    settings;


                showSettingsMessage(

                    this.checked
                        ? "Task reminders enabled."
                        : "Task reminders disabled."

                );

            }
        );

    }


    // =================================================
    // SAVE SETTINGS BUTTON
    // =================================================

    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveSettings
        );

    }


    // =================================================
    // RESET SETTINGS BUTTON
    // =================================================

    if (resetButton) {

        resetButton.addEventListener(
            "click",
            resetSettings
        );

    }


    // =================================================
    // CLEAR TASKS
    // =================================================

    if (clearTasksButton) {

        clearTasksButton.addEventListener(
            "click",
            clearTaskData
        );

    }


    // =================================================
    // TEST NOTIFICATION
    // =================================================

    if (testNotificationButton) {

        testNotificationButton.addEventListener(
            "click",
            testNotification
        );

    }


    console.log(
        "Settings event listeners connected."
    );
}


// =====================================================
// SAVE SETTINGS
// =====================================================

async function saveSettings() {

    const darkModeToggle =
        document.getElementById(
            "darkModeToggle"
        );


    const notificationsToggle =
        document.getElementById(
            "notificationsToggle"
        );


    const emailToggle =
        document.getElementById(
            "emailToggle"
        );


    const taskRemindersToggle =
        document.getElementById(
            "taskRemindersToggle"
        );


    const defaultPriority =
        document.getElementById(
            "defaultPriority"
        );


    const defaultView =
        document.getElementById(
            "defaultView"
        );


    const settings = {

        darkMode:
            darkModeToggle
                ? darkModeToggle.checked
                : false,


        notifications:
            notificationsToggle
                ? notificationsToggle.checked
                : true,


        emailNotifications:
            emailToggle
                ? emailToggle.checked
                : false,


        taskReminders:
            taskRemindersToggle
                ? taskRemindersToggle.checked
                : true,


        defaultPriority:
            defaultPriority
                ? defaultPriority.value
                : "medium",


        defaultView:
            defaultView
                ? defaultView.value
                : "list"

    };


    // Save
    saveSettingsToStorage(
        settings
    );


    // Apply dark mode
    applyDarkMode(
        settings.darkMode
    );


    // Browser notification permission
    if (
        settings.notifications &&
        "Notification" in window &&
        Notification.permission === "default"
    ) {

        await requestNotificationPermission();

    }


    // Global settings
    window.studentSettings =
        settings;


    updateNotificationStatus();


    showSettingsMessage(
        "Settings saved successfully."
    );


    console.log(
        "SETTINGS SAVED:",
        settings
    );
}


// =====================================================
// SAVE TO LOCAL STORAGE
// =====================================================

function saveSettingsToStorage(settings) {

    try {

        localStorage.setItem(
            SETTINGS_KEY,
            JSON.stringify(settings)
        );

        window.studentSettings =
            settings;

        console.log(
            "Settings stored:",
            settings
        );

    } catch (error) {

        console.error(
            "Could not save settings:",
            error
        );

    }
}


// =====================================================
// REQUEST NOTIFICATION PERMISSION
// =====================================================

async function requestNotificationPermission() {

    if (
        !("Notification" in window)
    ) {

        showSettingsMessage(
            "Browser notifications are not supported."
        );

        return false;
    }


    try {

        const permission =
            await Notification.requestPermission();


        if (
            permission === "granted"
        ) {

            showSettingsMessage(
                "Browser notifications enabled."
            );

            updateNotificationStatus();

            return true;
        }


        if (
            permission === "denied"
        ) {

            showSettingsMessage(
                "Browser notifications are blocked by the browser."
            );

            updateNotificationStatus();

            return false;
        }

    } catch (error) {

        console.error(
            "Notification permission error:",
            error
        );

    }


    return false;
}


// =====================================================
// TEST NOTIFICATION
// =====================================================

async function testNotification() {

    const settings =
        getSettings();


    if (!settings.notifications) {

        showSettingsMessage(
            "Please enable Task Notifications first."
        );

        return;
    }


    if (
        !("Notification" in window)
    ) {

        showSettingsMessage(
            "Your browser does not support notifications."
        );

        return;
    }


    if (
        Notification.permission !== "granted"
    ) {

        const granted =
            await requestNotificationPermission();


        if (!granted) {
            return;
        }
    }


    try {

        new Notification(
            "StudentTask",
            {
                body:
                    "Notifications are working successfully!",

                icon:
                    "/favicon.ico"
            }
        );


        showSettingsMessage(
            "Test notification sent."
        );


    } catch (error) {

        console.error(
            "Notification error:",
            error
        );

        showSettingsMessage(
            "Could not send notification."
        );

    }
}


// =====================================================
// NOTIFICATION STATUS
// =====================================================

function updateNotificationStatus() {

    const status =
        document.getElementById(
            "notificationStatus"
        );


    if (!status) {
        return;
    }


    const settings =
        getSettings();


    if (!settings.notifications) {

        status.textContent =
            "Notifications are turned off.";

        return;
    }


    if (
        !("Notification" in window)
    ) {

        status.textContent =
            "Browser notifications are not supported.";

        return;
    }


    if (
        Notification.permission === "granted"
    ) {

        status.textContent =
            "Browser notifications are enabled.";

    }

    else if (
        Notification.permission === "denied"
    ) {

        status.textContent =
            "Browser notifications are blocked by the browser.";

    }

    else {

        status.textContent =
            "Notifications are enabled in settings.";

    }
}


// =====================================================
// RESET SETTINGS
// =====================================================

function resetSettings() {

    const confirmed =
        confirm(
            "Are you sure you want to reset all settings?"
        );


    if (!confirmed) {
        return;
    }


    const resetValues = {
        ...defaultSettings
    };


    saveSettingsToStorage(
        resetValues
    );


    loadSettings();

    updateNotificationStatus();


    window.studentSettings =
        resetValues;


    showSettingsMessage(
        "Settings reset successfully."
    );
}


// =====================================================
// CLEAR TASK DATA
// =====================================================

function clearTaskData() {

    const confirmed =
        confirm(
            "Are you sure you want to permanently delete all tasks?"
        );


    if (!confirmed) {
        return;
    }


    localStorage.removeItem(
        "studentTasks"
    );

    localStorage.removeItem(
        "tasks"
    );

    localStorage.removeItem(
        "taskData"
    );


    showSettingsMessage(
        "All task data has been cleared."
    );


    setTimeout(
        () => {

            window.location.reload();

        },
        700
    );
}


// =====================================================
// DARK MODE
// =====================================================

function applyDarkMode(enabled) {

    document.body.classList.toggle(
        "dark-mode",
        Boolean(enabled)
    );
}


// =====================================================
// SETTINGS MESSAGE
// =====================================================

function showSettingsMessage(message) {

    let notification =
        document.getElementById(
            "settings-notification"
        );


    if (!notification) {

        notification =
            document.createElement(
                "div"
            );

        notification.id =
            "settings-notification";

        document.body.appendChild(
            notification
        );
    }


    notification.innerHTML = `

        <i class="fa-solid fa-circle-check"></i>

        <span>
            ${escapeHTML(message)}
        </span>

    `;


    notification.classList.add(
        "show"
    );


    clearTimeout(
        notification.timer
    );


    notification.timer =
        setTimeout(
            () => {

                notification.classList.remove(
                    "show"
                );

            },
            2500
        );
}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

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


// =====================================================
// GLOBAL SETTINGS FUNCTION
// =====================================================

window.getStudentSettings =
    function () {

        return getSettings();

    };