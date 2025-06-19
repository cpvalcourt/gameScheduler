import React, { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import type { SelectChangeEvent } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import api from "../api/axios";
import GameManagement from "../components/GameManagement";
import type { GameSeries } from "../types/gameSeries";
import { SPORT_TYPES } from "../constants/sport-types";
import type { SportType } from "../constants/sport-types";

interface Game {
  id: number;
  series_id: number;
  name: string;
  description: string;
  sport_type: SportType;
  date: string;
  time: string;
  location: string;
  min_players: number;
  max_players: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

const GamesPage = () => {
  const { seriesId } = useParams<{ seriesId: string }>();
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [series, setSeries] = useState<GameSeries | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sport_type: "" as SportType,
    date: "",
    time: "",
    location: "",
    min_players: 0,
    max_players: 0,
    status: "scheduled" as const,
  });

  const fetchSeries = async () => {
    try {
      const response = await api.get(`/game-series/${seriesId}`);
      setSeries(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch series");
    }
  };

  const fetchGames = async () => {
    try {
      const response = await api.get(`/game-series/${seriesId}/games`);
      setGames(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch games");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeries();
    fetchGames();
  }, [seriesId]);

  const handleOpenDialog = (game?: Game) => {
    if (game) {
      setEditingGame(game);
      setFormData({
        name: game.name,
        description: game.description,
        sport_type: game.sport_type,
        date: game.date.split("T")[0],
        time: game.time,
        location: game.location,
        min_players: game.min_players,
        max_players: game.max_players,
        status: game.status,
      });
    } else {
      setEditingGame(null);
      setFormData({
        name: "",
        description: "",
        sport_type: "Basketball",
        date: "",
        time: "",
        location: "",
        min_players: 0,
        max_players: 0,
        status: "scheduled",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGame(null);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement> | SelectChangeEvent
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as keyof typeof formData]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        sport_type:
          formData.sport_type.charAt(0).toUpperCase() +
          formData.sport_type.slice(1).toLowerCase(),
      };

      if (editingGame) {
        await api.put(
          `/game-series/${seriesId}/games/${editingGame.id}`,
          submitData
        );
      } else {
        await api.post(`/game-series/${seriesId}/games`, submitData);
      }

      setOpenDialog(false);
      fetchGames();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (window.confirm("Are you sure you want to delete this game?")) {
      try {
        await api.delete(`/game-series/${seriesId}/games/${id}`);
        fetchGames();
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to delete game");
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => navigate("/game-series")} color="primary">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Games</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          {series && (
            <GameManagement series={series} onGamesCreated={fetchGames} />
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Game
          </Button>
        </Box>
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
              <TableCell>Sport</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Min Players</TableCell>
              <TableCell>Max Players</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {games.map((game) => (
              <TableRow key={game.id}>
                <TableCell>{game.name}</TableCell>
                <TableCell>{game.sport_type}</TableCell>
                <TableCell>{game.description}</TableCell>
                <TableCell>
                  {new Date(game.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{game.time}</TableCell>
                <TableCell>{game.location}</TableCell>
                <TableCell>{game.min_players}</TableCell>
                <TableCell>{game.max_players}</TableCell>
                <TableCell>{game.status}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenDialog(game)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(game.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingGame ? "Edit Game" : "Add Game"}</DialogTitle>
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
          <FormControl fullWidth>
            <InputLabel>Sport Type</InputLabel>
            <Select
              name="sport_type"
              value={formData.sport_type}
              onChange={handleInputChange}
              label="Sport Type"
            >
              {SPORT_TYPES.map((sport) => (
                <MenuItem key={sport} value={sport}>
                  {sport}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="description"
            label="Description"
            fullWidth
            value={formData.description}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="date"
            label="Date"
            type="date"
            fullWidth
            value={formData.date}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            margin="dense"
            name="time"
            label="Time"
            type="time"
            fullWidth
            value={formData.time}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            margin="dense"
            name="location"
            label="Location"
            fullWidth
            value={formData.location}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="min_players"
            label="Min Players"
            type="number"
            fullWidth
            value={formData.min_players}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="max_players"
            label="Max Players"
            type="number"
            fullWidth
            value={formData.max_players}
            onChange={handleInputChange}
            required
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              label="Status"
              required
            >
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingGame ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GamesPage;
