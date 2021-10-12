FROM node:12-alpine

RUN apk add --no-cache i2c-tools
RUN apk add --no-cache lshw

WORKDIR /usr/app
COPY lib lib
COPY scripts scripts
COPY package.json .
COPY swagger.json .
COPY VERSION .

RUN npm install

CMD ["npm", "start"]