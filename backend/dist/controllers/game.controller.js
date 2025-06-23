"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
const game_model_1 = require("../models/game.model");
const team_model_1 = require("../models/team.model");
const game_series_model_1 = require("../models/game-series.model");
class GameController {
    static async createGame(req, res) {
        try {
            const { seriesId } = req.params;
            const { name, description, sport_type, date, time, location, min_players, max_players, status } = req.body;
            const user = req.user;
            if (!user) {
                return res.status(401).json({ message: "User not authenticated" });
            }
            // Verify the series exists and user has access
            const series = await game_series_model_1.GameSeriesModel.findById(parseInt(seriesId));
            if (!series) {
                return res.status(404).json({ message: 'Game series not found' });
            }
            if (series.created_by !== user.id) {
                return res.status(403).json({ message: 'Not authorized to add games to this series' });
            }
            const game = await game_model_1.GameModel.create({
                series_id: parseInt(seriesId),
                name,
                description,
                sport_type,
                date: new Date(date).toISOString().split('T')[0],
                time,
                location,
                min_players,
                max_players,
                status,
                created_by: user.id
            });
            res.status(201).json(game);
        }
        catch (error) {
            console.error("Error creating game:", error);
            res.status(500).json({ message: "Error creating game" });
        }
    }
    static async getGame(req, res) {
        try {
            const { id } = req.params;
            const gameId = parseInt(id);
            const user = req.user;
            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            const game = await game_model_1.GameModel.findById(gameId);
            if (!game) {
                return res.status(404).json({ message: 'Game not found' });
            }
            // Verify user has access to the series
            const series = await game_series_model_1.GameSeriesModel.findById(game.series_id);
            if (!series || series.created_by !== user.id) {
                return res.status(403).json({ message: 'Not authorized to view this game' });
            }
            res.json(game);
        }
        catch (error) {
            console.error('Error getting game:', error);
            res.status(500).json({ message: 'Error getting game' });
        }
    }
    static async updateGame(req, res) {
        try {
            const { seriesId, id } = req.params;
            const { name, description, sport_type, date, time, location, min_players, max_players, status } = req.body;
            const user = req.user;
            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            // Verify the series exists and user has access
            const series = await game_series_model_1.GameSeriesModel.findById(parseInt(seriesId));
            if (!series) {
                return res.status(404).json({ message: 'Game series not found' });
            }
            if (series.created_by !== user.id) {
                return res.status(403).json({ message: 'Not authorized to update games in this series' });
            }
            const game = await game_model_1.GameModel.findById(parseInt(id));
            if (!game) {
                return res.status(404).json({ message: 'Game not found' });
            }
            // Verify the game belongs to the specified series
            if (game.series_id !== parseInt(seriesId)) {
                return res.status(400).json({ message: 'Game does not belong to the specified series' });
            }
            const updates = {};
            if (name !== undefined)
                updates.name = name;
            if (description !== undefined)
                updates.description = description;
            if (sport_type !== undefined)
                updates.sport_type = sport_type;
            if (date !== undefined)
                updates.date = new Date(date).toISOString().split('T')[0];
            if (time !== undefined)
                updates.time = time;
            if (location !== undefined)
                updates.location = location;
            if (min_players !== undefined)
                updates.min_players = min_players;
            if (max_players !== undefined)
                updates.max_players = max_players;
            if (status !== undefined)
                updates.status = status;
            const updatedGame = await game_model_1.GameModel.update(parseInt(id), updates);
            res.json({
                message: 'Game updated successfully',
                game: updatedGame
            });
        }
        catch (error) {
            console.error('Error updating game:', error);
            res.status(500).json({ message: 'Error updating game' });
        }
    }
    static async deleteGame(req, res) {
        try {
            const { id } = req.params;
            const gameId = parseInt(id);
            const user = req.user;
            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            const game = await game_model_1.GameModel.findById(gameId);
            if (!game) {
                return res.status(404).json({ message: 'Game not found' });
            }
            // Verify user has access to the series
            const series = await game_series_model_1.GameSeriesModel.findById(game.series_id);
            if (!series || series.created_by !== user.id) {
                return res.status(403).json({ message: 'Not authorized to delete this game' });
            }
            const success = await game_model_1.GameModel.delete(gameId);
            if (!success) {
                return res.status(500).json({ message: 'Failed to delete game' });
            }
            res.json({ message: 'Game deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting game:', error);
            res.status(500).json({ message: 'Error deleting game' });
        }
    }
    static async addTeamToGame(req, res) {
        try {
            const { id } = req.params;
            const gameId = parseInt(id);
            const { team_id } = req.body;
            const user = req.user;
            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            const game = await game_model_1.GameModel.findById(gameId);
            if (!game) {
                return res.status(404).json({ message: 'Game not found' });
            }
            // Verify user has access to the series
            const series = await game_series_model_1.GameSeriesModel.findById(game.series_id);
            if (!series || series.created_by !== user.id) {
                return res.status(403).json({ message: 'Not authorized to modify this game' });
            }
            const team = await team_model_1.TeamModel.findById(team_id);
            if (!team) {
                return res.status(404).json({ message: 'Team not found' });
            }
            const gameTeam = await game_model_1.GameModel.addTeam(gameId, team_id);
            res.json({
                message: 'Team added to game successfully',
                gameTeam
            });
        }
        catch (error) {
            console.error('Error adding team to game:', error);
            res.status(500).json({ message: 'Error adding team to game' });
        }
    }
    static async removeTeamFromGame(req, res) {
        try {
            const { id, teamId } = req.params;
            const gameId = parseInt(id);
            const team_id = parseInt(teamId);
            const user = req.user;
            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            const game = await game_model_1.GameModel.findById(gameId);
            if (!game) {
                return res.status(404).json({ message: 'Game not found' });
            }
            // Verify user has access to the series
            const series = await game_series_model_1.GameSeriesModel.findById(game.series_id);
            if (!series || series.created_by !== user.id) {
                return res.status(403).json({ message: 'Not authorized to modify this game' });
            }
            const success = await game_model_1.GameModel.removeTeam(gameId, team_id);
            if (!success) {
                return res.status(404).json({ message: 'Team not found in game' });
            }
            res.json({ message: 'Team removed from game successfully' });
        }
        catch (error) {
            console.error('Error removing team from game:', error);
            res.status(500).json({ message: 'Error removing team from game' });
        }
    }
    static async updateAttendance(req, res) {
        try {
            const { id } = req.params;
            const gameId = parseInt(id);
            const { status, notes } = req.body;
            const user = req.user;
            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            const game = await game_model_1.GameModel.findById(gameId);
            if (!game) {
                return res.status(404).json({ message: 'Game not found' });
            }
            const attendance = await game_model_1.GameModel.updateAttendance(gameId, user.id, status, notes);
            res.json({
                message: 'Attendance updated successfully',
                attendance
            });
        }
        catch (error) {
            console.error('Error updating attendance:', error);
            res.status(500).json({ message: 'Error updating attendance' });
        }
    }
    static async getUserGames(req, res) {
        try {
            const user = req.user;
            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            const games = await game_model_1.GameModel.getUserGames(user.id);
            res.json(games);
        }
        catch (error) {
            console.error('Error getting user games:', error);
            res.status(500).json({ message: 'Error getting user games' });
        }
    }
    static async getSeriesGames(req, res) {
        try {
            const { seriesId } = req.params;
            const user = req.user;
            if (!user?.id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            // Verify the series exists and user has access
            const series = await game_series_model_1.GameSeriesModel.findById(parseInt(seriesId));
            if (!series) {
                return res.status(404).json({ message: 'Game series not found' });
            }
            if (series.created_by !== user.id) {
                return res.status(403).json({ message: 'Not authorized to view games in this series' });
            }
            const games = await game_model_1.GameModel.getSeriesGames(parseInt(seriesId));
            res.json(games);
        }
        catch (error) {
            console.error('Error getting series games:', error);
            res.status(500).json({ message: 'Error getting series games' });
        }
    }
    static async bulkCreateGames(req, res) {
        try {
            const { seriesId } = req.params;
            const { games } = req.body;
            const user = req.user;
            if (!user) {
                return res.status(401).json({ message: "User not authenticated" });
            }
            // Verify the series exists and user has access
            const series = await game_series_model_1.GameSeriesModel.findById(parseInt(seriesId));
            if (!series) {
                return res.status(404).json({ message: 'Game series not found' });
            }
            if (series.created_by !== user.id) {
                return res.status(403).json({ message: 'Not authorized to add games to this series' });
            }
            // Validate all games before creating them
            const validatedGames = games.map((game) => {
                if (!game.name || !game.sport_type || !game.date || !game.time || !game.location ||
                    !game.min_players || !game.max_players || !game.status) {
                    throw new Error('Missing required fields in game data');
                }
                return {
                    series_id: parseInt(seriesId),
                    name: game.name,
                    description: game.description || '',
                    sport_type: game.sport_type,
                    date: new Date(game.date).toISOString().split('T')[0],
                    time: game.time,
                    location: game.location,
                    min_players: game.min_players,
                    max_players: game.max_players,
                    status: game.status,
                    created_by: user.id
                };
            });
            // Create all games in a transaction
            const createdGames = await Promise.all(validatedGames.map((game) => game_model_1.GameModel.create(game)));
            res.status(201).json({
                message: 'Games created successfully',
                games: createdGames
            });
        }
        catch (error) {
            console.error("Error creating games:", error);
            res.status(500).json({ message: "Error creating games" });
        }
    }
    static async searchGames(req, res) {
        try {
            const { seriesId, status, sportType, startDate, endDate, location, minPlayers, maxPlayers } = req.query;
            const user = req.user;
            if (!user) {
                return res.status(401).json({ message: "User not authenticated" });
            }
            const games = await game_model_1.GameModel.search({
                seriesId: seriesId ? parseInt(seriesId) : undefined,
                status: status,
                sportType: sportType,
                startDate: startDate,
                endDate: endDate,
                location: location,
                minPlayers: minPlayers ? parseInt(minPlayers) : undefined,
                maxPlayers: maxPlayers ? parseInt(maxPlayers) : undefined
            });
            res.json(games);
        }
        catch (error) {
            console.error("Error searching games:", error);
            res.status(500).json({ message: "Error searching games" });
        }
    }
    static async getGameStats(req, res) {
        try {
            const { id } = req.params;
            const gameId = parseInt(id);
            const user = req.user;
            if (!user) {
                return res.status(401).json({ message: "User not authenticated" });
            }
            const game = await game_model_1.GameModel.findById(gameId);
            if (!game) {
                return res.status(404).json({ message: 'Game not found' });
            }
            // Get attendance stats
            const attendance = await game_model_1.GameModel.getGameAttendance(gameId);
            const attendanceStats = {
                total: attendance.length,
                attending: attendance.filter(a => a.status === 'attending').length,
                declined: attendance.filter(a => a.status === 'declined').length,
                maybe: attendance.filter(a => a.status === 'maybe').length
            };
            // Get team stats
            const teams = await game_model_1.GameModel.getGameTeams(gameId);
            const teamStats = {
                totalTeams: teams.length
            };
            res.json({
                game,
                attendance: attendanceStats,
                teams: teamStats
            });
        }
        catch (error) {
            console.error("Error getting game stats:", error);
            res.status(500).json({ message: "Error getting game stats" });
        }
    }
}
exports.GameController = GameController;
