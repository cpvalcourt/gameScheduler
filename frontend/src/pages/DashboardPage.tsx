import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  SportsEsports,
  Group,
  Event,
  TrendingUp,
  Add,
  CalendarToday,
  People,
  AdminPanelSettings,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import api from "../services/api";
import NavigationHeader from "../components/NavigationHeader";

interface DashboardStats {
  totalGameSeries: number;
  totalGames: number;
  totalTeams: number;
  upcomingGames: number;
  gamesThisWeek: number;
  gamesThisMonth: number;
}

interface RecentActivity {
  id: number;
  type: "game_created" | "series_created" | "team_joined" | "game_updated";
  title: string;
  description: string;
  timestamp: string;
  entityId?: number;
}

interface UpcomingGame {
  id: number;
  title: string;
  seriesName: string;
  date: string;
  time: string;
  location?: string;
  teams: string[];
}

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [upcomingGames, setUpcomingGames] = useState<UpcomingGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard statistics
      const statsResponse = await api.get("/dashboard/stats");
      setStats(statsResponse.data);

      // Fetch recent activity
      const activityResponse = await api.get("/dashboard/activity");
      setRecentActivity(activityResponse.data);

      // Fetch upcoming games
      const gamesResponse = await api.get("/dashboard/upcoming-games");
      console.log("Upcoming games API response:", gamesResponse.data);
      setUpcomingGames(gamesResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.message || t("dashboard.failedToLoad"));
      // Set mock data for development
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const setMockData = () => {
    setStats({
      totalGameSeries: 5,
      totalGames: 23,
      totalTeams: 8,
      upcomingGames: 3,
      gamesThisWeek: 2,
      gamesThisMonth: 7,
    });

    setRecentActivity([
      {
        id: 1,
        type: "game_created",
        title: t("dashboard.newGameCreated"),
        description: "Basketball Tournament - Round 1 added to Summer League",
        timestamp: "2024-01-15T10:30:00Z",
        entityId: 1,
      },
      {
        id: 2,
        type: "series_created",
        title: t("dashboard.newSeriesCreated"),
        description: "Summer League 2024 created",
        timestamp: "2024-01-14T15:45:00Z",
        entityId: 2,
      },
      {
        id: 3,
        type: "team_joined",
        title: t("dashboard.teamJoined"),
        description: "Thunder Dragons joined Basketball Tournament",
        timestamp: "2024-01-13T09:20:00Z",
        entityId: 3,
      },
    ]);

    setUpcomingGames([
      {
        id: 1,
        title: "Basketball Tournament - Round 1",
        seriesName: "Summer League 2024",
        date: "2024-01-20",
        time: "19:00",
        location: "Community Center",
        teams: ["Thunder Dragons", "Lightning Bolts"],
      },
      {
        id: 2,
        title: "Soccer Championship - Semi Final",
        seriesName: "City Cup 2024",
        date: "2024-01-22",
        time: "20:00",
        location: "Sports Complex",
        teams: ["Red Lions", "Blue Eagles"],
      },
      {
        id: 3,
        title: "Tennis Doubles - Final",
        seriesName: "Spring Tournament",
        date: "2024-01-25",
        time: "18:30",
        location: "Tennis Club",
        teams: ["Team Alpha", "Team Beta"],
      },
    ]);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "game_created":
        return <SportsEsports color="primary" aria-hidden="true" />;
      case "series_created":
        return <Event color="secondary" aria-hidden="true" />;
      case "team_joined":
        return <Group color="success" aria-hidden="true" />;
      case "game_updated":
        return <TrendingUp color="info" aria-hidden="true" />;
      default:
        return <Event aria-hidden="true" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatGameDate = (date: string, time: string) => {
    try {
      // Debug logging to see what data we're receiving
      console.log("formatGameDate input:", {
        date,
        time,
        dateType: typeof date,
        timeType: typeof time,
      });

      // Handle cases where date or time might be null, undefined, or invalid
      if (!date || !time) {
        console.log("Missing date or time:", { date, time });
        return "Date TBD";
      }

      // Ensure the date string is in a valid format
      let dateStr = date;
      if (date.includes("T")) {
        // If date already includes time, use it as is
        dateStr = date;
      } else {
        // Otherwise, combine date and time
        // Handle different time formats
        let timeStr = time;
        if (time && !time.includes(":")) {
          // If time is just a number (e.g., "1900"), convert to "19:00"
          if (time.length === 4) {
            timeStr = `${time.substring(0, 2)}:${time.substring(2, 4)}`;
          }
        }
        dateStr = `${date}T${timeStr}`;
      }

      console.log("Formatted date string:", dateStr);
      const gameDate = new Date(dateStr);

      // Check if the date is valid
      if (isNaN(gameDate.getTime())) {
        console.log("Invalid date created from:", dateStr);
        return "Date TBD";
      }

      return gameDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting game date:", error, { date, time });
      return "Date TBD";
    }
  };

  if (loading) {
    return (
      <Container component="main" maxWidth="xl">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
          role="status"
          aria-label={t("dashboard.loading")}
        >
          <CircularProgress aria-label={t("dashboard.loading")} />
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xl">
      {/* Skip to main content link */}
      <a
        href="#dashboard-content"
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
        Skip to dashboard content
      </a>

      <NavigationHeader
        title={t("navigation.dashboard")}
        subtitle={t("dashboard.subtitle")}
      />

      <Box id="dashboard-content" role="main" aria-labelledby="dashboard-title">
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            role="alert"
            aria-live="assertive"
          >
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Box component="section" aria-labelledby="stats-title">
          <Typography
            variant="h5"
            component="h2"
            id="stats-title"
            sx={{
              mb: 3,
              color: "text.primary",
              fontWeight: 600,
            }}
          >
            {t("dashboard.statistics")}
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                role="article"
                aria-labelledby="game-series-stat"
                sx={{
                  "&:focus-within": {
                    outline: "2px solid",
                    outlineColor: "primary.main",
                    outlineOffset: "2px",
                  },
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar
                      sx={{ bgcolor: "primary.main", mr: 2 }}
                      aria-hidden="true"
                    >
                      <Event />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h4"
                        component="div"
                        id="game-series-stat"
                        aria-label={`${
                          stats?.totalGameSeries || 0
                        } game series`}
                      >
                        {stats?.totalGameSeries || 0}
                      </Typography>
                      <Typography color="text.secondary">
                        {t("dashboard.gameSeries")}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                role="article"
                aria-labelledby="total-games-stat"
                sx={{
                  "&:focus-within": {
                    outline: "2px solid",
                    outlineColor: "primary.main",
                    outlineOffset: "2px",
                  },
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar
                      sx={{ bgcolor: "secondary.main", mr: 2 }}
                      aria-hidden="true"
                    >
                      <SportsEsports />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h4"
                        component="div"
                        id="total-games-stat"
                        aria-label={`${stats?.totalGames || 0} total games`}
                      >
                        {stats?.totalGames || 0}
                      </Typography>
                      <Typography color="text.secondary">
                        {t("dashboard.totalGames")}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                role="article"
                aria-labelledby="teams-stat"
                sx={{
                  "&:focus-within": {
                    outline: "2px solid",
                    outlineColor: "primary.main",
                    outlineOffset: "2px",
                  },
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar
                      sx={{ bgcolor: "success.main", mr: 2 }}
                      aria-hidden="true"
                    >
                      <People />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h4"
                        component="div"
                        id="teams-stat"
                        aria-label={`${stats?.totalTeams || 0} teams`}
                      >
                        {stats?.totalTeams || 0}
                      </Typography>
                      <Typography color="text.secondary">
                        {t("dashboard.teams")}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                role="article"
                aria-labelledby="upcoming-games-stat"
                sx={{
                  "&:focus-within": {
                    outline: "2px solid",
                    outlineColor: "primary.main",
                    outlineOffset: "2px",
                  },
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar
                      sx={{ bgcolor: "warning.main", mr: 2 }}
                      aria-hidden="true"
                    >
                      <CalendarToday />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h4"
                        component="div"
                        id="upcoming-games-stat"
                        aria-label={`${
                          stats?.upcomingGames || 0
                        } upcoming games`}
                      >
                        {stats?.upcomingGames || 0}
                      </Typography>
                      <Typography color="text.secondary">
                        {t("dashboard.upcomingGames")}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={3}>
          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <Card
              role="region"
              aria-labelledby="quick-actions-title"
              sx={{
                "&:focus-within": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: "2px",
                },
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  component="h3"
                  id="quick-actions-title"
                  gutterBottom
                  sx={{
                    color: "text.primary",
                    fontWeight: 600,
                  }}
                >
                  {t("dashboard.quickActions")}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<Add aria-hidden="true" />}
                    onClick={() => navigate("/game-series")}
                    fullWidth
                    aria-label={`${t(
                      "dashboard.createGameSeries"
                    )} - Create a new game series`}
                    sx={{
                      minHeight: "48px",
                      "&:focus": {
                        outline: "2px solid",
                        outlineColor: "primary.main",
                        outlineOffset: "2px",
                      },
                    }}
                  >
                    {t("dashboard.createGameSeries")}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Group aria-hidden="true" />}
                    onClick={() => navigate("/teams")}
                    fullWidth
                    aria-label={`${t("dashboard.manageTeams")} - Manage teams`}
                    sx={{
                      minHeight: "48px",
                      "&:focus": {
                        outline: "2px solid",
                        outlineColor: "primary.main",
                        outlineOffset: "2px",
                      },
                    }}
                  >
                    {t("dashboard.manageTeams")}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CalendarToday aria-hidden="true" />}
                    onClick={() => navigate("/game-series")}
                    fullWidth
                    aria-label={`${t(
                      "dashboard.viewAllSeries"
                    )} - View all game series`}
                    sx={{
                      minHeight: "48px",
                      "&:focus": {
                        outline: "2px solid",
                        outlineColor: "primary.main",
                        outlineOffset: "2px",
                      },
                    }}
                  >
                    {t("dashboard.viewAllSeries")}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Upcoming Games */}
          <Grid item xs={12} md={4}>
            <Card
              role="region"
              aria-labelledby="upcoming-games-title"
              sx={{
                "&:focus-within": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: "2px",
                },
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  component="h3"
                  id="upcoming-games-title"
                  gutterBottom
                  sx={{
                    color: "text.primary",
                    fontWeight: 600,
                  }}
                >
                  {t("dashboard.upcomingGames")}
                </Typography>
                <List dense aria-label={t("dashboard.upcomingGamesList")}>
                  {upcomingGames.slice(0, 3).map((game) => (
                    <ListItem
                      key={game.id}
                      divider
                      role="listitem"
                      aria-labelledby={`game-${game.id}-title`}
                    >
                      <ListItemIcon>
                        <SportsEsports color="primary" aria-hidden="true" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            id={`game-${game.id}-title`}
                            component="span"
                            variant="body1"
                            sx={{ fontWeight: 500 }}
                          >
                            {game.title}
                          </Typography>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              component="span"
                              display="block"
                            >
                              {formatGameDate(game.date, game.time)}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              component="span"
                              display="block"
                            >
                              {game.seriesName}
                            </Typography>
                            <Box sx={{ mt: 1 }} role="group" aria-label="Teams">
                              {game.teams.map((team, index) => (
                                <Chip
                                  key={index}
                                  label={team}
                                  size="small"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                  aria-label={`Team: ${team}`}
                                />
                              ))}
                            </Box>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                {upcomingGames.length > 3 && (
                  <Button
                    variant="text"
                    onClick={() => navigate("/game-series")}
                    fullWidth
                    aria-label={`${t(
                      "dashboard.viewAllGames"
                    )} - View all upcoming games`}
                    sx={{
                      minHeight: "44px",
                      "&:focus": {
                        outline: "2px solid",
                        outlineColor: "primary.main",
                        outlineOffset: "2px",
                      },
                    }}
                  >
                    {t("dashboard.viewAllGames")}
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={4}>
            <Card
              role="region"
              aria-labelledby="recent-activity-title"
              sx={{
                "&:focus-within": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: "2px",
                },
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  component="h3"
                  id="recent-activity-title"
                  gutterBottom
                  sx={{
                    color: "text.primary",
                    fontWeight: 600,
                  }}
                >
                  {t("dashboard.recentActivity")}
                </Typography>
                <List dense aria-label={t("dashboard.recentActivityList")}>
                  {recentActivity.slice(0, 4).map((activity) => (
                    <ListItem
                      key={activity.id}
                      divider
                      role="listitem"
                      aria-labelledby={`activity-${activity.id}-title`}
                    >
                      <ListItemIcon>
                        {getActivityIcon(activity.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            id={`activity-${activity.id}-title`}
                            component="span"
                            variant="body1"
                            sx={{ fontWeight: 500 }}
                          >
                            {activity.title}
                          </Typography>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              component="span"
                              display="block"
                            >
                              {activity.description}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              component="span"
                              display="block"
                            >
                              {formatDate(activity.timestamp)}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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

export default DashboardPage;
