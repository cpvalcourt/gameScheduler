import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import {
  getTeam,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember,
  updateMemberRole,
  getRoleDisplayName,
  getRoleColor,
  canManageTeam,
  isTeamAdmin,
} from "../api/teams";
import type {
  TeamWithMembers,
  TeamFormData,
  MemberFormData,
} from "../types/team";
import NavigationHeader from "../components/NavigationHeader";
import TeamInvitationForm from "../components/TeamInvitationForm";
import TeamInvitationsList from "../components/TeamInvitationsList";

const TeamDetailsPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [team, setTeam] = useState<TeamWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [invitationFormOpen, setInvitationFormOpen] = useState(false);

  // Dialog states
  const [editTeamDialogOpen, setEditTeamDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [deleteTeamDialogOpen, setDeleteTeamDialogOpen] = useState(false);
  const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);

  // Form states
  const [teamFormData, setTeamFormData] = useState<TeamFormData>({
    name: "",
    description: "",
  });
  const [memberFormData, setMemberFormData] = useState<MemberFormData>({
    email: "",
    role: "player",
  });

  // Selected member for removal
  const [selectedMember, setSelectedMember] = useState<any>(null);

  useEffect(() => {
    if (teamId) {
      loadTeam();
    }
  }, [teamId]);

  const loadTeam = async () => {
    if (!teamId) return;

    try {
      setLoading(true);
      setError(null);
      const teamData = await getTeam(parseInt(teamId));
      setTeam(teamData);
    } catch (err) {
      setError("Failed to load team details");
      console.error("Error loading team:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTeam = async () => {
    if (!team) return;

    try {
      setError(null);
      const response = await updateTeam(team.id, teamFormData);
      setTeam((prev) => (prev ? { ...prev, ...response.team } : null));
      setEditTeamDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update team");
      console.error("Error updating team:", err);
    }
  };

  const handleDeleteTeam = async () => {
    if (!team) return;

    try {
      setError(null);
      await deleteTeam(team.id);
      navigate("/teams");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete team");
      console.error("Error deleting team:", err);
    }
  };

  const handleAddMember = async () => {
    if (!team) return;

    try {
      setError(null);
      await addMember(team.id, memberFormData);
      await loadTeam(); // Reload team to get updated members
      setAddMemberDialogOpen(false);
      setMemberFormData({ email: "", role: "player" });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add member");
      console.error("Error adding member:", err);
    }
  };

  const handleRemoveMember = async () => {
    if (!team || !selectedMember) return;

    try {
      setError(null);
      await removeMember(team.id, selectedMember.id);
      await loadTeam(); // Reload team to get updated members
      setRemoveMemberDialogOpen(false);
      setSelectedMember(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to remove member");
      console.error("Error removing member:", err);
    }
  };

  const handleUpdateMemberRole = async (memberId: number, newRole: string) => {
    if (!team) return;

    try {
      setError(null);
      await updateMemberRole(team.id, memberId, { role: newRole as any });
      await loadTeam(); // Reload team to get updated members
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update member role");
      console.error("Error updating member role:", err);
    }
  };

  const openEditTeamDialog = () => {
    if (!team) return;
    setTeamFormData({
      name: team.name,
      description: team.description || "",
    });
    setEditTeamDialogOpen(true);
  };

  const openAddMemberDialog = () => {
    setMemberFormData({ email: "", role: "player" });
    setAddMemberDialogOpen(true);
  };

  const openRemoveMemberDialog = (member: any) => {
    setSelectedMember(member);
    setRemoveMemberDialogOpen(true);
  };

  const closeDialogs = () => {
    setEditTeamDialogOpen(false);
    setAddMemberDialogOpen(false);
    setDeleteTeamDialogOpen(false);
    setRemoveMemberDialogOpen(false);
    setSelectedMember(null);
    setError(null);
  };

  const handleInvitationSent = () => {
    // Refresh the invitations list
    // The TeamInvitationsList component will handle its own refresh
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!team) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Team not found</Alert>
      </Container>
    );
  }

  const canManage = canManageTeam(team, user?.id || 0);
  const isAdmin = isTeamAdmin(team, user?.id || 0);

  return (
    <Container maxWidth="lg" sx={{ mb: 4 }}>
      <NavigationHeader
        title={team.name}
        subtitle={team.description || "No description provided"}
        showBackButton={true}
        backUrl="/teams"
      >
        {canManage && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<EmailIcon />}
              onClick={() => setInvitationFormOpen(true)}
            >
              Send Invitation
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={openEditTeamDialog}
            >
              Edit Team
            </Button>
            {isAdmin && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteTeamDialogOpen(true)}
              >
                Delete Team
              </Button>
            )}
          </Box>
        )}
      </NavigationHeader>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
        >
          <Tab label="Team Info" />
          <Tab label="Members" />
          {canManage && <Tab label="Invitations" />}
        </Tabs>
      </Box>

      {/* Team Info Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Team Information
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Created:</strong>{" "}
                  {new Date(team.created_at).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Members:</strong> {team.members.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Last Updated:</strong>{" "}
                  {new Date(team.updated_at).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Members Tab */}
      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">
                Team Members ({team.members.length})
              </Typography>
              {canManage && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={openAddMemberDialog}
                  size="small"
                >
                  Add Member
                </Button>
              )}
            </Box>

            <List>
              {team.members.map((member, index) => (
                <React.Fragment key={member.id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography variant="body1">
                            {member.username ||
                              member.email ||
                              `User ${member.user_id}`}
                          </Typography>
                          <Chip
                            label={getRoleDisplayName(member.role)}
                            color={getRoleColor(member.role)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        member.email && member.username
                          ? member.email
                          : `Member since ${new Date(
                              member.created_at
                            ).toLocaleDateString()}`
                      }
                    />

                    {canManage && member.user_id !== user?.id && (
                      <ListItemSecondaryAction>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={member.role}
                              onChange={(e) =>
                                handleUpdateMemberRole(
                                  member.id,
                                  e.target.value
                                )
                              }
                              disabled={!isAdmin}
                            >
                              <MenuItem value="admin">Admin</MenuItem>
                              <MenuItem value="captain">Captain</MenuItem>
                              <MenuItem value="player">Player</MenuItem>
                              <MenuItem value="snack_provider">
                                Snack Provider
                              </MenuItem>
                            </Select>
                          </FormControl>
                          <IconButton
                            size="small"
                            onClick={() => openRemoveMemberDialog(member)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                  {index < team.members.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Invitations Tab */}
      {activeTab === 2 && canManage && (
        <Card>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Team Invitations</Typography>
              <Button
                variant="contained"
                startIcon={<EmailIcon />}
                onClick={() => setInvitationFormOpen(true)}
                size="small"
              >
                Send Invitation
              </Button>
            </Box>

            <TeamInvitationsList
              teamId={team.id}
              onInvitationDeleted={handleInvitationSent}
            />
          </CardContent>
        </Card>
      )}

      {/* Team Invitation Form */}
      <TeamInvitationForm
        open={invitationFormOpen}
        onClose={() => setInvitationFormOpen(false)}
        teamId={team.id}
        teamName={team.name}
        onInvitationSent={handleInvitationSent}
      />

      {/* Edit Team Dialog */}
      <Dialog
        open={editTeamDialogOpen}
        onClose={closeDialogs}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Team</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Team Name"
            fullWidth
            variant="outlined"
            value={teamFormData.name}
            onChange={(e) =>
              setTeamFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={teamFormData.description}
            onChange={(e) =>
              setTeamFormData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialogs}>Cancel</Button>
          <Button
            onClick={handleUpdateTeam}
            variant="contained"
            disabled={!teamFormData.name.trim()}
          >
            Update Team
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Team Dialog */}
      <Dialog open={deleteTeamDialogOpen} onClose={closeDialogs}>
        <DialogTitle>Delete Team</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{team.name}"? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialogs}>Cancel</Button>
          <Button onClick={handleDeleteTeam} color="error" variant="contained">
            Delete Team
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog open={removeMemberDialogOpen} onClose={closeDialogs}>
        <DialogTitle>Remove Member</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove "
            {selectedMember?.username || selectedMember?.email}" from the team?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialogs}>Cancel</Button>
          <Button
            onClick={handleRemoveMember}
            color="error"
            variant="contained"
          >
            Remove Member
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeamDetailsPage;
