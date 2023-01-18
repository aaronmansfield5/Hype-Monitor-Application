const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    changeWindow: (status) => ipcRenderer.send('changeWindow', status),
    goto: (status) => ipcRenderer.send('goto', status)
})