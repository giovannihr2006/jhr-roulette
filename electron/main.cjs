const { app, BrowserWindow } = require('electron')
const path = require('path')

const isDev = !app.isPackaged

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true
        },
        title: 'GHR Ruleta Royale - Forensic Workstation',
        autoHideMenuBar: true,
        show: false
    })

    win.maximize()
    win.show()
    win.webContents.setZoomFactor(0.8)

    if (isDev) {
        win.loadURL('http://localhost:7777')
    } else {
        const indexPath = path.join(app.getAppPath(), 'dist', 'index.html')
        win.loadFile(indexPath)
    }
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
