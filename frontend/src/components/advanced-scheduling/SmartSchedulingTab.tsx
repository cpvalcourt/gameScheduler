import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";

interface SmartSchedulingTabProps {
  onError: (error: string) => void;
  onLoading: (loading: boolean) => void;
}

interface OptimalTimeSlot {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  availability_score: number;
  available_players: number;
  total_players: number;
  conflicts: string[];
  weather_forecast?: string;
}

const SmartSchedulingTab = ({
  onError,
  onLoading,
}: SmartSchedulingTabProps) => {
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | "">("");
  const [searchDate, setSearchDate] = useState("");
  const [searchDuration, setSearchDuration] = useState(120); // minutes
  const [optimalSlots, setOptimalSlots] = useState<OptimalTimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Ref for date input
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      onLoading(true);

      // Mock teams data
      const mockTeams = [
        {
          id: 1,
          name: "Basketball Team Alpha",
          sport: "Basketball",
          member_count: 12,
        },
        { id: 2, name: "Soccer Squad Beta", sport: "Soccer", member_count: 18 },
        { id: 3, name: "Tennis Club Gamma", sport: "Tennis", member_count: 8 },
      ];

      setTeams(mockTeams);
      if (mockTeams.length > 0) {
        setSelectedTeam(mockTeams[0].id);
      }
    } catch (error) {
      onError("Failed to load teams");
      console.error("Error loading teams:", error);
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  const handleFindOptimalTime = async () => {
    if (!selectedTeam || !searchDate) {
      onError("Please select a team and date");
      return;
    }

    try {
      setSearching(true);
      onLoading(true);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock optimal time slots
      const mockSlots: OptimalTimeSlot[] = [
        {
          id: 1,
          date: searchDate,
          start_time: "14:00",
          end_time: "16:00",
          location: "Community Center Court",
          availability_score: 95,
          available_players: 10,
          total_players: 12,
          conflicts: ["Player John has a work meeting"],
          weather_forecast: "Sunny, 72°F",
        },
        {
          id: 2,
          date: searchDate,
          start_time: "16:00",
          end_time: "18:00",
          location: "Community Center Court",
          availability_score: 88,
          available_players: 9,
          total_players: 12,
          conflicts: [
            "Player Sarah has a doctor appointment",
            "Player Mike has a family event",
          ],
          weather_forecast: "Partly cloudy, 68°F",
        },
        {
          id: 3,
          date: searchDate,
          start_time: "18:00",
          end_time: "20:00",
          location: "Community Center Court",
          availability_score: 75,
          available_players: 8,
          total_players: 12,
          conflicts: [
            "Player Alex has a dinner reservation",
            "Player Lisa has a class",
            "Player Tom has a work shift",
          ],
          weather_forecast: "Clear, 65°F",
        },
      ];

      setOptimalSlots(mockSlots);
      onError("Optimal time slots found! (Demo mode)");
    } catch (error) {
      onError("Failed to find optimal time slots");
      console.error("Error finding optimal time:", error);
    } finally {
      setSearching(false);
      onLoading(false);
    }
  };

  const getAvailabilityColor = (score: number) => {
    if (score >= 90) return "success";
    if (score >= 75) return "warning";
    return "error";
  };

  const getAvailabilityLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Good";
    if (score >= 60) return "Fair";
    return "Poor";
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
          Smart Scheduling
        </Typography>
        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={handleFindOptimalTime}
          disabled={!selectedTeam || !searchDate || searching}
        >
          {searching ? "Finding Optimal Times..." : "Find Optimal Time"}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Search Criteria */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Search Criteria
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <FormControl fullWidth>
                  <InputLabel>Select Team</InputLabel>
                  <Select
                    value={selectedTeam}
                    label="Select Team"
                    onChange={(e) => setSelectedTeam(e.target.value as number)}
                    inputProps={{
                      "aria-label": "Select team for smart scheduling",
                    }}
                  >
                    {teams.map((team) => (
                      <MenuItem key={team.id} value={team.id}>
                        {team.name} ({team.sport})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Search Date"
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  inputRef={dateInputRef}
                  InputLabelProps={{
                    shrink: true,
                    sx: { color: "text.primary" },
                  }}
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

                <FormControl fullWidth>
                  <InputLabel>Game Duration</InputLabel>
                  <Select
                    value={searchDuration}
                    label="Game Duration"
                    onChange={(e) =>
                      setSearchDuration(e.target.value as number)
                    }
                    inputProps={{
                      "aria-label": "Select game duration",
                    }}
                  >
                    <MenuItem value={60}>1 hour</MenuItem>
                    <MenuItem value={90}>1.5 hours</MenuItem>
                    <MenuItem value={120}>2 hours</MenuItem>
                    <MenuItem value={150}>2.5 hours</MenuItem>
                    <MenuItem value={180}>3 hours</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handleFindOptimalTime}
                  disabled={!selectedTeam || !searchDate || searching}
                  fullWidth
                >
                  {searching ? "Searching..." : "Find Optimal Times"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Results */}
        <Grid item xs={12} md={8}>
          {optimalSlots.length === 0 ? (
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Optimal Time Slots
                </Typography>
                <Alert severity="info">
                  Select a team and date, then click "Find Optimal Time" to
                  discover the best scheduling options.
                </Alert>
              </CardContent>
            </Card>
          ) : (
            <Box>
              <Typography variant="h6" component="h2" gutterBottom>
                Optimal Time Slots Found
              </Typography>
              <Grid container spacing={2}>
                {optimalSlots.map((slot) => (
                  <Grid item xs={12} key={slot.id}>
                    <Card>
                      <CardContent>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          mb={2}
                        >
                          <Box>
                            <Typography
                              variant="h6"
                              component="h2"
                              gutterBottom
                            >
                              {slot.start_time} - {slot.end_time}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom
                            >
                              {new Date(slot.date).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Chip
                            label={`${
                              slot.availability_score
                            }% - ${getAvailabilityLabel(
                              slot.availability_score
                            )}`}
                            color={
                              getAvailabilityColor(
                                slot.availability_score
                              ) as any
                            }
                            icon={<StarIcon />}
                          />
                        </Box>

                        <Box display="flex" gap={2} mb={2}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <LocationIcon
                              sx={{ color: "#1976d2" }}
                              fontSize="small"
                            />
                            <Typography variant="body2">
                              {slot.location}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <GroupIcon
                              sx={{ color: "#1976d2" }}
                              fontSize="small"
                            />
                            <Typography variant="body2">
                              {slot.available_players}/{slot.total_players}{" "}
                              players available
                            </Typography>
                          </Box>
                        </Box>

                        {slot.weather_forecast && (
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            mb={2}
                          >
                            <ScheduleIcon
                              sx={{ color: "#1976d2" }}
                              fontSize="small"
                            />
                            <Typography variant="body2">
                              Weather: {slot.weather_forecast}
                            </Typography>
                          </Box>
                        )}

                        {slot.conflicts.length > 0 && (
                          <Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Conflicts:
                            </Typography>
                            <List dense>
                              {slot.conflicts.map((conflict, index) => (
                                <ListItem key={index} sx={{ py: 0 }}>
                                  <ListItemIcon sx={{ minWidth: 24 }}>
                                    <Typography variant="body2" color="error">
                                      •
                                    </Typography>
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={conflict}
                                    primaryTypographyProps={{
                                      variant: "body2",
                                    }}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}

                        <Box display="flex" gap={2} mt={2}>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                          >
                            Schedule Game
                          </Button>
                          <Button variant="outlined" size="small">
                            View Details
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default SmartSchedulingTab;
