FROM node:15

# ENV
ENV MQ_HOST=localhost
ENV MQ_PORT=5672
ENV MQ_QUEUE_NAME=extractionRecords
ENV DB_HOST=localhost
ENV DB_PORT=49153
ENV DB_NAME=WebExtractor
ENV STANDALONE_MODE=true

# Expose port
EXPOSE 3000

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Start app
CMD [ "npm", "start" ]