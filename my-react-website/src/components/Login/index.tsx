import React, { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import { Card, Typography, TextField, Button } from "@mui/material";
import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // เอาไป verifyToken ฝั่ง Backend
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const handleLogin = async () => {
    console.log("click login");
    console.log("username", username);
    console.log("password", password);
    try {
      const result = await axios.post("http://localhost:3001/api/login", {
        username,
        password,
      });
      console.log(result);
      if (result.data) {
        // ถ้า login สำเร็จ บันทึก token ลง local storage
        localStorage.setItem("token", result.data.token);
        navigate(`/landing/${username}`);
      }
    } catch (error: any) {
      if (error.response.status === 401) {
        setError("Invalid username or password");
      } else {
      }
    }
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    // ถ้ามี Token เเล้ว ให้ไปหน้า Banner
    if (storedToken) {
      navigate(`/landing/${username}`);
    }
  }, []);

  return (
    <div>
      <Grid
        container
        spacing={2}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Grid item xl={9} md={9} xs={9}>
          <Card
            style={{
              boxShadow: " 0px 2px 8px 0px rgba(99, 99, 99, 0.25)",
              borderRadius: 12,
              margin: "20px",
              height: 100,
              fontFamily: "'Roboto','Kanit',sans-serif",
              fontWeight: 500,
              fontSize: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#D3D3D3",
            }}
          >
            <Grid container>
              <Grid item xl={12} md={12} xs={12}>
                <Typography variant="h2">Login</Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ margin: "10px 0" }}
      />

      <TextField
        label="Password"
        variant="outlined"
        type="password"
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ margin: "10px 0" }}
      />

      <Button
        variant="contained"
        onClick={handleLogin}
        style={{ marginTop: "10px" }}
      >
        Login
      </Button>
      <Button
        variant="contained"
        component={Link}
        to="/register"
        style={{ marginTop: "10px", marginLeft: "20px" }}
      >
        Register
      </Button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default App;
