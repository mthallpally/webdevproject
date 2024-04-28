const CONNECTION_STRING = "mongodb+srv://admin:ventilator@ventilator.yibiaut.mongodb.net/ventilator?retryWrites=true&w=majority";
const DATABASE_NAME = "hospitalManagement";
let database;

const PORT = 9080;
const http = require('http');
const url = require('url');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  // Enable CORS
  cors()(req, res, () => {
    // Connect to MongoDB
    MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
      if (error) {
        console.error('Error connecting to MongoDB:', error);
        return;
      }
      const database = client.db(DATABASE_NAME);
      
      // Handle routes
      if (path === '/hospital' && req.method === 'GET') {
        console.log("getting things ready");
        database.collection("hospitalManagement").find().toArray()
        .then(result => {
          res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify(result));
        })
        .catch(error => {
          console.error("Error:", error);
          res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ error: "Internal Server Error" }));
        });
      }
      else if (path === '/searchventbystatus' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          const { status } = JSON.parse(body);
          console.log(status);
          database.collection('hospitalManagement').find({"status": status}).toArray()
          .then(result => {
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify(result));
          })
          .catch(error => {
            console.error("Error:", error);
            res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ error: "Internal Server Error" }));
          });
        });
     
      }else if(path === '/deletevent' && req.method === 'DELETE'){
        database.collection('hospitalManagement').deleteOne({ "ventilatorId": ventilatorId },function (err, result){
            if (err) {
                console.error("Error deleting ventilator:", err);
                res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({ error: "Internal Server Error" }));
                return;
              }
              if (result.deletedCount === 0) {
                // No ventilator found with the specified ID
                res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({ error: "Ventilator not found" }));
              } else {
                // Ventilator successfully deleted
                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({ message: "Ventilator deleted successfully" }));
              }
            });
          }
      
      else if (path === '/addvent' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          const { ventilatorId, hospitalName, Address, contact } = JSON.parse(body);
          console.log("adding ventilator, please wait a moment");
          const item = {  ventilatorId: ventilatorId,hospitalName:hospitalName,Address:Address,contact: contact };
          database.collection("hospitalManagement").insertOne(item, function(err, result) {
            if (err) {
              console.error("Error:", err);
              res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
              res.end(JSON.stringify({ error: "Internal Server Error" }));
              return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ message: "Inserted successfully" }));
          });
        });
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
        res.end('Not Found');
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


