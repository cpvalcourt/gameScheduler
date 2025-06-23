import React from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Container, Button, Box } from "@mui/material";
import { useI18n } from "../contexts/I18nContext";

function HomePage() {
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleManageGameSeries = () => {
    navigate("/game-series");
  };

  return (
    <Container component="main" maxWidth="lg">
      <Box
        component="main"
        sx={{
          mt: 4,
          display: "flex",
          flexDirection: "column",
          minHeight: "60vh",
        }}
        role="main"
        aria-labelledby="home-title"
      >
        {/* Skip to main content link for screen readers */}
        <a
          href="#main-content"
          style={{
            position: "absolute",
            left: "-10000px",
            top: "auto",
            width: "1px",
            height: "1px",
            overflow: "hidden",
          }}
          onFocus={(e) => {
            e.target.style.left = "6px";
            e.target.style.top = "6px";
            e.target.style.width = "auto";
            e.target.style.height = "auto";
            e.target.style.overflow = "visible";
          }}
          onBlur={(e) => {
            e.target.style.left = "-10000px";
            e.target.style.top = "auto";
            e.target.style.width = "1px";
            e.target.style.height = "1px";
            e.target.style.overflow = "hidden";
          }}
        >
          Skip to main content
        </a>

        <Box
          id="main-content"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
          role="banner"
          aria-label="Page header"
        >
          <Typography
            variant="h4"
            component="h1"
            id="home-title"
            sx={{
              mb: 0,
              color: "text.primary",
              fontWeight: 600,
            }}
          >
            {t("home.title")}
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleLogout}
            aria-label={`${t("auth.logout")} - Sign out of your account`}
            sx={{
              minHeight: "44px",
              minWidth: "44px",
              padding: "8px 16px",
            }}
          >
            {t("auth.logout")}
          </Button>
        </Box>

        <Box
          component="section"
          sx={{
            mb: 4,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
          aria-labelledby="home-subtitle"
        >
          <Typography
            variant="body1"
            component="p"
            id="home-subtitle"
            sx={{
              mb: 4,
              fontSize: "1.1rem",
              lineHeight: 1.6,
              color: "text.secondary",
            }}
          >
            {t("home.subtitle")}
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              justifyContent: "center",
              alignItems: "center",
            }}
            role="group"
            aria-label="Main navigation options"
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleManageGameSeries}
              aria-label={`${t(
                "home.manageGameSeries"
              )} - Navigate to game series management`}
              sx={{
                minHeight: "48px",
                minWidth: "200px",
                fontSize: "1.1rem",
                fontWeight: 600,
                textTransform: "none",
                boxShadow: 2,
                "&:hover": {
                  boxShadow: 4,
                },
                "&:focus": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: "2px",
                },
              }}
            >
              {t("home.manageGameSeries")}
            </Button>
          </Box>
        </Box>

        {/* Announcement region for dynamic content */}
        <div
          aria-live="polite"
          aria-atomic="true"
          style={{
            position: "absolute",
            left: "-10000px",
            width: "1px",
            height: "1px",
            overflow: "hidden",
          }}
        >
          {/* Screen reader announcements will be inserted here */}
        </div>
      </Box>
    </Container>
  );
}

export default HomePage;
