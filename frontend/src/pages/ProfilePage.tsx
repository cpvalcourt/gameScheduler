import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Chip,
} from "@mui/material";
import {
  Edit,
  Save,
  Cancel,
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
  LocationOn,
  Phone,
  Cake,
  LinkedIn,
  Twitter,
  Language,
  Description,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import api, { updateProfile } from "../services/api";
import { ProfilePictureUpload } from "../components/ProfilePictureUpload";
import { AccountDeletion } from "../components/AccountDeletion";

interface ProfileFormData {
  username: string;
  email: string;
  bio: string;
  location: string;
  phone: string;
  date_of_birth: string;
  linkedin_url: string;
  twitter_url: string;
  website_url: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile form state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
    location: user?.location || "",
    phone: user?.phone || "",
    date_of_birth: user?.date_of_birth || "",
    linkedin_url: user?.linkedin_url || "",
    twitter_url: user?.twitter_url || "",
    website_url: user?.website_url || "",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        location: user.location || "",
        phone: user.phone || "",
        date_of_birth: user.date_of_birth
          ? user.date_of_birth.split("T")[0]
          : "",
        linkedin_url: user.linkedin_url || "",
        twitter_url: user.twitter_url || "",
        website_url: user.website_url || "",
      });
    }
  }, [user]);

  const handleProfileChange =
    (field: keyof ProfileFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setProfileForm({
        ...profileForm,
        [field]: event.target.value,
      });
    };

  const handlePasswordChange =
    (field: keyof PasswordFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordForm({
        ...passwordForm,
        [field]: event.target.value,
      });
    };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Ensure date_of_birth is properly formatted
      const profileData = {
        ...profileForm,
        date_of_birth: profileForm.date_of_birth
          ? profileForm.date_of_birth.split("T")[0]
          : undefined,
      };

      const response = await updateProfile(profileData);

      // Update the user context with new data
      if (updateUser) {
        updateUser(response.user);
      }

      setIsEditingProfile(false);
      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await api.put("/users/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccess("Password changed successfully!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setProfileForm({
      username: user?.username || "",
      email: user?.email || "",
      bio: user?.bio || "",
      location: user?.location || "",
      phone: user?.phone || "",
      date_of_birth: user?.date_of_birth
        ? user.date_of_birth.split("T")[0]
        : "",
      linkedin_url: user?.linkedin_url || "",
      twitter_url: user?.twitter_url || "",
      website_url: user?.website_url || "",
    });
    setError(null);
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    });
  };

  const handlePictureUpdate = (pictureUrl: string | null) => {
    if (updateUser && user) {
      updateUser({
        ...user,
        profile_picture_url: pictureUrl,
      });
    }
  };

  if (!user) {
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
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account information and security settings
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h6">Profile Information</Typography>
                {!isEditingProfile ? (
                  <Button
                    startIcon={<Edit />}
                    onClick={() => setIsEditingProfile(true)}
                    variant="outlined"
                    size="small"
                  >
                    Edit
                  </Button>
                ) : (
                  <Box>
                    <Button
                      startIcon={<Save />}
                      onClick={handleSaveProfile}
                      variant="contained"
                      size="small"
                      disabled={loading}
                      sx={{ mr: 1 }}
                    >
                      Save
                    </Button>
                    <Button
                      startIcon={<Cancel />}
                      onClick={handleCancelEdit}
                      variant="outlined"
                      size="small"
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>

              {/* Profile Picture */}
              <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
                <ProfilePictureUpload
                  currentPictureUrl={user.profile_picture_url}
                  onPictureUpdate={handlePictureUpdate}
                  size={120}
                />
              </Box>

              <Grid container spacing={2}>
                {/* Basic Information */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={profileForm.username}
                    onChange={handleProfileChange("username")}
                    disabled={!isEditingProfile}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={profileForm.email}
                    onChange={handleProfileChange("email")}
                    disabled={!isEditingProfile}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={profileForm.location}
                    onChange={handleProfileChange("location")}
                    disabled={!isEditingProfile}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange("phone")}
                    disabled={!isEditingProfile}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    value={
                      profileForm.date_of_birth
                        ? profileForm.date_of_birth.split("T")[0]
                        : ""
                    }
                    onChange={handleProfileChange("date_of_birth")}
                    disabled={!isEditingProfile}
                    margin="normal"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Cake />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Social Media Links */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    Social Media Links
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="LinkedIn URL"
                    value={profileForm.linkedin_url}
                    onChange={handleProfileChange("linkedin_url")}
                    disabled={!isEditingProfile}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LinkedIn />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Twitter URL"
                    value={profileForm.twitter_url}
                    onChange={handleProfileChange("twitter_url")}
                    disabled={!isEditingProfile}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Twitter />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Website URL"
                    value={profileForm.website_url}
                    onChange={handleProfileChange("website_url")}
                    disabled={!isEditingProfile}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Language />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Bio */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    value={profileForm.bio}
                    onChange={handleProfileChange("bio")}
                    disabled={!isEditingProfile}
                    margin="normal"
                    multiline
                    rows={4}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Description />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Account Status:{" "}
                  <Chip
                    label={user.is_verified ? "Verified" : "Unverified"}
                    color={user.is_verified ? "success" : "warning"}
                    size="small"
                  />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Member since: {new Date(user.created_at).toLocaleDateString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Change Password */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>

              <TextField
                fullWidth
                label="Current Password"
                type={showPasswords.current ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange("currentPassword")}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility("current")}
                        edge="end"
                      >
                        {showPasswords.current ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="New Password"
                type={showPasswords.new ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={handlePasswordChange("newPassword")}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility("new")}
                        edge="end"
                      >
                        {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Confirm New Password"
                type={showPasswords.confirm ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange("confirmPassword")}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility("confirm")}
                        edge="end"
                      >
                        {showPasswords.confirm ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                variant="contained"
                onClick={handleChangePassword}
                disabled={
                  loading ||
                  !passwordForm.currentPassword ||
                  !passwordForm.newPassword ||
                  !passwordForm.confirmPassword
                }
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : "Change Password"}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <Button variant="outlined" onClick={() => navigate("/")}>
          Back to Dashboard
        </Button>
      </Box>

      <AccountDeletion />
    </Container>
  );
}

export default ProfilePage;
