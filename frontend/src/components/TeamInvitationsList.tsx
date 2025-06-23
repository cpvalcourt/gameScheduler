import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Box,
  Alert,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import { teamInvitationsApi } from "../api/team-invitations";
import type { TeamInvitation } from "../api/team-invitations";

interface TeamInvitationsListProps {
  teamId: number;
  onInvitationDeleted?: () => void;
}

const TeamInvitationsList = ({
  teamId,
  onInvitationDeleted,
}: TeamInvitationsListProps) => {
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invitationToDelete, setInvitationToDelete] =
    useState<TeamInvitation | null>(null);

  useEffect(() => {
    loadInvitations();
  }, [teamId]);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const response = await teamInvitationsApi.getTeamInvitations(teamId);
      setInvitations(response.invitations);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load invitations");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (invitation: TeamInvitation) => {
    setInvitationToDelete(invitation);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!invitationToDelete) return;

    try {
      setDeletingId(invitationToDelete.id);
      await teamInvitationsApi.deleteInvitation(teamId, invitationToDelete.id);

      // Remove from local state
      setInvitations((prev) =>
        prev.filter((inv) => inv.id !== invitationToDelete.id)
      );

      // Call callback if provided
      if (onInvitationDeleted) {
        onInvitationDeleted();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete invitation");
    } finally {
      setDeletingId(null);
      setDeleteDialogOpen(false);
      setInvitationToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setInvitationToDelete(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "accepted":
        return "success";
      case "declined":
        return "error";
      case "expired":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "accepted":
        return "Accepted";
      case "declined":
        return "Declined";
      case "expired":
        return "Expired";
      default:
        return status;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "captain":
        return <GroupIcon fontSize="small" />;
      case "player":
        return <PersonIcon fontSize="small" />;
      default:
        return <PersonIcon fontSize="small" />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (invitations.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No invitations found for this team.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Box>
        {invitations.map((invitation: TeamInvitation) => (
          <Card key={invitation.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <EmailIcon color="action" />
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {invitation.email}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      {getRoleIcon(invitation.role)}
                      <Typography variant="body2" color="text.secondary">
                        {invitation.role.charAt(0).toUpperCase() +
                          invitation.role.slice(1)}
                      </Typography>
                      {invitation.invited_by && (
                        <>
                          <Typography variant="body2" color="text.secondary">
                            • Invited by {invitation.invited_by}
                          </Typography>
                        </>
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Sent:{" "}
                      {new Date(invitation.created_at).toLocaleDateString()}
                      {invitation.status === "pending" && (
                        <>
                          {" "}
                          • Expires:{" "}
                          {new Date(invitation.expires_at).toLocaleDateString()}
                        </>
                      )}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label={getStatusText(invitation.status)}
                    color={getStatusColor(invitation.status) as any}
                    size="small"
                  />

                  {invitation.status === "pending" && (
                    <Tooltip title="Delete invitation">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(invitation)}
                        disabled={deletingId === invitation.id}
                      >
                        {deletingId === invitation.id ? (
                          <CircularProgress size={20} />
                        ) : (
                          <DeleteIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Invitation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the invitation for{" "}
            <strong>{invitationToDelete?.email}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TeamInvitationsList;
