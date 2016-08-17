var client = require('../build/client');
var BASE_URL='http://localhost:9515';
client.getStatus(BASE_URL, function(){
  console.log('this is status', arguments);
})