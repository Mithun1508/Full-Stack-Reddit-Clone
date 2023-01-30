FROM node:14

RUN adduser node root

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .
COPY .env.production .env

RUN mkdir -p ./public
RUN chmod -R 775 ./public
RUN chown -R node:root ./public

RUN npm run build

ENV NODE_ENV production

EXPOSE 8080
CMD [ "node", "build/server.js" ]
USER node