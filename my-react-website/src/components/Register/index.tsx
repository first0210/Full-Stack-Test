import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  Grid,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const response = await axios.post("http://localhost:3001/api/register", {
        username,
        password,
      });
      console.log("response", response);

      if (
        response &&
        response.data &&
        response.data.message === "Registration successful"
      ) {
        setOpenDialog(true);
      } else {
        // ไม่สำเร็จ
        console.log("Registration failed. Please try again.");
        setError("Registration failed. Please try again.");
      }
    } catch (error: any) {
      console.log("error", error);
      setError(error.response.data.message);
      console.error(
        "Registration failed:",
        error.response ? error.response.data.message : error.message
      );
    }
  };

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
                <Typography variant="h2">Register</Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={handleRegister}>
            Register
          </Button>
          <Button
          style={{ marginLeft: "20px" }}
            variant="contained"
            color="primary"
            component={Link}
            to="/login"
          >
            Cancel
          </Button>
        </Grid>
      </Grid>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Register Success</DialogTitle>
        <DialogContent>Register Success</DialogContent>
        <DialogActions>
          <Button
            style={{ marginRight: "10px" }}
            variant="contained"
            color="primary"
            component={Link}
            to="/login"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Register;
