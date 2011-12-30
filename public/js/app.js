$(document).ready(init);

function init() {
    var socket = io.connect();
    socket.on('firehose', function(msg) {
        //var msg = jQuery.parseJSON(data);
        addUpdate(msg);
        removeOld();
        });
    };

function addUpdate(msg) {
    var lang = '[' + msg.lang + '] ';
    var a = $('<a>').attr({
        'href': msg.href,
        'lang': msg.lang,
        target: '_new'}).text(msg.title);
    var d = $('<div>').attr({'class': 'link'})
        .append(lang)
        .append(a)
        .append(' by ' + msg.author)
        .hide();
    $('#updates').prepend(d);
    d.slideDown('medium');
    };

function removeOld() {
    var old = $('#updates').slice(5);
    old.fadeOut('fast', function() { old.remove(); });
    };
