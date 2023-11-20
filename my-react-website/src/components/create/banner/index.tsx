import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import {
  Card,
  Grid,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import axios from "axios";

function banner() {
  const navigate = useNavigate();
  const { username } = useParams();
  const [openCancel, setOpenCancel] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openFail, setOpenFail] = useState(false);
  const [bannerLink, setBannerLink] = useState<any>([]);

  const handleSave = async () => {
    // ตรวจสอบว่ามีข้อมูลที่ต้องการสร้างหรือไม่
    if (!bannerLink.trim()) {
      alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      // สร้าง banner (post)
      await axios.post(
        "http://localhost:3001/api/banner",
        {
          link: bannerLink,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // เปิด Dialog Create Success
      setOpenSuccess(true);
    } catch (error: any) {
      if (error?.response?.data?.message === "Unauthorized") {
        // ลบ token เเละ ไปหน้า login
        localStorage.removeItem("token");
        navigate("/login");
      }
      // เปิด Dialog Create Fail
      setOpenFail(true);
      console.error("Error creating banner:", error);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        position: "absolute",
        top: 20,
        left: 0,
      }}
    >
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
                <Typography variant="h2">Create Banner</Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      <Grid
        container
        spacing={2}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Grid item xl={6} md={6} xs={6}>
          <Card
            style={{
              boxShadow: " 0px 2px 8px 0px rgba(99, 99, 99, 0.25)",
              borderRadius: 12,
              margin: "20px",
              height: 200,
              fontFamily: "'Roboto','Kanit',sans-serif",
              fontWeight: 500,
              fontSize: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#CCF2F4",
            }}
          >
            <Grid container>
              <Grid
                item
                xl={12}
                md={12}
                xs={12}
                style={{ marginLeft: "30px", marginRight: "30px" }}
              >
                <TextField
                  name="bannerLink"
                  label="Banner Link"
                  variant="outlined"
                  fullWidth
                  required
                  value={bannerLink}
                  onChange={(e) => setBannerLink(e.target.value)}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
      <div style={{ marginBottom: "30px" }}>
        <Button
          variant="contained"
          color="primary"
          style={{ marginRight: "10px" }}
          onClick={handleSave}
        >
          Save
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenCancel(true)}
        >
          Cancel
        </Button>
      </div>
      <Dialog open={openCancel} onClose={() => setOpenCancel(false)}>
        <DialogTitle>ยกเลิกการ Create Banner</DialogTitle>
        <DialogContent>
          คุณต้องการยกเลิกการ Create Banner ใช่หรือไม่ ?
        </DialogContent>
        <DialogActions>
          <Button
            style={{ marginRight: "10px" }}
            variant="contained"
            color="primary"
            component={Link}
            to={`/landing/${username}`}
          >
            ใช่s
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenCancel(false)}
          >
            ไม่ใช่
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openSuccess} onClose={() => setOpenSuccess(false)}>
        <DialogTitle>Create Success</DialogTitle>
        <DialogContent>Create Banner สำเร็จเเล้ว ! </DialogContent>
        <DialogActions>
          <Button
            style={{ marginRight: "10px" }}
            variant="contained"
            color="primary"
            component={Link}
            to={`/landing/${username}`}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openFail} onClose={() => setOpenFail(false)}>
        <DialogTitle>Create Fail</DialogTitle>
        <DialogContent>
          สร้าง Banner ไม่สำเร็จ กรุณาตรวจสอบความถูกต้องอีกครั้ง
        </DialogContent>
        <DialogActions>
          <Button
            style={{ marginRight: "10px" }}
            variant="contained"
            color="primary"
            onClick={() => setOpenFail(false)}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default banner;
