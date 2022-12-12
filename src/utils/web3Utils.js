import Web3 from "web3";
import {config} from "@/config/config";
import WalletConnectProvider from "@walletconnect/web3-provider";
import {METAMASK, OKX, WALLET_CONNECT} from "@/config/constants";

export const ConnectMetaMask = async (refresh) => {
    const provider = window.ethereum;
    if (!provider) throw new Error("No metamask installed");
    const status = await provider._metamask.isUnlocked();
    if (!status && refresh) throw new Error("Metamask locked");
    const accounts = await provider.request({method: 'eth_requestAccounts'});
    const web3 = new Web3(provider);
    const chainId = await web3.eth.getChainId();
    if (chainId !== config.chainId) throw new Error("The network connected is not correct");
    return {web3, address: accounts[0]}
}

export const ConnectOkx = async () => {
    const provider = window.okexchain;
    if (!provider) throw new Error("No OKX installed");
    const accounts = await provider.enable();
    const web3 = new Web3(provider);
    const chainId = Number(provider.chainId);
    if (chainId !== config.chainId) throw new Error("The network connected is not correct");
    return {web3, address: accounts[0]}
}

export const ConnectWalletConnect = async (refresh) => {
    const provider = new WalletConnectProvider({
        rpc: {
            [config.chainId]: config.chainEndpoint,
        }
    })
    await provider.enable();
    if (refresh && !provider.connected) {
        await provider.connector.killSession();
        throw new Error("Connection interruption")
    }
    const {chainId, accounts} = provider
    if (chainId !== config.chainId) {
        await provider.disconnect();
        throw new Error("The network connected is not correct");
    }
    const web3 = new Web3(provider);
    return {web3, address: accounts[0]}
}

export const connect = (connectType, refresh = false) => {
    return connectType === METAMASK ? ConnectMetaMask(refresh) :
        connectType === OKX ? ConnectOkx() :
            connectType === WALLET_CONNECT ? ConnectWalletConnect(refresh) : Promise.reject();
}
