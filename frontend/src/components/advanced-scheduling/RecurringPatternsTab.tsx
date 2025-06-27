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
  CardActions,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import {
  Add as AddIcon,
  PlayArrow as GenerateIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationOnIcon,
  Group as GroupIcon,
  SportsEsports as SportsEsportsIcon,
} from "@mui/icons-material";
import { useI18n } from "../../contexts/I18nContext";
import type {
  RecurringPattern,
  CreateRecurringPatternData,
} from "../../api/advanced-scheduling";
import {
  createRecurringPattern,
  getRecurringPatterns,
  generateGamesFromPattern,
} from "../../api/advanced-scheduling";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { fr } from "date-fns/locale/fr";
import { es } from "date-fns/locale/es";
import { enUS } from "date-fns/locale/en-US";

interface RecurringPatternsTabProps {
  onError: (error: string) => void;
  onLoading: (loading: boolean) => void;
}

const RecurringPatternsTab = ({
  onError,
  onLoading,
}: RecurringPatternsTabProps) => {
  const { t, language } = useI18n();
  const [patterns, setPatterns] = useState<RecurringPattern[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateRecurringPatternData>({
    name: "",
    description: "",
    frequency: "weekly",
    interval: 1,
    day_of_week: 0,
    start_time: "14:00",
    end_time: "16:00",
    location: "",
    min_players: 8,
    max_players: 20,
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  });

  // Refs for input fields
  const startTimeInputRef = useRef<HTMLInputElement>(null);
  const endTimeInputRef = useRef<HTMLInputElement>(null);
  const startDateInputRef = useRef<HTMLInputElement>(null);
  const endDateInputRef = useRef<HTMLInputElement>(null);

  const daysOfWeek = [
    { value: 0, label: t("advancedScheduling.sunday") },
    { value: 1, label: t("advancedScheduling.monday") },
    { value: 2, label: t("advancedScheduling.tuesday") },
    { value: 3, label: t("advancedScheduling.wednesday") },
    { value: 4, label: t("advancedScheduling.thursday") },
    { value: 5, label: t("advancedScheduling.friday") },
    { value: 6, label: t("advancedScheduling.saturday") },
  ];

  const frequencies = [
    { value: "weekly", label: t("advancedScheduling.weekly") },
    { value: "bi_weekly", label: t("advancedScheduling.biWeekly") },
    { value: "monthly", label: t("advancedScheduling.monthly") },
    { value: "custom", label: t("advancedScheduling.custom") },
  ];

  const localeMap = { en: enUS, fr: fr, es: es };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      onLoading(true);

      // For now, let's create a mock series since we don't have the game-series API working
      const mockSeries = [
        { id: 1, name: "Basketball League" },
        { id: 2, name: "Soccer Tournament" },
        { id: 3, name: "Tennis Club" },
      ];

      setSeries(mockSeries);

      if (mockSeries.length > 0) {
        setSelectedSeries(mockSeries[0].id);
        await loadPatterns(mockSeries[0].id);
      }
    } catch (error) {
      onError(t("advancedScheduling.failedToLoadTeams"));
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  const loadPatterns = async (seriesId: number) => {
    try {
      // For now, let's use mock data since the API might not be fully set up
      const mockPatterns: RecurringPattern[] = [
        {
          id: 1,
          series_id: seriesId,
          name: "Weekly Basketball",
          description: "Weekly basketball games every Sunday",
          frequency: "weekly",
          interval: 1,
          day_of_week: 0,
          start_time: "14:00",
          end_time: "16:00",
          location: "Community Center Court",
          min_players: 8,
          max_players: 20,
          start_date: "2024-01-01",
          end_date: "2024-12-31",
          is_active: true,
          created_by: 1,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ];

      setPatterns(mockPatterns);
    } catch (error) {
      onError(t("advancedScheduling.patternCreateError"));
      console.error("Error loading patterns:", error);
    }
  };

  const handleSeriesChange = (event: any) => {
    const seriesId = Number(event.target.value);
    setSelectedSeries(seriesId);
    if (seriesId) {
      loadPatterns(seriesId);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSeries) {
      onError(t("advancedScheduling.pleaseSelectSeries"));
      return;
    }

    try {
      setLoading(true);
      onLoading(true);

      // For now, let's simulate the API call
      console.log("Creating pattern:", formData);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setOpenDialog(false);
      setFormData({
        name: "",
        description: "",
        frequency: "weekly",
        interval: 1,
        day_of_week: 0,
        start_time: "14:00",
        end_time: "16:00",
        location: "",
        min_players: 8,
        max_players: 20,
        start_date: new Date().toISOString().split("T")[0],
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      });

      onError(t("advancedScheduling.patternCreated"));
      await loadPatterns(selectedSeries);
    } catch (error) {
      onError(t("advancedScheduling.patternCreateError"));
      console.error("Error creating pattern:", error);
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  const handleGenerateGames = async (patternId: number) => {
    try {
      setGenerating(patternId);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      onError(t("advancedScheduling.gamesGenerated"));
    } catch (error) {
      onError(t("advancedScheduling.gamesGenerateError"));
      console.error("Error generating games:", error);
    } finally {
      setGenerating(null);
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
          {t("advancedScheduling.recurringPatterns")}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          disabled={!selectedSeries}
        >
          {t("advancedScheduling.createPattern")}
        </Button>
      </Box>

      {series.length === 0 ? (
        <Alert severity="info">{t("advancedScheduling.noGameSeries")}</Alert>
      ) : (
        <>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>{t("gameSeries.title")}</InputLabel>
            <Select
              value={selectedSeries}
              label={t("gameSeries.title")}
              onChange={handleSeriesChange}
              inputProps={{
                "aria-label": t("advancedScheduling.selectTeam"),
              }}
            >
              {series.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {patterns.length === 0 ? (
            <Alert severity="info">{t("advancedScheduling.noPatterns")}</Alert>
          ) : (
            <Grid container spacing={2}>
              {patterns.map((pattern) => (
                <Grid item xs={12} md={6} key={pattern.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {pattern.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        {pattern.description}
                      </Typography>

                      <Box display="flex" gap={1} mb={2}>
                        <Chip
                          label={
                            frequencies.find(
                              (f) => f.value === pattern.frequency
                            )?.label
                          }
                          size="small"
                          color="primary"
                        />
                        <Chip
                          label={
                            daysOfWeek.find(
                              (d) => d.value === pattern.day_of_week
                            )?.label
                          }
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`${pattern.start_time} - ${pattern.end_time}`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>

                      <Typography variant="body2">
                        <strong>{t("advancedScheduling.location")}:</strong>{" "}
                        {pattern.location}
                      </Typography>
                      <Typography variant="body2">
                        <strong>
                          {t("advancedScheduling.availablePlayers")}:
                        </strong>{" "}
                        {pattern.min_players} - {pattern.max_players}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t("advancedScheduling.status")}:</strong>{" "}
                        {pattern.is_active
                          ? t("advancedScheduling.yes")
                          : t("advancedScheduling.no")}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<GenerateIcon />}
                        onClick={() => handleGenerateGames(pattern.id)}
                        disabled={generating === pattern.id}
                      >
                        {generating === pattern.id
                          ? t("advancedScheduling.generating")
                          : t("advancedScheduling.generateGames")}
                      </Button>
                      <Tooltip title={t("advancedScheduling.deletePattern")}>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Create Pattern Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t("advancedScheduling.createPattern")}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t("advancedScheduling.patternName")}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t("advancedScheduling.description")}
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{t("advancedScheduling.frequency")}</InputLabel>
                <Select
                  value={formData.frequency}
                  label={t("advancedScheduling.frequency")}
                  onChange={(e) =>
                    setFormData({ ...formData, frequency: e.target.value })
                  }
                >
                  {frequencies.map((freq) => (
                    <MenuItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label={t("advancedScheduling.interval")}
                value={formData.interval}
                onChange={(e) =>
                  setFormData({ ...formData, interval: Number(e.target.value) })
                }
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{t("advancedScheduling.dayOfWeek")}</InputLabel>
                <Select
                  value={formData.day_of_week}
                  label={t("advancedScheduling.dayOfWeek")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      day_of_week: Number(e.target.value),
                    })
                  }
                >
                  {daysOfWeek.map((day) => (
                    <MenuItem key={day.value} value={day.value}>
                      {day.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="time"
                label={t("advancedScheduling.startTime")}
                value={formData.start_time}
                onChange={(e) =>
                  setFormData({ ...formData, start_time: e.target.value })
                }
                inputRef={startTimeInputRef}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="time"
                label={t("advancedScheduling.endTime")}
                value={formData.end_time}
                onChange={(e) =>
                  setFormData({ ...formData, end_time: e.target.value })
                }
                inputRef={endTimeInputRef}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t("advancedScheduling.location")}
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label={t("advancedScheduling.minPlayers")}
                value={formData.min_players}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    min_players: Number(e.target.value),
                  })
                }
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label={t("advancedScheduling.maxPlayers")}
                value={formData.max_players}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_players: Number(e.target.value),
                  })
                }
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={localeMap[language] || enUS}
              >
                <DatePicker
                  label={t("advancedScheduling.startDate")}
                  value={
                    formData.start_date ? new Date(formData.start_date) : null
                  }
                  onChange={(newValue) =>
                    setFormData({
                      ...formData,
                      start_date: newValue
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
                      inputRef: startDateInputRef,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={localeMap[language] || enUS}
              >
                <DatePicker
                  label={t("advancedScheduling.endDate")}
                  value={formData.end_date ? new Date(formData.end_date) : null}
                  onChange={(newValue) =>
                    setFormData({
                      ...formData,
                      end_date: newValue
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
                      inputRef: endDateInputRef,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {t("common.create")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecurringPatternsTab;
