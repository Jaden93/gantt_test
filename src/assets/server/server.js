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

// Endpoint per ottenere i dati dalla tabella dbo.gantt_tasks
app.get('/data', async (req, res) => {
  try {
    // Promise.all([

    // ])
    // Creazione della connessione al database
    await sql.connect(config);

    // Esecuzione della query per ottenere i dati
    const result = await sql.query('SELECT * FROM gantt_tasks');
    console.log(result)
    // Verifica se result.recordset contiene dei dati
    if (result.recordset && result.recordset.length > 0) {
      // Invia i dati come risposta
      res.json(result.recordset);
    } else {
      // Nessun dato trovato, invia un messaggio di errore o una risposta vuota
      res.status(404).send('Nessun dato trovato');
    }

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
