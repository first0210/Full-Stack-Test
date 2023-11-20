import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Home</h1>
      <Link to="/login">Go To Website</Link>
    </div>
  );
}

export default Home;
