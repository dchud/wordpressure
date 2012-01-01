var express = require('express'),
    http = require('http'),
    sio = require('socket.io'),
    sys = require('sys'),
    _ = require('underscore'),
    xml2js = require('xml2js');

var app = module.exports = express.createServer(express.logger());

app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    });

app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.static(__dirname + '/public'));
    });

app.configure('production', function() {
    app.use(express.errorHandler());
    app.use(express.static(__dirname + '/public', {maxAge: 60}));
    });

app.get('/', function(req, res) {
    res.render('index', {
        title: 'wordpressure',
        stream: true
        });
    });

var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log('Listening on ' + port);
    });

var io = sio.listen(app);
var sockets = [];

// see http://devcenter.heroku.com/articles/using-socket-io-with-node-js-on-heroku
io.configure(function () { 
    io.set('transports', ['xhr-polling']); 
    io.set('polling duration', 10); 
    });

io.sockets.on('connection', function(socket) {
    sockets.push(socket);
    socket.on('disconnect', function() {
        console.log('removing socket ' + socket + ' size ' + sockets.length);
        sockets = _.without(sockets, socket);
        console.log('removed socket ' + socket + ' size ' + sockets.length);
        });
    });

function processEntry(err, entry) {
    if (err || ! entry.title) 
        return;
    var title = entry.title['#'];
    var author = entry.author.name;
    var lang = entry['@']['xml:lang'];
    var link = _.find(entry.link, function(l) {
        return l['@'].type == "text/html";
        });

    var msg = {
        title: title, 
        author: author, 
        lang: lang, 
        href: link['@'].href
        };
    console.log('sockets size ' + sockets.length);
    _.each(sockets, function(socket) {
        socket.emit('firehose', msg);
        });

    return msg;
}

function listenFirehose() {
    var options = {
        'host': 'xmpp.wordpress.com',
        'port': 8008,
        'path': '/firehose.xml',
        };

    http.get(options, function(res) {
        var entry = "";
        res.on('data', function(chunk) {
            var xmlChunk = String(chunk);
            if (! xmlChunk.match(/^(<tick|<stream)/)) {
                entry += xmlChunk;
                if (xmlChunk.match(/<\/entry>/)) {
                    parser = new xml2js.Parser();
                    parser.parseString(entry, processEntry);
                    entry = "";
                }
            }
        });
    }).on('error', function(e) {
        console.log('error: ' + e);
        });
}

listenFirehose();
