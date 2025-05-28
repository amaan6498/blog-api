import express from "express";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const saltRounds = 10;
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "sKj9eFv6HrM3#Lq2vP@wTuKz8WxJfTgXzLm4cBzFv1Q!xShD5V2Tb7z*9K7UoYn";
const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY,
});

app.use(cors());
app.use(express.json());

// PostgreSQL setup
const db = new pg.Client({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASS,
  port: process.env.DATABASE_PORT,
  ssl: {
    rejectUnauthorized: false, // This allows for SSL without certificate validation (default on Render)
  },
});

// db.connect();

async function connectToDb() {
  try {
    await db.connect();
    console.log("Connected to Render PostgreSQL 🎉");
  } catch (err) {
    console.error("Error connecting to database:", err);
  }
}

connectToDb();

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.post("/register", (req, res) => {
  const { id, username, password } = req.body;

  if (id || !username || !password) {
    return res
      .status(400)
      .json({ error: "Missing required fields (id, username, password)" });
  }
  const randomGeneratedId = uuidv4();
  //hashing password for better security
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.log("Error hashing password");
    } else {
      // Use parameterized query to prevent SQL injection
      const query =
        "INSERT INTO user_credentials (id, user_name, password) VALUES ($1, $2, $3)";

      db.query(query, [randomGeneratedId, username, hash], (err, result) => {
        if (err) {
          console.error("Error executing query", err.stack);
          return res
            .status(500)
            .json({ error: `Error posting data: ${err.message}` });
        }

        res.status(201).json({ message: "Registration Successful" });
      });
    }
  });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db.query(
      "SELECT * FROM user_credentials WHERE user_name = $1",
      [username]
    );
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedHashedPassword = user.password;
      bcrypt.compare(password, storedHashedPassword, (err, result) => {
        if (err) {
          console.error("Error comparing passwords:", err);
        } else {
          if (result) {
            const token = jwt.sign(
              { userId: user.id, username: user.user_name },
              JWT_SECRET,
              { expiresIn: "168h" }
            );
            res.json({ message: "Login successful", token });
            // res.send("Login Successful");
          } else {
            res.status(400).json({ message: "Incorrect Password" });
          }
        }
      });
    } else {
      res.status(400).json({ message: "Error finding User" });
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/getAllPosts", async (req, res) => {
  db.query("SELECT * FROM blog_data", (err, result) => {
    if (err) {
      console.error("Error executing query", err.stack);
      return res.status(500).json({ error: "Error fetching data" });
    }

    res.json(result.rows); //Query Response
  });
});

app.post("/addblog", (req, res) => {
  const { name, imgUrl, description, tags, date } = req.body;

  const uuidForBlog = uuidv4();
  const query =
    "INSERT INTO blog_data (id, title, description, date, image, tags) VALUES ($1, $2, $3, $4, $5, $6)";

  db.query(
    query,
    [uuidForBlog, name, description, date, imgUrl, tags],
    (err, result) => {
      if (err) {
        console.error("Error executing query", err.stack);
        return res
          .status(500)
          .json({ error: `Error posting data: ${err.message}` });
      }

      res.status(201).json({ message: "Blog Added to database" });
    }
  );
});

app.post("/chatwithgemini", async (req, res) => {
  const userInput = req.body.text;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Please enhance the following text in the most beautiful way it can be written:

      ${userInput}`,
    });

    // The response from Gemini will be directly in an enhanced list format
    res.json({ enhancedText: response.text });
  } catch (error) {
    console.error("Error occurred while querying Gemini:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
