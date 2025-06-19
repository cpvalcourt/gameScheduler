const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function createSampleData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "game_scheduler",
  });

  try {
    console.log("🎮 Creating sample data for Game Scheduler...\n");

    // Get the test user ID
    const [userRows] = await connection.execute(
      "SELECT ID FROM USERS WHERE EMAIL = ?",
      ["cpvalcourt@gmail.com"]
    );

    if (userRows.length === 0) {
      console.log(
        "❌ Test user not found. Please make sure you have a user with email: cpvalcourt@gmail.com"
      );
      return;
    }

    const userId = userRows[0].ID;
    console.log(`✅ Using user ID: ${userId}`);

    // Create sample teams
    console.log("\n🏀 Creating sample teams...");
    const teams = [
      {
        name: "Thunder Dragons",
        description: "Basketball team with lightning speed",
      },
      { name: "Lightning Bolts", description: "Fast-paced basketball team" },
      {
        name: "Red Lions",
        description: "Soccer team with fierce determination",
      },
      { name: "Blue Eagles", description: "Soccer team with aerial dominance" },
      { name: "Team Alpha", description: "Tennis doubles team" },
      { name: "Team Beta", description: "Tennis doubles team" },
      { name: "Golden Bears", description: "Baseball team with power hitting" },
      {
        name: "Silver Sharks",
        description: "Baseball team with precision pitching",
      },
    ];

    const teamIds = [];
    for (const team of teams) {
      const [result] = await connection.execute(
        "INSERT INTO TEAMS (NAME, DESCRIPTION, CREATED_BY) VALUES (?, ?, ?)",
        [team.name, team.description, userId]
      );
      teamIds.push(result.insertId);
      console.log(`  ✅ Created team: ${team.name}`);
    }

    // Create sample game series
    console.log("\n🏆 Creating sample game series...");
    const series = [
      {
        name: "Summer League 2024",
        description: "Annual summer basketball tournament",
        type: "tournament",
        start_date: "2024-06-01",
        end_date: "2024-08-31",
      },
      {
        name: "City Cup 2024",
        description: "City-wide soccer championship",
        type: "tournament",
        start_date: "2024-05-01",
        end_date: "2024-07-31",
      },
      {
        name: "Spring Tennis Tournament",
        description: "Spring tennis doubles competition",
        type: "tournament",
        start_date: "2024-03-01",
        end_date: "2024-05-31",
      },
      {
        name: "Baseball League 2024",
        description: "Regular baseball league",
        type: "league",
        start_date: "2024-04-01",
        end_date: "2024-09-30",
      },
    ];

    const seriesIds = [];
    for (const seriesData of series) {
      const [result] = await connection.execute(
        "INSERT INTO GAME_SERIES (NAME, DESCRIPTION, TYPE, START_DATE, END_DATE, CREATED_BY) VALUES (?, ?, ?, ?, ?, ?)",
        [
          seriesData.name,
          seriesData.description,
          seriesData.type,
          seriesData.start_date,
          seriesData.end_date,
          userId,
        ]
      );
      seriesIds.push(result.insertId);
      console.log(`  ✅ Created series: ${seriesData.name}`);
    }

    // Create sample games
    console.log("\n🎯 Creating sample games...");
    const games = [
      // Summer League games
      {
        series_id: seriesIds[0],
        name: "Basketball Tournament - Round 1",
        description: "First round of the summer basketball tournament",
        sport_type: "Basketball",
        date: "2024-06-15",
        time: "19:00:00",
        location: "Community Center",
        min_players: 8,
        max_players: 12,
        status: "scheduled",
      },
      {
        series_id: seriesIds[0],
        name: "Basketball Tournament - Round 2",
        description: "Second round of the summer basketball tournament",
        sport_type: "Basketball",
        date: "2024-06-22",
        time: "20:00:00",
        location: "Community Center",
        min_players: 8,
        max_players: 12,
        status: "scheduled",
      },
      {
        series_id: seriesIds[0],
        name: "Basketball Tournament - Final",
        description: "Championship game of the summer basketball tournament",
        sport_type: "Basketball",
        date: "2024-06-29",
        time: "19:30:00",
        location: "Community Center",
        min_players: 8,
        max_players: 12,
        status: "scheduled",
      },
      // City Cup games
      {
        series_id: seriesIds[1],
        name: "Soccer Championship - Semi Final",
        description: "Semi-final match of the city cup",
        sport_type: "Soccer",
        date: "2024-06-20",
        time: "20:00:00",
        location: "Sports Complex",
        min_players: 10,
        max_players: 22,
        status: "scheduled",
      },
      {
        series_id: seriesIds[1],
        name: "Soccer Championship - Final",
        description: "Championship match of the city cup",
        sport_type: "Soccer",
        date: "2024-07-05",
        time: "21:00:00",
        location: "Sports Complex",
        min_players: 10,
        max_players: 22,
        status: "scheduled",
      },
      // Tennis games
      {
        series_id: seriesIds[2],
        name: "Tennis Doubles - Final",
        description: "Final match of the spring tennis tournament",
        sport_type: "Tennis",
        date: "2024-05-25",
        time: "18:30:00",
        location: "Tennis Club",
        min_players: 4,
        max_players: 4,
        status: "scheduled",
      },
      // Baseball games
      {
        series_id: seriesIds[3],
        name: "Baseball Season Opener",
        description: "Opening game of the baseball season",
        sport_type: "Baseball",
        date: "2024-04-15",
        time: "19:00:00",
        location: "Baseball Field",
        min_players: 16,
        max_players: 20,
        status: "completed",
      },
      {
        series_id: seriesIds[3],
        name: "Baseball Mid-Season Game",
        description: "Mid-season baseball game",
        sport_type: "Baseball",
        date: "2024-07-10",
        time: "20:00:00",
        location: "Baseball Field",
        min_players: 16,
        max_players: 20,
        status: "scheduled",
      },
    ];

    const gameIds = [];
    for (const game of games) {
      const [result] = await connection.execute(
        `INSERT INTO GAMES (SERIES_ID, NAME, DESCRIPTION, SPORT_TYPE, DATE, TIME, LOCATION, MIN_PLAYERS, MAX_PLAYERS, STATUS, CREATED_BY) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          game.series_id,
          game.name,
          game.description,
          game.sport_type,
          game.date,
          game.time,
          game.location,
          game.min_players,
          game.max_players,
          game.status,
          userId,
        ]
      );
      gameIds.push(result.insertId);
      console.log(`  ✅ Created game: ${game.name}`);
    }

    // Assign teams to games
    console.log("\n🤝 Assigning teams to games...");
    const gameTeams = [
      { game_id: gameIds[0], team_ids: [teamIds[0], teamIds[1]] }, // Basketball Round 1
      { game_id: gameIds[1], team_ids: [teamIds[0], teamIds[1]] }, // Basketball Round 2
      { game_id: gameIds[2], team_ids: [teamIds[0], teamIds[1]] }, // Basketball Final
      { game_id: gameIds[3], team_ids: [teamIds[2], teamIds[3]] }, // Soccer Semi Final
      { game_id: gameIds[4], team_ids: [teamIds[2], teamIds[3]] }, // Soccer Final
      { game_id: gameIds[5], team_ids: [teamIds[4], teamIds[5]] }, // Tennis Final
      { game_id: gameIds[6], team_ids: [teamIds[6], teamIds[7]] }, // Baseball Opener
      { game_id: gameIds[7], team_ids: [teamIds[6], teamIds[7]] }, // Baseball Mid-Season
    ];

    for (const gameTeam of gameTeams) {
      for (const teamId of gameTeam.team_ids) {
        await connection.execute(
          "INSERT INTO GAME_TEAMS (GAME_ID, TEAM_ID) VALUES (?, ?)",
          [gameTeam.game_id, teamId]
        );
      }
      console.log(`  ✅ Assigned teams to game ID: ${gameTeam.game_id}`);
    }

    console.log("\n🎉 Sample data created successfully!");
    console.log(`📊 Dashboard should now show:`);
    console.log(`   • ${series.length} Game Series`);
    console.log(`   • ${games.length} Total Games`);
    console.log(`   • ${teams.length} Teams`);
    console.log(
      `   • ${
        games.filter(
          (g) => g.status === "scheduled" && new Date(g.date) >= new Date()
        ).length
      } Upcoming Games`
    );
  } catch (error) {
    console.error("❌ Error creating sample data:", error);
  } finally {
    await connection.end();
  }
}

createSampleData();
