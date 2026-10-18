// =====================================================
// STUDENT TASK MANAGER - PROFILE
// =====================================================

const PROFILE_KEY = "studentProfile";

let originalProfileData = {};


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("Profile page initializing...");

    loadProfile();

    setupProfileForm();

    setupEditButton();

    setupCancelButton();

    setupLogout();

});


// =====================================================
// LOAD PROFILE
// =====================================================

function loadProfile() {

    const user = getLoggedInUser();

    const savedProfile = getSavedProfile();

    const username = getLoggedInUserName(user);


    // =================================================
    // USERNAME
    // =================================================

    setText(
        "username",
        username
    );


    // =================================================
    // PROFILE NAME
    // =================================================

    const displayName =
        savedProfile.fullName ||
        user.fullName ||
        user.name ||
        username ||
        "Student";

    setText(
        "profileName",
        displayName
    );


    // =================================================
    // AVATAR
    // =================================================

    const initials =
        getInitials(displayName);


    const profileAvatar =
        document.getElementById(
            "profileAvatar"
        );


    if (profileAvatar) {

        profileAvatar.textContent =
            initials;

    }


    // =================================================
    // FORM VALUES
    // =================================================

    setValue(
        "fullName",
        savedProfile.fullName ||
        user.fullName ||
        user.name ||
        username
    );


    setValue(
        "email",
        savedProfile.email ||
        user.email ||
        ""
    );


    setValue(
        "studentId",
        savedProfile.studentId ||
        user.studentId ||
        ""
    );


    setValue(
        "department",
        savedProfile.department ||
        user.department ||
        ""
    );


    setValue(
        "semester",
        savedProfile.semester ||
        user.semester ||
        ""
    );


    // =================================================
    // MEMBER SINCE
    // =================================================

    const memberSince =
        document.getElementById(
            "memberSince"
        );


    if (memberSince) {

        memberSince.textContent =
            savedProfile.memberSince ||
            user.memberSince ||
            "2026";

    }


    // =================================================
    // STORE ORIGINAL VALUES
    // =================================================

    saveOriginalProfileData();

    disableProfileFields();

}


// =====================================================
// GET LOGGED-IN USER
// =====================================================

function getLoggedInUser() {

    // Try existing getCurrentUser()
    if (
        typeof getCurrentUser === "function"
    ) {

        try {

            const user =
                getCurrentUser();

            if (
                user &&
                typeof user === "object"
            ) {

                return user;

            }

        } catch (error) {

            console.warn(
                "getCurrentUser failed:",
                error
            );

        }

    }


    // Try localStorage user
    const storedUser =
        localStorage.getItem(
            "user"
        );


    if (storedUser) {

        try {

            const user =
                JSON.parse(
                    storedUser
                );


            if (
                user &&
                typeof user === "object"
            ) {

                return user;

            }

        } catch (error) {

            console.warn(
                "Could not parse user:",
                error
            );

        }

    }


    // Try currentUser
    const currentUser =
        localStorage.getItem(
            "currentUser"
        );


    if (currentUser) {

        try {

            const user =
                JSON.parse(
                    currentUser
                );


            if (
                user &&
                typeof user === "object"
            ) {

                return user;

            }

        } catch (error) {

            console.warn(
                "Could not parse currentUser:",
                error
            );

        }

    }


    // Try username
    const username =
        localStorage.getItem(
            "username"
        );


    if (username) {

        return {
            name: username
        };

    }


    return {};

}


// =====================================================
// GET USERNAME
// =====================================================

function getLoggedInUserName(user) {

    if (
        typeof getCurrentUserName ===
        "function"
    ) {

        try {

            const name =
                getCurrentUserName();

            if (
                name &&
                name !== "Student"
            ) {

                return String(
                    name
                ).trim();

            }

        } catch (error) {

            console.warn(
                "getCurrentUserName failed:",
                error
            );

        }

    }


    if (
        !user ||
        typeof user !== "object"
    ) {

        return "Student";

    }


    const name =
        user.name ||
        user.fullName ||
        user.username ||
        user.userName ||
        user.displayName;


    if (
        name &&
        String(name).trim()
    ) {

        return String(
            name
        ).trim();

    }


    return "Student";

}


// =====================================================
// GET SAVED PROFILE
// =====================================================

function getSavedProfile() {

    try {

        const saved =
            localStorage.getItem(
                PROFILE_KEY
            );


        if (!saved) {

            return {};

        }


        const profile =
            JSON.parse(
                saved
            );


        if (
            profile &&
            typeof profile === "object"
        ) {

            return profile;

        }

    } catch (error) {

        console.error(
            "Could not load saved profile:",
            error
        );

    }


    return {};

}


// =====================================================
// SETUP PROFILE FORM
// =====================================================

function setupProfileForm() {

    const form =
        document.getElementById(
            "profileForm"
        );


    if (!form) {

        console.error(
            "profileForm not found."
        );

        return;

    }


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            saveProfile();

        }
    );

}


// =====================================================
// EDIT PROFILE BUTTON
// =====================================================

function setupEditButton() {

    const editButton =
        document.getElementById(
            "editProfileBtn"
        );


    if (!editButton) {

        console.error(
            "Edit Profile button not found."
        );

        return;

    }


    editButton.addEventListener(
        "click",
        () => {

            enableProfileFields();

            editButton.style.display =
                "none";

            const actions =
                document.getElementById(
                    "profileActions"
                );


            if (actions) {

                actions.style.display =
                    "flex";

            }


            const firstInput =
                document.getElementById(
                    "fullName"
                );


            if (firstInput) {

                firstInput.focus();

            }


            console.log(
                "Profile edit mode enabled."
            );

        }
    );

}


// =====================================================
// CANCEL BUTTON
// =====================================================

function setupCancelButton() {

    const cancelButton =
        document.getElementById(
            "cancelProfileBtn"
        );


    if (!cancelButton) {

        return;

    }


    cancelButton.addEventListener(
        "click",
        () => {

            restoreOriginalProfileData();

            disableProfileFields();

            const editButton =
                document.getElementById(
                    "editProfileBtn"
                );


            if (editButton) {

                editButton.style.display =
                    "inline-flex";

            }


            const actions =
                document.getElementById(
                    "profileActions"
                );


            if (actions) {

                actions.style.display =
                    "none";

            }


            showMessage(
                "Changes cancelled."
            );

        }
    );

}


// =====================================================
// ENABLE PROFILE FIELDS
// =====================================================

function enableProfileFields() {

    const fields = [

        "fullName",
        "email",
        "studentId",
        "department",
        "semester"

    ];


    fields.forEach(id => {

        const element =
            document.getElementById(
                id
            );


        if (element) {

            element.disabled =
                false;

        }

    });


    const card =
        document.getElementById(
            "profileCard"
        );


    if (card) {

        card.classList.add(
            "profile-editing"
        );

    }

}


// =====================================================
// DISABLE PROFILE FIELDS
// =====================================================

function disableProfileFields() {

    const fields = [

        "fullName",
        "email",
        "studentId",
        "department",
        "semester"

    ];


    fields.forEach(id => {

        const element =
            document.getElementById(
                id
            );


        if (element) {

            element.disabled =
                true;

        }

    });


    const card =
        document.getElementById(
            "profileCard"
        );


    if (card) {

        card.classList.remove(
            "profile-editing"
        );

    }

}


// =====================================================
// SAVE ORIGINAL PROFILE
// =====================================================

function saveOriginalProfileData() {

    originalProfileData = {

        fullName:
            getValue("fullName"),

        email:
            getValue("email"),

        studentId:
            getValue("studentId"),

        department:
            getValue("department"),

        semester:
            getValue("semester")

    };

}


// =====================================================
// RESTORE ORIGINAL DATA
// =====================================================

function restoreOriginalProfileData() {

    setValue(
        "fullName",
        originalProfileData.fullName
    );

    setValue(
        "email",
        originalProfileData.email
    );

    setValue(
        "studentId",
        originalProfileData.studentId
    );

    setValue(
        "department",
        originalProfileData.department
    );

    setValue(
        "semester",
        originalProfileData.semester
    );

}


// =====================================================
// SAVE PROFILE
// =====================================================

function saveProfile() {

    const currentUser =
        getLoggedInUser();


    const existingProfile =
        getSavedProfile();


    // IMPORTANT:
    // Get the NEW full name from the input
    const fullName =
        getValue("fullName");


    const email =
        getValue("email");


    const studentId =
        getValue("studentId");


    const department =
        getValue("department");


    const semester =
        getValue("semester");


    // =================================================
    // VALIDATION
    // =================================================

    if (!fullName) {

        showMessage(
            "Please enter your full name.",
            true
        );

        return;

    }


    if (!email) {

        showMessage(
            "Please enter your email address.",
            true
        );

        return;

    }


    // =================================================
    // CREATE PROFILE
    // =================================================

    const profile = {

        ...existingProfile,

        fullName:
            fullName,

        email:
            email,

        studentId:
            studentId,

        department:
            department,

        semester:
            semester,

        memberSince:
            existingProfile.memberSince ||
            currentUser.memberSince ||
            new Date()
                .getFullYear()
                .toString()

    };


    // =================================================
    // SAVE PROFILE
    // =================================================

    localStorage.setItem(

        PROFILE_KEY,

        JSON.stringify(profile)

    );


    // =================================================
    // UPDATE USER
    // =================================================

    const updatedUser = {

        ...currentUser,

        name:
            fullName,

        fullName:
            fullName,

        email:
            email,

        studentId:
            studentId,

        department:
            department,

        semester:
            semester

    };


    updateLoggedInUser(
        updatedUser
    );


    // =================================================
    // UPDATE UI
    // =================================================

    setText(
        "username",
        fullName
    );


    setText(
        "profileName",
        fullName
    );


    const avatar =
        document.getElementById(
            "profileAvatar"
        );


    if (avatar) {

        avatar.textContent =
            getInitials(
                fullName
            );

    }


    // =================================================
    // SAVE ORIGINAL DATA
    // =================================================

    saveOriginalProfileData();


    // =================================================
    // EXIT EDIT MODE
    // =================================================

    disableProfileFields();


    const editButton =
        document.getElementById(
            "editProfileBtn"
        );


    if (editButton) {

        editButton.style.display =
            "inline-flex";

    }


    const actions =
        document.getElementById(
            "profileActions"
        );


    if (actions) {

        actions.style.display =
            "none";

    }


    // =================================================
    // SUCCESS MESSAGE
    // =================================================

    showMessage(
        "Profile updated successfully."
    );


    console.log(
        "PROFILE SAVED:",
        profile
    );

}


// =====================================================
// UPDATE USER IN LOCAL STORAGE
// =====================================================

function updateLoggedInUser(
    updatedUser
) {

    if (
        !updatedUser ||
        typeof updatedUser !== "object"
    ) {

        return;

    }


    localStorage.setItem(

        "user",

        JSON.stringify(
            updatedUser
        )

    );


    localStorage.setItem(

        "currentUser",

        JSON.stringify(
            updatedUser
        )

    );


    localStorage.setItem(

        "username",

        updatedUser.name ||
        updatedUser.fullName ||
        "Student"

    );

}


// =====================================================
// GET INPUT VALUE
// =====================================================

function getValue(id) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return "";

    }


    return String(
        element.value || ""
    ).trim();

}


// =====================================================
// SET INPUT VALUE
// =====================================================

function setValue(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return;

    }


    element.value =
        value || "";

}


// =====================================================
// SET TEXT
// =====================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value || "";

    }

}


// =====================================================
// GET INITIALS
// =====================================================

function getInitials(
    name
) {

    if (
        !name ||
        name === "Student"
    ) {

        return "S";

    }


    const words =
        String(name)
            .trim()
            .split(/\s+/);


    if (
        words.length === 1
    ) {

        return words[0]
            .charAt(0)
            .toUpperCase();

    }


    return (

        words[0].charAt(0) +

        words[
            words.length - 1
        ].charAt(0)

    ).toUpperCase();

}


// =====================================================
// LOGOUT
// =====================================================

function setupLogout() {

    const buttons =
        document.querySelectorAll(

            "#logout-btn, #sidebar-logout-btn"

        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();


                    if (
                        typeof logoutUser ===
                        "function"
                    ) {

                        logoutUser();

                    } else {

                        logoutFallback();

                    }

                }
            );

        }
    );

}


// =====================================================
// LOGOUT FALLBACK
// =====================================================

function logoutFallback() {

    const authKeys = [

        "username",
        "userName",
        "studentName",
        "name",
        "loggedInUser",
        "currentUser",
        "user",
        "isLoggedIn"

    ];


    authKeys.forEach(
        key => {

            localStorage.removeItem(
                key
            );

            sessionStorage.removeItem(
                key
            );

        }
    );


    localStorage.removeItem(
        PROFILE_KEY
    );


    localStorage.removeItem(
        "studentSettings"
    );


    window.location.href =
        "/login.html";

}


// =====================================================
// SHOW MESSAGE
// =====================================================

function showMessage(
    message,
    isError = false
) {

    let element =
        document.getElementById(
            "profileMessage"
        );


    if (!element) {

        return;

    }


    element.textContent =
        message;


    element.classList.add(
        "show"
    );


    if (isError) {

        element.style.background =
            "#fef2f2";

        element.style.color =
            "#b91c1c";

        element.style.borderColor =
            "#fecaca";

    } else {

        element.style.background =
            "#ecfdf5";

        element.style.color =
            "#047857";

        element.style.borderColor =
            "#a7f3d0";

    }


    clearTimeout(
        element.messageTimer
    );


    element.messageTimer =
        setTimeout(
            () => {

                element.classList.remove(
                    "show"
                );

            },
            3000
        );

}


// =====================================================
// STORAGE SYNC
// =====================================================

window.addEventListener(
    "storage",
    event => {

        if (

            event.key === "user" ||

            event.key === "currentUser" ||

            event.key === "username" ||

            event.key === PROFILE_KEY

        ) {

            loadProfile();

        }

    }
);