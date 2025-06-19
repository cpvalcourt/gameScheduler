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
import api from "../services/api";

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
      setUpcomingGames(gamesResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
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
        title: "New Game Created",
        description: "Basketball Tournament - Round 1 added to Summer League",
        timestamp: "2024-01-15T10:30:00Z",
        entityId: 1,
      },
      {
        id: 2,
        type: "series_created",
        title: "New Series Created",
        description: "Summer League 2024 created",
        timestamp: "2024-01-14T15:45:00Z",
        entityId: 2,
      },
      {
        id: 3,
        type: "team_joined",
        title: "Team Joined",
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
        return <SportsEsports color="primary" />;
      case "series_created":
        return <Event color="secondary" />;
      case "team_joined":
        return <Group color="success" />;
      case "game_updated":
        return <TrendingUp color="info" />;
      default:
        return <Event />;
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
    const gameDate = new Date(`${date}T${time}`);
    return gameDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Container>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome back, {user?.username || "User"}! 👋
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Here's what's happening with your game schedules
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            {user?.role === "admin" && (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<AdminPanelSettings />}
                onClick={() => navigate("/admin")}
              >
                Admin Dashboard
              </Button>
            )}
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate("/profile")}
            >
              Profile
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                  <Event />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {stats?.totalGameSeries || 0}
                  </Typography>
                  <Typography color="text.secondary">Game Series</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: "secondary.main", mr: 2 }}>
                  <SportsEsports />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {stats?.totalGames || 0}
                  </Typography>
                  <Typography color="text.secondary">Total Games</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: "success.main", mr: 2 }}>
                  <People />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {stats?.totalTeams || 0}
                  </Typography>
                  <Typography color="text.secondary">Teams</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: "warning.main", mr: 2 }}>
                  <CalendarToday />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {stats?.upcomingGames || 0}
                  </Typography>
                  <Typography color="text.secondary">Upcoming Games</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate("/game-series")}
                  fullWidth
                >
                  Create Game Series
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Group />}
                  onClick={() => navigate("/teams")}
                  fullWidth
                >
                  Manage Teams
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CalendarToday />}
                  onClick={() => navigate("/game-series")}
                  fullWidth
                >
                  View All Series
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Games */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Games
              </Typography>
              <List dense>
                {upcomingGames.slice(0, 3).map((game) => (
                  <ListItem key={game.id} divider>
                    <ListItemIcon>
                      <SportsEsports color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={game.title}
                      secondary={
                        <Box>
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
                          <Box sx={{ mt: 1 }}>
                            {game.teams.map((team, index) => (
                              <Chip
                                key={index}
                                label={team}
                                size="small"
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            ))}
                          </Box>
                        </Box>
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
                >
                  View All Games
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List dense>
                {recentActivity.slice(0, 4).map((activity) => (
                  <ListItem key={activity.id} divider>
                    <ListItemIcon>
                      {getActivityIcon(activity.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.title}
                      secondary={
                        <Box>
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
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default DashboardPage;
