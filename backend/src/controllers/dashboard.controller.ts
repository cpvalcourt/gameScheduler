import { Request, Response } from 'express';
import { GameSeriesModel } from '../models/game-series.model';
import { GameModel, Game } from '../models/game.model';
import { TeamModel } from '../models/team.model';

export const dashboardController = {
  // Get dashboard statistics
  async getStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      // Get user's game series
      const userSeries = await GameSeriesModel.getUserSeries(userId);
      const totalGameSeries = userSeries.length;

      // Get total games in user's series
      let totalGames = 0;
      for (const series of userSeries) {
        const games = await GameModel.getSeriesGames(series.id);
        totalGames += games.length;
      }

      // Get user's teams
      const userTeams = await TeamModel.getUserTeams(userId);
      const totalTeams = userTeams.length;

      // Get upcoming games (simplified for now)
      let upcomingGames = 0;
      for (const series of userSeries) {
        const games = await GameModel.getSeriesGames(series.id);
        const futureGames = games.filter((game: Game) => new Date(game.date) >= new Date());
        upcomingGames += futureGames.length;
      }

      // Mock weekly and monthly stats for now
      const gamesThisWeek = Math.floor(upcomingGames * 0.3);
      const gamesThisMonth = Math.floor(upcomingGames * 0.7);

      res.json({
        totalGameSeries,
        totalGames,
        totalTeams,
        upcomingGames,
        gamesThisWeek,
        gamesThisMonth,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default stats instead of error
      res.json({
        totalGameSeries: 0,
        totalGames: 0,
        totalTeams: 0,
        upcomingGames: 0,
        gamesThisWeek: 0,
        gamesThisMonth: 0,
      });
    }
  },

  // Get recent activity feed
  async getRecentActivity(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      // For now, return mock activity data
      // In a real application, you would have an activity/audit log table
      const mockActivity = [
        {
          id: 1,
          type: 'game_created',
          title: 'New Game Created',
          description: 'Basketball Tournament - Round 1 added to Summer League',
          timestamp: new Date().toISOString(),
          entityId: 1,
        },
        {
          id: 2,
          type: 'series_created',
          title: 'New Series Created',
          description: 'Summer League 2024 created',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          entityId: 2,
        },
        {
          id: 3,
          type: 'team_joined',
          title: 'Team Joined',
          description: 'Thunder Dragons joined Basketball Tournament',
          timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          entityId: 3,
        },
      ];

      res.json(mockActivity);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      res.json([]); // Return empty array instead of error
    }
  },

  // Get upcoming games
  async getUpcomingGames(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      // Get user's series and their upcoming games
      const userSeries = await GameSeriesModel.getUserSeries(userId);
      const upcomingGames: any[] = [];

      for (const series of userSeries) {
        const games = await GameModel.getSeriesGames(series.id);
        const futureGames = games
          .filter((game: Game) => new Date(game.date) >= new Date())
          .sort((a: Game, b: Game) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5);

        for (const game of futureGames) {
          // Get teams for this game
          const gameTeams = await GameModel.getGameTeams(game.id);
          const teamNames = gameTeams.map((team: any) => team.NAME);

          upcomingGames.push({
            id: game.id,
            title: game.name,
            seriesName: series.name,
            date: game.date,
            time: game.time,
            location: game.location,
            teams: teamNames,
          });
        }
      }

      // Sort by date and limit to 5
      upcomingGames.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      res.json(upcomingGames.slice(0, 5));
    } catch (error) {
      console.error('Error fetching upcoming games:', error);
      res.json([]); // Return empty array instead of error
    }
  },
}; 