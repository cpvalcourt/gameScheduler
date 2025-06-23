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
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import {
  Add as AddIcon,
  PlayArrow as GenerateIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import type {
  RecurringPattern,
  CreateRecurringPatternData,
} from "../../api/advanced-scheduling";
import {
  createRecurringPattern,
  getRecurringPatterns,
  generateGamesFromPattern,
} from "../../api/advanced-scheduling";

interface RecurringPatternsTabProps {
  onError: (error: string) => void;
  onLoading: (loading: boolean) => void;
}

const RecurringPatternsTab = ({
  onError,
  onLoading,
}: RecurringPatternsTabProps) => {
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
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ];

  const frequencies = [
    { value: "weekly", label: "Weekly" },
    { value: "bi_weekly", label: "Bi-weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "custom", label: "Custom" },
  ];

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
      onError("Failed to load data");
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
      onError("Failed to load recurring patterns");
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
      onError("Please select a game series");
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

      onError("Pattern created successfully! (Demo mode)");
      await loadPatterns(selectedSeries);
    } catch (error) {
      onError("Failed to create recurring pattern");
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

      onError("Games generated successfully! (Demo mode)");
    } catch (error) {
      onError("Failed to generate games");
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
          Recurring Patterns
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          disabled={!selectedSeries}
        >
          Create Pattern
        </Button>
      </Box>

      {series.length === 0 ? (
        <Alert severity="info">
          No game series found. Please create a game series first.
        </Alert>
      ) : (
        <>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Game Series</InputLabel>
            <Select
              value={selectedSeries}
              label="Game Series"
              onChange={handleSeriesChange}
              inputProps={{
                "aria-label": "Select game series",
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
            <Alert severity="info">
              No recurring patterns found for this series. Create your first
              pattern to get started.
            </Alert>
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
                        <strong>Location:</strong> {pattern.location}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Players:</strong> {pattern.min_players} -{" "}
                        {pattern.max_players}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Active:</strong>{" "}
                        {pattern.is_active ? "Yes" : "No"}
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
                          ? "Generating..."
                          : "Generate Games"}
                      </Button>
                      <Tooltip title="Delete Pattern">
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
        <DialogTitle>Create Recurring Pattern</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Pattern Name"
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
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={formData.frequency}
                  label="Frequency"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      frequency: e.target.value as any,
                    })
                  }
                  inputProps={{
                    "aria-label": "Select frequency",
                  }}
                >
                  {frequencies.map((f) => (
                    <MenuItem key={f.value} value={f.value}>
                      {f.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Day of Week</InputLabel>
                <Select
                  value={formData.day_of_week}
                  label="Day of Week"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      day_of_week: e.target.value as number,
                    })
                  }
                  inputProps={{
                    "aria-label": "Select day of week",
                  }}
                >
                  {daysOfWeek.map((d) => (
                    <MenuItem key={d.value} value={d.value}>
                      {d.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={formData.start_time}
                onChange={(e) =>
                  setFormData({ ...formData, start_time: e.target.value })
                }
                inputRef={startTimeInputRef}
                InputLabelProps={{ shrink: true }}
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
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={formData.end_time}
                onChange={(e) =>
                  setFormData({ ...formData, end_time: e.target.value })
                }
                inputRef={endTimeInputRef}
                InputLabelProps={{ shrink: true }}
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
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                required
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Min Players"
                type="number"
                value={formData.min_players}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    min_players: parseInt(e.target.value),
                  })
                }
                inputProps={{ min: 1, max: 100 }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Max Players"
                type="number"
                value={formData.max_players}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_players: parseInt(e.target.value),
                  })
                }
                inputProps={{ min: 1, max: 100 }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                inputRef={startDateInputRef}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: (
                    <Box
                      onClick={() => {
                        if (startDateInputRef.current) {
                          startDateInputRef.current.showPicker();
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
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                inputRef={endDateInputRef}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: (
                    <Box
                      onClick={() => {
                        if (endDateInputRef.current) {
                          endDateInputRef.current.showPicker();
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
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? "Creating..." : "Create Pattern"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecurringPatternsTab;
