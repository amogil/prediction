# Compile coffeescript
coffee --compile --join deploy/latest/prediction.js src/*.coffee
# Concat libs
cat lib/*.js >> deploy/latest/prediction.js
# Minify js
java -jar bin/yuicompressor-2.4.8.jar deploy/latest/prediction.js -o deploy/latest/prediction.js
