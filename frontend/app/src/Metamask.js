import React, { Component } from 'react';
import { ethers } from "ethers";
import ZapperABI from "./abi/Zapper.json"
import NftkABI from "./abi/NFTKeeper.json"
import UniPairABI from "./abi/UniPair.json"
import UniFactoryV2 from "./abi/UniFactoryV2.json"
import UniRouterV2 from "./abi/UniFactoryV2.json"
import UsdcAbi from "./abi/Usdc.json"

class Metamask extends Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    async addLiquidity(erc20, erc721, pair, zapper, amount, nfts, router, receiver, deadline) {
        const gasPrice = ethers.parseUnits("21", "gwei");
        const gasLimit = 2100000;
        const gasConfig = { gasPrice: gasPrice, gasLimit: gasLimit };

        await erc721.setApprovalForAll(zapper.address, true);
        await erc20.approve(zapper.address, ethers.MaxUint256);

        console.log("Reserves before adding liquidity");
        console.log(await pair.getReserves());

        await zapper.addLiquidityWithNFT(
            erc20.address,
            erc721.address,
            pair.address,
            amount,
            nfts,
            router.address,
            receiver,
            deadline,
            gasConfig
        );

        console.log("Reserves after adding liquidity");
        console.log(await pair.getReserves());
    }

    async removeLiquidity(token0, token1, factory, router, receiver) {

    }

    async approveBeforeAddLiquidity(erc20, erc721) {

    }

    getContract(address, abi, provider) {
        const contract = new ethers.Contract(address, abi, provider)
        this.setState({ contract })
    }

    async connectToMetamask() {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.send("eth_requestAccounts", []);
        const balance = await provider.getBalance(accounts[0]);

        const balanceInEther = ethers.formatEther(balance);

        console.log(accounts)
///0x9136C680B025331E6F8C447a30522b93d9980cb6 pair
        const nftkContract = new ethers.Contract('0xbE747DbAdB03692653505cA03b570BD7677ddA9C', NftkABI.abi, provider)
        const uniFactoryV2 = new ethers.Contract('0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32', UniFactoryV2, provider)
        const uniRouterV2 = new ethers.Contract('0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff', UniRouterV2, provider)
        const usdc = new ethers.Contract('0x2791bca1f2de4661ed88a30c99a7a9449aa84174', UsdcAbi, provider)
        const pair = new ethers.Contract('0x9136C680B025331E6F8C447a30522b93d9980cb6', UniPairABI, provider);
        const tokenName = await nftkContract.name();
        const tokenBalance = await nftkContract.balanceOf(accounts[0]);
        const tokenUnits = await nftkContract.decimals();
        const tokenBalanceInEther = ethers.formatUnits(tokenBalance, tokenUnits);

        this.setState({
            selectedAddress: accounts[0],
            balance: balanceInEther,
            tokenName,
            tokenBalanceInEther,
            uniFactoryV2,
            uniRouterV2,
            nftkContract,
            usdc,
            pair
        })
    }

    renderMetamask() {
        if (!this.state.selectedAddress) {
            return (
                <button onClick={() => this.connectToMetamask()}>Connect to Metamask</button>
            )
        } else {
            return (
                <div>
                    <h1>NFT POOL</h1>
                    <h3>Your address {this.state.selectedAddress}</h3>
                    <p>Your MATIC Balance is: {this.state.balance}</p>
                    <p>Balance of NFTK token {this.state.tokenName} is: {this.state.tokenBalanceInEther}</p>

                    <button onClick={() => this.addLiquidity(this.state.usdc.address)}>Add liquidity</button>
                </div>
            );
        }
    }

    render() {
        return (
            <div>
                {this.renderMetamask()}
            </div>
        )
    }
}

export default Metamask;