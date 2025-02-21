const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const xrpl = require("xrpl");

let win;
let client;

// Initialize XRPL client and connect when app is ready
async function initializeXRPL() {
    client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    try {
        await client.connect();
        console.log("Connected to XRPL Testnet");
    } catch (error) {
        console.error("Failed to connect to XRPL:", error);
    }
}

app.whenReady().then(async () => {
    win = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    win.loadFile("index.html");
    
    // Open DevTools for debugging (optional)
    win.webContents.openDevTools();
    
    await initializeXRPL();
});

// Handle app closing
app.on('window-all-closed', async () => {
    if (client && client.isConnected()) {
        await client.disconnect();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Handle transactions
ipcMain.handle("send_xrp", async (event, data) => {
    try {
        const wallet = xrpl.Wallet.fromSeed(data.sender_secret);
        const transaction = {
            TransactionType: "Payment",
            Account: wallet.classicAddress,
            Destination: data.destination,
            Amount: (data.amount * 1000000).toString()
        };
        const prepared = await client.autofill(transaction);
        const signed = wallet.sign(prepared);
        const result = await client.submitAndWait(signed.tx_blob);

        return { success: true, tx_hash: result.result.hash };
    } catch (error) {
        return { success: false, error: error.message };
    }
});