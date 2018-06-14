# Run server with docker on port 8080 (in root folder)

docker build -t app -f Dockerfile . && docker run -p 8080:80 app

# Run unit tests swith docker (in root folder)

docker build -t app -f Dockerfile . && docker build -t app-test -f Dockerfile.test . && docker run --rm app-test

# Build app with docker and export to dist folder (in root folder)

rm -rf dist && docker build -t app -f Dockerfile . && docker cp $(docker ps -l -q):/dist dist

