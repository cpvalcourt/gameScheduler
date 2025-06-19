import React, { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  SportsEsports as GamesIcon,
} from "@mui/icons-material";
import api from "../api/axios";

interface GameSeries {
  id: number;
  name: string;
  description: string;
  type: "tournament" | "league" | "casual";
  start_date: string;
  end_date: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

const GameSeriesPage = () => {
  const [series, setSeries] = useState<GameSeries[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingSeries, setEditingSeries] = useState<GameSeries | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    type: "tournament" | "league" | "casual";
    start_date: string;
    end_date: string;
  }>({
    name: "",
    description: "",
    type: "" as "tournament" | "league" | "casual",
    start_date: "",
    end_date: "",
  });

  const navigate = useNavigate();

  const fetchSeries = async () => {
    try {
      const response = await api.get("/game-series");
      setSeries(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch game series");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeries();
  }, []);

  const handleOpenDialog = (series?: GameSeries) => {
    if (series) {
      setEditingSeries(series);
      setFormData({
        name: series.name,
        description: series.description,
        type: series.type,
        start_date: series.start_date.split("T")[0],
        end_date: series.end_date.split("T")[0],
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
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: typeof formData) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (
        !formData.type ||
        !["tournament", "league", "casual"].includes(formData.type)
      ) {
        setError("Please select a valid type (tournament, league, or casual)");
        return;
      }

      if (editingSeries) {
        await api.put(`/game-series/${editingSeries.id}`, formData);
      } else {
        await api.post("/game-series", formData);
      }
      handleCloseDialog();
      fetchSeries();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save game series");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this game series?")) {
      try {
        await api.delete(`/game-series/${id}`);
        fetchSeries();
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to delete game series");
      }
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container>
      <Box
        sx={{
          mt: 4,
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1">
          Game Series
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Series
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {series.map((s: GameSeries) => (
              <TableRow key={s.id}>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.description}</TableCell>
                <TableCell>{s.type}</TableCell>
                <TableCell>
                  {new Date(s.start_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(s.end_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenDialog(s)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(s.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => navigate(`/game-series/${s.id}/games`)}
                    color="primary"
                  >
                    <GamesIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingSeries ? "Edit Game Series" : "Add Game Series"}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Name"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            fullWidth
            value={formData.description}
            onChange={handleInputChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              label="Type"
              required
            >
              <MenuItem value="tournament">Tournament</MenuItem>
              <MenuItem value="league">League</MenuItem>
              <MenuItem value="casual">Casual</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="start_date"
            label="Start Date"
            type="date"
            fullWidth
            value={formData.start_date}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            margin="dense"
            name="end_date"
            label="End Date"
            type="date"
            fullWidth
            value={formData.end_date}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingSeries ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GameSeriesPage;
