nginx -p $(pwd) -c nginx.conf &
./node_modules/.bin/webpack-dev-server --config ./webpack.js
nginx -s stop
