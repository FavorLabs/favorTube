import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";

export const chains = {
    18: {
        chainId: 137,
        rpc: "https://polygon-rpc.com",
        tokenName: "MATIC",
    },
    19: {
        chainId: 80001,
        rpc: "https://polygon-testnet.public.blastapi.io",
        faucet: "https://faucet.polygon.technology/",
        tokenName: "MATIC",
    },
    20: {
        chainId: 1088,
        rpc: "https://andromeda.metis.io/?owner=1088",
        tokenName: "METIS",
    },
    21: {
        chainId: 66,
        rpc: "https://exchainrpc.okex.org",
        tokenName: "OKT",
    }
}

export const getChainInfo = () => {
    const config = sessionStorage.getItem('current_config');
    const network_id = sessionStorage.getItem("network_id");
    if (config) {
        const configObj = JSON.parse(config);
        const mergeConfig = {
            chainId: chains[network_id].chainId ?? chains[19].chainId,
            rpc: chains[network_id].rpc ?? chains[19].rpc,
            faucet: chains[network_id]?.faucet ?? chains[19]?.faucet,
            tokenName: chains[network_id].tokenName ?? chains[19].tokenName,
            ...configObj
        };
        return {
            chainId: mergeConfig.chainId,
            rpc: mergeConfig.rpc,
            faucet: mergeConfig.faucet,
            tokenName: mergeConfig.tokenName,
        };
    } else {
        // console.log('getChainInfo from local');
        return chains[network_id] ?? chains[19];
    }
}

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
        disConnect(provider, cb);

        localStorage.setItem("connect_type", "walletConnect");

        return {err: null, res: {web3, address}};
    } catch (e) {
        return {err: e.message || e, res: {}};
    }
}

export const connect = (connectType, cb) => {
    let chainInfo = getChainInfo();
    // console.log('chainInfo', chainInfo);

    if (connectType === "metaMask") {
        return ConnectMetaMask(chainInfo);
    } else if (connectType === "okx") {
        return ConnectOkx(chainInfo);
    }
    return ConnectWalletConnect(chainInfo, cb);
}

export const getWeb3 = async (cb) => {
    const type = localStorage.getItem("connect_type");
    return connect(type, cb);
}

export const disConnect = (provider, cb) => {
    provider.on("disconnect", () => {
        cb();
    });
}
