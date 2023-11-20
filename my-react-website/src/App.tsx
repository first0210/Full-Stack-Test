import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./components/Home";
import Login from "./components/Login";
import Register from './components/Register';
import Website from "./components/website";
import EditBanner from "./components/edit/banner";
import EditShop from "./components/edit/shop";
import EditAcc from "./components/edit/account";
import CreateBanner from "./components/create/banner";
import CreateShop from "./components/create/shop";


function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/landing/:username" element={<Website />} />
          <Route path="/banner/edit/:username" element={<EditBanner />} />
          <Route path="/shop/edit/:username" element={<EditShop />} />
          <Route path="/account/edit/:username" element={<EditAcc />} />
          <Route path="/banner/create/:username" element={<CreateBanner />} />
          <Route path="/shop/create/:username" element={<CreateShop />} />
          
        </Routes>
      </Router>
    </>
  );
}

export default App;
