import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Group as GroupIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { teamInvitationsApi } from "../api/team-invitations";
import NavigationHeader from "../components/NavigationHeader";

const TeamInvitationPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [invitation, setInvitation] = useState(null);

  useEffect(() => {
    if (token) {
      loadInvitation();
    }
  }, [token]);

  const loadInvitation = async () => {
    try {
      setLoading(true);
      // We'll need to add a method to get invitation by token
      // For now, we'll handle this in the accept/decline methods
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load invitation");
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!token) return;

    try {
      setProcessing(true);
      await teamInvitationsApi.acceptInvitation(token);

      // Show success and redirect
      setTimeout(() => {
        navigate("/teams", {
          state: {
            message:
              "Invitation accepted successfully! You are now a member of the team.",
          },
        });
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to accept invitation");
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!token) return;

    try {
      setProcessing(true);
      await teamInvitationsApi.declineInvitation(token);

      // Show success and redirect
      setTimeout(() => {
        navigate("/teams", {
          state: { message: "Invitation declined successfully." },
        });
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to decline invitation");
      setProcessing(false);
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
      <Container maxWidth="md">
        <NavigationHeader title="Team Invitation" showNavigation={false} />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <NavigationHeader title="Team Invitation" showNavigation={false} />
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
        <Box mt={2}>
          <Button variant="contained" onClick={() => navigate("/teams")}>
            Go to Teams
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <NavigationHeader title="Team Invitation" showNavigation={false} />

      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Team Invitation
          </Typography>

          <Typography variant="body1" color="text.secondary" paragraph>
            You have been invited to join a team. Please review the details
            below and choose whether to accept or decline the invitation.
          </Typography>

          <Box mt={3} mb={3}>
            <Typography variant="h6" gutterBottom>
              Invitation Details
            </Typography>

            <Box display="flex" alignItems="center" gap={1} mb={1}>
              {invitation?.role && getRoleIcon(invitation.role)}
              <Typography variant="body1">
                Role:{" "}
                <strong>
                  {invitation?.role?.charAt(0).toUpperCase() +
                    invitation?.role?.slice(1)}
                </strong>
              </Typography>
            </Box>

            {invitation?.team_name && (
              <Typography variant="body1" mb={1}>
                Team: <strong>{invitation.team_name}</strong>
              </Typography>
            )}

            {invitation?.invited_by && (
              <Typography variant="body1" mb={1}>
                Invited by: <strong>{invitation.invited_by}</strong>
              </Typography>
            )}

            {invitation?.expires_at && (
              <Box mt={2}>
                <Chip
                  label={`Expires: ${new Date(
                    invitation.expires_at
                  ).toLocaleDateString()}`}
                  color="warning"
                  size="small"
                />
              </Box>
            )}
          </Box>

          <Box display="flex" gap={2} mt={3}>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckIcon />}
              onClick={handleAccept}
              disabled={processing}
              size="large"
            >
              {processing ? "Accepting..." : "Accept Invitation"}
            </Button>

            <Button
              variant="outlined"
              color="error"
              startIcon={<CloseIcon />}
              onClick={handleDecline}
              disabled={processing}
              size="large"
            >
              {processing ? "Declining..." : "Decline Invitation"}
            </Button>
          </Box>

          <Box mt={3}>
            <Typography variant="body2" color="text.secondary">
              <strong>Note:</strong> Accepting this invitation will add you to
              the team with the specified role. You can leave the team later if
              needed.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default TeamInvitationPage;
