const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
 
const port = 1337;
const app = express();
 
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
 
app.listen(port, () =>{
    console.log("Server is running on port "+port+"...");
});