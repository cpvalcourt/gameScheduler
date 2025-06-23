import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";

interface PlayerAvailabilityTabProps {
  onError: (error: string) => void;
  onLoading: (loading: boolean) => void;
}

interface AvailabilitySlot {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: "available" | "unavailable" | "maybe";
  notes?: string;
}

const PlayerAvailabilityTab = ({
  onError,
  onLoading,
}: PlayerAvailabilityTabProps) => {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    start_time: "14:00",
    end_time: "16:00",
    status: "available" as "available" | "unavailable" | "maybe",
    notes: "",
  });

  // Refs for input fields
  const dateInputRef = useRef<HTMLInputElement>(null);
  const startTimeInputRef = useRef<HTMLInputElement>(null);
  const endTimeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      onLoading(true);

      // Mock data for demonstration
      const mockAvailability: AvailabilitySlot[] = [
        {
          id: 1,
          date: "2024-01-15",
          start_time: "14:00",
          end_time: "16:00",
          status: "available",
          notes: "Looking forward to it!",
        },
        {
          id: 2,
          date: "2024-01-22",
          start_time: "14:00",
          end_time: "16:00",
          status: "maybe",
          notes: "Depends on work schedule",
        },
        {
          id: 3,
          date: "2024-01-29",
          start_time: "14:00",
          end_time: "16:00",
          status: "unavailable",
          notes: "Out of town",
        },
      ];

      setAvailability(mockAvailability);
    } catch (error) {
      onError("Failed to load availability");
      console.error("Error loading availability:", error);
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.date) {
      onError("Please select a date");
      return;
    }

    try {
      setLoading(true);
      onLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newSlot: AvailabilitySlot = {
        id: Date.now(),
        ...formData,
      };

      setAvailability([...availability, newSlot]);
      setFormData({
        date: "",
        start_time: "14:00",
        end_time: "16:00",
        status: "available",
        notes: "",
      });
      setShowForm(false);

      onError("Availability updated successfully! (Demo mode)");
    } catch (error) {
      onError("Failed to update availability");
      console.error("Error updating availability:", error);
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "success";
      case "maybe":
        return "warning";
      case "unavailable":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckIcon sx={{ color: "#2e7d32" }} />;
      case "unavailable":
        return <CloseIcon sx={{ color: "#d32f2f" }} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" component="h2">
          Player Availability
        </Typography>
        <Button
          variant="contained"
          startIcon={<CalendarIcon />}
          onClick={() => setShowForm(true)}
        >
          Set Availability
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Summary Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Availability Summary
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Available:</Typography>
                  <Chip
                    label={
                      availability.filter((a) => a.status === "available")
                        .length
                    }
                    color="success"
                    size="small"
                  />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Maybe:</Typography>
                  <Chip
                    label={
                      availability.filter((a) => a.status === "maybe").length
                    }
                    color="warning"
                    size="small"
                  />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Unavailable:</Typography>
                  <Chip
                    label={
                      availability.filter((a) => a.status === "unavailable")
                        .length
                    }
                    color="error"
                    size="small"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Availability Form */}
        {showForm && (
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Set Your Availability
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Date"
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      inputRef={dateInputRef}
                      InputLabelProps={{
                        shrink: true,
                        sx: { color: "text.primary" },
                      }}
                      required
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
                            <CalendarIcon
                              sx={{
                                color: "#1976d2",
                                fontSize: "20px",
                              }}
                            />
                          </Box>
                        ),
                      }}
                      sx={{
                        "& .MuiInputBase-input": {
                          color: "text.primary",
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "primary.main",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Start Time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) =>
                        setFormData({ ...formData, start_time: e.target.value })
                      }
                      inputRef={startTimeInputRef}
                      InputLabelProps={{
                        shrink: true,
                        sx: { color: "text.primary" },
                      }}
                      InputProps={{
                        endAdornment: (
                          <Box
                            onClick={() => {
                              if (startTimeInputRef.current) {
                                startTimeInputRef.current.showPicker();
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
                      sx={{
                        "& .MuiInputBase-input": {
                          color: "text.primary",
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "primary.main",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="End Time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) =>
                        setFormData({ ...formData, end_time: e.target.value })
                      }
                      inputRef={endTimeInputRef}
                      InputLabelProps={{
                        shrink: true,
                        sx: { color: "text.primary" },
                      }}
                      InputProps={{
                        endAdornment: (
                          <Box
                            onClick={() => {
                              if (endTimeInputRef.current) {
                                endTimeInputRef.current.showPicker();
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
                      sx={{
                        "& .MuiInputBase-input": {
                          color: "text.primary",
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "primary.main",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={formData.status}
                        label="Status"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status: e.target.value as any,
                          })
                        }
                        inputProps={{
                          "aria-label": "Select availability status",
                        }}
                      >
                        <MenuItem value="available">Available</MenuItem>
                        <MenuItem value="unavailable">Unavailable</MenuItem>
                        <MenuItem value="maybe">Maybe</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notes (optional)"
                      multiline
                      rows={2}
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="Any additional notes about your availability..."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" gap={2}>
                      <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save Availability"}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setShowForm(false)}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Availability Table */}
      <Box mt={3}>
        <Typography variant="h6" component="h2" gutterBottom>
          Your Availability Schedule
        </Typography>
        {availability.length === 0 ? (
          <Alert severity="info">
            No availability records found. Set your availability to get started.
          </Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {availability.map((slot) => (
                  <TableRow key={slot.id}>
                    <TableCell>
                      {new Date(slot.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {slot.start_time} - {slot.end_time}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          slot.status.charAt(0).toUpperCase() +
                          slot.status.slice(1)
                        }
                        color={getStatusColor(slot.status) as any}
                        icon={getStatusIcon(slot.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{slot.notes || "-"}</TableCell>
                    <TableCell>
                      <Button size="small" color="primary">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
};

export default PlayerAvailabilityTab;
