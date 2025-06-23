import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { teamInvitationsApi } from "../api/team-invitations";
import type { SendInvitationRequest } from "../api/team-invitations";

interface TeamInvitationFormProps {
  open: boolean;
  onClose: () => void;
  teamId: number;
  teamName: string;
  onInvitationSent?: () => void;
}

const TeamInvitationForm = ({
  open,
  onClose,
  teamId,
  teamName,
  onInvitationSent,
}: TeamInvitationFormProps) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("player");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const invitationData: SendInvitationRequest = {
        teamId,
        email: email.trim(),
        role: role as "captain" | "player",
      };

      await teamInvitationsApi.sendInvitation(invitationData);

      setSuccess("Invitation sent successfully!");
      setEmail("");
      setRole("player");

      // Call callback if provided
      if (onInvitationSent) {
        onInvitationSent();
      }

      // Close dialog after a short delay
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEmail("");
      setRole("player");
      setError(null);
      setSuccess(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Invite to Team: {teamName}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Send an invitation to join your team. The recipient will receive
              an email with instructions.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            sx={{ mb: 2 }}
            helperText="Enter the email address of the person you want to invite"
          />

          <FormControl fullWidth disabled={loading} sx={{ mb: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={role}
              label="Role"
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="player">Player</MenuItem>
              <MenuItem value="captain">Captain</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Note:</strong> If the person doesn't have an account,
              they'll be prompted to create one. If they already have an
              account, they'll be asked to log in.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !email.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Sending..." : "Send Invitation"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TeamInvitationForm;
