import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";

let netWorkID = 80001;
export let rpc = "https://polygon-testnet.public.blastapi.io";

export const ConnectMetaMask = async () => {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
            const web3 = new Web3(window.ethereum);
            const chainId = await web3.eth.getChainId();
            if (chainId !== netWorkID) {
                return {err: "Please connect the correct chain", res: {}};
            }
            const address = accounts[0];
            return {err: null, res: {web3, address}};
        } catch (e) {
            return {err: e.message || e, res: {}};
        }

    } else {
        return {err: "Please install MetaMask first"};
    }
}

export const ConnectWalletConnect = async (cb) => {
    try {
        const provider = new WalletConnectProvider({
            rpc: {
                [netWorkID]: rpc,
            }
        });
        await provider.enable();
        const {chainId, accounts} = provider
        if (chainId !== netWorkID) {
            await provider.disconnect();
            return {err: "Please connect the correct chain", res: {}};
        }
        const address = accounts[0];
        const web3 = new Web3(provider);
        disConnect(provider, cb)
        return {err: null, res: {web3, address}};
    } catch (e) {
        return {err: e.message || e, res: {}};
    }
}

export const connect = (connectType, cb) => {

    if (connectType === "metaMask") {
        return ConnectMetaMask();
    }
    return ConnectWalletConnect(cb);
}

export const getWeb3 = async (cb) => {
    if (localStorage.getItem("walletconnect")) {
        return connect("walletConnect", cb);
    } else {
        return connect("metaMask");
    }
}

export const disConnect = (provider, cb) => {
    provider.on("disconnect", () => {
        cb();
    });
}
