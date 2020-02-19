FROM node:12-alpine
RUN mkdir -p /usr/src/app
RUN apk add vim python python-dev py-pip build-base
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
#RUN if [ "$NODE_ENV" = "production" ] ; then npm install --production ; else npm install; fi
RUN npm install --production
COPY . /usr/src/app
EXPOSE 8700
WORKDIR /usr/src/app
CMD [ "npm", "start" ]