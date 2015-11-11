# node-redis-cache-server

Simple node app that acts as a middle-man between an api of your choice (I used Forecast io in this case) and stores
subsequent results into redis for faster lookup.  Useful for reducing the amount of requests pinged towards your web
service
