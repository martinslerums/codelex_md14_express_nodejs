const mysql = require('mysql2');
const DB_NAME = 'my_first_database'

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'example',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }

  console.log('Connected to MySQL server');

  // Create the database if it doesn't exist
  const createDatabaseQuery = `CREATE DATABASE IF NOT EXISTS ${DB_NAME}`;
  connection.query(createDatabaseQuery, (createDatabaseError, createDatabaseResults) => {
    if (createDatabaseError) {
      console.error('Error creating database:', createDatabaseError);
      connection.end();
      return;
    }

    console.log(`Database "${DB_NAME}" created or already exists`);

    // Switch to the created database
    connection.changeUser({ database: DB_NAME }, (changeUserError) => {
      if (changeUserError) {
        console.error('Error switching to database:', changeUserError);
        connection.end();
        return;
      }

      console.log(`Switched to database "${DB_NAME}"`);

      // Define the SQL query to create a table if not exists
      const createTableQuery = `
      CREATE TABLE IF NOT EXISTS movies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        movieTitle VARCHAR(255) NOT NULL,
        movieGenre VARCHAR(255) NOT NULL,
        movieReleaseYear INT NOT NULL,
        moviePoster VARCHAR(255) NOT NULL,
        movieTrailer VARCHAR(255) NOT NULL
      )
    `;

      // Execute the query to create the table
      connection.query(createTableQuery, (createTableError, createTableResults) => {
        if (createTableError) {
          console.error('Error creating table:', createTableError);
          connection.end();
          return;
        }

        console.log('Table "movies" created or already exists');

        // Define the SQL query to insert data into the table
        const insertDataQuery = `
        INSERT INTO movies (movieTitle, movieGenre, movieReleaseYear, moviePoster,  movieTrailer) VALUES
        ('Joker', 'Drama', 2018, 'https://creativereview.imgix.net/content/uploads/2019/12/joker_full.jpg?auto=compress,format&q=60&w=1012&h=1500', 'https://youtu.be/t433PEQGErc?si=7UoVpzklWpRGPCuK'),
        ('Creed III', 'Drama', 2024, 'https://artofthemovies.co.uk/cdn/shop/products/IMG_1312-310705.jpg?v=1677660328', 'https://youtu.be/AHmCH7iB_IM?si=sMjcFmBC0X1g35V-');
    
        `;

        // Execute the query to insert data
        connection.query(insertDataQuery, (insertDataError, insertDataResults) => {
          if (insertDataError) {
            console.error('Error inserting data:', insertDataError);
          } else {
            console.log('Data inserted or already exists');
          }

          // Close the connection
          connection.end();
        });
      });
    });
  });
});
