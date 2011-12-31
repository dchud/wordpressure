WordPressure

A node.js application that reads from the WordPress firehose (see
http://en.wordpress.com/firehose/ for details) and shows a running
list of new entries on WordPress sites on a web page.

It uses node.js with socket.io to display and update the list as
updates come available.

This application comes mostly from a desire to understand these
tools and the cool way that @edsu has used them to make Wikistream
(see https://github.com/edsu/wikistream).  It looks a lot just like
Wikistream because I read and copied liberally from Wikistream as
I wrote it.  To a lesser extent, I also wanted to get a feel for
the flow of data into a service like WordPress.

To install, set up node w/npm:

* install [node](http://nodejs.org/)
* install [npm](http://npmjs.org/)

Grab external node libraries w/npm:

    npm install

Then start the app:

    node app.js

Finally, open your browser to:

    http://localhost:3000/

Authors:

* Dan Chudnov (@dchud)
* Ed Summers (@edsu)

Wholly inspired by and copied from Ed Summers' Wikistream, as
mentioned above.

License: Public Domain
