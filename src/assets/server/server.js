const express = require('express');
const app = express();
const sql = require('mssql');
const cors = require('cors');
const bodyParser = require('body-parser');
app.use(cors({
    origin: 'http://localhost:4200'
}));
const Promise = require('bluebird');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

const pool = new sql.ConnectionPool(config);


require("date-format-lite");

// Endpoint per ottenere i dati dalla tabella sqlo.gantt_tasks
app.get('/data', async (req, res) => {
  try {
    await pool.connect();
      const getTasks = await pool.query('SELECT * FROM gantt_tasks');
      const getLinks =  await pool.query('SELECT * FROM gantt_links')
          for (let i = 0; i < getTasks.recordset.length; i++) {
        getTasks.recordset[i].start_date = getTasks.recordset[i].start_date.format("YYYY-MM-DD hh:mm:ss")
        // console.log(tasks.recordset[i].start_date)
        // tasks.recordset[i].start_date = tasks[i].start_date.format("YYYY-MM-DD hh:mm:ss");
        getTasks.recordset[i].open = false;
      }
      await pool.close();
      // sendResponse(res, "inserted", getTasks)
      res.send({
        data : getTasks.recordset,
        links : getLinks.recordset
      })
        } catch (error) {
    sendResponse(res, "error", null, error);
  }
});

//non funziona
// app.post("/data/task", async(req,res) => {
//   try {


//     const query = "INSERT INTO gantt_tasks (text, start_date, duration, progress, parent) VALUES (@text, @start_date, @duration, @progress, @parent)"
//     const request = pool.request();
//     let task = getTask(req.params);

//     const params = {
//       text : request.input("text", sql.VarChar(255), task.text),
//       start_date : request.input("start_date", sql.DateTime, task.start_date),
//       duration :     request.input("duration", sql.Int, task.duration),
//       progress :     request.input("progress", sql.Float, task.progress),
//       parent :     request.input("parent", sql.Int, task.parent)
//     };

//     await executeQuery(query, params);
//     console.log('Dati inseriti correttamente.');
//   } catch (error) {
//     console.error('Si è verificato un errore:', error);
//   }
// });

// add a new task
app.post("/data/task", async (req, res) => {
  try {
    // Creazione della connessione al database
    let task = getTask(req.body);
    await pool.connect()
    const request = pool.request();
    request.input("text", sql.VarChar(255), task.text)
    request.input("start_date", sql.DateTime, task.start_date)
    request.input("duration", sql.Int, task.duration)
    request.input("progress", sql.Float, task.progress)
    request.input("parent", sql.Int, task.parent)

    const result = await request.query(
      "INSERT INTO gantt_tasks (text, start_date, duration, progress, parent) VALUES (@text, @start_date, @duration, @progress, @parent)",
    );
    // Chiusura della connessione al database
    await sql.close();
    sendResponse(res, "inserted", result.insertId)
  } catch (error) {
    sendResponse(res, "error", null, error);
  }
});
// update a task
app.put("/data/task/:id", async (req, res) => {
  try {
    let sid = req.params.id;
    let task = getTask(req.body);
    await pool.connect();
    const request = pool.request();
    request.input("id", sql.VarChar, sid);
    request.input("text", sql.VarChar(255), task.text);
    request.input("start_date", sql.DateTime, task.start_date);
    request.input("duration", sql.Int, task.duration);
    request.input("progress", sql.Float, task.progress);
    request.input("parent", sql.Int, task.parent);

    const result = await request.query(`
      UPDATE gantt_tasks
      SET text = @text, start_date = @start_date, duration = @duration, progress = @progress, parent = @parent
      WHERE id = @id
    `);

    await pool.close();
    sendResponse(res, "updated", result.rowsAffected[0]);
    console.log("Dati correttamenti inviati");
  } catch (error) {
    sendResponse(res, "error", null, error);
  }
});


app.delete("/data/task/:id", async (req, res) => {
  try {
    let sid = req.params.id;
    await pool.connect();

    const request = pool.request();
    request.input('id', sql.VarChar, sid);

    const result = await request.query("DELETE FROM gantt_tasks WHERE id = @id");
    console.log(result);

    await pool.close();
    sendResponse(res, "updated", result.rowsAffected[0]);
    console.log("Dati correttamenti inviati");
  } catch (error) {
    sendResponse(res, "error", null, error);
  }
});

// add a link
app.post("/data/link", (req, res) => {
    let link = getLink(req.body);

    sql.query("INSERT INTO gantt_links(source, target, type) VALUES (?,?,?)",
        [link.source, link.target, link.type])
    .then(result => {
        sendResponse(res, "inserted", result.insertId);
    })
    .catch(error => {
        sendResponse(res, "error", null, error);
    });
});

// update a link
app.put("/data/link/:id", (req, res) => {
    let sid = req.params.id,
        link = getLink(req.body);

    sql.query("UPDATE gantt_links SET source = ?, target = ?, type = ? WHERE id = ?",
        [link.source, link.target, link.type, sid])
    .then(result => {
        sendResponse(res, "updated");
    })
    .catch(error => {
        sendResponse(res, "error", null, error);
    });
});

// delete a link
app.delete("/data/link/:id", (req, res) => {
  try {
    let sid = req.params.id;
    pool.connect()
    const result = pool.query("DELETE FROM gantt_links WHERE id = ?", [sid])
    pool.close()
    sendResponse(res, "deleted");
  } catch (error) {
    sendResponse(res, "error", null, error);
  }
});

// app.all(/data/,function (req,res,next) {
//   console.log('n'+req.method +" " + req.url + "--->" + JSON.stringify(req.body, 't',2))
//   res.status(200).end()
// })

function getTask(data) {
    return {
        text: data.text,
        start_date: data.start_date,
        duration: data.duration,
        progress: data.progress || 0,
        parent: data.parent
    };
}

function getLink(data) {
    return {
        source: data.source,
        target: data.target,
        type: data.type
    };
}



async function sendResponse(res, action, tid, error) {

    if (action == "error")
        console.log(error);

    let result = {
        action: action
    };
    if (tid !== undefined && tid !== null)
        result.tid = tid;

    res.send(result);

}

// Avvio del server
const port = 1337;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
