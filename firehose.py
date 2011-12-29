#!/usr/bin/env python

import HTMLParser
from pprint import pprint
import socket
import time
import urllib2

import feedparser
import redis
import simplejson as json

HOSE = 'http://xmpp.wordpress.com:8008/firehose.xml'

socket._fileobject.default_bufsize = 0


if __name__ == '__main__':
    r = redis.StrictRedis(host='localhost', port=6379, db=0)
    req = urllib2.Request(url=HOSE, data=None)
    f = urllib2.urlopen(req)
    buf = []
    while 1:
        chunk = f.readline()
        if chunk.startswith('<tick'):
            # print 'tick'
            pass
        elif '<entry' in chunk:
            buf.append(chunk)
        elif '</entry' in chunk:
            buf.append(chunk)
            data = feedparser.parse(u''.join(buf))
            entry = data['entries'][0]
            e = {'author': entry['author'],
                'title': entry['title'],
                'href': entry['link'],
                'lang': entry['title_detail']['language']
                }
            # pprint(e)
            # skip anything missing a title; not so interesting to see
            if e['title']:
                out = json.dumps(e)
                r.publish('firehose', out)
            buf = []
        elif chunk.startswith('<stream'):
            pass
        else:
            # easiest way to avoid double-escaping in client
            buf.append(HTMLParser.HTMLParser().unescape(chunk))

