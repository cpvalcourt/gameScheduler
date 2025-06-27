import React, { useState, useRef, useEffect } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Alert,
  Link,
  CircularProgress,
} from "@mui/material";
import api from "../api/axios";
import { Link as RouterLink } from "react-router-dom";
import { useI18n } from "../contexts/I18nContext";
import { useAuth } from "../contexts/AuthContext";
import LanguageSelector from "../components/LanguageSelector";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const { t } = useI18n();
  const { login } = useAuth();

  // Refs for focus management
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const errorRef = useRef(null);
  const formRef = useRef(null);

  // Focus management for screen readers
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [error]);

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate form fields
  const validateForm = (): boolean => {
    let isValid = true;

    // Clear previous errors
    setEmailError("");
    setPasswordError("");

    // Validate email
    if (!email.trim()) {
      setEmailError(t("auth.emailRequired"));
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError(t("auth.emailInvalid"));
      isValid = false;
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError(t("auth.passwordRequired"));
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!validateForm()) {
      // Focus on first error field
      if (emailError && emailRef.current) {
        emailRef.current.focus();
      } else if (passwordError && passwordRef.current) {
        passwordRef.current.focus();
      }
      return;
    }

    setLoading(true);
    try {
      // Use AuthContext login function which properly handles user state
      await login(email, password);

      // Check if user is verified (this should be handled by the backend)
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        if (!user.is_verified) {
          setError(t("auth.emailNotVerified"));
          setShowResendVerification(true);
          return;
        }
      }

      // Navigate to dashboard after successful login
      navigate("/");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || t("auth.loginFailed");
      setError(errorMessage);
      if (err.response?.data?.message?.includes("verify")) {
        setShowResendVerification(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await api.post("/auth/resend-verification", { email });
      setError(t("auth.verificationEmailSent"));
      setShowResendVerification(false);
    } catch (err: any) {
      setError(
        err.response?.data?.message || t("auth.resendVerificationFailed")
      );
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) {
      setPasswordError("");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      {/* Language Selector - Top Right */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 1,
        }}
      >
        <LanguageSelector variant="menu" size="small" />
      </Box>

      {/* Skip to main content link */}
      <a
        href="#login-form"
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
        Skip to login form
      </a>

      <Box
        component="main"
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        role="main"
        aria-labelledby="login-title"
      >
        <Typography
          component="h1"
          variant="h4"
          id="login-title"
          sx={{
            mb: 3,
            color: "text.primary",
            fontWeight: 600,
          }}
        >
          {t("auth.signIn")}
        </Typography>

        {/* Error Alert - Focusable for screen readers */}
        {error && (
          <Alert
            severity="error"
            sx={{
              width: "100%",
              mt: 2,
              "& .MuiAlert-message": {
                color: "error.contrastText",
              },
            }}
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            {error}
          </Alert>
        )}

        <Box
          component="form"
          id="login-form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ mt: 1, width: "100%" }}
          ref={formRef}
          aria-label={t("auth.loginForm")}
          role="form"
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label={t("auth.emailAddress")}
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={handleEmailChange}
            error={!!emailError}
            helperText={emailError}
            inputRef={emailRef}
            aria-describedby={emailError ? "email-error" : undefined}
            inputProps={{
              "aria-label": t("auth.emailAddress"),
              "aria-describedby": emailError ? "email-error" : undefined,
              "aria-invalid": !!emailError,
              "aria-required": "true",
            }}
            sx={{
              "& .MuiInputBase-root": {
                minHeight: "48px",
              },
            }}
          />
          {emailError && (
            <div
              id="email-error"
              style={{
                position: "absolute",
                width: "1px",
                height: "1px",
                padding: 0,
                margin: "-1px",
                overflow: "hidden",
                clip: "rect(0, 0, 0, 0)",
                whiteSpace: "nowrap",
                border: 0,
              }}
              aria-live="polite"
              role="status"
            >
              {emailError}
            </div>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label={t("auth.password")}
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={handlePasswordChange}
            error={!!passwordError}
            helperText={passwordError}
            inputRef={passwordRef}
            aria-describedby={passwordError ? "password-error" : undefined}
            inputProps={{
              "aria-label": t("auth.password"),
              "aria-describedby": passwordError ? "password-error" : undefined,
              "aria-invalid": !!passwordError,
              "aria-required": "true",
            }}
            sx={{
              "& .MuiInputBase-root": {
                minHeight: "48px",
              },
            }}
          />
          {passwordError && (
            <div
              id="password-error"
              style={{
                position: "absolute",
                width: "1px",
                height: "1px",
                padding: 0,
                margin: "-1px",
                overflow: "hidden",
                clip: "rect(0, 0, 0, 0)",
                whiteSpace: "nowrap",
                border: 0,
              }}
              aria-live="polite"
              role="status"
            >
              {passwordError}
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              minHeight: 48,
              fontSize: "1.1rem",
              fontWeight: 600,
              "&:focus": {
                outline: "2px solid",
                outlineColor: "primary.main",
                outlineOffset: "2px",
              },
            }}
            disabled={loading}
            aria-describedby={loading ? "loading-status" : undefined}
            aria-busy={loading}
            aria-label={loading ? t("auth.signingIn") : t("auth.signIn")}
          >
            {loading ? (
              <>
                <CircularProgress
                  size={20}
                  sx={{ mr: 1 }}
                  aria-label={t("auth.loading")}
                />
                {t("auth.signingIn")}
              </>
            ) : (
              t("auth.signIn")
            )}
          </Button>

          {loading && (
            <div
              id="loading-status"
              style={{
                position: "absolute",
                width: "1px",
                height: "1px",
                padding: 0,
                margin: "-1px",
                overflow: "hidden",
                clip: "rect(0, 0, 0, 0)",
                whiteSpace: "nowrap",
                border: 0,
              }}
              aria-live="polite"
              role="status"
            >
              {t("auth.signingInPleaseWait")}
            </div>
          )}

          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Link
              component={RouterLink}
              to="/forgot-password"
              variant="body2"
              aria-label={t("auth.forgotPasswordDescription")}
              sx={{
                "&:focus": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: "2px",
                },
              }}
            >
              {t("auth.forgotPassword")}
            </Link>
          </Box>

          {showResendVerification && (
            <Box sx={{ textAlign: "center" }}>
              <Button
                variant="text"
                onClick={handleResendVerification}
                aria-label={t("auth.resendVerificationEmail")}
                sx={{
                  textTransform: "none",
                  minHeight: "44px",
                  "&:focus": {
                    outline: "2px solid",
                    outlineColor: "primary.main",
                    outlineOffset: "2px",
                  },
                }}
              >
                {t("auth.resendVerificationEmail")}
              </Button>
            </Box>
          )}

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography variant="body2" component="p">
              {t("auth.noAccount")}{" "}
              <Link
                component={RouterLink}
                to="/register"
                variant="body2"
                aria-label={t("auth.signUpDescription")}
                sx={{
                  "&:focus": {
                    outline: "2px solid",
                    outlineColor: "primary.main",
                    outlineOffset: "2px",
                  },
                }}
              >
                {t("auth.signUpHere")}
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
