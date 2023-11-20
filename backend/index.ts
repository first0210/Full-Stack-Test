const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cors = require("cors");
const { randomBytes } = require("crypto");
const bcrypt = require("bcrypt");
const util = require("util");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const SECRET_KEY = randomBytes(32).toString("hex");
console.log("Auto-generated secret key:", SECRET_KEY);

function isTokenExpired(token) {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const currentTime = Math.floor(Date.now() / 1000);
    console.log("decoded.exp", decoded.exp);
    return decoded.exp < currentTime;
  } catch (error) {
    console.log(error);
    return true;
  }
}
function verifyToken(req, res, next) {
  const token = req?.headers?.authorization?.replace("Bearer ", "");
  console.log("req?.headers?.authorization", req?.headers?.authorization);

  if (!token || isTokenExpired(token)) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token is invalid" });
  }
}

// MySQL database configuration
const db = mysql.createConnection({
  host: "localhost",
  user: "firstpanupong",
  password: "12345",
  database: "feyverly_test",
  port: 3307,
});

// เชื่อม MySQL database
db.connect((err) => {
  if (err) {
    console.error("Unable to connect to MySQL:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

// Login route
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // ตรวจสอบข้อมูลผู้ใช้ในฐานข้อมูล MySQL
    const query = "SELECT * FROM users WHERE username = ?";
    //ใช้ util.promisify เพื่อให้เป็น Promise-based ---> ทำให้ใช้ await ได้ (เพื่อ hash ก่อนเปรียบเทียบกับ db)
    const results = await util.promisify(db.query).bind(db)(query, [username]);

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = results[0];
    // ถูก hash ก่อนเปรียบเทียบกับ db
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // สร้าง token แบบ JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดขณะทำการ login:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Create username - register (POST)
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("username :", username);
    // เช็ค username หรือ password ห้ามเป็นค่าว่าง
    if (!username || !password) {
      console.log("Username or password is empty.");
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const queryAsync = util.promisify(db.query).bind(db);

    // เช็คว่า username ซ้ำไหม
    const usernameExists = await queryAsync(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    console.log("usernameExists :", usernameExists.length);

    if (usernameExists && usernameExists.length > 0) {
      console.log("Username is already taken:", username);
      return res.status(400).json({ message: "Username is already taken" });
    } else {
      console.log("Username is available:", username);
    }

    // Hash รหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    // ใส่ผู้ใช้ใหม่ ลง DB
    const result = await db.query(
      "INSERT INTO users (username, password, role, name, surname, phone) VALUES (?, ?, ?, ?, ?, ?)",
      [username, hashedPassword, "user", "", "", ""]
      // [username, hashedPassword, "admin", "", "", ""]
    );

    // เช็ค successful
    if (result) {
      res.json({ message: "Registration successful" });
    } else {
      console.error(
        "Registration failed. Unable to insert user into the database."
      );
      res.status(500).json({ message: "Internal Server Error" });
    }
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Read username (GET)
app.get("/api/users/:username", verifyToken, async (req, res) => {
  try {
    const usernameToRead = req.params.username;
    const queryAsync = util.promisify(db.query).bind(db);

    const user = await queryAsync(
      "SELECT id, username, name, surname, phone, role FROM users WHERE username = ?",
      [usernameToRead]
    );

    if (!user || user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user[0]);
  } catch (error) {
    console.error("Error retrieving user data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Delete username (DELETE)
app.delete("/api/users/:username", verifyToken, async (req, res) => {
  try {
    const usernameToDelete = req.params.username;
    console.log("usernameToDelete", usernameToDelete);
    // เช็คว่ามี username ไหม
    const queryAsync = util.promisify(db.query).bind(db);

    const userToDelete = await queryAsync(
      "SELECT * FROM users WHERE username = ?",
      [usernameToDelete]
    );

    if (!userToDelete || userToDelete.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // ลบ user จาก DB
    const deleteResult = await queryAsync(
      "DELETE FROM users WHERE username = ?",
      [usernameToDelete]
    );

    if (deleteResult.affectedRows > 0) {
      return res.json({ message: "User deleted successfully" });
    } else {
      return res.status(500).json({ message: "Failed to delete user" });
    }
  } catch (error) {
    console.error("Error during user deletion:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Update user (PUT)
app.put("/api/users/:username", verifyToken, async (req, res) => {
  try {
    const usernameToUpdate = req.params.username;
    const { name, surname, phone } = req.body;

    // เช็คว่ามี username ไหม
    const queryAsync = util.promisify(db.query).bind(db);
    const userToUpdate = await queryAsync(
      "SELECT * FROM users WHERE username = ?",
      [usernameToUpdate]
    );

    if (!userToUpdate || userToUpdate.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // อัพเดตข้อมูล user
    const updateResult = await queryAsync(
      "UPDATE users SET name = ?, surname = ?, phone = ? WHERE username = ?",
      [name, surname, phone, usernameToUpdate]
    );

    if (updateResult.affectedRows > 0) {
      return res.json({ message: "User updated successfully" });
    } else {
      return res.status(500).json({ message: "Failed to update user" });
    }
  } catch (error) {
    console.error("Error during user update:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Read shop (GET)
app.get("/api/shop", verifyToken, async (req, res) => {
  try {
    const queryAsync = util.promisify(db.query).bind(db);
    const shops = await queryAsync("SELECT * FROM shop");
    res.json(shops);
  } catch (error) {
    console.error("Error retrieving shop data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Update shop (PUT)
app.put("/api/shop", verifyToken, async (req, res) => {
  try {
    const { name, lat, lng } = req.body;
    const queryAsync = util.promisify(db.query).bind(db);
    const updateShop = await queryAsync(
      "UPDATE shop SET lat = ?, lng = ?, name = ?",
      [lat, lng, name]
    );
    res.json({ message: "Shop data updated successfully" });
  } catch (error) {
    console.error("Error updating shop data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Create Shop (Post)
app.post("/api/shop", verifyToken, async (req, res) => {
  try {
    const { name, lat, lng } = req.body;
    const queryAsync = util.promisify(db.query).bind(db);
    const createShop = await queryAsync(
      "INSERT INTO shop (name, lat, lng) VALUES (?, ?, ?)",
      [name, lat, lng]
    );
    res.json({ message: "Shop created successfully" });
  } catch (error) {
    console.error("Error creating shop:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Delete Shop (DELETE)
app.delete("/api/shop", verifyToken, async (req, res) => {
  try {
    const queryAsync = util.promisify(db.query).bind(db);
    const deleteShop = await queryAsync("DELETE FROM shop");
    res.json({ message: "Shop deleted successfully" });
  } catch (error) {
    console.error("Error deleting shop:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Read banner (GET)
app.get("/api/banner", verifyToken, async (req, res) => {
  try {
    const queryAsync = util.promisify(db.query).bind(db);
    const banners = await queryAsync("SELECT * FROM banner");
    res.json(banners);
  } catch (error) {
    console.error("Error retrieving banner link:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Update banner (PUT)
app.put("/api/banner", verifyToken, async (req, res) => {
  try {
    const { link } = req.body;
    const queryAsync = util.promisify(db.query).bind(db);
    const updateBanner = await queryAsync("UPDATE banner SET link = ? ", [
      link,
    ]);
    res.json({ message: "Banner link updated successfully" });
  } catch (error) {
    console.error("Error updating banner link:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Create banner (Post)
app.post("/api/banner", verifyToken, async (req, res) => {
  try {
    const { link } = req.body;
    const queryAsync = util.promisify(db.query).bind(db);
    const createBanner = await queryAsync(
      "INSERT INTO banner (link) VALUES (?)",
      [link]
    );
    res.json({ message: "Banner created successfully" });
  } catch (error) {
    console.error("Error creating banner:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Delete banner (DELETE)
app.delete("/api/banner", verifyToken, async (req, res) => {
  try {
    const queryAsync = util.promisify(db.query).bind(db);
    const deleteBanner = await queryAsync("DELETE FROM banner");
    res.json({ message: "Banner deleted successfully" });
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/", (req, res) => {
  res.send("Welcome!!!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
