const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db/db");

const router = express.Router();


// =====================================================
// REGISTER
// POST /api/auth/register
// =====================================================
router.post("/register", async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            securityQuestion,
            securityAnswer
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                error: "Name, email and password are required."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: "Password must be at least 6 characters."
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        // Check existing account
        const existingUser = db.prepare(`
            SELECT user_id
            FROM users
            WHERE LOWER(email) = ?
        `).get(cleanEmail);

        if (existingUser) {
            return res.status(409).json({
                error: "An account with this email already exists."
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create account
        const result = db.prepare(`
            INSERT INTO users
            (name, email, password, security_question, security_answer)
            VALUES (?, ?, ?, ?, ?)
        `).run(
            cleanName,
            cleanEmail,
            hashedPassword,
            securityQuestion ? securityQuestion.trim() : "",
            securityAnswer ? securityAnswer.trim().toLowerCase() : ""
        );

        const user = db.prepare(`
            SELECT user_id, name, email
            FROM users
            WHERE user_id = ?
        `).get(result.lastInsertRowid);

        // Login the newly registered user
        req.session.userId = user.user_id;

        return res.status(201).json({
            success: true,
            message: "Account created successfully.",
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);

        return res.status(500).json({
            error: "Unable to create account."
        });
    }
});


// =====================================================
// LOGIN
// POST /api/auth/login
// =====================================================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required."
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        const user = db.prepare(`
            SELECT user_id, name, email, password
            FROM users
            WHERE LOWER(email) = ?
        `).get(cleanEmail);

        if (!user) {
            return res.status(401).json({
                error: "Invalid email or password."
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                error: "Invalid email or password."
            });
        }

        // Save logged-in user's database ID in session
        req.session.userId = user.user_id;

        return res.json({
            success: true,
            message: "Login successful.",
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        return res.status(500).json({
            error: "Unable to login."
        });
    }
});


// =====================================================
// CURRENT USER
// GET /api/auth/me
// =====================================================
router.get("/me", (req, res) => {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({
                error: "Not authenticated."
            });
        }

        const user = db.prepare(`
            SELECT user_id, name, email
            FROM users
            WHERE user_id = ?
        `).get(req.session.userId);

        if (!user) {
            return res.status(401).json({
                error: "User not found."
            });
        }

        return res.json({
            authenticated: true,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("ME ERROR:", error);

        return res.status(500).json({
            error: "Unable to get user information."
        });
    }
});


// =====================================================
// LOGOUT
// POST /api/auth/logout
// =====================================================
router.post("/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error("LOGOUT ERROR:", error);

            return res.status(500).json({
                error: "Unable to logout."
            });
        }

        res.clearCookie("connect.sid");

        return res.json({
            success: true,
            message: "Logged out successfully."
        });
    });
});


// =====================================================
// FORGOT PASSWORD - SECURITY QUESTION
// GET /api/auth/forgot-question?email=...
// =====================================================
router.get("/forgot-question", (req, res) => {
    try {
        const email = String(req.query.email || "")
            .trim()
            .toLowerCase();

        if (!email) {
            return res.status(400).json({
                error: "Email is required."
            });
        }

        const user = db.prepare(`
            SELECT security_question
            FROM users
            WHERE LOWER(email) = ?
        `).get(email);

        if (!user) {
            return res.status(404).json({
                error: "No account found with this email."
            });
        }

        return res.json({
            question: user.security_question
        });

    } catch (error) {
        console.error("FORGOT QUESTION ERROR:", error);

        return res.status(500).json({
            error: "Unable to find security question."
        });
    }
});


// =====================================================
// RESET PASSWORD
// POST /api/auth/reset-password
// =====================================================
router.post("/reset-password", async (req, res) => {
    try {
        const {
            email,
            answer,
            newPassword
        } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                error: "Email and new password are required."
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                error: "Password must be at least 6 characters."
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        const user = db.prepare(`
            SELECT user_id, security_answer
            FROM users
            WHERE LOWER(email) = ?
        `).get(cleanEmail);

        if (!user) {
            return res.status(404).json({
                error: "No account found with this email."
            });
        }

        // If security answer is provided, verify it
        if (answer !== undefined) {
            const cleanAnswer = String(answer)
                .trim()
                .toLowerCase();

            const savedAnswer = String(
                user.security_answer || ""
            ).trim().toLowerCase();

            if (cleanAnswer !== savedAnswer) {
                return res.status(401).json({
                    error: "Incorrect security answer."
                });
            }
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        // Update password using user_id
        db.prepare(`
            UPDATE users
            SET password = ?
            WHERE user_id = ?
        `).run(
            hashedPassword,
            user.user_id
        );

        return res.json({
            success: true,
            message: "Password reset successfully."
        });

    } catch (error) {
        console.error("RESET PASSWORD ERROR:", error);

        return res.status(500).json({
            error: "Unable to reset password."
        });
    }
});


module.exports = router;

