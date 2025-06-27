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
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Help as HelpIcon,
} from "@mui/icons-material";
import { useI18n } from "../../contexts/I18nContext";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { fr } from "date-fns/locale/fr";
import { es } from "date-fns/locale/es";
import { enUS } from "date-fns/locale/en-US";

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

const localeMap = { en: enUS, fr: fr, es: es };

const PlayerAvailabilityTab = ({
  onError,
  onLoading,
}: PlayerAvailabilityTabProps) => {
  const { t, language } = useI18n();
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
      onError(t("advancedScheduling.failedToLoadAvailability"));
      console.error("Error loading availability:", error);
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.date) {
      onError(t("advancedScheduling.pleaseSelectDate"));
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

      onError(t("advancedScheduling.availabilityUpdated"));
    } catch (error) {
      onError(t("advancedScheduling.availabilityUpdateError"));
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
          {t("advancedScheduling.playerAvailability")}
        </Typography>
        <Button
          variant="contained"
          startIcon={<CalendarIcon />}
          onClick={() => setShowForm(true)}
        >
          {t("advancedScheduling.setAvailability")}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Summary Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                {t("advancedScheduling.availabilitySummary")}
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">
                    {t("advancedScheduling.available")}:
                  </Typography>
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
                  <Typography variant="body2">
                    {t("advancedScheduling.maybe")}:
                  </Typography>
                  <Chip
                    label={
                      availability.filter((a) => a.status === "maybe").length
                    }
                    color="warning"
                    size="small"
                  />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">
                    {t("advancedScheduling.unavailable")}:
                  </Typography>
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
                  {t("advancedScheduling.setYourAvailability")}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <LocalizationProvider
                      dateAdapter={AdapterDateFns}
                      adapterLocale={localeMap[language] || enUS}
                    >
                      <DatePicker
                        label={t("advancedScheduling.date")}
                        value={formData.date ? new Date(formData.date) : null}
                        onChange={(newValue) =>
                          setFormData({
                            ...formData,
                            date: newValue
                              ? newValue.toISOString().split("T")[0]
                              : "",
                          })
                        }
                        format={
                          language === "fr" || language === "es"
                            ? "dd/MM/yyyy"
                            : "MM/dd/yyyy"
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            placeholder: t("dateTime.dateFormat"),
                            inputRef: dateInputRef,
                            required: true,
                            sx: {
                              "& .MuiInputBase-input": {
                                color: "text.primary",
                              },
                              "& .MuiInputLabel-root.Mui-focused": {
                                color: "primary.main",
                              },
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label={t("advancedScheduling.startTime")}
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
                      label={t("advancedScheduling.endTime")}
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
                      <InputLabel>{t("advancedScheduling.status")}</InputLabel>
                      <Select
                        value={formData.status}
                        label={t("advancedScheduling.status")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status: e.target.value as
                              | "available"
                              | "unavailable"
                              | "maybe",
                          })
                        }
                      >
                        <MenuItem value="available">
                          {t("advancedScheduling.available")}
                        </MenuItem>
                        <MenuItem value="maybe">
                          {t("advancedScheduling.maybe")}
                        </MenuItem>
                        <MenuItem value="unavailable">
                          {t("advancedScheduling.unavailable")}
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t("advancedScheduling.notes")}
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder={t("advancedScheduling.notesPlaceholder")}
                      multiline
                      rows={2}
                    />
                  </Grid>
                </Grid>
                <Box display="flex" gap={2} mt={2}>
                  <Button variant="outlined" onClick={() => setShowForm(false)}>
                    {t("common.cancel")}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {t("common.save")}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Availability Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                {t("advancedScheduling.playerAvailability")}
              </Typography>
              {availability.length === 0 ? (
                <Alert severity="info">
                  {t("advancedScheduling.noPatterns")}
                </Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t("advancedScheduling.date")}</TableCell>
                        <TableCell>
                          {t("advancedScheduling.startTime")}
                        </TableCell>
                        <TableCell>{t("advancedScheduling.endTime")}</TableCell>
                        <TableCell>{t("advancedScheduling.status")}</TableCell>
                        <TableCell>{t("advancedScheduling.notes")}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {availability.map((slot) => (
                        <TableRow key={slot.id}>
                          <TableCell>{slot.date}</TableCell>
                          <TableCell>{slot.start_time}</TableCell>
                          <TableCell>{slot.end_time}</TableCell>
                          <TableCell>
                            <Chip
                              label={t(`advancedScheduling.${slot.status}`)}
                              color={getStatusColor(slot.status)}
                              size="small"
                              icon={getStatusIcon(slot.status)}
                            />
                          </TableCell>
                          <TableCell>{slot.notes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PlayerAvailabilityTab;
