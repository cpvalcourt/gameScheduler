import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
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
  LinearProgress,
  Avatar,
  AvatarGroup,
} from "@mui/material";
import {
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { useI18n } from "../../contexts/I18nContext";
import { formatDate, formatTime } from "../../utils/dateUtils";

interface TeamAvailabilityTabProps {
  onError: (error: string) => void;
  onLoading: (loading: boolean) => void;
}

interface TeamMember {
  id: number;
  name: string;
  email: string;
  availability_percentage: number;
  last_updated: string;
  upcoming_games: number;
  missed_games: number;
}

interface TeamAvailability {
  id: number;
  name: string;
  sport: string;
  total_members: number;
  active_members: number;
  average_availability: number;
  next_game: string;
  members: TeamMember[];
}

const TeamAvailabilityTab = ({
  onError,
  onLoading,
}: TeamAvailabilityTabProps) => {
  const { t, language } = useI18n();
  const [teams, setTeams] = useState<TeamAvailability[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTeamAvailability();
  }, []);

  const loadTeamAvailability = async () => {
    try {
      setLoading(true);
      onLoading(true);

      // Mock data for demonstration
      const mockTeams: TeamAvailability[] = [
        {
          id: 1,
          name: "Basketball Team Alpha",
          sport: "Basketball",
          total_members: 12,
          active_members: 10,
          average_availability: 85,
          next_game: "2024-01-15T14:00:00Z",
          members: [
            {
              id: 1,
              name: "John Smith",
              email: "john@example.com",
              availability_percentage: 90,
              last_updated: "2024-01-10T10:00:00Z",
              upcoming_games: 3,
              missed_games: 1,
            },
            {
              id: 2,
              name: "Sarah Johnson",
              email: "sarah@example.com",
              availability_percentage: 75,
              last_updated: "2024-01-09T15:30:00Z",
              upcoming_games: 2,
              missed_games: 2,
            },
            {
              id: 3,
              name: "Mike Davis",
              email: "mike@example.com",
              availability_percentage: 95,
              last_updated: "2024-01-11T09:15:00Z",
              upcoming_games: 4,
              missed_games: 0,
            },
          ],
        },
        {
          id: 2,
          name: "Soccer Squad Beta",
          sport: "Soccer",
          total_members: 18,
          active_members: 15,
          average_availability: 78,
          next_game: "2024-01-18T16:00:00Z",
          members: [
            {
              id: 4,
              name: "Alex Wilson",
              email: "alex@example.com",
              availability_percentage: 80,
              last_updated: "2024-01-10T14:20:00Z",
              upcoming_games: 2,
              missed_games: 1,
            },
            {
              id: 5,
              name: "Lisa Brown",
              email: "lisa@example.com",
              availability_percentage: 70,
              last_updated: "2024-01-08T11:45:00Z",
              upcoming_games: 1,
              missed_games: 3,
            },
          ],
        },
      ];

      setTeams(mockTeams);
      if (mockTeams.length > 0) {
        setSelectedTeam(mockTeams[0].id);
      }
    } catch (error) {
      onError(t("advancedScheduling.failedToLoadTeamAvailability"));
      console.error("Error loading team availability:", error);
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  const getAvailabilityColor = (percentage: number) => {
    if (percentage >= 90) return "success";
    if (percentage >= 75) return "warning";
    return "error";
  };

  const getAvailabilityLabel = (percentage: number) => {
    if (percentage >= 90) return t("advancedScheduling.excellent");
    if (percentage >= 75) return t("advancedScheduling.good");
    if (percentage >= 60) return t("advancedScheduling.fair");
    return t("advancedScheduling.poor");
  };

  const selectedTeamData = teams.find((team) => team.id === selectedTeam);

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
          {t("advancedScheduling.teamAvailability")}
        </Typography>
        <Button
          variant="contained"
          startIcon={<CalendarIcon />}
          onClick={() =>
            onError(t("advancedScheduling.teamAvailabilityManagement"))
          }
        >
          {t("advancedScheduling.manageTeamSchedule")}
        </Button>
      </Box>

      {teams.length === 0 ? (
        <Alert severity="info">{t("advancedScheduling.noTeamsFound")}</Alert>
      ) : (
        <Grid container spacing={3}>
          {/* Team Selection */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  {t("advancedScheduling.selectTeam")}
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  {teams.map((team) => (
                    <Button
                      key={team.id}
                      variant={
                        selectedTeam === team.id ? "contained" : "outlined"
                      }
                      onClick={() => setSelectedTeam(team.id)}
                      startIcon={<GroupIcon />}
                    >
                      {team.name}
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Team Overview */}
          {selectedTeamData && (
            <>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {t("advancedScheduling.teamOverview")}
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {t("advancedScheduling.totalMembers")}
                        </Typography>
                        <Typography variant="h4">
                          {selectedTeamData.total_members}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {t("advancedScheduling.activeMembers")}
                        </Typography>
                        <Typography variant="h4" color="primary">
                          {selectedTeamData.active_members}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {t("advancedScheduling.averageAvailability")}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="h4">
                            {selectedTeamData.average_availability}%
                          </Typography>
                          <Chip
                            label={getAvailabilityLabel(
                              selectedTeamData.average_availability
                            )}
                            color={getAvailabilityColor(
                              selectedTeamData.average_availability
                            )}
                            size="small"
                          />
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={selectedTeamData.average_availability}
                          color={getAvailabilityColor(
                            selectedTeamData.average_availability
                          )}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {t("advancedScheduling.nextGame")}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <ScheduleIcon color="primary" />
                      <Box>
                        <Typography variant="body1">
                          {formatDate(selectedTeamData.next_game, language)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatTime(selectedTeamData.next_game, language)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Member Availability Table */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {t("advancedScheduling.memberAvailability")}
                    </Typography>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>
                              {t("advancedScheduling.member")}
                            </TableCell>
                            <TableCell>
                              {t("advancedScheduling.availability")}
                            </TableCell>
                            <TableCell>
                              {t("advancedScheduling.lastUpdated")}
                            </TableCell>
                            <TableCell>
                              {t("advancedScheduling.upcomingGames")}
                            </TableCell>
                            <TableCell>
                              {t("advancedScheduling.missedGames")}
                            </TableCell>
                            <TableCell>
                              {t("advancedScheduling.actions")}
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedTeamData.members.map((member) => (
                            <TableRow key={member.id}>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={2}>
                                  <Avatar sx={{ width: 32, height: 32 }}>
                                    {member.name.charAt(0)}
                                  </Avatar>
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      fontWeight="medium"
                                    >
                                      {member.name}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {member.email}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Typography variant="body2">
                                    {member.availability_percentage}%
                                  </Typography>
                                  <Chip
                                    label={getAvailabilityLabel(
                                      member.availability_percentage
                                    )}
                                    color={getAvailabilityColor(
                                      member.availability_percentage
                                    )}
                                    size="small"
                                  />
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={member.availability_percentage}
                                  color={getAvailabilityColor(
                                    member.availability_percentage
                                  )}
                                  sx={{ mt: 1 }}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {formatDate(member.last_updated, language)}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {formatTime(member.last_updated, language)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {member.upcoming_games}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="error">
                                  {member.missed_games}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Button size="small" variant="outlined">
                                  {t("common.view")}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default TeamAvailabilityTab;
