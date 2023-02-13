
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');


/**
 * run the graph node locally
 * 
 * before running this script, ensure both docker and the local blockchain on localhost:8545 are running
 */

function main() {

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

    const options = {
        cwd: path.join(pathToNode, '/docker/') 
    }

    resetGraphNode(options);
}

function resetGraphNode(options) {
    console.log('resetting graph node container');
    // reset container and images from last build by running docker-compose down
    const resetNode = spawn('docker-compose', ['down'], options);

    resetNode.on('error', function (error) {
        console.log(`graph node reset error: ${error}`);
    });

    resetNode.stdout.on('data', (data) => {
        console.log(data.toString());
    });
    
    resetNode.stderr.on('data', (data) => {
        console.error(data.toString());
    });

    resetNode.on('exit', function (code, signal) {
        if (code === 0) {
            console.log('graph node reset successfully');

            resetNode.stdout.removeAllListeners();
            resetNode.stderr.removeAllListeners();
            resetNode.removeAllListeners();

            runGraphNode(options);
        }
        else {
            console.log('Graph node reset failed');
        }
    });
}

function runGraphNode(options) {
    // now run the graph node using spawn
    const graphNode = spawn('docker-compose', ['up'], options);

    graphNode.on('exit', function (code, signal) {
        graphNode.removeAllListeners();
        process.exit(0);
    });

    graphNode.on('error', function (error) {
        console.log(`graph node error: ${error}`);
    });

    graphNode.stdout.on('data', (data) => {
        console.log(data.toString());
    });
    
    graphNode.stderr.on('data', (data) => {
        console.error(data.toString());
    });

    // shut down gracefully
    process.on('SIGINT', () => {
        console.log('\nKilling graph node nicely');

        graphNode.stdout.removeAllListeners();
        graphNode.stderr.removeAllListeners();

        graphNode.kill();
    });
}


main();
