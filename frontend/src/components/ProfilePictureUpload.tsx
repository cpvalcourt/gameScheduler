import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Slider,
  Grid,
} from "@mui/material";
import {
  PhotoCamera as PhotoCameraIcon,
  Crop as CropIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RotateLeft as RotateLeftIcon,
  RotateRight as RotateRightIcon,
} from "@mui/icons-material";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useI18n } from "../contexts/I18nContext";
import api from "../services/api";

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  onImageUpdate: (imageUrl: string) => void;
  size?: number;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentImageUrl,
  onImageUpdate,
  size = 120,
}) => {
  const { t } = useI18n();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  });
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(t("profile.imageTooLarge"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
        setIsCropDialogOpen(true);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (crop: Crop) => {
    setCrop(crop);
  };

  const handleZoomChange = (_event: Event, newValue: number | number[]) => {
    setZoom(newValue as number);
  };

  const handleRotationChange = (direction: "left" | "right") => {
    setRotation((prev) => prev + (direction === "left" ? -90 : 90));
  };

  const getCroppedImg = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!imageRef.current || !selectedImage) {
        reject(new Error(t("profile.noImageSelected")));
        return;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error(t("profile.canvasError")));
        return;
      }

      const image = imageRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = crop.width * scaleX;
      canvas.height = crop.height * scaleY;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY
      );

      ctx.restore();

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            reject(new Error(t("profile.blobError")));
          }
        },
        "image/jpeg",
        0.9
      );
    });
  };

  const handleSave = async () => {
    try {
      setIsUploading(true);
      setError(null);

      const croppedImageUrl = await getCroppedImg();
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("image", blob, "profile-picture.jpg");

      const apiResponse = await api.post("/users/profile-picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      onImageUpdate(apiResponse.data.user.profile_picture_url);
      setIsCropDialogOpen(false);
      setSelectedImage(null);
      setCrop({ unit: "%", width: 100, height: 100, x: 0, y: 0 });
      setZoom(1);
      setRotation(0);

      // Clean up the blob URL
      URL.revokeObjectURL(croppedImageUrl);
    } catch (err: any) {
      setError(err.response?.data?.message || t("profile.uploadFailed"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setIsCropDialogOpen(false);
    setSelectedImage(null);
    setCrop({ unit: "%", width: 100, height: 100, x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setError(null);
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box sx={{ textAlign: "center" }}>
      <Box sx={{ position: "relative", display: "inline-block" }}>
        <Avatar
          src={currentImageUrl}
          sx={{
            width: size,
            height: size,
            fontSize: size * 0.4,
            border: "3px solid #fff",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        />
        <IconButton
          onClick={handleCameraClick}
          sx={{
            position: "absolute",
            bottom: 0,
            right: 0,
            backgroundColor: "primary.main",
            color: "white",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
          }}
        >
          <PhotoCameraIcon />
        </IconButton>
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {t("profile.clickToUpload")}
      </Typography>

      <Dialog
        open={isCropDialogOpen}
        onClose={handleCancel}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t("profile.cropImage")}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ textAlign: "center", mb: 2 }}>
            <ReactCrop
              crop={crop}
              onChange={handleCropComplete}
              aspect={1}
              circularCrop
            >
              <img
                ref={imageRef}
                src={selectedImage || ""}
                alt={t("profile.cropPreview")}
                style={{
                  maxWidth: "100%",
                  maxHeight: "400px",
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                }}
              />
            </ReactCrop>
          </Box>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <Typography gutterBottom>{t("profile.zoom")}</Typography>
              <Slider
                value={zoom}
                onChange={handleZoomChange}
                min={0.5}
                max={3}
                step={0.1}
                marks={[
                  { value: 0.5, label: "0.5x" },
                  { value: 1, label: "1x" },
                  { value: 2, label: "2x" },
                  { value: 3, label: "3x" },
                ]}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography gutterBottom>{t("profile.rotation")}</Typography>
              <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                <IconButton
                  onClick={() => handleRotationChange("left")}
                  color="primary"
                >
                  <RotateLeftIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleRotationChange("right")}
                  color="primary"
                >
                  <RotateRightIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} startIcon={<CancelIcon />}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={
              isUploading ? <CircularProgress size={20} /> : <SaveIcon />
            }
            disabled={isUploading}
          >
            {isUploading ? t("profile.uploading") : t("profile.save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePictureUpload;
