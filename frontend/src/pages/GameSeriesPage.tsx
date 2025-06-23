import React, { useState, useEffect, useRef } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SportsEsports as GamesIcon,
  CalendarToday as CalendarTodayIcon,
} from "@mui/icons-material";
import { useI18n } from "../contexts/I18nContext";
import api from "../services/api";
import NavigationHeader from "../components/NavigationHeader";

interface GameSeries {
  id: number;
  name: string;
  description: string;
  type: "tournament" | "league" | "casual";
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

interface GameSeriesFormData {
  name: string;
  description: string;
  type: "tournament" | "league" | "casual";
  start_date: string;
  end_date: string;
}

const GameSeriesPage = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [series, setSeries] = useState<GameSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSeries, setEditingSeries] = useState<GameSeries | null>(null);
  const [formData, setFormData] = useState<GameSeriesFormData>({
    name: "",
    description: "",
    type: "" as "tournament" | "league" | "casual",
    start_date: "",
    end_date: "",
  });

  // Refs for input fields
  const startDateInputRef = useRef<HTMLInputElement>(null);
  const endDateInputRef = useRef<HTMLInputElement>(null);
  const dialogTitleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    fetchSeries();
  }, []);

  // Focus management for dialog
  useEffect(() => {
    if (openDialog && dialogTitleRef.current) {
      dialogTitleRef.current.focus();
    }
  }, [openDialog]);

  const fetchSeries = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/game-series");
      setSeries(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || t("gameSeries.failedToFetch"));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (series?: GameSeries) => {
    if (series) {
      setEditingSeries(series);
      setFormData({
        name: series.name,
        description: series.description,
        start_date: series.start_date.split("T")[0],
        end_date: series.end_date.split("T")[0],
        type: series.type,
      });
    } else {
      setEditingSeries(null);
      setFormData({
        name: "",
        description: "",
        type: "" as "tournament" | "league" | "casual",
        start_date: "",
        end_date: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSeries(null);
    setFormData({
      name: "",
      description: "",
      type: "" as "tournament" | "league" | "casual",
      start_date: "",
      end_date: "",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: typeof formData) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!["tournament", "league", "casual"].includes(formData.type)) {
      setError(t("gameSeries.invalidType"));
      return;
    }

    try {
      setError(null);
      if (editingSeries) {
        await api.put(`/game-series/${editingSeries.id}`, formData);
      } else {
        await api.post("/game-series", formData);
      }
      fetchSeries();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || t("gameSeries.failedToSave"));
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t("gameSeries.deleteConfirmation"))) {
      try {
        await api.delete(`/game-series/${id}`);
        fetchSeries();
      } catch (err: any) {
        setError(err.response?.data?.message || t("gameSeries.failedToDelete"));
      }
    }
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 4 }}>
        <CircularProgress aria-label={t("common.loading")} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <NavigationHeader title={t("gameSeries.title")}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon aria-hidden="true" />}
          onClick={() => handleOpenDialog()}
          aria-label={`${t("gameSeries.addSeries")} - Create new game series`}
          sx={{
            minHeight: "48px",
            "&:focus": {
              outline: "2px solid",
              outlineColor: "primary.main",
              outlineOffset: "2px",
            },
          }}
        >
          {t("gameSeries.addSeries")}
        </Button>
      </NavigationHeader>

      {/* Skip to main content link for screen readers */}
      <a
        href="#game-series-content"
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

      <Box
        id="game-series-content"
        role="main"
        aria-labelledby="game-series-title"
      >
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            role="alert"
            aria-live="assertive"
          >
            {error}
          </Alert>
        )}

        <TableContainer
          component={Paper}
          role="region"
          aria-labelledby="game-series-table-title"
        >
          <Table aria-label={t("gameSeries.tableDescription")}>
            <TableHead>
              <TableRow>
                <TableCell scope="col" id="name-header">
                  {t("gameSeries.name")}
                </TableCell>
                <TableCell scope="col" id="type-header">
                  {t("gameSeries.type")}
                </TableCell>
                <TableCell scope="col" id="start-date-header">
                  {t("gameSeries.startDate")}
                </TableCell>
                <TableCell scope="col" id="end-date-header">
                  {t("gameSeries.endDate")}
                </TableCell>
                <TableCell scope="col" id="actions-header">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {series.map((s) => (
                <TableRow key={s.id}>
                  <TableCell headers="name-header">{s.name}</TableCell>
                  <TableCell headers="type-header">{s.type}</TableCell>
                  <TableCell headers="start-date-header">
                    {new Date(s.start_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell headers="end-date-header">
                    {new Date(s.end_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell headers="actions-header">
                    <IconButton
                      onClick={() => handleOpenDialog(s)}
                      color="primary"
                      size="small"
                      aria-label={`${t("gameSeries.editGameSeries")} - ${
                        s.name
                      }`}
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
                      <EditIcon aria-hidden="true" />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(s.id)}
                      color="error"
                      size="small"
                      aria-label={`${t("gameSeries.deleteGameSeries")} - ${
                        s.name
                      }`}
                      sx={{
                        minWidth: "44px",
                        minHeight: "44px",
                        "&:focus": {
                          outline: "2px solid",
                          outlineColor: "error.main",
                          outlineOffset: "2px",
                        },
                      }}
                    >
                      <DeleteIcon aria-hidden="true" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          aria-labelledby="dialog-title"
          aria-describedby="dialog-description"
        >
          <DialogTitle
            id="dialog-title"
            ref={dialogTitleRef}
            tabIndex={-1}
            sx={{
              "&:focus": {
                outline: "2px solid",
                outlineColor: "primary.main",
                outlineOffset: "2px",
              },
            }}
          >
            {editingSeries
              ? t("gameSeries.editGameSeries")
              : t("gameSeries.addGameSeries")}
          </DialogTitle>
          <DialogContent id="dialog-description">
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label={t("gameSeries.name")}
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleInputChange}
              aria-required="true"
              aria-describedby="name-error"
              sx={{
                "&:focus-within": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: "2px",
                },
              }}
            />
            <TextField
              margin="dense"
              name="description"
              label={t("gameSeries.description")}
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              aria-describedby="description-help"
              sx={{
                "&:focus-within": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: "2px",
                },
              }}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel id="type-label">{t("gameSeries.type")}</InputLabel>
              <Select
                name="type"
                value={formData.type}
                label={t("gameSeries.type")}
                labelId="type-label"
                onChange={handleInputChange}
                aria-required="true"
                aria-describedby="type-error"
                sx={{
                  "&:focus-within": {
                    outline: "2px solid",
                    outlineColor: "primary.main",
                    outlineOffset: "2px",
                  },
                }}
              >
                <MenuItem value="tournament">
                  {t("gameSeries.tournament")}
                </MenuItem>
                <MenuItem value="league">{t("gameSeries.league")}</MenuItem>
                <MenuItem value="casual">{t("gameSeries.casual")}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              name="start_date"
              label={t("gameSeries.startDate")}
              type="date"
              fullWidth
              variant="outlined"
              value={formData.start_date}
              onChange={handleInputChange}
              inputRef={startDateInputRef}
              InputLabelProps={{
                shrink: true,
              }}
              aria-required="true"
              aria-describedby="start-date-error"
              sx={{
                "& .MuiInputBase-root": {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                },
                "& .MuiInputBase-root:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                },
                "&:focus-within": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: "2px",
                },
              }}
            />
            <TextField
              margin="dense"
              name="end_date"
              label={t("gameSeries.endDate")}
              type="date"
              fullWidth
              variant="outlined"
              value={formData.end_date}
              onChange={handleInputChange}
              inputRef={endDateInputRef}
              InputLabelProps={{
                shrink: true,
              }}
              aria-required="true"
              aria-describedby="end-date-error"
              sx={{
                "& .MuiInputBase-root": {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                },
                "& .MuiInputBase-root:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                },
                "&:focus-within": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: "2px",
                },
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseDialog}
              aria-label={t("common.cancel")}
              sx={{
                minHeight: "44px",
                "&:focus": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: "2px",
                },
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              aria-label={
                editingSeries ? t("gameSeries.update") : t("gameSeries.create")
              }
              sx={{
                minHeight: "44px",
                "&:focus": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: "2px",
                },
              }}
            >
              {editingSeries ? t("gameSeries.update") : t("gameSeries.create")}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default GameSeriesPage;
