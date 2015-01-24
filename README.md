# docker
```
docker build -t battlecode .
docker run --rm -t --name battlecode -v <local-path-to-battlecodevis>:/battlecodevis:rw -p 5000:5000 battlecode
```

now look at ``localhost:5000``

if you are using boot2docker, instead of localhost, run ``boot2docker ip`` to find out the ip, docker is running on.

## development setup  
[win-only] allow all user permissions to "node_modules"
```
npm install
npm run server
```
now beefy should open up a server on `http://127.0.0.1:9966`  

### updates
- run `grunt less` to update your css file
- run `grunt bower` to update the require.js index (eg. if you have added a package to bower)
