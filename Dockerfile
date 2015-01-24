# battlecodevis
FROM debian:wheezy

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update -y -qq && apt-get -y install
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup | bash -
RUN apt-get install -y nodejs

VOLUME ["/battlecodevis"]
WORKDIR /battlecodevis

ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /battlecodevis && cp -a /tmp/node_modules /battlecodevis

WORKDIR /battlecodevis

EXPOSE 5000

ENTRYPOINT ["/usr/bin/npm"]
CMD ["run", "start"]
