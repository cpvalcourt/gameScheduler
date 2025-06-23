import React, { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Fab,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Group as GroupIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import {
  getUserTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  getRoleDisplayName,
  getRoleColor,
  canManageTeamBasic,
} from "../api/teams";
import type { Team, TeamWithMembers, TeamFormData } from "../types/team";
import { useNavigate } from "react-router-dom";
import NavigationHeader from "../components/NavigationHeader";

const TeamsPage = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState<TeamFormData>({
    name: "",
    description: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const userTeams = await getUserTeams();
      setTeams(userTeams);
    } catch (err) {
      setError(t("teams.failedToLoad"));
      console.error("Error loading teams:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    try {
      setError(null);
      const response = await createTeam(formData);
      setTeams((prev) => [...prev, response.team]);
      setCreateDialogOpen(false);
      setFormData({ name: "", description: "" });
    } catch (err: any) {
      setError(err.response?.data?.message || t("teams.failedToCreate"));
      console.error("Error creating team:", err);
    }
  };

  const handleUpdateTeam = async () => {
    if (!selectedTeam) return;

    try {
      setError(null);
      const response = await updateTeam(selectedTeam.id, formData);
      setTeams((prev) =>
        prev.map((team) => (team.id === selectedTeam.id ? response.team : team))
      );
      setEditDialogOpen(false);
      setSelectedTeam(null);
      setFormData({ name: "", description: "" });
    } catch (err: any) {
      setError(err.response?.data?.message || t("teams.failedToUpdate"));
      console.error("Error updating team:", err);
    }
  };

  const handleDeleteTeam = async () => {
    if (!selectedTeam) return;

    try {
      setError(null);
      await deleteTeam(selectedTeam.id);
      setTeams((prev) => prev.filter((team) => team.id !== selectedTeam.id));
      setDeleteDialogOpen(false);
      setSelectedTeam(null);
    } catch (err: any) {
      setError(err.response?.data?.message || t("teams.failedToDelete"));
      console.error("Error deleting team:", err);
    }
  };

  const openCreateDialog = () => {
    setFormData({ name: "", description: "" });
    setCreateDialogOpen(true);
  };

  const openEditDialog = (team: Team) => {
    setSelectedTeam(team);
    setFormData({
      name: team.name,
      description: team.description || "",
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (team: Team) => {
    setSelectedTeam(team);
    setDeleteDialogOpen(true);
  };

  const closeDialogs = () => {
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setDeleteDialogOpen(false);
    setSelectedTeam(null);
    setFormData({ name: "", description: "" });
    setError(null);
  };

  const handleFormChange =
    (field: keyof TeamFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleViewTeamDetails = (teamId: number) => {
    navigate(`/teams/${teamId}`);
  };

  // Filter teams based on search term
  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (team.description &&
        team.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mb: 4 }}>
      <NavigationHeader title={t("teams.title")}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
          size="large"
        >
          {t("teams.createTeam")}
        </Button>
      </NavigationHeader>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder={t("teams.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          variant="outlined"
        />
      </Box>

      {teams.length === 0 ? (
        <Card sx={{ textAlign: "center", py: 8 }}>
          <CardContent>
            <PeopleIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t("teams.noTeams")}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {t("teams.noTeamsDescription")}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
              size="large"
            >
              {t("teams.createFirstTeam")}
            </Button>
          </CardContent>
        </Card>
      ) : filteredTeams.length === 0 ? (
        <Card sx={{ textAlign: "center", py: 8 }}>
          <CardContent>
            <SearchIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t("teams.noTeamsFound")}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {t("teams.noTeamsFoundDescription")}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setSearchTerm("")}
              size="large"
            >
              {t("teams.clearSearch")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredTeams.map((team) => (
            <Grid item xs={12} sm={6} md={4} key={team.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {team.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {team.description || t("teams.noDescription")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t("teams.created")}:{" "}
                    {new Date(team.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "space-between" }}>
                  <Button
                    size="small"
                    startIcon={<PeopleIcon />}
                    onClick={() => handleViewTeamDetails(team.id)}
                  >
                    {t("teams.viewDetails")}
                  </Button>
                  {canManageTeamBasic(team, user?.id || 0) && (
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => openEditDialog(team)}
                        color="primary"
                        aria-label={`${t("teams.editTeam")} - ${team.name}`}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => openDeleteDialog(team)}
                        color="error"
                        aria-label={`${t("teams.deleteTeam")} - ${team.name}`}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Team Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={closeDialogs}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("teams.createNewTeam")}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t("teams.teamName")}
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleFormChange("name")}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label={t("teams.description")}
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={formData.description}
            onChange={handleFormChange("description")}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialogs}>{t("common.cancel")}</Button>
          <Button
            onClick={handleCreateTeam}
            variant="contained"
            disabled={!formData.name.trim()}
          >
            {t("teams.createTeam")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={closeDialogs}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("teams.editTeam")}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t("teams.teamName")}
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleFormChange("name")}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label={t("teams.description")}
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={formData.description}
            onChange={handleFormChange("description")}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialogs}>{t("common.cancel")}</Button>
          <Button
            onClick={handleUpdateTeam}
            variant="contained"
            disabled={!formData.name.trim()}
          >
            {t("teams.updateTeam")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Team Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDialogs}>
        <DialogTitle>{t("teams.deleteTeam")}</DialogTitle>
        <DialogContent>
          <Typography>
            {t("teams.deleteConfirmation", { teamName: selectedTeam?.name })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialogs}>{t("common.cancel")}</Button>
          <Button onClick={handleDeleteTeam} color="error" variant="contained">
            {t("teams.deleteTeam")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeamsPage;
