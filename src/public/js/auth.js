(function () {
    "use strict";

    // =====================================================
    // LOGIN / REGISTER ELEMENTS
    // =====================================================

    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const message = document.getElementById("auth-message");
    const tabs = document.querySelectorAll(".tab");

    if (!loginForm || !registerForm || !message) {
        console.error("Login form elements not found.");
        return;
    }

    // =====================================================
    // MESSAGE
    // =====================================================

    function showMessage(text, type = "error") {
        message.textContent = text;
        message.className = `message ${type}`;
    }

    // =====================================================
    // SAVE USER
    // =====================================================

    function saveUser(user) {
        if (!user) return;

        const name = user.name || "";
        const email = user.email || "";

        localStorage.setItem("username", name);

        localStorage.setItem(
            "user",
            JSON.stringify({
                user_id: user.user_id,
                name: name,
                email: email
            })
        );
    }

    // =====================================================
    // LOGIN / REGISTER TABS
    // =====================================================

    tabs.forEach((tab) => {
        tab.addEventListener("click", function () {

            tabs.forEach((item) => {
                item.classList.remove("active");
            });

            tab.classList.add("active");

            message.textContent = "";

            const isLogin =
                tab.dataset.tab === "login";

            loginForm.classList.toggle(
                "hidden",
                !isLogin
            );

            registerForm.classList.toggle(
                "hidden",
                isLogin
            );
        });
    });

    // =====================================================
    // LOGIN
    // =====================================================

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        console.log("LOGIN BUTTON CLICKED");

        const formData = new FormData(loginForm);

        const email = String(
            formData.get("email") || ""
        ).trim();

        const password = String(
            formData.get("password") || ""
        );

        if (!email || !password) {
            showMessage(
                "Please enter email and password."
            );
            return;
        }

        try {

            showMessage(
                "Signing in...",
                "success"
            );

            const response = await api.post(
                "/api/auth/login",
                {
                    email: email,
                    password: password
                }
            );

            console.log(
                "LOGIN RESPONSE:",
                response
            );

            if (response.user) {
                saveUser(response.user);
            }

            showMessage(
                "Login successful. Opening dashboard...",
                "success"
            );

            setTimeout(function () {
                window.location.href =
                    "/dashboard.html";
            }, 500);

        } catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );

            showMessage(
                error.message ||
                "Login failed. Please check your email and password."
            );
        }
    });

    // =====================================================
    // REGISTER
    // =====================================================

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const formData =
            new FormData(registerForm);

        const name = String(
            formData.get("name") || ""
        ).trim();

        const email = String(
            formData.get("email") || ""
        ).trim();

        const password = String(
            formData.get("password") || ""
        );

        const securityQuestion = String(
            formData.get("securityQuestion") || ""
        ).trim();

        const securityAnswer = String(
            formData.get("securityAnswer") || ""
        ).trim();

        if (!name || !email || !password) {

            showMessage(
                "Please fill in all required fields."
            );

            return;
        }

        if (password.length < 6) {

            showMessage(
                "Password must be at least 6 characters."
            );

            return;
        }

        try {

            showMessage(
                "Creating account...",
                "success"
            );

            const response = await api.post(
                "/api/auth/register",
                {
                    name: name,
                    email: email,
                    password: password,
                    securityQuestion:
                        securityQuestion,
                    securityAnswer:
                        securityAnswer
                }
            );

            console.log(
                "REGISTER RESPONSE:",
                response
            );

            if (response.user) {
                saveUser(response.user);
            }

            showMessage(
                "Account created successfully. Opening dashboard...",
                "success"
            );

            setTimeout(function () {
                window.location.href =
                    "/dashboard.html";
            }, 500);

        } catch (error) {

            console.error(
                "REGISTER ERROR:",
                error
            );

            showMessage(
                error.message ||
                "Registration failed."
            );
        }
    });

    // =====================================================
    // SHOW / HIDE PASSWORD
    // =====================================================

    document
        .querySelectorAll(".toggle-password")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    const wrapper =
                        button.closest(".relative");

                    if (!wrapper) return;

                    const input =
                        wrapper.querySelector(
                            "input"
                        );

                    if (!input) return;

                    if (input.type === "password") {

                        input.type = "text";

                        button.textContent =
                            "Hide";

                    } else {

                        input.type =
                            "password";

                        button.textContent =
                            "Show";
                    }
                }
            );
        });

    // =====================================================
    // FORGOT PASSWORD
    // =====================================================

    let userEmail = "";

    const modal =
        document.getElementById("forgotModal");

    const closeBtn =
        document.getElementById("closeModalBtn");

    const forgotForm =
        document.getElementById("forgotForm");

    console.log(
        "FORGOT PASSWORD ELEMENTS:",
        {
            forgotBtn:
                !!document.getElementById(
                    "forgotPasswordBtn"
                ),

            modal:
                !!modal,

            forgotForm:
                !!forgotForm,

            resetEmail:
                !!document.getElementById(
                    "resetEmail"
                ),

            closeBtn:
                !!closeBtn
        }
    );

    // =====================================================
    // OPEN FORGOT PASSWORD
    // =====================================================

    document.addEventListener(
        "click",
        function (event) {

            const forgotButton =
                event.target.closest(
                    "#forgotPasswordBtn"
                );

            if (!forgotButton) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            console.log(
                "FORGOT PASSWORD BUTTON CLICKED"
            );

            const forgotModal =
                document.getElementById(
                    "forgotModal"
                );

            if (!forgotModal) {

                console.error(
                    "forgotModal not found."
                );

                return;
            }

            forgotModal.classList.remove(
                "hidden"
            );

            // FORCE MODAL ABOVE EVERYTHING
            forgotModal.style.display =
                "flex";

            forgotModal.style.visibility =
                "visible";

            forgotModal.style.opacity =
                "1";

            forgotModal.style.pointerEvents =
                "auto";

            forgotModal.style.position =
                "fixed";

            forgotModal.style.zIndex =
                "999999";

            document.body.style.overflow =
                "hidden";

            const emailInput =
                document.getElementById(
                    "resetEmail"
                );

            if (emailInput) {

                emailInput.value = "";

                emailInput.disabled = false;
                emailInput.readOnly = false;

                emailInput.style.pointerEvents =
                    "auto";

                emailInput.style.position =
                    "relative";

                emailInput.style.zIndex =
                    "1000000";

                setTimeout(function () {
                    emailInput.focus();
                }, 100);
            }

            const status =
                document.getElementById(
                    "modalStatus"
                );

            if (status) {

                status.textContent = "";

                status.className =
                    "text-sm text-center hidden";
            }

            const sendButton =
                document.getElementById(
                    "sendResetBtn"
                );

            if (sendButton) {

                sendButton.disabled =
                    false;

                sendButton.textContent =
                    "Continue";
            }
        }
    );

    // =====================================================
    // CLOSE MODAL
    // =====================================================

    function closeModal() {

        const forgotModal =
            document.getElementById(
                "forgotModal"
            );

        if (!forgotModal) {
            return;
        }

        forgotModal.classList.add(
            "hidden"
        );

        forgotModal.style.display =
            "none";

        forgotModal.style.visibility =
            "hidden";

        forgotModal.style.opacity =
            "0";

        forgotModal.style.pointerEvents =
            "none";

        document.body.style.overflow =
            "auto";
    }

    // =====================================================
    // CLOSE BUTTON
    // =====================================================

    if (closeBtn) {

        closeBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                closeModal();
            }
        );
    }

    // =====================================================
    // CLICK OUTSIDE MODAL
    // =====================================================

    if (modal) {

        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    modal
                ) {
                    closeModal();
                }
            }
        );
    }

    // =====================================================
    // CHECK EMAIL
    // =====================================================

    if (forgotForm) {

        forgotForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                const resetEmail =
                    document.getElementById(
                        "resetEmail"
                    );

                const sendBtn =
                    document.getElementById(
                        "sendResetBtn"
                    );

                const email = String(
                    resetEmail?.value || ""
                )
                    .trim()
                    .toLowerCase();

                console.log(
                    "FORGOT PASSWORD EMAIL:",
                    email
                );

                if (!email) {

                    showModalStatus(
                        "Please enter your email address.",
                        "error"
                    );

                    return;
                }

                if (sendBtn) {

                    sendBtn.disabled =
                        true;

                    sendBtn.textContent =
                        "Checking...";
                }

                try {

                    const response =
                        await fetch(
                            "/api/auth/forgot-question?email=" +
                            encodeURIComponent(
                                email
                            ),
                            {
                                method: "GET",
                                credentials: "include"
                            }
                        );

                    const data =
                        await response.json();

                    console.log(
                        "FORGOT QUESTION RESPONSE:",
                        data
                    );

                    if (!response.ok) {

                        throw new Error(
                            data.error ||
                            data.message ||
                            "Account not found."
                        );
                    }

                    userEmail =
                        email;

                    showResetForm(
                        data.question
                    );

                } catch (error) {

                    console.error(
                        "FORGOT PASSWORD ERROR:",
                        error
                    );

                    showModalStatus(
                        error.message ||
                        "Could not find your account.",
                        "error"
                    );

                    if (sendBtn) {

                        sendBtn.disabled =
                            false;

                        sendBtn.textContent =
                            "Continue";
                    }
                }
            }
        );
    }

    // =====================================================
    // SHOW RESET FORM
    // =====================================================

    function showResetForm(question) {

        if (!forgotForm) {
            return;
        }

        forgotForm.innerHTML = `

            <div
                style="
                    position:relative;
                    z-index:1000000;
                    pointer-events:auto;
                "
                class="space-y-4"
            >

                <!-- SECURITY QUESTION -->

                <div>

                    <label
                        class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
                    >
                        Security Question
                    </label>

                    <div
                        class="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50 text-gray-700 text-sm"
                    >
                        ${escapeHtml(
                            question ||
                            "Security question"
                        )}
                    </div>

                </div>

                <!-- SECURITY ANSWER -->

                <div>

                    <label
                        class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
                    >
                        Security Answer
                    </label>

                    <input
                        type="text"
                        id="securityAnswer"
                        name="securityAnswer"
                        autocomplete="off"
                        placeholder="Enter your answer"
                        required
                        style="
                            position:relative;
                            z-index:1000001;
                            pointer-events:auto;
                            user-select:text;
                            cursor:text;
                        "
                        class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none text-gray-800 text-sm"
                    >

                </div>

                <!-- NEW PASSWORD -->

                <div>

                    <label
                        class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
                    >
                        New Password
                    </label>

                    <input
                        type="password"
                        id="resetPassword"
                        name="newPassword"
                        autocomplete="new-password"
                        placeholder="Enter new password"
                        minlength="6"
                        required
                        style="
                            position:relative;
                            z-index:1000001;
                            pointer-events:auto;
                            user-select:text;
                            cursor:text;
                        "
                        class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none text-gray-800 text-sm"
                    >

                </div>

                <!-- CONFIRM PASSWORD -->

                <div>

                    <label
                        class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
                    >
                        Confirm New Password
                    </label>

                    <input
                        type="password"
                        id="confirmResetPassword"
                        name="confirmPassword"
                        autocomplete="new-password"
                        placeholder="Confirm new password"
                        minlength="6"
                        required
                        style="
                            position:relative;
                            z-index:1000001;
                            pointer-events:auto;
                            user-select:text;
                            cursor:text;
                        "
                        class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none text-gray-800 text-sm"
                    >

                </div>

                <!-- STATUS -->

                <div
                    id="resetStatus"
                    class="text-sm text-center hidden"
                ></div>

                <!-- BUTTONS -->

                <div
                    class="flex gap-3 pt-2"
                    style="
                        position:relative;
                        z-index:1000002;
                    "
                >

                    <button
                        type="button"
                        id="backBtn"
                        class="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 text-sm"
                    >
                        Back
                    </button>

                    <button
                        type="button"
                        id="resetBtn"
                        class="flex-1 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm"
                    >
                        Reset Password
                    </button>

                </div>

            </div>
        `;

        // =================================================
        // GET NEW ELEMENTS
        // =================================================

        const securityAnswer =
            document.getElementById(
                "securityAnswer"
            );

        const resetPasswordInput =
            document.getElementById(
                "resetPassword"
            );

        const confirmResetPassword =
            document.getElementById(
                "confirmResetPassword"
            );

        const backBtn =
            document.getElementById(
                "backBtn"
            );

        const resetBtn =
            document.getElementById(
                "resetBtn"
            );

        // =================================================
        // FORCE INPUTS TO BE CLICKABLE
        // =================================================

        [
            securityAnswer,
            resetPasswordInput,
            confirmResetPassword
        ].forEach(function (input) {

            if (!input) return;

            input.disabled = false;
            input.readOnly = false;

            input.style.pointerEvents =
                "auto";

            input.style.userSelect =
                "text";

            input.style.cursor =
                "text";

            input.style.position =
                "relative";

            input.style.zIndex =
                "1000001";

            // Extra protection against
            // another element blocking input

            input.addEventListener(
                "click",
                function (event) {
                    event.stopPropagation();
                }
            );

            input.addEventListener(
                "mousedown",
                function (event) {
                    event.stopPropagation();
                }
            );

            input.addEventListener(
                "keydown",
                function (event) {
                    event.stopPropagation();
                }
            );
        });

        // =================================================
        // BACK
        // =================================================

        if (backBtn) {

            backBtn.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    location.reload();
                }
            );
        }

        // =================================================
        // RESET
        // =================================================

        if (resetBtn) {

            resetBtn.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    resetPassword();
                }
            );
        }

        // =================================================
        // DEBUG
        // =================================================

        console.log(
            "RESET FORM CREATED:",
            {
                securityAnswer:
                    !!securityAnswer,

                resetPassword:
                    !!resetPasswordInput,

                confirmResetPassword:
                    !!confirmResetPassword,

                resetBtn:
                    !!resetBtn
            }
        );
    }

    // =====================================================
    // RESET PASSWORD
    // =====================================================

    async function resetPassword() {

        // IMPORTANT:
        // These IDs now MATCH showResetForm()

        const answer = String(
            document.getElementById(
                "securityAnswer"
            )?.value || ""
        )
            .trim()
            .toLowerCase();

        const newPassword = String(
            document.getElementById(
                "resetPassword"
            )?.value || ""
        );

        const confirmPassword = String(
            document.getElementById(
                "confirmResetPassword"
            )?.value || ""
        );

        const resetBtn =
            document.getElementById(
                "resetBtn"
            );

        console.log(
            "RESET PASSWORD DATA:",
            {
                email: userEmail,
                answerEntered:
                    !!answer,
                newPasswordEntered:
                    !!newPassword,
                confirmPasswordEntered:
                    !!confirmPassword
            }
        );

        // =================================================
        // VALIDATION
        // =================================================

        if (
            !answer ||
            !newPassword ||
            !confirmPassword
        ) {

            showResetStatus(
                "Please fill in all fields.",
                "error"
            );

            return;
        }

        if (newPassword.length < 6) {

            showResetStatus(
                "Password must be at least 6 characters.",
                "error"
            );

            return;
        }

        if (
            newPassword !==
            confirmPassword
        ) {

            showResetStatus(
                "Passwords do not match.",
                "error"
            );

            return;
        }

        if (!userEmail) {

            showResetStatus(
                "Email session is missing. Please start again.",
                "error"
            );

            return;
        }

        if (resetBtn) {

            resetBtn.disabled =
                true;

            resetBtn.textContent =
                "Resetting...";
        }

        // =================================================
        // SEND TO SERVER
        // =================================================

        try {

            console.log(
                "RESETTING PASSWORD FOR:",
                userEmail
            );

            const response =
                await fetch(
                    "/api/auth/reset-password",
                    {
                        method: "POST",

                        credentials:
                            "include",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email:
                                userEmail,

                            answer:
                                answer,

                            newPassword:
                                newPassword
                        })
                    }
                );

            const text =
                await response.text();

            let data = {};

            try {
                data =
                    text
                        ? JSON.parse(text)
                        : {};
            } catch {
                data = {
                    message: text
                };
            }

            console.log(
                "RESET PASSWORD RESPONSE:",
                data
            );

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    data.message ||
                    "Could not reset password."
                );
            }

            // =================================================
            // SUCCESS
            // =================================================

            showResetStatus(
                "Password reset successfully! You can now login.",
                "success"
            );

            if (resetBtn) {

                resetBtn.textContent =
                    "Done";
            }

            setTimeout(function () {

                closeModal();

                const loginTab =
                    document.getElementById(
                        "tab-login"
                    );

                if (loginTab) {
                    loginTab.click();
                }

            }, 2000);

        } catch (error) {

            console.error(
                "RESET PASSWORD ERROR:",
                error
            );

            showResetStatus(
                error.message ||
                "Could not reset password.",
                "error"
            );

            if (resetBtn) {

                resetBtn.disabled =
                    false;

                resetBtn.textContent =
                    "Reset Password";
            }
        }
    }

    // =====================================================
    // MODAL STATUS
    // =====================================================

    function showModalStatus(
        text,
        type
    ) {

        const status =
            document.getElementById(
                "modalStatus"
            );

        if (!status) return;

        status.textContent =
            text;

        if (type === "error") {

            status.className =
                "text-sm text-center text-red-600 bg-red-50 p-3 rounded-lg";

        } else {

            status.className =
                "text-sm text-center text-green-600 bg-green-50 p-3 rounded-lg";
        }
    }

    // =====================================================
    // RESET STATUS
    // =====================================================

    function showResetStatus(
        text,
        type
    ) {

        const status =
            document.getElementById(
                "resetStatus"
            );

        if (!status) return;

        status.textContent =
            text;

        status.classList.remove(
            "hidden"
        );

        if (type === "error") {

            status.className =
                "text-sm text-center text-red-600 bg-red-50 p-3 rounded-lg";

        } else {

            status.className =
                "text-sm text-center text-green-600 bg-green-50 p-3 rounded-lg";
        }
    }

    // =====================================================
    // ESCAPE HTML
    // =====================================================

    function escapeHtml(text) {

        const div =
            document.createElement(
                "div"
            );

        div.textContent =
            text;

        return div.innerHTML;
    }

})();