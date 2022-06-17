// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, Tray, dialog} = require('electron');
const path = require('path');
const {ipcMain} = require('electron');
const {run} = require('./utils');
// const fs = require('fs');

// app.disableHardwareAcceleration();

let win;
let tray;
let logs = [];

let menuExit = false;

function quit(status = true) {
    win.emit("kill");
    if (status) app.quit();
}

function restart() {
    quit(false);
    logs = [];
    win.webContents.send('logs', logs);
    win.webContents.send('startLoading');
    start();
}

function start() {
    run({win, logs});
}


async function createWindow() {
    Menu.setApplicationMenu(null);

    // Create the browser window.
    win = new BrowserWindow({
        show: false,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: false,
        },
    });

    win.on('close', (e) => {
        if (menuExit) return;
        const choice = dialog.showMessageBoxSync(win, {
            message: 'Are you sure you want to quit?',
            type: 'info',
            buttons: ['Cancel', 'Ok'],
        });
        if (choice === 0 && e) {
            e.preventDefault();
        }
    });

    start();

    // Create the menu
    tray = new Tray('./public/favicon.png'); // sets tray icon image
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Clear Cache',
            click: () => {
                win.webContents.session.clearStorageData();
                restart();
            }
        },
        {
            label: 'Restart',
            click: () => {
                restart();
            }, // click event
        },
        {
            label: 'Exit',
            click: () => {
                menuExit = true;
                quit();
            },
        },
    ]);

    tray.setContextMenu(contextMenu);

    // and load the index.html of the app.
    if (process.env.TERGET_ENV) {
        win.loadURL("http:localhost:8080")
    } else {
        win.loadFile('./dist/index.html');
    }

    win.webContents.addListener(
        'new-window',
        (event, url) => {
            event.preventDefault();
            let openWin = new BrowserWindow({
                webPreferences: {
                    preload: path.join(__dirname, 'preload.js'),
                    webSecurity: false,
                },
            });
            openWin.loadURL(url);
            openWin.webContents.session.addListener(
                'will-download',
                () => {
                    openWin.destroy();
                },
            );
        },
    );

    win.maximize();
    win.show();

    // Open the DevTools.

    process.env.TERGET_ENV && win.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        quit();
    }
});

ipcMain.on('restart', async () => {
    restart();
});

