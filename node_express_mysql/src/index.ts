import express, {Request, response} from 'express';
const bodyParser = require('body-parser')
const cors = require('cors');
import { connection } from "./db";
const app = express();
const port = 3001;

app.use(bodyParser.json())

type Player =   {
  "playerName": string,
  "playerPosition": string,
  "playerJerseyNumber": number,
  "playerStory": string,
}

app.use(cors({
  origin: '*'
}));


app.post('/player', async (req: Request<{}, {}, Player>, res) => {
  const { playerName, playerPosition, playerJerseyNumber, playerStory } = req.body;

  // Pārbaudam vai dati ir legit
  if (!playerName || !playerPosition || !playerJerseyNumber || !playerStory) {
    res.status(400).json({
      error: {
        message: "Invalid data"
      }
    });
    return;
  }

  connection.query(
    `
    INSERT INTO players (playerName, playerPosition, playerJerseyNumber, playerStory)
    VALUES ('${playerName}', '${playerPosition}', '${playerJerseyNumber}', '${playerStory}');
    `,
    (error, results) => {
      if (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }

      res.json({players: results});
    }
  );
});

app.get('/players', async (req, res) => {
  // Execute the query to get all users
  connection.query('SELECT * FROM players', (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Send the users as a JSON response
    res.json({ players: results });
  });
});

app.delete('/players/:id', (req, res) => {

  const playerId = req.params.id;

  connection.query(
    'DELETE FROM players WHERE id = ?',
    [playerId],
    (error, results) => {
      if (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }

      res.json({ message: 'Player deleted successfully' });
    }
  );
});

app.put('/players/:id', (req, res) => {
  const playerId = req.params.id;
  const { playerName, playerPosition, playerJerseyNumber, playerStory } = req.body;

  if (!playerName || !playerPosition || !playerJerseyNumber || !playerStory) {
    res.status(400).json({
      error: {
        message: "Invalid data"
      }
    });
    return;
  }

  connection.query(
    `
    UPDATE players 
    SET playerName = ?, playerPosition = ?, playerJerseyNumber = ?, playerStory = ?
    WHERE id = ?;
    `,
    [playerName, playerPosition, playerJerseyNumber, playerStory, playerId],
    (error, results) => {
      if (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }

      res.json({ message: 'Player updated successfully' });
    }
  );
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
