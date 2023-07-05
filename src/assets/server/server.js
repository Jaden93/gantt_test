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
              recordset[i].open = true;
            }

            res.send({
                    data: recordset
                });
              })
    // Chiusura della connessione al database
    await sql.close();
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// app.all(/data/,function (req,res,next) {
//   console.log('n'+req.method +" " + req.url + "--->" + JSON.stringify(req.body, 't',2))
//   res.status(200).end()
// })

// add a new task
app.post("/data/task", async (req, res) => {
  try {
    // Creazione della connessione al database
    let task = getTask(req.body);
    await pool.connect();
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

    sendResponse(res, "inserted", result.insertId);
  } catch (error) {
    sendResponse(res, "error", null, error);
  }
});
// app.post("/data/task", async (req, res) => {
//     let task = getTask(req.body);
//     await sql.connect(config);

//     sql.query("INSERT INTO gantt_tasks(text, start_date, duration, progress, parent) VALUES (?,?,?,?,?)",
//         [task.text, task.start_date, task.duration, task.progress, task.parent])
//     .then(async result => {
//         sendResponse(res, "inserted", result.insertId);
//     })
//     .catch(error => {
//         sendResponse(res, "error", null, error);
//     });

// });

// update a task
app.put("/data/task/:id", (req, res) => {
  let sid = req.params.id,
  task = getTask(req.params);
  sql.query("UPDATE gantt_tasks SET text = ?, start_date = ?, "
        + "duration = ?, progress = ?, parent = ? WHERE id = ?",
        [task.text, task.start_date, task.duration, task.progress, task.parent, sid])
    .then(result => {
        sendResponse(res, "updated");
    })
    .catch(error => {
        sendResponse(res, "error", null, error);
    });
});


// delete a task
app.delete("/data/task/:id", (req, res) => {
    let sid = req.params.id;
    sql.query("DELETE FROM gantt_tasks WHERE id = ?", [sid])
    .then(result => {
        sendResponse(res, "deleted");
    })
    .catch(error => {
        sendResponse(res, "error", null, error);
    });
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
    let sid = req.params.id;
    sql.query("DELETE FROM gantt_links WHERE id = ?", [sid])
    .then(result => {
        sendResponse(res, "deleted");
    })
    .catch(error => {
        sendResponse(res, "error", null, error);
    });
});



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
