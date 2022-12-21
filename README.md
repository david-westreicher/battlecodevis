# Battlecode Visualization 2015
##- by team schnitzel

https://user-images.githubusercontent.com/706827/208970984-965c7192-c412-422e-8207-4714a43f7916.mp4

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
