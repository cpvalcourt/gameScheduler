import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Typography, Box, Alert, Button } from "@mui/material";
import api from "../api/axios";

const VerifyEmailPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await api.get(`/auth/verify-email/${token}`);
        setStatus("success");
        setMessage("Email verified successfully! You can now log in.");
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Failed to verify email. Please try again."
        );
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Email Verification
        </Typography>

        {status === "verifying" && (
          <Typography>Verifying your email...</Typography>
        )}

        {status === "success" && (
          <>
            <Alert severity="success" sx={{ width: "100%", mb: 2 }}>
              {message}
            </Alert>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {message}
            </Alert>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
};

export default VerifyEmailPage;
