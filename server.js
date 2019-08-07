const express = require('express')
const app = express()
const port = 3000

app.use(express.static(__dirname + "/src"));

app.get('/', (req, res) => res.sendFile('./src/index.html', { root: __dirname }));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));