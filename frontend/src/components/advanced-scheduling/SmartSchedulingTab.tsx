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
  Close as CloseIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useI18n } from "../../contexts/I18nContext";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { fr } from "date-fns/locale/fr";
import { es } from "date-fns/locale/es";
import { enUS } from "date-fns/locale/en-US";

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

const localeMap = {
  en: enUS,
  fr: fr,
  es: es,
};

const SmartSchedulingTab = ({
  onError,
  onLoading,
}: SmartSchedulingTabProps) => {
  const { t, language } = useI18n();
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
      onError(t("advancedScheduling.failedToLoadTeams"));
      console.error("Error loading teams:", error);
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  const handleFindOptimalTime = async () => {
    if (!selectedTeam || !searchDate) {
      onError(t("advancedScheduling.pleaseSelectTeamAndDate"));
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
      onError(t("advancedScheduling.optimalTimeSlotsFound"));
    } catch (error) {
      onError(t("advancedScheduling.failedToFindOptimalTime"));
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
    if (score >= 90) return t("advancedScheduling.excellent");
    if (score >= 75) return t("advancedScheduling.good");
    if (score >= 60) return t("advancedScheduling.fair");
    return t("advancedScheduling.poor");
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
          {t("advancedScheduling.smartScheduling")}
        </Typography>
        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={handleFindOptimalTime}
          disabled={!selectedTeam || !searchDate || searching}
        >
          {searching
            ? t("advancedScheduling.findingOptimalTimes")
            : t("advancedScheduling.findOptimalTime")}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Search Criteria */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                {t("advancedScheduling.searchCriteria")}
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <FormControl fullWidth>
                  <InputLabel>{t("advancedScheduling.selectTeam")}</InputLabel>
                  <Select
                    value={selectedTeam}
                    label={t("advancedScheduling.selectTeam")}
                    onChange={(e) => setSelectedTeam(e.target.value as number)}
                    inputProps={{
                      "aria-label": t("advancedScheduling.selectTeam"),
                    }}
                  >
                    {teams.map((team) => (
                      <MenuItem key={team.id} value={team.id}>
                        {team.name} ({team.sport})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <LocalizationProvider
                  dateAdapter={AdapterDateFns}
                  adapterLocale={localeMap[language] || enUS}
                >
                  <DatePicker
                    label={t("advancedScheduling.searchDate")}
                    value={searchDate ? new Date(searchDate) : null}
                    onChange={(newValue) =>
                      setSearchDate(
                        newValue ? newValue.toISOString().split("T")[0] : ""
                      )
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

                <FormControl fullWidth>
                  <InputLabel>
                    {t("advancedScheduling.gameDuration")}
                  </InputLabel>
                  <Select
                    value={searchDuration}
                    label={t("advancedScheduling.gameDuration")}
                    onChange={(e) =>
                      setSearchDuration(e.target.value as number)
                    }
                    inputProps={{
                      "aria-label": t("advancedScheduling.gameDuration"),
                    }}
                  >
                    <MenuItem value={60}>
                      {t("advancedScheduling.oneHour")}
                    </MenuItem>
                    <MenuItem value={90}>
                      {t("advancedScheduling.oneAndHalfHours")}
                    </MenuItem>
                    <MenuItem value={120}>
                      {t("advancedScheduling.twoHours")}
                    </MenuItem>
                    <MenuItem value={150}>
                      {t("advancedScheduling.twoAndHalfHours")}
                    </MenuItem>
                    <MenuItem value={180}>
                      {t("advancedScheduling.threeHours")}
                    </MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handleFindOptimalTime}
                  disabled={!selectedTeam || !searchDate || searching}
                  fullWidth
                >
                  {searching
                    ? t("advancedScheduling.searching")
                    : t("advancedScheduling.findOptimalTimes")}
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
                  {t("advancedScheduling.optimalTimeSlots")}
                </Typography>
                <Alert severity="info">
                  {t("advancedScheduling.selectTeamAndDate")}
                </Alert>
              </CardContent>
            </Card>
          ) : (
            <Box>
              <Typography variant="h6" component="h2" gutterBottom>
                {t("advancedScheduling.optimalTimeSlotsFound")}
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
                              component="h3"
                              gutterBottom
                            >
                              {slot.start_time} - {slot.end_time}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {slot.location}
                            </Typography>
                          </Box>
                          <Chip
                            label={getAvailabilityLabel(
                              slot.availability_score
                            )}
                            color={getAvailabilityColor(
                              slot.availability_score
                            )}
                            size="small"
                          />
                        </Box>

                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={1}
                              mb={1}
                            >
                              <GroupIcon fontSize="small" color="action" />
                              <Typography variant="body2">
                                {t("advancedScheduling.availablePlayers")}:{" "}
                                {slot.available_players}/{slot.total_players}
                              </Typography>
                            </Box>
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={1}
                              mb={1}
                            >
                              <StarIcon fontSize="small" color="action" />
                              <Typography variant="body2">
                                {t("advancedScheduling.availabilityScore")}:{" "}
                                {slot.availability_score}%
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={1}
                              mb={1}
                            >
                              <LocationIcon fontSize="small" color="action" />
                              <Typography variant="body2">
                                {t("advancedScheduling.weatherForecast")}:{" "}
                                {slot.weather_forecast}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        {slot.conflicts.length > 0 && (
                          <Box mt={2}>
                            <Typography variant="subtitle2" gutterBottom>
                              {t("advancedScheduling.conflicts")}:
                            </Typography>
                            <List dense>
                              {slot.conflicts.map((conflict, index) => (
                                <ListItem key={index} sx={{ py: 0 }}>
                                  <ListItemIcon sx={{ minWidth: 32 }}>
                                    <CloseIcon fontSize="small" color="error" />
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
