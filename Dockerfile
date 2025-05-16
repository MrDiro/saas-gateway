FROM node:22-alpine

WORKDIR /app

COPY . .

RUN npm install

RUN npm build

CMD ["npm", "start:prod"]