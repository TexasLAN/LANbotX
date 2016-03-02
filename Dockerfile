FROM node:wheezy

RUN mkdir -p /usr/src
WORKDIR /usr/src

COPY . /usr/src
RUN npm install

EXPOSE 8080

CMD [ "npm", "start" ]
