var express = require('express'),
    redis = require('redis'),
    sio = require('socket.io'),
    sys = require('sys');

var app = module.exports = express.createServer();

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
    var firehose = redis.createClient();
    firehose.subscribe('firehose');
    firehose.on('message', function(channel, message) {
        socket.send(message);
        });
    socket.on('disconnect', function() {
        firehose.quit();
        });
    });
