const path = require('path');
const bodyParser = require('body-parser');
const express = require("express");
const app = express();
const { readFile } = require('fs').promises;

app.use(bodyParser.urlencoded({ extended: true }));

// Set current folder as static folder
app.use(express.static(path.join(__dirname, './')));

app.get('/', async (request, response) => {

    response.send( await readFile('./index.html', 'utf8') );

});

app.listen(process.env.PORT || 3000, () => console.log(`App available on http://localhost:3000`))