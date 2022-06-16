
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

/**
 * run the graph node locally
 * 
 * before running this script, ensure both docker and the local blockchain on localhost:8545 are running
 */


function runGraphNode() {

    const pathToNode = path.resolve('./graph-node/');

    const pathToData = path.join(pathToNode, '/docker/', '/data/');

    if (!fs.existsSync(pathToNode)) {
        console.log('Graph Node repository not found: looking for ' + pathToNode);
        process.exit(0);
    }
    if (fs.existsSync(pathToData)) {
        // delete directory
        console.log('Found old data for the graph node - deleting it');
        fs.rmSync(pathToData, { recursive: true, force: true });
    }

    // now run the graph node using exec
    
    const graphNode = spawn('docker-compose', ['up'], {cwd: path.join(pathToNode, '/docker/') });

    graphNode.on('exit', function (code, signal) {
        console.log(`graph node exited with code ${code} and signal ${signal}`);
    });

    graphNode.on('error', function (error) {
        console.log(`graph node error: ${error}`);
    });

    graphNode.stdout.on('data', (data) => {
        console.log(data.toString());
    });
      
    graphNode.stderr.on('data', (data) => {
        console.error(`Graph Node stderr: ${data.toString()}`);
    });

}
runGraphNode();