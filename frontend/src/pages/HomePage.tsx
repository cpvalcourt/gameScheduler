import React from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Container, Button, Box } from "@mui/material";

function HomePage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <Container>
      <Box
        sx={{
          mt: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to the Game Scheduler
        </Typography>
        <Button variant="outlined" color="primary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      <Typography variant="body1" sx={{ mb: 4 }}>
        You are now logged in. This is your home page.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/game-series")}
      >
        Manage Game Series
      </Button>
    </Container>
  );
}

export default HomePage;
