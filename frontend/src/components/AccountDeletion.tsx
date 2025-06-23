import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Paper,
  Divider,
} from "@mui/material";
import {
  Delete,
  Warning,
  Visibility,
  VisibilityOff,
  Lock,
} from "@mui/icons-material";
import { deleteAccount } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { useNavigate } from "react-router-dom";

export const AccountDeletion = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const { logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleDeleteClick = () => {
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!password.trim()) {
      setError(t("accountDeletion.passwordRequired"));
      return;
    }
    setIsDialogOpen(false);
    setIsConfirmDialogOpen(true);
  };

  const handleFinalDelete = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await deleteAccount(password);

      setSuccess(t("accountDeletion.success"));

      // Clear local storage and redirect after a short delay
      setTimeout(() => {
        logout();
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || t("accountDeletion.error"));
      setIsConfirmDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setIsConfirmDialogOpen(false);
    setPassword("");
    setError("");
    setShowPassword(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box>
      <Paper sx={{ p: 3, border: "1px solid #ff6b6b" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Warning sx={{ color: "#ff6b6b", mr: 1 }} />
          <Typography variant="h6" color="error">
            {t("accountDeletion.dangerZone")}
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {t("accountDeletion.description")}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t("accountDeletion.warning")}
        </Typography>

        <Button
          variant="outlined"
          color="error"
          startIcon={<Delete />}
          onClick={handleDeleteClick}
          sx={{ borderColor: "#ff6b6b", color: "#ff6b6b" }}
        >
          {t("accountDeletion.deleteButton")}
        </Button>
      </Paper>

      {/* Password Confirmation Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Warning sx={{ color: "#ff6b6b", mr: 1 }} />
            {t("accountDeletion.title")}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {t("accountDeletion.confirmPasswordMessage")}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label={t("auth.password")}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>
            {t("accountDeletion.cancelButton")}
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={!password.trim()}
          >
            {t("accountDeletion.continue")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Final Confirmation Dialog */}
      <Dialog
        open={isConfirmDialogOpen}
        onClose={handleCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Warning sx={{ color: "#ff6b6b", mr: 1 }} />
            {t("accountDeletion.finalConfirmation")}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              {t("accountDeletion.irreversibleWarning")}
            </Typography>
            <Typography variant="body2">
              {t("accountDeletion.permanentDeletion")}
            </Typography>
          </Alert>

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Typography variant="body1" sx={{ mb: 2 }}>
            {t("accountDeletion.finalQuestion")}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} disabled={loading}>
            {t("accountDeletion.cancelButton")}
          </Button>
          <Button
            onClick={handleFinalDelete}
            variant="contained"
            color="error"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Delete />}
          >
            {loading
              ? t("accountDeletion.deleting")
              : t("accountDeletion.confirmDelete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
