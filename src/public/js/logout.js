document.addEventListener("DOMContentLoaded", () => {
    const logoutButtons =
        document.querySelectorAll(
            "#sidebar-logout-btn, #logout-btn, .logout-btn, .logout-link"
        );

    logoutButtons.forEach(button => {
        button.addEventListener(
            "click",
            logoutUser
        );
    });
});

async function logoutUser(event) {
    event.preventDefault();

    try {
        await api.post(
            "/api/auth/logout"
        );
    } catch (error) {
        console.error(
            "Logout error:",
            error
        );
    } finally {
        localStorage.removeItem("user");
        localStorage.removeItem("username");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("isLoggedIn");

        sessionStorage.clear();

        window.location.href =
            "/index.html";
    }
}