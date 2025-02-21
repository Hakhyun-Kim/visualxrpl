const { ipcRenderer } = require("electron");
const React = require("react");
const ReactDOM = require("react-dom");
const ReactFlow = require("react-flow-renderer");

function XRPLFlow() {
    const initialNodes = [
        { id: "1", type: "input", data: { label: "Start" }, position: { x: 250, y: 50 } },
        { id: "2", data: { label: "Send XRP" }, position: { x: 250, y: 150 } },
        { id: "3", data: { label: "Check Balance" }, position: { x: 250, y: 250 } },
        { id: "4", type: "output", data: { label: "End" }, position: { x: 250, y: 350 } }
    ];

    const initialEdges = [
        { id: "e1-2", source: "1", target: "2" },
        { id: "e2-3", source: "2", target: "3" },
        { id: "e3-4", source: "3", target: "4" }
    ];

    const onNodeClick = async (event, node) => {
        if (node.data.label === "Send XRP") {
            const result = await ipcRenderer.invoke("send_xrp", {
                sender_secret: "your_secret",
                destination: "rRecipientAddress",
                amount: 10
            });
            alert(result.success ? `TX Sent: ${result.tx_hash}` : `Error: ${result.error}`);
        } else if (node.data.label === "Check Balance") {
            const balance = await ipcRenderer.invoke("get_balance", "your_wallet_address");
            alert(`Balance: ${balance.balance} drops`);
        }
    };

    return (
        <ReactFlow
            elements={[...initialNodes, ...initialEdges]}
            onNodeClick={onNodeClick}
            style={{ width: "100%", height: "100vh" }}
        />
    );
}

ReactDOM.render(<XRPLFlow />, document.getElementById("root"));