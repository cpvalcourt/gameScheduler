import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  Event as EventIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  ArrowBack as ArrowBackIcon,
  Schedule as ScheduleIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { useNavigate } from "react-router-dom";
import LanguageSelector from "./LanguageSelector";
import { getAvatarInitial } from "../utils/avatarUtils";

interface NavigationHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  children?: any;
}

const NavigationHeader = ({
  title,
  subtitle,
  showBackButton = false,
  children,
}: NavigationHeaderProps) => {
  const { user, loading, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    logout();
    navigate("/login");
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleUserMenuOpen = (event: any) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  return (
    <Box
      component="header"
      sx={{
        mb: 3,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
      }}
      role="banner"
      aria-label="Main navigation"
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {showBackButton && (
          <Tooltip title={t("navigation.goBack")}>
            <IconButton
              onClick={handleBack}
              size="large"
              aria-label={t("navigation.goBack")}
              sx={{
                minWidth: "44px",
                minHeight: "44px",
                "&:focus": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: "2px",
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
        )}
        <Box>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              color: "text.primary",
              fontWeight: 600,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body1"
              color="text.secondary"
              component="p"
              aria-label="Page subtitle"
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "center",
          flexWrap: "wrap",
        }}
        role="navigation"
        aria-label="Main navigation menu"
      >
        {/* Navigation Icons */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            flexWrap: "wrap",
          }}
          role="group"
          aria-label="Primary navigation"
        >
          <Tooltip title={t("navigation.dashboard")}>
            <IconButton
              onClick={() => navigate("/")}
              color="primary"
              size="large"
              aria-label={`${t(
                "navigation.dashboard"
              )} - Navigate to dashboard`}
              sx={{
                minWidth: "44px",
                minHeight: "44px",
                "&:focus": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: "2px",
                },
              }}
            >
              <DashboardIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={t("navigation.teams")}>
            <IconButton
              onClick={() => navigate("/teams")}
              color="primary"
              size="large"
              aria-label={`${t("navigation.teams")} - Navigate to teams`}
              sx={{
                minWidth: "44px",
                minHeight: "44px",
                "&:focus": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: "2px",
                },
              }}
            >
              <GroupIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={t("navigation.gameSeries")}>
            <IconButton
              onClick={() => navigate("/game-series")}
              color="primary"
              size="large"
              aria-label={`${t(
                "navigation.gameSeries"
              )} - Navigate to game series`}
              sx={{
                minWidth: "44px",
                minHeight: "44px",
                "&:focus": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: "2px",
                },
              }}
            >
              <EventIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={t("navigation.advancedScheduling")}>
            <IconButton
              onClick={() => navigate("/advanced-scheduling")}
              color="primary"
              size="large"
              aria-label={`${t(
                "navigation.advancedScheduling"
              )} - Navigate to advanced scheduling`}
              sx={{
                minWidth: "44px",
                minHeight: "44px",
                "&:focus": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: "2px",
                },
              }}
            >
              <ScheduleIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={t("navigation.profile")}>
            <IconButton
              onClick={() => navigate("/profile")}
              color="primary"
              size="large"
              aria-label={`${t("navigation.profile")} - Navigate to profile`}
              sx={{
                minWidth: "44px",
                minHeight: "44px",
                "&:focus": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: "2px",
                },
              }}
            >
              <PersonIcon />
            </IconButton>
          </Tooltip>

          {user?.role === "admin" && (
            <Tooltip title={t("navigation.adminDashboard")}>
              <IconButton
                onClick={() => navigate("/admin")}
                color="secondary"
                size="large"
                aria-label={`${t(
                  "navigation.adminDashboard"
                )} - Navigate to admin dashboard`}
                sx={{
                  minWidth: "44px",
                  minHeight: "44px",
                  "&:focus": {
                    outline: "2px solid",
                    outlineColor: "secondary.main",
                    outlineOffset: "2px",
                  },
                }}
              >
                <AdminIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Language Switcher */}
        <LanguageSelector variant="icon" size="small" />

        {/* User Menu */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
          role="group"
          aria-label="User account"
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              cursor: "pointer",
              "&:focus": {
                outline: "2px solid",
                outlineColor: "primary.main",
                outlineOffset: "2px",
              },
            }}
            onClick={handleUserMenuOpen}
            role="button"
            aria-label={`${t("navigation.userMenu")} - ${
              user?.username || "User"
            }`}
            aria-haspopup="true"
            aria-expanded={Boolean(userMenuAnchor)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleUserMenuOpen(e as any);
              }
            }}
          >
            {(() => {
              // Debug logging
              console.log("NavigationHeader render - User:", user);
              console.log("NavigationHeader render - Email:", user?.email);
              console.log(
                "NavigationHeader render - Username:",
                user?.username
              );
              console.log("NavigationHeader render - Loading:", loading);

              if (loading) {
                console.log(
                  "NavigationHeader render - Still loading, showing U"
                );
                return "U";
              }

              const initial = getAvatarInitial(user);
              console.log(
                "NavigationHeader render - Calculated initial:",
                initial
              );

              return initial;
            })()}
          </Avatar>

          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            role="menu"
            aria-label={t("navigation.userMenu")}
          >
            <MenuItem
              onClick={() => {
                handleUserMenuClose();
                navigate("/profile");
              }}
              role="menuitem"
              aria-label={t("navigation.profile")}
            >
              <PersonIcon sx={{ mr: 1 }} />
              {t("navigation.profile")}
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                handleUserMenuClose();
                handleLogout();
              }}
              role="menuitem"
              aria-label={t("auth.logout")}
            >
              <LogoutIcon sx={{ mr: 1 }} />
              {t("auth.logout")}
            </MenuItem>
          </Menu>
        </Box>

        {children && (
          <Box
            sx={{ ml: 2 }}
            role="complementary"
            aria-label="Additional navigation options"
          >
            {children}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default NavigationHeader;
