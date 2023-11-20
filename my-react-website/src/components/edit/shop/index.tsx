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

function EditShop() {
  const navigate = useNavigate();
  const { username } = useParams();
  const [openCancel, setOpenCancel] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openAddFail, setOpenAddFail] = useState(false);
  const [formData, setFormData] = useState({
    shopName: "",
    lat: "",
    lng: "",
  });

  useEffect(() => {
    getShopData();
  }, []);

  const getShopData = async () => {
    const token = localStorage.getItem("token");
    try {
      // ดึงข้อมูล shop
      const shopResponse = await axios.get("http://localhost:3001/api/shop", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const shopData = shopResponse.data[0]; // เลือกร้าน

      // set state
      setFormData({
        shopName: shopData.name,
        lat: shopData.lat,
        lng: shopData.lng,
      });
    } catch (error: any) {
      console.error("Error fetching shop data:", error);
      if (error?.response?.data?.message === "Unauthorized") {
        // ลบ token เเละ ไปหน้า login
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleSave = async () => {
    // ตรวจสอบค่าว่างก่อนบันทึก
    if (
      formData.shopName.trim() === "" ||
      formData.lat === null ||
      formData.lng === null
    ) {
      // แสดง alert ถ้าค่าว่าง
      alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      // ทำการบันทึกข้อมูลร้านค้า
      await axios.put(
        "http://localhost:3001/api/shop",
        {
          name: formData.shopName,
          lat: formData.lat,
          lng: formData.lng,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // เปิด Dialog Edit Success
      setOpenAdd(true);
    } catch (error: any) {
      if (error?.response?.data?.message === "Unauthorized") {
        // ลบ token เเละ ไปหน้า login
        localStorage.removeItem("token");
        navigate("/login");
      }
      // เปิด Dialog Edit Fail
      setOpenAddFail(true);
      console.error("Error saving data:", error);
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
                <Typography variant="h2">Edit Shop</Typography>
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
              height: 400,
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
                  name="shopName"
                  label="Shop Name"
                  variant="outlined"
                  fullWidth
                  required
                  value={formData.shopName}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  name="lat"
                  label="Latitude"
                  variant="outlined"
                  fullWidth
                  required
                  value={formData.lat}
                  onChange={handleInputChange}
                  margin="normal"
                  inputProps={{
                    type: "number",
                    pattern: "\\d*\\.?\\d*", // จะให้กรอกตัวเลขและจุดทศนิยมเท่านั้น
                  }}
                />
                <TextField
                  name="lng"
                  label="Longitude"
                  variant="outlined"
                  fullWidth
                  required
                  value={formData.lng}
                  onChange={handleInputChange}
                  margin="normal"
                  inputProps={{
                    type: "number",
                    pattern: "\\d*\\.?\\d*", // จะให้กรอกตัวเลขและจุดทศนิยมเท่านั้น
                  }}
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
        <DialogTitle>ยกเลิกการ Edit Shop</DialogTitle>
        <DialogContent>
          คุณต้องการยกเลิกการ Edit Shop ใช่หรือไม่ ?
        </DialogContent>
        <DialogActions>
          <Button
            style={{ marginRight: "10px" }}
            variant="contained"
            color="primary"
            component={Link}
            to={`/landing/${username}`}
          >
            ใช่
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
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
        <DialogTitle>Edit Shop Success</DialogTitle>
        <DialogContent>Edit Shop สำเร็จเเล้ว ! </DialogContent>
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
      <Dialog open={openAddFail} onClose={() => setOpenAddFail(false)}>
        <DialogTitle>Edit Fail</DialogTitle>
        <DialogContent>
          Edit Shop ไม่สำเร็จ กรุณาตรวจสอบความถูกต้องอีกครั้ง <br />
          hint : lat, lng กรุณากรอกให้ถูกต้อง{" "}
        </DialogContent>
        <DialogActions>
          <Button
            style={{ marginRight: "10px" }}
            variant="contained"
            color="primary"
            onClick={() => setOpenAddFail(false)}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default EditShop;
