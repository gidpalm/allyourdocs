// start-server.js
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  console.log(`🚀 Starting AllYourDocs Backend with ${os.cpus().length} workers`);
  
  // Fork workers
  for (let i = 0; i < Math.min(os.cpus().length, 4); i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
  
} else {
  // Worker process - start the server
  require('./index.js');
}