const uuid = require('uuid');

var http = require('http');
var mysql = require('mysql');
const { exit } = require('process');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mhn'
});

var options = {
  host: 'i-lab.umm.ac.id',
  port: 8080,
  path: '/api/session/?api_key=161c0967e9d4414b9c2b2101ccda2591&hours_ago=1'
};

async function insert(){
  for (const response of responses.data) {
    await connection.query('INSERT IGNORE INTO sessions (_id, destination_ip, destination_port, honeypot, identifier, protocol, source_ip, source_port, timestamp) VALUE (\'' + response._id + '\', \'' + response.destination_ip + '\', \'' + response.destination_port + '\', \'' + response.honeypot + '\', \'' + response.identifier + '\', \'' + response.protocol + '\', \'' + response.source_ip + '\', \'' + response.source_port + '\', \'' + response.timestamp + '\')', function (error, results, fields) {
      if (error) throw error;
      console.log(response._id);
    });
  }
}

async function counts() {
  await connection.query('SELECT COUNT(*) as total FROM sessions', function (error, results, fields) {
    if (error) throw error;
    var created = new Date();
    const message = `Pooling with ${responses.meta.size} and writen ${results[0].total} data, finish at: ${created}`
    connection.query('INSERT INTO states (_id, createAt, message) VALUE (' + connection.escape(uuid.v4()) + ', ' + connection.escape(created) + ', ' + connection.escape(message) + ')', function (error, results, fields) {
      if (error) throw error;
      console.log(message);
    });
  });
}

callback = function (response) {
  var str = '';
  response.on('data', function (chunk) {
    str += chunk;
  });

  response.on('end', function () {
    responses = JSON.parse(str)
    insert()
    counts()
  });
}

http.request(options, callback).end();