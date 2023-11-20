const fs = require("fs");

// อ่านไฟล์ JSON
const rawData = fs.readFileSync(
  // "C:/Users/panupongtan/Desktop/gosoft/IAM/feyverly-test/backend/user.json"
  "C:/Users/panupongtan/Desktop/gosoft/IAM/feyverly-test/backend/shop.json"
);
const userData = JSON.parse(rawData);

const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "firstpanupong",
  password: "12345",
  database: "feyverly_test",
  port: 3307,
});

// เปิดการเชื่อมต่อกับฐานข้อมูล
connection.connect();

// เพิ่มข้อมูลจากไฟล์ JSON
userData.forEach((user) => {
  // const query = "INSERT INTO users (id, username, password) VALUES (?, ?, ?)";
  // const values = [user.id, user.username, user.password];
  const query = "INSERT INTO shop (id, name, lat, lng) VALUES (?, ?, ?, ?)";
  const values = [user.id, user.name, user.lat, user.lng];
  connection.query(query, values, (err, results) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`Inserted user with ID ${results.insertId}`);
    }
  });
});

// ปิดการเชื่อมต่อ
connection.end();
