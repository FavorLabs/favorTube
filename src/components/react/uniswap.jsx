import React, {useState} from "react";
import ReactDom from "react-dom/client";
// eslint-disable-next-line no-unused-vars
import {SwapWidget, Field, TradeType} from '@uniswap/widgets'
// eslint-disable-next-line no-unused-vars
import {tokens} from '@uniswap/default-token-list'
import {Token} from '@uniswap/sdk-core'
import '@uniswap/widgets/dist/fonts.css'
import BigNumber from "bignumber.js";

const Uniswap = (props) => {
    const {provider, uniConfig} = props.vue;
    // eslint-disable-next-line no-unused-vars
    const {chainId, favorTokenAddress, favorTubeAddress, decimal, name, symbol, price} = uniConfig;
    const value = BigNumber(price).div(BigNumber(10).pow(decimal))
    // eslint-disable-next-line no-unused-vars
    const [input, setInput] = useState()
    // eslint-disable-next-line no-unused-vars
    const token = new Token(chainId, favorTokenAddress, decimal, symbol, name);
    return <>
        <SwapWidget
            contractAddress={favorTubeAddress}
            value={{
                type: TradeType.EXACT_OUTPUT,
                amount: value.toString(),
                [Field.OUTPUT]: token,
                [Field.INPUT]: input,
            }}
            defaultChainId={80001}
            className={"uniswap"}
            hideConnectionUI
            tokenList={tokens}
            provider={provider}
            brandedFooter={false}
            onSwapPriceUpdate={(trade, state) => {
                console.log('onSwapPriceUpdate', trade);
                props.vue.$emit("priceUpdate", trade, state);
            }}
            onDisableUpdate={(disable, approved) => {
                // console.log('onDisableUpdate', disable, approved);
                props.vue.$emit("disableUpdate", disable, approved);
            }}
            onTokenChange={(field, token) => {
                field === Field.INPUT && setInput(token)
            }}
        />
    </>
}

export default Uniswap;

let root = null;
export const mount = (container, props) => {
    root = ReactDom.createRoot(container);
    root.render(React.createElement(Uniswap, props, null));
}
export const update = (container, props) => {
    root.render(React.createElement(Uniswap, props, null));
}

export const unmount = () => {
    root.unmount();
}
