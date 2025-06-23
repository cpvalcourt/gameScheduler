import React, { useState, useRef } from "react";
import type { ChangeEvent } from "react";
import type { GameSeries } from "../types/gameSeries";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import api from "../services/api";
import {
  Add as AddIcon,
  CalendarToday as CalendarTodayIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";

interface GameManagementProps {
  series: GameSeries;
  onSuccess: () => void;
}

interface GameFormData {
  date: string;
  time: string;
  location: string;
  opponent: string;
  isHome: boolean;
  days: string[];
}

const GameManagement = ({ series, onSuccess }: GameManagementProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<GameFormData>({
    date: "",
    time: "14:00",
    location: "",
    opponent: "",
    isHome: true,
    days: [],
  });

  // Refs for input fields
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setError(null);
    setFormData({
      date: "",
      time: "14:00",
      location: "",
      opponent: "",
      isHome: true,
      days: [],
    });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev: GameFormData) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDayToggle = (day: string) => {
    setFormData((prev: GameFormData) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d: string) => d !== day)
        : [...prev.days, day],
    }));
  };

  const handleBulkCreate = async () => {
    // Simple client-side validation
    if (
      !formData.date ||
      !formData.time ||
      !formData.location ||
      !formData.opponent
    ) {
      setError("All fields are required.");
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const gameData = {
        seriesId: series.id,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        opponent: formData.opponent,
        isHome: formData.isHome,
        days: formData.days,
      };

      await api.post(`/game-series/${series.id}/games`, gameData);
      handleClose();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create games");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
        sx={{ mb: 2 }}
      >
        Add Games
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Games</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              name="date"
              label="Date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              inputRef={dateInputRef}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <Box
                    onClick={() => {
                      if (dateInputRef.current) {
                        dateInputRef.current.showPicker();
                      }
                    }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      padding: "4px",
                      borderRadius: "4px",
                      "&:hover": {
                        backgroundColor: "rgba(25, 118, 210, 0.08)",
                      },
                    }}
                  >
                    <CalendarTodayIcon
                      sx={{
                        color: "#1976d2",
                        fontSize: "20px",
                      }}
                    />
                  </Box>
                ),
              }}
              fullWidth
            />

            <TextField
              name="time"
              label="Time"
              type="time"
              value={formData.time}
              onChange={handleInputChange}
              inputRef={timeInputRef}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <Box
                    onClick={() => {
                      if (timeInputRef.current) {
                        timeInputRef.current.showPicker();
                      }
                    }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      padding: "4px",
                      borderRadius: "4px",
                      "&:hover": {
                        backgroundColor: "rgba(25, 118, 210, 0.08)",
                      },
                    }}
                  >
                    <ScheduleIcon
                      sx={{
                        color: "#1976d2",
                        fontSize: "20px",
                      }}
                    />
                  </Box>
                ),
              }}
              fullWidth
            />

            <TextField
              name="location"
              label="Location"
              value={formData.location}
              onChange={handleInputChange}
              fullWidth
            />

            <TextField
              name="opponent"
              label="Opponent"
              value={formData.opponent}
              onChange={handleInputChange}
              fullWidth
            />

            <FormControlLabel
              control={
                <Checkbox
                  name="isHome"
                  checked={formData.isHome}
                  onChange={handleInputChange}
                />
              }
              label="Home Game"
            />

            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Select Days
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day) => (
                <FormControlLabel
                  key={day}
                  control={
                    <Checkbox
                      checked={formData.days.includes(day)}
                      onChange={() => handleDayToggle(day)}
                    />
                  }
                  label={day}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleBulkCreate}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Create Games"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GameManagement;
