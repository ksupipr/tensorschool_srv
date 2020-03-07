const express = require('express')
const path = require('path')
const app = express()
const port = 80

app.get('/', function(req, res) {
    // res.sendFile(path.join(__dirname + '/index.html'));
    res.sendFile(path.join('index.html'));
});

app.listen(port, (err) => {
    if (!console) return;
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
})