const express = require('express');
const app = express();
const sql = require('mssql');
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:4200'
}));
// Configurazione della connessione al database
const config = {
  user: 'sa',
  password: 'scao',
  server: 'equadra\\sqlexpress',
  port : 1337,
  // TrustServerCertificate:true,
  database: 'gantt_howto_node',
  // requestTimeout: 15000,
  // stream: true,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

require("date-format-lite");


// Endpoint per ottenere i dati dalla tabella dbo.gantt_tasks
app.get('/data', async (req, res) => {
  try {
    await sql.connect(config);


    Promise.all([
      await sql.query('SELECT * FROM gantt_tasks'),
      await sql.query('SELECT * FROM gantt_links')
    ]).then(results => {
            // let tasks = results[0],
                // links = results[1];

          let recordset = results[0].recordset
                for (let i = 0; i < recordset.length; i++) {
              recordset[i].start_date = recordset[i].start_date.format("YYYY-MM-DD hh:mm:ss")
              // console.log(tasks.recordset[i].start_date)
              // tasks.recordset[i].start_date = tasks[i].start_date.format("YYYY-MM-DD hh:mm:ss");
              // tasks[i].open = true;
            }

            res.send({
                    data: recordset
                });
              })
    // Creazione della connessione al database
    // Esecuzione della query per ottenere i dati
    // console.log(result)
    // Verifica se result.recordset contiene dei dati
    // if (result.recordset && result.recordset.length > 0) {
      // Invia i dati come risposta
      // res.json(result.recordset);
    // }
    // else {
      // Nessun dato trovato, invia un messaggio di errore o una risposta vuota
      // res.status(404).send('Nessun dato trovato');
    // }

    // Chiusura della connessione al database
    await sql.close();
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Avvio del server
const port = 1337;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
