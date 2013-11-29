# Cleanup
rm -f tmp/*.js
# Compile coffeescript
coffee -c -o tmp src/*.coffee

# Combine, minify and append libs
#java -jar bin/yuicompressor-2.4.8.jar tmp/*.js lib/*.js -o deploy/latest/prediction.js
# Only combine and append libs
cat tmp/*.js > deploy/latest/prediction.js
cat lib/*.js >> deploy/latest/prediction.js

# Cleanup
rm -f tmp/*.js