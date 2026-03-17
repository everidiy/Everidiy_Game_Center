import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import { generateSixDigitCode } from "./codeGenerate.js";
import { Pool } from "pg";

const server = express();
server.use(cors());
server.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

server.get("/", (req, res) => {
  res.send("Server works");
});

server.get("/api/users", async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT id, email FROM users");
        res.json(rows);
    } catch (e) {
        return res.status(500).json({ error: "Failed to load users" });
    }
})

server.post("/api/register", async (req, res) => {
    try {

        const { email, password, confirmPassword } = req.body;

        if (!email || !password || !confirmPassword) {
            return res.status(400).json({ error: "Р’СЃРµ РїРѕР»СЏ РѕР±СЏР·Р°С‚РµР»СЊРЅС‹" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: "РџР°СЂРѕР»Рё РЅРµ СЃРѕРІРїР°РґР°СЋС‚" });
        }

        const existing = await pool.query("SELECT 1 FROM users WHERE email = $1 LIMIT 1", [email]);
        if (existing.rowCount > 0) {
            return res.status(400).json({ error: "Email СѓР¶Рµ Р·Р°РЅСЏС‚" });
        }

        const transporter = nodemailer.createTransport({
            host: "smtp.mail.ru",
            port: 465,
            secure: true,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        const user = { id: crypto.randomUUID(), email, password };
        const code = generateSixDigitCode();

        await pool.query(
            "INSERT INTO users (id, email, password) VALUES ($1, $2, $3)",
            [user.id, user.email, user.password]
        );

        await pool.query(
            "INSERT INTO verification_codes (email, code, user_id) VALUES ($1, $2, $3)",
            [user.email, String(code), user.id]
        );

        try {
            await transporter.sendMail({
                from: '"Everidiy Game Center" <everidiy.center@mail.ru>',
                to: `${user.email}`,
                subject: "РљРѕРґ РїРѕРґС‚РІРµСЂР¶РґРµРЅРёСЏ",
                text: `${code}`,
            });
            console.log("Message sent:", user.email);
        } catch (err) {
            console.error("SendMail error:", err);
        }

        return res.status(200).send({
            status: 200,
            message: "Success send!",
            user: { id: user.id, email: user.email }
        }); 
        
    } catch(e) {
        return res.status(500).send({
            status: 500,
            message: "Error for request!"
        })
    }
})
    
server.post("/api/verify-code", async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) 
        return res.status(400).json({ error: "Email Рё РєРѕРґ РѕР±СЏР·Р°С‚РµР»СЊРЅС‹" });

    try {
        const { rows } = await pool.query(
            "SELECT code FROM verification_codes WHERE email = $1 LIMIT 1",
            [email]
        );

        const record = rows[0];
        if (record && String(record.code) === String(code)) {
            await pool.query("DELETE FROM verification_codes WHERE email = $1", [email]);
            return res.status(200).json({ success: true });
        }

        return res.status(400).json({ error: "РќРµРІРµСЂРЅС‹Р№ РєРѕРґ" });
    } catch (e) {
        return res.status(500).json({ error: "Server error" });
    }
});

server.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
    }

    try {
        const { rows } = await pool.query(
            "SELECT id, email, password FROM users WHERE email = $1 LIMIT 1",
            [email]
        );
        const user = rows[0];
        if (!user || user.password !== password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        return res.status(200).json({ user: { id: user.id, email: user.email } });
    } catch (e) {
        return res.status(500).json({ error: "Server error" });
    }
});

server.post("/api/scores/snake", async (req, res) => {
    const { userId, length, speed } = req.body;
    if (!userId || length == null || speed == null) {
        return res.status(400).json({ error: "Missing score data" });
    }

    try {
        await pool.query(
            "INSERT INTO snake_scores (id, user_id, length, speed) VALUES ($1, $2, $3, $4)",
            [crypto.randomUUID(), userId, Number(length), Number(speed)]
        );
        return res.status(200).json({ success: true });
    } catch (e) {
        return res.status(500).json({ error: "Failed to save score" });
    }
});

server.post("/api/scores/cards", async (req, res) => {
    const { userId, time, rightParts } = req.body;
    if (!userId || time == null || rightParts == null) {
        return res.status(400).json({ error: "Missing score data" });
    }

    try {
        await pool.query(
            "INSERT INTO cards_scores (id, user_id, time, right_parts) VALUES ($1, $2, $3, $4)",
            [crypto.randomUUID(), userId, Number(time), Number(rightParts)]
        );
        return res.status(200).json({ success: true });
    } catch (e) {
        return res.status(500).json({ error: "Failed to save score" });
    }
});

server.post("/api/scores/maze", async (req, res) => {
    const { userId, rightPartsMaze } = req.body;
    if (!userId || rightPartsMaze == null) {
        return res.status(400).json({ error: "Missing score data" });
    }

    try {
        await pool.query(
            "INSERT INTO maze_scores (id, user_id, right_parts_maze) VALUES ($1, $2, $3)",
            [crypto.randomUUID(), userId, Number(rightPartsMaze)]
        );
        return res.status(200).json({ success: true });
    } catch (e) {
        return res.status(500).json({ error: "Failed to save score" });
    }
});

server.get("/api/scores/snake/high", async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
    }

    try {
        const { rows } = await pool.query(
            "SELECT length, speed FROM snake_scores WHERE user_id = $1 ORDER BY length DESC, speed ASC, created_at DESC LIMIT 1",
            [userId]
        );
        return res.status(200).json({ highScore: rows[0] || null });
    } catch (e) {
        return res.status(500).json({ error: "Failed to load score" });
    }
});

server.get("/api/scores/cards/high", async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
    }

    try {
        const { rows } = await pool.query(
            "SELECT time, right_parts FROM cards_scores WHERE user_id = $1 ORDER BY right_parts DESC, time ASC, created_at DESC LIMIT 1",
            [userId]
        );
        const row = rows[0] ? { time: rows[0].time, rightParts: rows[0].right_parts } : null;
        return res.status(200).json({ highScore: row });
    } catch (e) {
        return res.status(500).json({ error: "Failed to load score" });
    }
});

server.get("/api/scores/maze/high", async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
    }

    try {
        const { rows } = await pool.query(
            "SELECT right_parts_maze FROM maze_scores WHERE user_id = $1 ORDER BY right_parts_maze DESC, created_at DESC LIMIT 1",
            [userId]
        );
        const row = rows[0] ? { rightPartsMaze: rows[0].right_parts_maze } : null;
        return res.status(200).json({ highScore: row });
    } catch (e) {
        return res.status(500).json({ error: "Failed to load score" });
    }
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
})
