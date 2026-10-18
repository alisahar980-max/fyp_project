// =====================================================
// STUDENT TASK MANAGER - HELP CENTER
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
    initializeHelp();
});


// =====================================================
// INITIALIZE HELP CENTER
// =====================================================

async function initializeHelp() {

    try {

        // Load logged-in user
        await loadHelpUser();

        // Setup all help functionality
        setupHelpNavigation();
        setupQuickHelp();
        setupHelpCards();

        console.log("Help Center initialized.");

    } catch (error) {

        console.error(
            "Help Center initialization error:",
            error
        );

    }

}


// =====================================================
// LOAD LOGGED-IN USER
// =====================================================

async function loadHelpUser() {

    try {

        // If API exists, get current user
        if (
            typeof api !== "undefined" &&
            typeof api.get === "function"
        ) {

            const response =
                await api.get("/api/auth/me");

            if (
                response &&
                response.user
            ) {

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

                updateHelpUsername(user);

                return true;
            }
        }

        // Fallback to localStorage
        const storedUser =
            localStorage.getItem("user");

        if (storedUser) {

            const user =
                JSON.parse(storedUser);

            updateHelpUsername(user);

            return true;
        }

        const username =
            localStorage.getItem("username");

        if (username) {

            updateHelpUsername({
                name: username
            });

        }

        return true;

    } catch (error) {

        console.error(
            "Help user loading error:",
            error
        );

        return false;
    }

}


// =====================================================
// UPDATE USERNAME
// =====================================================

function updateHelpUsername(user) {

    const name =
        user?.name || "Student";

    document.querySelectorAll(
        "#username, #user-name, #welcome-name, .username, .user-name"
    ).forEach(element => {

        element.textContent = name;

    });

}


// =====================================================
// SIDEBAR HELP NAVIGATION
// =====================================================

function setupHelpNavigation() {

    /*
        The Need Help box in the sidebar
        will open help.html.
    */

    const helpBox =
        document.querySelector(".help-box");

    if (helpBox) {

        helpBox.style.cursor = "pointer";

        helpBox.setAttribute(
            "role",
            "button"
        );

        helpBox.setAttribute(
            "tabindex",
            "0"
        );

        helpBox.addEventListener(
            "click",
            openHelpPage
        );

        helpBox.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();

                    openHelpPage();

                }

            }
        );

    }


    /*
        If there is an element with
        #need-help-btn, make that clickable too.
    */

    const needHelpButton =
        document.getElementById(
            "need-help-btn"
        );

    if (needHelpButton) {

        needHelpButton.addEventListener(
            "click",
            openHelpPage
        );

    }

}


// =====================================================
// OPEN HELP PAGE
// =====================================================

function openHelpPage() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop();

    // Already on help page
    if (currentPage === "help.html") {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        return;
    }

    window.location.href =
        "help.html";

}


// =====================================================
// QUICK HELP
// =====================================================

function setupQuickHelp() {

    const quickItems =
        document.querySelectorAll(
            ".quick-help-item"
        );

    quickItems.forEach(item => {

        item.style.cursor = "pointer";

        item.setAttribute(
            "role",
            "button"
        );

        item.setAttribute(
            "tabindex",
            "0"
        );

        item.addEventListener(
            "click",
            () => {

                const text =
                    item.textContent
                        .trim()
                        .toLowerCase();

                if (
                    text.includes("create task")
                ) {

                    goToPage(
                        "tasks.html"
                    );

                }

                else if (
                    text.includes("edit profile")
                ) {

                    goToPage(
                        "profile.html"
                    );

                }

                else if (
                    text.includes("notification")
                ) {

                    goToPage(
                        "settings.html"
                    );

                }

            }
        );


        item.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();

                    item.click();

                }

            }
        );

    });

}


// =====================================================
// HELP CARDS
// =====================================================

function setupHelpCards() {

    const helpCards =
        document.querySelectorAll(
            ".help-card"
        );

    helpCards.forEach(card => {

        card.style.cursor = "pointer";

        card.addEventListener(
            "click",
            () => {

                const title =
                    card.querySelector("h3");

                if (!title) {
                    return;
                }

                const section =
                    title.textContent
                        .trim()
                        .toLowerCase();


                if (
                    section.includes("managing tasks")
                ) {

                    goToPage(
                        "tasks.html"
                    );

                }

                else if (
                    section.includes("dashboard")
                ) {

                    goToPage(
                        "dashboard.html"
                    );

                }

                else if (
                    section.includes("analytics")
                ) {

                    goToPage(
                        "analytics.html"
                    );

                }

                else if (
                    section.includes("profile")
                ) {

                    goToPage(
                        "profile.html"
                    );

                }

                else if (
                    section.includes("settings")
                ) {

                    goToPage(
                        "settings.html"
                    );

                }

                else if (
                    section.includes("forgot password")
                ) {

                    goToLoginForgotPassword();

                }

            }
        );

    });

}


// =====================================================
// GO TO PAGE
// =====================================================

function goToPage(page) {

    window.location.href =
        page;

}


// =====================================================
// FORGOT PASSWORD
// =====================================================

function goToLoginForgotPassword() {

    /*
        Your login page is index.html.
        We open it and tell auth.js to open
        the Forgot Password modal.
    */

    window.location.href =
        "../index.html?forgotPassword=true";

}


// =====================================================
// QUICK HELP VISUAL FEEDBACK
// =====================================================

document.addEventListener(
    "click",
    event => {

        const item =
            event.target.closest(
                ".quick-help-item"
            );

        if (!item) {
            return;
        }

        item.classList.add(
            "help-clicked"
        );

        setTimeout(() => {

            item.classList.remove(
                "help-clicked"
            );

        }, 300);

    }
);