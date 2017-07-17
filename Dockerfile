FROM node:alpine

WORKDIR /usr/src/app

COPY package.json ./package.json
RUN npm install && rm -rf /tmp/npm-*
COPY . ./

ENV PATH=/opt/bin:$PATH
ENV NODE_ENV=production
ENV BIND_HOST=:: BIND_PORT=3001

ENTRYPOINT [ "npm", "start" ]
EXPOSE 3001
