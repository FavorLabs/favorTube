const os = require('os');
const {spawn} = require('child_process');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

let cmdPath = path.join(__dirname, '../favor');
let startCmd = os.platform() === 'win32' ? 'favorX.exe' : './favorX';
let cmd = '--config=favorx.yaml';

let workerProcess;

function run({win, logs, data}) {

    win.once("kill", () => {
        workerProcess.kill();
    });

    return runExec();

    function runExec() {

        workerProcess = spawn(startCmd, [cmd, 'start', ...getConfig(data)], {
            cwd: cmdPath,
        });

        win.webContents.once('did-finish-load', () => {
            win.webContents.send('stopLoading');
        });

        let notStart = true;

        let writeLog = (log) => {
            let fileName =
                'favor__' + moment().format('YYYY_MM_DD') + '.log';

            let logPath = os.platform() === 'win32' ? cmdPath : os.tmpdir();

            fs.appendFile(path.join(logPath, fileName), log, (err) => {
                if (err) console.log(err);
            });
        }

        workerProcess.stdout.on('data', (data) => {
            let log = data.toString();
            console.log('stdout:' + log);
            if (!win.isDestroyed() && notStart) {
                win.webContents.send('getLogInfo', log);
            }
            let re = /\Sapi address: http(s?):\/\/\[::]:(\d*)/;
            if (notStart && re.test(log)) {
                notStart = false;
                win?.webContents.send('start', {api: 'http://localhost:' + log.match(re)[2]});
            }
            let n = logs.push(log);
            if (n >= 300) logs.splice(0, 100);
            writeLog(log);
        });

        workerProcess.stderr.on('data', (data) => {
            let log = data.toString();
            console.log('stdout:' + log);
            if (!win.isDestroyed() && notStart) {
                win.webContents.send('getLogInfo', log);
            }
            logs.push(log);
            writeLog(log);
        });

        workerProcess.on('close', function (code) {
            if (code) {
                setTimeout(() => {
                    runExec();
                }, 3000)
            }
            console.log('out code:' + code);
        });
    }
}

function getConfig(data) {
    let configList = [];
    if (data) {
        configList.push(`--network-id=${data.networkId}`);
        configList.push(`--chain-endpoint=${data.chainEndpoint}`);
        configList.push(`--oracle-contract-addr=${data.oracleContractAddr}`);
        configList.push(`--bootnode=${data.bootNode}`);
        configList.push(`--traffic-enable=${data.traffic}`);
        configList.push(`--traffic-contract-addr=${data.trafficContractAddr}`);
    }
    return configList;
}

module.exports = {
    run,
};
