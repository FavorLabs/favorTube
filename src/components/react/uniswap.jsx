import React, {useState} from "react";
import ReactDom from "react-dom/client";
// eslint-disable-next-line no-unused-vars
import {SwapWidget, Field, TradeType} from '@uniswap/widgets'
// eslint-disable-next-line no-unused-vars
import {tokens} from '@uniswap/default-token-list'
import {Token} from '@uniswap/sdk-core'
import '@uniswap/widgets/dist/fonts.css'
let root = null;

const Uniswap = (props) => {
    const {provider, uniConfig} = props.vue;
    console.log(props, uniConfig)
    // eslint-disable-next-line no-unused-vars
    const [input, setInput] = useState()
    // eslint-disable-next-line no-unused-vars
    // const token = new Token(80001, `0xd9e990ceb3728c43fb28d15b44c5b8c1a136db13`, 3, 'FTUBE', 'Favor Token')
    const token = new Token(uniConfig.chainId, uniConfig.favorTokenAddress, uniConfig.decimal, uniConfig.symbol, uniConfig.name);
    return <>
        <SwapWidget
            contractAddress={uniConfig.favorTubeAddress}
            value={{
                type: TradeType.EXACT_OUTPUT,
                amount: '1',
                [Field.OUTPUT]: token,
                [Field.INPUT]: input,
            }}
            defaultChainId={80001}
            className={"uniswap"}
            hideConnectionUI
            tokenList={tokens}
            provider={provider}
            brandedFooter={false}
            onSwapPriceUpdate={(trade) => {
                console.log('onSwapPriceUpdate', trade);
                props.vue.$emit("priceUpdate", trade.inputAmount.toExact(), trade.outputAmount.toExact());
            }}
            onDisableUpdate={(disable, approved) => {
                console.log('onDisableUpdate', disable, approved);
                props.vue.$emit("disableUpdate", disable, approved);
            }}
            onTokenChange={(field, token) => {
                field === Field.INPUT && setInput(token)
            }}
        />
    </>
}

const NullNode = () => {
    return <></>
}

export default Uniswap;

export const mount = (container, props) => {
    root = ReactDom.createRoot(container);
    root.render(React.createElement(Uniswap, props, null));
}

export const unmount = (container, props) => {
    root.render(React.createElement(NullNode, props, null));
}
