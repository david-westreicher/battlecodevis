# Battlecode Visualization 2015
##- by team schnitzel

## Install
You will need [nodejs](http://nodejs.org/).
```sh
$ npm install
$ npm run start
```
Visit ``localhost:5000``. Done.

## with Docker
```sh
$ docker build -t battlecode .
$ docker run --rm -t --name battlecode -v <local-path-to-battlecodevis>:/battlecodevis:rw -p 5000:5000 battlecode
```
Visit ``localhost:5000``. Done.

## Battlecode Tick Socket (for teh devs)
When you start the server with
```sh
$ npm run starttick
```
the server tries to connect to a socket on port ``1337``.
It accepts integers for the roundnumber.
When a map is finished the server sends back a message ``end``
the other end of the socket should then reset the roundnumber to 0.
