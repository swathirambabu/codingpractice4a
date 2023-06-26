const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
const initializeAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeAndServer();
const convertDBObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
//get players list//

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `select * from cricket_team;`;

  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDBObjectToResponseObject(eachPlayer)
    )
  );
});
//Returns a player based on a player ID

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const getPlayerQuery = `select * from cricket_team where player_id={playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(convertDBObjectToResponseObject(player));
});

//create player list//

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;

  const { playerName, jerseyNumber, role } = playerDetails;

  const addPlayerQuery = `INSERT INTO  cricket_team (player_name,jersey_number,role)
    values( '${playerName}' ,'${jerseyNumber}','${role}' );`;
  const dbResponse = await db.run(addPlayerQuery);

  response.send("Player Added to Team");
});

//Updates the details of a player in the team (database) based on the player ID
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;

  const updatePlayerQuery = `UPDATE  cricket_team SET 
     player_name='${playerName}',
     jersey_number='${jerseyNumber},
     role='${role}' 
    where player_id=${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});
//Deletes a player from the team (database) based on the player ID
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const deletePlayerQuery = `delete  from cricket_team 
    where player_id=${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
module.exports = app;
