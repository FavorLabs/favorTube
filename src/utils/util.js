import Web3 from "web3";
import {config} from "@/config/config";

export const isElectron =
    window.navigator.userAgent.toLowerCase().indexOf('electron') !== -1;

export const ipc = () => {
    if (isElectron) {
        return window.require('electron').ipcRenderer;
    }
    return null;
}

export const websocket = (host) => {
    let ws = new Web3.providers.WebsocketProvider(host, {
        reconnect: {
            auto: true,
        }
    });
    ws.on(ws.DATA, (res) => {
        ws.emit(res.params.subscription, res.params.result)
    })
    return ws;
}
export const stringToBinary = (b, len) => {
    let value = '';
    let uStr = window.atob(b);
    for (let i = 0; i < uStr.length; i++) {
        let char = uStr.charCodeAt(i).toString(2);
        char = char.split('').reverse().join('');
        value += char + '0'.repeat(8 - char.length);
    }
    if (len < value.length) {
        value = value.substr(0, len);
    }
    return value;
};

export const getDownloadNumber = (b) => {
    return b.match(/1/g)?.length || 0;
};

export const getProgress = (b, len) => {
    const oneLen = b.match(/1/g)?.length || 0;
    return (oneLen / len) * 100;
};


export const splicingBit = (a, b, len) => {
    let ecA = window.atob(a);
    let ecB = window.atob(b);
    let str = "";
    for (let i = 0; i < ecA.length; i++) {
        let n = ecA.charCodeAt(i) | ecB.charCodeAt(i);
        n = n.toString(2).split('').reverse().join('');
        str += n + '0'.repeat(8 - n.length);
    }
    return str.substring(0, len)
}

export const random = (a, b) => {
    if (a > b) [a, b] = [b, a];
    return Math.round(Math.random() * (b - a) + a);
}

export const query = (params) => {
    let newParams = {
        page: JSON.stringify(params.page || {}),
        sort: JSON.stringify(params.sort || {}),
        filter: JSON.stringify(params.filter || []),
    }
    return Object.keys(newParams).map(key => [key, newParams[key]].map(encodeURIComponent).join('=')).join('&');
}

export const randomHex = () => {
    return `#${Math.floor(Math.random() * 0xffffff).toString(16).padEnd(6, "0")}`;
}


export const getVideoLimitSize = () => config.videoLimitSize;

export const getSize = (size, level = 0) => {
    let levelList = ['KB', 'MB', 'GB', 'TB'];
    let n = 0;
    while (size >= Math.pow(1024, n + 1)) {
        n++;
    }
    return (
        parseFloat((size / Math.pow(1024, n)).toFixed(2)) +
        ' ' +
        levelList[level + n]
    );
};


export const disconnect = async (_this) => {
    if (_this.$store.state.auth.isUserLoggedIn) {
        await _this.$store.dispatch('signOut');
        if (_this.$route.name !== "Home") {
            await _this.$router.push("/");
        }
    }
}

export const getQueryString = (options) => {
    const arr = [];
    for (let key in options) {
        if (options[key]) {
            arr.push(`${key}=${options[key]}`);
        }
    }
    return arr.length ? `?${arr.join('&')}` : '';
}

