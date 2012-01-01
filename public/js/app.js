$(document).ready(init);

function init() {
    var socket = io.connect();
    socket.on('firehose', function(msg) {
        addUpdate(msg);
        removeOld();
        });
    };

function addUpdate(msg) {
    if($.trim(msg.title) == '')
        return;
    var a = $('<a>').attr({
        'href': msg.href,
        'lang': msg.lang,
        target: '_new'}).html(msg.title);
    var d = $('<div>').attr({'class': 'link'})
        .append(a)
        .append(' by ' + msg.author)
        .hide();
    $('#updates').prepend(d);
    d.slideDown('medium');
    };

function removeOld() {
    var old = $('.link').slice(30);
    old.fadeOut('medium', function() { old.remove(); });
    };
