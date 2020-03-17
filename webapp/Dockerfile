FROM node:12-alpine
MAINTAINER R. Oung (r.oung@hapi-robo.com)

# create app directory
WORKDIR /usr/src/app

# copy all app dependencies
COPY package*.json ./
RUN npm install

# bundle app source code
COPY public/ ./public/
COPY views/ ./views/
COPY app.js ./

# run the app
CMD ["npm", "start"]