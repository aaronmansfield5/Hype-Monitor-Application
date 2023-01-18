const electron = require('electron');
const app=electron.app;
const BrowserWindow=electron.BrowserWindow;
const ipcMain=electron.ipcMain;

const path=require('path');
const url=require('url');

let win;

function createWindow(){
    win=new BrowserWindow({
        width: 1100,
        height: 600,
        webPreferences:{
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true,
            contextIsolation: true,
            enableRemoteModule: true
        },
        autoHideMenuBar: true,
        frame: false,
        hasShadow: true,
        resizable: false
    });
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
    }));

    //win.webContents.openDevTools()

    win.on('close', function(){
        win=null
    });
}

app.whenReady().then(() => {
    ipcMain.on('changeWindow', (event, status) => {
        if(status == "close") {
            BrowserWindow.getFocusedWindow().close()
        } else if(status == "min") {
            BrowserWindow.getFocusedWindow().minimize()
        } else if(status == "max") {
            const window = BrowserWindow.getFocusedWindow()
            if (!window.isMaximized()) {
           window.maximize();          
       } else {
           window.unmaximize();
       }
        }
    })

    ipcMain.on('goto', (event, link) => {
        require('electron').shell.openExternal(link);
    })
    createWindow()
})