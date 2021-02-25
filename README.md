# webpage_extractor
A full-stack web application that allows a user to extract data from webpages on demand

# how to run

## standalone mode

1. run a MongoDB container
```
docker run --name some-mongo -p 49153:27017 -d mongo
```
2. make a ENV configuration file like this
```
master.env
----------
DB_HOST=IP_ADDRESS # do not use something like 127.0.0.1 or localhost
# DB_PORT=49153
# DB_NAME=WebExtractor
STANDALONE_MODE=true
```

3. run the app
```
docker run --name standalone-master --env-file master.env -p 3000:3000 -d jayzhu/web-crawler-master
```

4. open your browser and visit `http://YOUR_SERVER_IP:3000`


## cluster mode
1. run a MongoDB container
```
docker run --name some-mongo -p 49153:27017 -d mongo
```
2. run a RabbitMQ container
```
docker run -d -p 15672:15672 -p 5672:5672 -e RABBITMQ_NODENAME=my-rabbit --name some-rabbit rabbitmq:management
```
3. make ENV configuration file for master ndoe and worker node
```
master.env
----------
MQ_HOST=IP_ADDRESS # it should not be something like 127.0.0.1 or localhost
# MQ_PORT=5672
# MQ_QUEUE_NAME=extractionRecords
DB_HOST=IP_ADDRESS # it should not be something like 127.0.0.1 or localhost
# DB_PORT=49153
# DB_NAME=WebExtractor
STANDALONE_MODE=false

worker.env
----------
MQ_HOST=IP_ADDRESS # it should not be something like 127.0.0.1 or localhost
# MQ_PORT=5672
# MQ_QUEUE_NAME=extractionRecords
DB_HOST=IP_ADDRESS # it should not be something like 127.0.0.1 or localhost
# DB_PORT=49153
# DB_NAME=WebExtractor
```

4. run the master
```
docker run --name cluster-master --env-file master.env -p 3000:3000 -d jayzhu/web-crawler-master
```

5. run the dedicated worker as many as you want
```
docker run --name cluster-worker --env-file worker.env -d jayzhu/web-crawler-worker
```

6. open your browser and visit `http://YOUR_SERVER_IP:3000`

7. you can also visit `http://MQ_HOST:15672` to see the RabbitMQ admin panel, username and password are both `guest`