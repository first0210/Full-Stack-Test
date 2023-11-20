import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";

function website(props: any) {
  const mapStyles = {
    width: "1000px",
    height: "500px",
  };
  const navigate = useNavigate();
  const { username } = useParams();
  const [shops, setShops] = useState<any>([]);
  const [banner, setBanner] = useState<any>([]);
  const [users, setUsers] = useState<any>([]);
  const [center, setCenter] = useState<any>({ lat: 0, lng: 0 });
  const [openDelBanner, setOpenDelBanner] = useState(false);
  const [openDelShop, setOpenDelShop] = useState(false);
  const [openDelAcc, setOpenDelAcc] = useState(false);

  const isAdmin = users.role === "admin";
  const hasNoBanner = !banner || banner.length === 0;
  const hasNoShops = !shops || shops.length === 0;

  const handleEditBanner = () => {
    navigate(`/banner/edit/${username}`);
  };

  const handleEditShop = () => {
    navigate(`/shop/edit/${username}`);
  };

  const handleEditAccount = () => {
    navigate(`/account/edit/${username}`);
  };

  const handleCreateBanner = () => {
    navigate(`/banner/create/${username}`);
  };
  const handleCreateShop = () => {
    navigate(`/shop/create/${username}`);
  };

  const handleDeleteBanner = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete("http://localhost:3001/api/banner", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Banner deleted successfully");
      window.location.reload();
    } catch (error: any) {
      if (error?.response?.data?.message === "Unauthorized") {
        // ลบ token เเละ ไปหน้า login
        localStorage.removeItem("token");
        navigate("/login");
      }
      console.error("Error deleting banner:", error);
    }
  };

  const handleDeleteShop = async () => {
    const token = localStorage.getItem("token");
    try {
      // เรียก API ลบ banner
      await axios.delete("http://localhost:3001/api/shop", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Shop deleted successfully");
      window.location.reload();
    } catch (error: any) {
      if (error?.response?.data?.message === "Unauthorized") {
        // ลบ token เเละ ไปหน้า login
        localStorage.removeItem("token");
        navigate("/login");
      }
      console.error("Error deleting shop:", error);
    }
  };

  const handleLogout = () => {
    // ลบ Token จาก Local Storage
    localStorage.removeItem("token");
    // กลับไปยังหน้า Login
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem("token");

    try {
      // ทำการลบบัญชีผู้ใช้ โดยเรียก API หรือเส้นทางที่เหมาะสม
      const response = await axios.delete(
        `http://localhost:3001/api/users/${username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ตรวจสอบว่าลบบัญชีสำเร็จหรือไม่
      if (response.status === 200) {
        console.log("Account deleted successfully");

        // ลบ Token และกลับไปยังหน้า Login
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        console.error("Failed to delete account");
      }
    } catch (error: any) {
      if (error?.response?.data?.message === "Unauthorized") {
        // ลบ Token และไปที่หน้า login
        localStorage.removeItem("token");
        navigate("/login");
      }

      console.error("Error deleting account:", error);
    }
  };

  useEffect(() => {
    getShops();
    getUsers();
    getBanner();
  }, []); // ระบุเป็น [] เพื่อให้ทำงานเพียงครั้งเดียวตอนเริ่มเว็ป

  async function getShops() {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:3001/api/shop", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setShops(response.data);
      console.log("Shop data:", response.data);
      // คำนวณ center ใน maps และ set state
      const newCenter = {
        lat:
          response.data.reduce(
            (sum: any, shop: any) => sum + parseFloat(shop.lat),
            0
          ) / response.data.length,
        lng:
          response.data.reduce(
            (sum: any, shop: any) => sum + parseFloat(shop.lng),
            0
          ) / response.data.length,
      };
      setCenter(newCenter);
      console.log("newCenter", newCenter);
    } catch (error: any) {
      console.error("Error fetching shops:", error);
      if (error?.response?.data?.message === "Unauthorized") {
        // ลบ token เเละ ไปหน้า login
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }

  async function getUsers() {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:3001/api/users/${username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers(response.data);
      console.log("Shop User:", response.data);
    } catch (error: any) {
      console.error("Error fetching shops:", error);
      if (error?.response?.data?.message === "Unauthorized") {
        // ลบ token เเละ ไปหน้า login
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }

  async function getBanner() {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:3001/api/banner", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBanner(response.data[0]?.link || "");
      console.log("Banner data:", response.data);
    } catch (error: any) {
      console.error("Error fetching shops:", error);
      if (error?.response?.data?.message === "Unauthorized") {
        // ลบ token เเละ ไปหน้า login
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }

  return (
    <div>
      {/* Banner */}
      {isAdmin && hasNoBanner ? (
        <Button variant="outlined" onClick={handleCreateBanner}>
          Create Banner
        </Button>
      ) : (
        <img
          src={banner}
          alt="Banner"
          style={{
            width: "100%",
            height: "400px",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1,
          }}
        />
      )}

      <Grid container spacing={2}>
        {shops.map((shop: any) => (
          <Grid item key={shop.id} xl={12} md={12} xs={12}>
            <Card
              style={{
                boxShadow: " 0px 2px 8px 0px rgba(99, 99, 99, 0.25)",
                borderRadius: 12,
                margin: "20px",
                marginTop: "400px",
                height: 100,
                width: "auto",
                padding: "15px",
                fontFamily: "'Roboto','Kanit',sans-serif",
                fontWeight: 500,
                fontSize: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "orange  ",
              }}
            >
              <Grid container>
                <Grid item xl={12} md={12} xs={12}>
                  <Typography
                    variant="h2"
                    style={{ fontWeight: "bold", color: "white" }}
                  >
                    Welcome to... {shop.name}
                  </Typography>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        ))}
      </Grid>

      {isAdmin && hasNoShops ? (
        <Button variant="outlined" onClick={handleCreateShop}>
          Create Shop
        </Button>
      ) : (
        //Map
        <LoadScript googleMapsApiKey="AIzaSyCid0eqI13Hzy0FlLI7sy9jq-xk7H4LpmI">
          <GoogleMap mapContainerStyle={mapStyles} zoom={14} center={center}>
            {shops.map((shop: any) => (
              <Marker
                key={shop.id}
                position={{
                  lat: parseFloat(shop.lat),
                  lng: parseFloat(shop.lng),
                }}
              />
            ))}
          </GoogleMap>
        </LoadScript>
      )}

      <div style={{ marginTop: "20px" }}>
        {isAdmin && !hasNoBanner ? (
          <Button
            style={{ marginLeft: "10px" }}
            variant="outlined"
            onClick={handleEditBanner}
          >
            Edit Banner
          </Button>
        ) : null}

        {isAdmin && !hasNoBanner ? (
          <Button
            style={{ marginLeft: "10px" }}
            variant="outlined"
            onClick={() => setOpenDelBanner(true)}
          >
            Delete Banner
          </Button>
        ) : null}

        {isAdmin && !hasNoShops ? (
          <Button
            style={{ marginLeft: "10px" }}
            variant="outlined"
            onClick={handleEditShop}
          >
            Edit Shop
          </Button>
        ) : null}

        {isAdmin && !hasNoShops ? (
          <Button
            style={{ marginLeft: "10px" }}
            variant="outlined"
            onClick={() => setOpenDelShop(true)}
          >
            Delete Shop
          </Button>
        ) : null}
        <Button
          style={{ marginLeft: "10px" }}
          variant="outlined"
          onClick={handleEditAccount}
        >
          Edit Account
        </Button>
        <Button
          style={{ marginLeft: "10px" }}
          variant="outlined"
          onClick={handleLogout}
        >
          Log Out
        </Button>
        <Button
          style={{ marginLeft: "10px", color: "red", borderColor: "red" }}
          variant="outlined"
          onClick={() => setOpenDelAcc(true)}
        >
          Delete Account
        </Button>
      </div>

      <Dialog open={openDelBanner} onClose={() => setOpenDelBanner(false)}>
        <DialogTitle>Delete Banner</DialogTitle>
        <DialogContent>คุณต้องการลบ Banner ใช่หรือไม่ ?</DialogContent>
        <DialogActions>
          <Button
            style={{ marginRight: "10px" }}
            variant="contained"
            color="primary"
            onClick={() => {
              handleDeleteBanner();
              setOpenDelBanner(false);
            }}
          >
            ใช่
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenDelBanner(false)}
          >
            ไม่ใช่
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDelShop} onClose={() => setOpenDelShop(false)}>
        <DialogTitle>Delete Shop</DialogTitle>
        <DialogContent>คุณต้องการลบ Shop ใช่หรือไม่ ?</DialogContent>
        <DialogActions>
          <Button
            style={{ marginRight: "10px" }}
            variant="contained"
            color="primary"
            onClick={() => {
              handleDeleteShop();
              setOpenDelShop(false);
            }}
          >
            ใช่
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenDelShop(false)}
          >
            ไม่ใช่
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDelAcc} onClose={() => setOpenDelAcc(false)}>
        <DialogTitle>***Delete Account***</DialogTitle>
        <DialogContent>คุณต้องการลบ Account ใช่หรือไม่ ?</DialogContent>
        <DialogActions>
          <Button
            style={{ marginRight: "10px" }}
            variant="contained"
            color="primary"
            onClick={() => {
              handleDeleteAccount();
              setOpenDelAcc(false);
            }}
          >
            ใช่
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenDelAcc(false)}
          >
            ไม่ใช่
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default website;
