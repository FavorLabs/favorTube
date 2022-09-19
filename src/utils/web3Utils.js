import Web3 from "web3";
import {config} from "@/config/config";
import WalletConnectProvider from "@walletconnect/web3-provider";

export const ConnectMetaMask = async (chainInfo) => {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
            const web3 = new Web3(window.ethereum);
            const chainId = await web3.eth.getChainId();
            if (chainId !== chainInfo.chainId) {
                return {err: "Please connect the correct chain"};
            }
            const address = accounts[0];
            localStorage.setItem("connect_type", "metaMask");
            return {err: null, res: {web3, address}};
        } catch (e) {
            return {err: e.message || e, res: {}};
        }

    } else {
        return {err: "Please install MetaMask first"};
    }
}

export const ConnectOkx = async (chainInfo) => {
    const okexchain = window.okexchain;
    if (okexchain) {
        try {
            const accounts = await okexchain.enable();

            const web3 = new Web3(okexchain);

            const chainId = Number(okexchain.chainId);

            if (chainId !== chainInfo.chainId) {
                return {err: "Please connect the correct chain"};
            }
            const address = accounts[0];

            localStorage.setItem("connect_type", "okx");

            return {err: null, res: {web3, address}};
        } catch (e) {
            return {err: e.message || e};
        }

    } else {
        return {err: "Please install OKX Wallet"};
    }
}

export const ConnectWalletConnect = async (chainInfo, cb) => {
    try {
        const provider = new WalletConnectProvider({
            rpc: {
                [chainInfo.chainId]: chainInfo.chainEndpoint,
            }
        })
        await provider.enable();
        const {chainId, accounts} = provider
        if (chainId !== chainInfo.chainId) {
            await provider.disconnect();
            return {err: "Please connect the correct chain", res: {}};
        }
        const address = accounts[0];
        const web3 = new Web3(provider);
        disConnect(provider, cb);

        localStorage.setItem("connect_type", "walletConnect");

        return {err: null, res: {web3, address}};
    } catch (e) {
        return {err: e.message || e, res: {}};
    }
}

export const connect = (connectType, cb) => {
    let chainInfo = config;

    if (connectType === "metaMask") {
        return ConnectMetaMask(chainInfo);
    } else if (connectType === "okx") {
        return ConnectOkx(chainInfo);
    }
    return ConnectWalletConnect(chainInfo, cb);
}

export const getWeb3 = async (cb) => {
    const type = localStorage.getItem("connect_type");
    if (type === 'metaMask') {
        const status = await window.ethereum._metamask.isUnlocked();
        if (!status) return {err: "metamask lock"}
    }
    return connect(type, cb);
}

export const disConnect = (provider, cb) => {
    provider.on("disconnect", () => {
        cb();
    });
}
