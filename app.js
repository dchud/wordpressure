var express = require('express'),
    sio = require('socket.io'),
    http = require('http'),
    xml2js = require('xml2js'),
    _ = require('underscore'),
    sys = require('sys');

var app = module.exports = express.createServer();
var sockets = [];

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

app.listen(3000);

var io = sio.listen(app);

io.sockets.on('connection', function(socket) {
    sockets.push(socket);
    socket.on('disconnect', function() {
        sockets = _.without(sockets, socket);
        });
    });

function processEntry(entry) {
    if (! entry.title) return;
    var title = entry.title['#'];
    var author = entry.author.name;
    var lang = entry['@']['xml:lang'];
    var link = _.find(entry.link, function(l) {
        return l['@'].type == "text/html";
        });

    var msg = {title: title, author: author, lang: lang, href: link['@'].href};
    _.each(sockets, function(socket) {
        socket.emit('firehose', msg);
    });

    return msg 
}

function listenFirehose() {
    var options = {
        'host': 'xmpp.wordpress.com',
        'port': 8008,
        'path': '/firehose.xml',
    }

    parser = new xml2js.Parser();
    parser.addListener('end', processEntry);

    http.get(options, function(res) {
        var entry = "";
        res.on('data', function(chunk) {
            var xmlChunk = String(chunk);
            if (! xmlChunk.match(/^(<tick|<stream)/)) {
                entry += xmlChunk;
                if (xmlChunk.match(/<\/entry>/)) {
                    parser.parseString(entry);
                    entry = "";
                }
            }
        });
    });
}

listenFirehose();
