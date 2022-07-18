import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";

export const chain = {
    19: {
        chainId: 80001,
        rpc: "https://polygon-testnet.public.blastapi.io",
        faucet: "https://faucet.polygon.technology/"
    },
    20: {
        chainId: 588,
        rpc: "https://stardust.metis.io/?owner=588",
        faucet: "https://faucet.metissafe.tech/"
    },
    21: {
        chainId: 65,
        rpc: "https://exchaintestrpc.okex.org",
        faucet: "https://www.okx.com/cn/okc/faucet"
    }
}

export const getChainInfo = () => {
    let network_id = sessionStorage.getItem("network_id");
    return chain[network_id] ?? chain[19]
}

export const ConnectMetaMask = async (chainInfo) => {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
            const web3 = new Web3(window.ethereum);
            const chainId = await web3.eth.getChainId();
            if (chainId !== chainInfo.chainId) {
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

export const ConnectWalletConnect = async (chainInfo, cb) => {
    try {
        const provider = new WalletConnectProvider({
            rpc: {
                [chainInfo.chainId]: chainInfo.rpc,
            }
        });
        await provider.enable();
        const {chainId, accounts} = provider
        if (chainId !== chainInfo.chainId) {
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
    let chainInfo = getChainInfo();
    if (connectType === "metaMask") {
        return ConnectMetaMask(chainInfo);
    }
    return ConnectWalletConnect(chainInfo, cb);
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
