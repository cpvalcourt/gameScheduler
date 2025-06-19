import React, { useState, useRef, useCallback } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
  Typography,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import { PhotoCamera, Delete, Crop, Save, Cancel } from "@mui/icons-material";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { uploadProfilePicture, deleteProfilePicture } from "../services/api";

interface ProfilePictureUploadProps {
  currentPictureUrl?: string | null;
  onPictureUpdate: (pictureUrl: string | null) => void;
  size?: number;
}

export const ProfilePictureUpload = ({
  currentPictureUrl,
  onPictureUpdate,
  size = 120,
}: ProfilePictureUploadProps) => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [crop, setCrop] = useState<any>({
    unit: "%",
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<any>();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      setSelectedFile(file);
      setError("");
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setIsUploadDialogOpen(false);
      setIsCropDialogOpen(true);
    }
  };

  const onImageLoad = useCallback((e: any) => {
    const { width, height } = e.currentTarget;
    const crop = {
      unit: "%",
      width: 90,
      height: 90,
      x: 5,
      y: 5,
    };
    setCrop(crop);
  }, []);

  const getCroppedImg = useCallback(async (): Promise<Blob> => {
    if (!imgRef.current || !completedCrop) {
      throw new Error("No image or crop data");
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No 2d context");
    }

    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          }
        },
        "image/jpeg",
        0.8
      );
    });
  }, [completedCrop]);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError("");
    setSuccess("");

    try {
      const croppedBlob = await getCroppedImg();
      const croppedFile = new File([croppedBlob], selectedFile.name, {
        type: "image/jpeg",
      });

      const formData = new FormData();
      formData.append("image", croppedFile);

      const response = await uploadProfilePicture(formData);

      if (response.user.profile_picture_url) {
        onPictureUpdate(response.user.profile_picture_url);
        setSuccess("Profile picture uploaded successfully!");
      }

      setIsCropDialogOpen(false);
      setSelectedFile(null);
      setPreviewUrl("");
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    setIsUploading(true);
    setError("");
    setSuccess("");

    try {
      await deleteProfilePicture();
      onPictureUpdate(null);
      setSuccess("Profile picture deleted successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to delete profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setIsCropDialogOpen(false);
    setSelectedFile(null);
    setError("");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const getImageUrl = (url: string) => {
    if (url.startsWith("http")) {
      return url;
    }
    return `${import.meta.env.VITE_API_URL || "http://localhost:3002"}${url}`;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      {/* Current Profile Picture */}
      <Box sx={{ position: "relative" }}>
        <Avatar
          src={currentPictureUrl ? getImageUrl(currentPictureUrl) : undefined}
          sx={{
            width: size,
            height: size,
            fontSize: size * 0.4,
            border: "3px solid #e0e0e0",
          }}
        >
          {!currentPictureUrl && "U"}
        </Avatar>

        {/* Upload Button Overlay */}
        <IconButton
          sx={{
            position: "absolute",
            bottom: 0,
            right: 0,
            backgroundColor: "primary.main",
            color: "white",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
            width: 32,
            height: 32,
          }}
          onClick={() => setIsUploadDialogOpen(true)}
        >
          <PhotoCamera sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<PhotoCamera />}
          onClick={() => setIsUploadDialogOpen(true)}
        >
          Upload
        </Button>
        {currentPictureUrl && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<Delete />}
            onClick={handleDelete}
            disabled={isUploading}
          >
            Remove
          </Button>
        )}
      </Box>

      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ width: "100%" }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      )}

      {/* File Upload Dialog */}
      <Dialog
        open={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
      >
        <DialogTitle>Upload Profile Picture</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select an image file (JPG, PNG, GIF). Maximum size: 5MB
          </Typography>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
          <Button
            variant="contained"
            component="label"
            fullWidth
            onClick={() => fileInputRef.current?.click()}
          >
            Choose File
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Image Crop Dialog */}
      <Dialog
        open={isCropDialogOpen}
        onClose={handleCancel}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Crop />
            Crop Profile Picture
          </Box>
        </DialogTitle>
        <DialogContent>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Drag to adjust the crop area. The image will be cropped to a
              square.
            </Typography>
            {previewUrl && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imgRef}
                  alt="Crop preview"
                  src={previewUrl}
                  onLoad={onImageLoad}
                  style={{ maxWidth: "100%", maxHeight: "400px" }}
                />
              </ReactCrop>
            )}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            startIcon={isUploading ? <CircularProgress size={16} /> : <Save />}
            disabled={isUploading || !completedCrop}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
