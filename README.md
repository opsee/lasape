# lasape
front-end

## Building

### Pre-requisites

1. Node.js 
  * brew install node
  * npm install -g grunt grunt-cli bower
2. Dependencies
  * npm install
  * sudo gem install bundler
  * bundle install

### Compiling

1. bundle exec grunt build
2. bundle exec grunt compass

### Development

1. bundle exec grunt

This will start a server on localhost:8000 and open it in a browser window.
Grunt will watch for file changes and update on the fly.

## Docker

### Building

1. docker build -t lasape .

### Running

1. docker run -p 80:80 lasape

Then point your browser to port 80 on your Docker host.
