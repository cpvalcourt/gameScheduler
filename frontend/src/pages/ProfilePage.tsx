import React, { useState, useEffect, useRef } from "react";
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
  Description,
  CalendarToday,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import api, { updateProfile } from "../services/api";
import ProfilePictureUpload from "../components/ProfilePictureUpload";
import { AccountDeletion } from "../components/AccountDeletion";
import NavigationHeader from "../components/NavigationHeader";

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
  const { t } = useI18n();
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

  // Ref for date of birth input
  const dateOfBirthInputRef = useRef<HTMLInputElement>(null);

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
      setSuccess(t("profile.updateSuccess"));
    } catch (err: any) {
      setError(err.response?.data?.message || t("profile.updateError"));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError(t("profile.passwordMismatch"));
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError(t("profile.passwordTooShort"));
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
      setSuccess(t("profile.passwordChangeSuccess"));
    } catch (err: any) {
      setError(err.response?.data?.message || t("profile.passwordChangeError"));
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
      // Construct full URL if pictureUrl is a relative path
      const fullPictureUrl = pictureUrl
        ? pictureUrl.startsWith("http")
          ? pictureUrl
          : `http://localhost:3002${pictureUrl}`
        : null;

      updateUser({
        ...user,
        profile_picture_url: fullPictureUrl,
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
      <NavigationHeader
        title={t("profile.title")}
        subtitle={t("profile.subtitle")}
      />

      {/* Skip to main content link for screen readers */}
      <a
        href="#profile-content"
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
        Skip to main content
      </a>

      <Box id="profile-content" role="main" aria-labelledby="profile-title">
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

        {success && (
          <Alert
            severity="success"
            sx={{ mb: 3 }}
            role="status"
            aria-live="polite"
          >
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Profile Information */}
          <Grid item xs={12} md={8}>
            <Card role="region" aria-labelledby="profile-information-title">
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography variant="h6" id="profile-information-title">
                    {t("profile.information")}
                  </Typography>
                  {!isEditingProfile ? (
                    <Button
                      startIcon={<Edit aria-hidden="true" />}
                      onClick={() => setIsEditingProfile(true)}
                      variant="outlined"
                      size="small"
                      aria-label={`${t("profile.edit")} profile information`}
                      sx={{
                        minHeight: "44px",
                        "&:focus": {
                          outline: "2px solid",
                          outlineColor: "primary.main",
                          outlineOffset: "2px",
                        },
                      }}
                    >
                      {t("profile.edit")}
                    </Button>
                  ) : (
                    <Box role="group" aria-label="Profile edit actions">
                      <Button
                        startIcon={<Save aria-hidden="true" />}
                        onClick={handleSaveProfile}
                        variant="contained"
                        size="small"
                        disabled={loading}
                        aria-label={`${t("profile.save")} profile changes`}
                        sx={{
                          mr: 1,
                          minHeight: "44px",
                          "&:focus": {
                            outline: "2px solid",
                            outlineColor: "primary.main",
                            outlineOffset: "2px",
                          },
                        }}
                      >
                        {t("profile.save")}
                      </Button>
                      <Button
                        startIcon={<Cancel aria-hidden="true" />}
                        onClick={handleCancelEdit}
                        variant="outlined"
                        size="small"
                        disabled={loading}
                        aria-label={`${t("profile.cancel")} profile editing`}
                        sx={{
                          minHeight: "44px",
                          "&:focus": {
                            outline: "2px solid",
                            outlineColor: "primary.main",
                            outlineOffset: "2px",
                          },
                        }}
                      >
                        {t("profile.cancel")}
                      </Button>
                    </Box>
                  )}
                </Box>

                {/* Profile Picture */}
                <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
                  <ProfilePictureUpload
                    currentImageUrl={user.profile_picture_url}
                    onImageUpdate={handlePictureUpdate}
                    size={120}
                  />
                </Box>

                <Grid container spacing={2}>
                  {/* Basic Information */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t("profile.username")}
                      value={profileForm.username}
                      onChange={handleProfileChange("username")}
                      disabled={!isEditingProfile}
                      margin="normal"
                      aria-required="true"
                      aria-describedby="username-help"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person aria-hidden="true" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "&:focus-within": {
                          outline: "2px solid",
                          outlineColor: "primary.main",
                          outlineOffset: "2px",
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t("profile.email")}
                      type="email"
                      value={profileForm.email}
                      onChange={handleProfileChange("email")}
                      disabled={!isEditingProfile}
                      margin="normal"
                      aria-required="true"
                      aria-describedby="email-help"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email aria-hidden="true" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "&:focus-within": {
                          outline: "2px solid",
                          outlineColor: "primary.main",
                          outlineOffset: "2px",
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t("profile.location")}
                      value={profileForm.location}
                      onChange={handleProfileChange("location")}
                      disabled={!isEditingProfile}
                      margin="normal"
                      aria-describedby="location-help"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOn aria-hidden="true" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "&:focus-within": {
                          outline: "2px solid",
                          outlineColor: "primary.main",
                          outlineOffset: "2px",
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t("profile.phone")}
                      value={profileForm.phone}
                      onChange={handleProfileChange("phone")}
                      disabled={!isEditingProfile}
                      margin="normal"
                      aria-describedby="phone-help"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone aria-hidden="true" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "&:focus-within": {
                          outline: "2px solid",
                          outlineColor: "primary.main",
                          outlineOffset: "2px",
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t("profile.dateOfBirth")}
                      type="date"
                      value={profileForm.date_of_birth}
                      onChange={handleProfileChange("date_of_birth")}
                      disabled={!isEditingProfile}
                      margin="normal"
                      inputRef={dateOfBirthInputRef}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      aria-describedby="date-of-birth-help"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Cake aria-hidden="true" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "&:focus-within": {
                          outline: "2px solid",
                          outlineColor: "primary.main",
                          outlineOffset: "2px",
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t("profile.bio")}
                      value={profileForm.bio}
                      onChange={handleProfileChange("bio")}
                      disabled={!isEditingProfile}
                      margin="normal"
                      multiline
                      rows={3}
                      aria-describedby="bio-help"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Description aria-hidden="true" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "&:focus-within": {
                          outline: "2px solid",
                          outlineColor: "primary.main",
                          outlineOffset: "2px",
                        },
                      }}
                    />
                  </Grid>

                  {/* Social Links */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {t("profile.socialLinks")}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label={t("profile.linkedin")}
                      value={profileForm.linkedin_url}
                      onChange={handleProfileChange("linkedin_url")}
                      disabled={!isEditingProfile}
                      margin="normal"
                      aria-describedby="linkedin-help"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LinkedIn aria-hidden="true" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "&:focus-within": {
                          outline: "2px solid",
                          outlineColor: "primary.main",
                          outlineOffset: "2px",
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label={t("profile.twitter")}
                      value={profileForm.twitter_url}
                      onChange={handleProfileChange("twitter_url")}
                      disabled={!isEditingProfile}
                      margin="normal"
                      aria-describedby="twitter-help"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Twitter aria-hidden="true" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "&:focus-within": {
                          outline: "2px solid",
                          outlineColor: "primary.main",
                          outlineOffset: "2px",
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label={t("profile.website")}
                      value={profileForm.website_url}
                      onChange={handleProfileChange("website_url")}
                      disabled={!isEditingProfile}
                      margin="normal"
                      aria-describedby="website-help"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarToday aria-hidden="true" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "&:focus-within": {
                          outline: "2px solid",
                          outlineColor: "primary.main",
                          outlineOffset: "2px",
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Password Change */}
          <Grid item xs={12} md={4}>
            <Card role="region" aria-labelledby="password-change-title">
              <CardContent>
                <Typography
                  variant="h6"
                  id="password-change-title"
                  gutterBottom
                >
                  {t("profile.changePassword")}
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <TextField
                  fullWidth
                  label={t("profile.currentPassword")}
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange("currentPassword")}
                  margin="normal"
                  aria-required="true"
                  aria-describedby="current-password-help"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock aria-hidden="true" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => togglePasswordVisibility("current")}
                          edge="end"
                          aria-label={
                            showPasswords.current
                              ? t("profile.hidePassword")
                              : t("profile.showPassword")
                          }
                          sx={{
                            minWidth: "44px",
                            minHeight: "44px",
                            "&:focus": {
                              outline: "2px solid",
                              outlineColor: "primary.main",
                              outlineOffset: "2px",
                            },
                          }}
                        >
                          {showPasswords.current ? (
                            <VisibilityOff aria-hidden="true" />
                          ) : (
                            <Visibility aria-hidden="true" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "&:focus-within": {
                      outline: "2px solid",
                      outlineColor: "primary.main",
                      outlineOffset: "2px",
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label={t("profile.newPassword")}
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange("newPassword")}
                  margin="normal"
                  aria-required="true"
                  aria-describedby="new-password-help"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock aria-hidden="true" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => togglePasswordVisibility("new")}
                          edge="end"
                          aria-label={
                            showPasswords.new
                              ? t("profile.hidePassword")
                              : t("profile.showPassword")
                          }
                          sx={{
                            minWidth: "44px",
                            minHeight: "44px",
                            "&:focus": {
                              outline: "2px solid",
                              outlineColor: "primary.main",
                              outlineOffset: "2px",
                            },
                          }}
                        >
                          {showPasswords.new ? (
                            <VisibilityOff aria-hidden="true" />
                          ) : (
                            <Visibility aria-hidden="true" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "&:focus-within": {
                      outline: "2px solid",
                      outlineColor: "primary.main",
                      outlineOffset: "2px",
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label={t("profile.confirmPassword")}
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange("confirmPassword")}
                  margin="normal"
                  aria-required="true"
                  aria-describedby="confirm-password-help"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock aria-hidden="true" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => togglePasswordVisibility("confirm")}
                          edge="end"
                          aria-label={
                            showPasswords.confirm
                              ? t("profile.hidePassword")
                              : t("profile.showPassword")
                          }
                          sx={{
                            minWidth: "44px",
                            minHeight: "44px",
                            "&:focus": {
                              outline: "2px solid",
                              outlineColor: "primary.main",
                              outlineOffset: "2px",
                            },
                          }}
                        >
                          {showPasswords.confirm ? (
                            <VisibilityOff aria-hidden="true" />
                          ) : (
                            <Visibility aria-hidden="true" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "&:focus-within": {
                      outline: "2px solid",
                      outlineColor: "primary.main",
                      outlineOffset: "2px",
                    },
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleChangePassword}
                  disabled={loading}
                  aria-label={t("profile.changePassword")}
                  sx={{
                    mt: 2,
                    minHeight: "48px",
                    "&:focus": {
                      outline: "2px solid",
                      outlineColor: "primary.main",
                      outlineOffset: "2px",
                    },
                  }}
                >
                  {t("profile.changePassword")}
                </Button>
              </CardContent>
            </Card>

            {/* Account Deletion */}
            <Card
              sx={{ mt: 2 }}
              role="region"
              aria-labelledby="account-deletion-title"
            >
              <CardContent>
                <Typography
                  variant="h6"
                  id="account-deletion-title"
                  gutterBottom
                >
                  {t("profile.dangerZone")}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <AccountDeletion />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default ProfilePage;
