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