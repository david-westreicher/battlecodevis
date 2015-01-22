# docker
```
docker build -t battlecode .
docker run --rm -t --name battlecode -v <local-path-to-battlecodevis>:/battlecodevis:rw -p 5000:5000 battlecode
```

now look at ``localhost:5000``

if you are using boot2docker, instead of localhost, run ``boot2docker ip`` to find out the ip, docker is running on.