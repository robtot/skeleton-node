FROM node:alpine

# Install packages
RUN apk update
RUN apk add curl

# Create dist directory and install dependencies
RUN mkdir dist
COPY package.json /dist
WORKDIR dist
RUN npm install --ignore-scripts --unsafe-perm

# add source code and config
ADD config /dist/config
ADD src /dist/src

# start server
CMD npm start

# Expose container port 8080
EXPOSE 8080

HEALTHCHECK --interval=5m --timeout=3s \
CMD curl -f http://localhost:80 || exit 1