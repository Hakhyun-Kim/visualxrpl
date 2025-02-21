const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendXRP: (data) => ipcRenderer.invoke('send_xrp', data)
}); 