var express = require('express');
var cors = require('cors')
var srv = express();

const bodyParser = require('body-parser')
const multer = require('multer') // v1.0.5
const upload = multer() // for parsing multipart/form-data
const fs = require('fs'); // rw file

srv.use(bodyParser.json()) // for parsing application/json
srv.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

srv.use(cors())

// -----------------------------------------   DB  ---------------------------------------------

function generateId() {
    return Math.random().toString(32).slice(2);
};

class DateTable {
    constructor(db) {
        this.db = db || [];
    }

    read(id) {
        return this.db.find( (o) => o.id == id );
    }

    list(page, limit) {
        const offset = page*limit;
        const lim = offset + limit;
        return this.db.slice(offset, lim);
    }

    create(data) {
        data['id'] = generateId();
        this.db.push(data);
        return data['id'];
    }

    update(id, data) {
        this.read(id) = data;
        return id;
    }

    delete(id) {
        const index = this.db.findIndex( (o) => o.id == id );
        this.db.splice(index, 1);
        return id;
    }

    toObject() {
        return this.db;
    }
}

class DataBase {
    constructor(db) {
        if (db) {
            for (let k in db) {
                db[k] = new DateTable(db[k]);
            }
        }
        this.db = db || {}
    }

    add(key, table) {
        this.db[key] = new DateTable(table);
        return this.db[key];
    }

    get(key) {
        return this.db[key] || this.add(key);
    }

    toObject() {
        let data = {};
        for (let k in this.db) {
            data[k] = this.db[k].toObject();
        }

        return data;
    }
}

let database;
fs.readFile('database.json', (err, data) => {
    if (err) throw err;
    let db = JSON.parse(data);
    database = new DataBase(db);
});



// -----------------------------------------   REST  ---------------------------------------------

srv.get('/:object/:page/:limit', function (req, res) {
    res.send(
        database.get(req.params['object'])
            .list(
                parseInt(req.params['page'], 10),
                parseInt(req.params['limit'], 10)
            )
    );
});

srv.get('/:object/:id', function (req, res) {
    res.send(
        database.get(req.params['object'])
            .read(
                req.params['id']
            )
    );
});

srv.post('/:object/:id', function (req, res) {
    res.send(
        database.get(req.params['object'])
            .create(
                req.body
            )
    );
});

srv.put('/:object/:id', function (req, res) {
    res.send(
        database.get(req.params['object'])
            .update(
                req.params['id'],
                req.body
            )
    );
});

srv.delete('/:object/:id', function (req, res) {
    res.send(
        database.get(req.params['object'])
            .delete(
                req.params['id']
            )
    );
});


// -----------------------------------------   SERVER SAVE STATE  ---------------------------------------------

function closeServer() {
    server.close(function () {
        saveDataBase();
    });
}

function saveDataBase() {
    let data = JSON.stringify(database.toObject(), null, 2);

    fs.writeFile('database.json', data, (err) => {
        if (err) throw err;
        console.log('Data written to file');
     });
};

// listen for TERM signal .e.g. kill
process.on ('SIGTERM', closeServer);

// listen for INT signal e.g. Ctrl-C
process.on ('SIGINT', closeServer); 

//or even exit event 
process.on('exit', closeServer); 

let server = srv.listen(8080, function () {
    console.log('Server listening on port 8080');
});