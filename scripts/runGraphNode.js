
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

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
    
    exec('docker-compose up', {cwd: path.join(pathToNode, '/docker/') }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Graph Node error: ${error.message}`);
            return;
        }
        
        if (stderr) {
            console.error(`Graph Node stderr: ${stderr}`);
            return;
        }
        
        console.log(stdout);
    });

}
runGraphNode();