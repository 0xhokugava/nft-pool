import React, { useState } from "react";
import { ethers } from "ethers";
import ZapperABI from "./abi/Zapper.json";
import NftkABI from "./abi/NFTKeeper.json";
import UniPairABI from "./abi/UniPair.json";
import UniFactoryV2 from "./abi/UniFactoryV2.json";
import UniRouterV2 from "./abi/UniFactoryV2.json";
import MockERC20Abi from "./abi/MockERC20.json";
import MockNftAbi from "./abi/MockNFT.json";

function Metamask() {
    const [metamaskState, setMetamaskState] = useState({
        selectedAddress: null,
        balance: null,
        tokenName: null,
        tokenBalanceInEther: null,
        uniFactoryV2: null,
        uniRouterV2: null,
        nftkContract: null,
        mockNft: null,
        zapper: null,
        usdc: null,
        signer: null,
        pair: null,
    });

    const connectToMetamask = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const accounts = await provider.send("eth_requestAccounts", []);

        const nftkContract = new ethers.Contract(
            "0xbE747DbAdB03692653505cA03b570BD7677ddA9C",
            NftkABI.abi,
            provider
        );
        const uniFactoryV2 = new ethers.Contract(
            "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
            UniFactoryV2,
            provider
        );
        const uniRouterV2 = new ethers.Contract(
            "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
            UniRouterV2,
            provider
        );
        const usdx = new ethers.Contract(
            "0xdE1D4d4f022252774c50b20f8Ae4BF942953a261",
            MockERC20Abi.abi,
            provider
        );
        const pair = new ethers.Contract(
            "0x9136C680B025331E6F8C447a30522b93d9980cb6",
            UniPairABI,
            provider
        );
        const zapper = new ethers.Contract(
            "0xA87eeA6C0DedC684D9F1CA6499c3bA12138C71b3",
            ZapperABI.abi,
            provider
        );
        const mockNft = new ethers.Contract(
            "0x5c3ecfa917a6ad5371a10b08b2aa086172604023",
            MockNftAbi,
            provider
        );

        const balance = await provider.getBalance(accounts[0]);
        const balanceInEther = ethers.formatEther(balance);
        const tokenName = await nftkContract.name();
        const tokenBalance = await nftkContract.balanceOf(accounts[0]);
        const tokenUnits = await nftkContract.decimals();
        const tokenBalanceInEther = ethers.formatUnits(tokenBalance, tokenUnits);

        const usdcBalance = await usdx.balanceOf(accounts[0]);
        const usdcUnits = await usdx.decimals();
        const usdcBalanceInEther = ethers.formatUnits(usdcBalance, usdcUnits);

        const mock721Balance = Number(await mockNft.balanceOf(accounts[0]));

        setMetamaskState({
            selectedAddress: accounts[0],
            balance: balanceInEther,
            tokenName: tokenName,
            tokenBalanceInEther: tokenBalanceInEther,
            uniFactoryV2: uniFactoryV2,
            uniRouterV2: uniRouterV2,
            nftkContract: nftkContract,
            mockNft: mockNft,
            zapper: zapper,
            usdcBalanceInEther: usdcBalanceInEther,
            mock721Balance: mock721Balance,
            signer: signer,
            pair: pair,
        });
    };

    const gasPrice = ethers.parseUnits("31", "gwei"); // Set your desired gas price
    const gasLimit = 3100000;

    const gasConfig = { gasPrice: gasPrice, gasLimit: gasLimit };
    let tokenId = 0
    const mintNft = async () => {
        await metamaskState.mockNft
            .connect(metamaskState.signer)
            .mint(metamaskState.signer, tokenId, gasConfig);
        tokenId++
    };

    // const addLiquidity = async () => {
    //     console.log(MockNftAbi);
    //     await MockNftAbi.setApprovalForAll(
    //         "0xA87eeA6C0DedC684D9F1CA6499c3bA12138C71b3",
    //         true
    //     );
    //     await NftkABI.approve(metamaskState.zapper.address, ethers.MaxUint256);

    //     console.log("Reserves before adding liquidity");
    //     console.log(await metamaskState.pair.getReserves());

    //     await ZapperABI.addLiquidityWithNFT(
    //         NftkABI.address,
    //         MockNftAbi.address,
    //         metamaskState.pair.address,
    //         metamaskState.amount,
    //         metamaskState.nfts,
    //         metamaskState.router.address,
    //         metamaskState.receiver,
    //         metamaskState.deadline,
    //         gasConfig
    //     );

    //     console.log("Reserves after adding liquidity");
    //     console.log(await metamaskState.pair.getReserves());
    // };

    return (
        <>
            {!metamaskState.selectedAddress && (
                <button onClick={connectToMetamask}>Connect to Metamask</button>
            )}

            {metamaskState.selectedAddress && (
                <div>
                    <h1>NFT POOL</h1>
                    <h3>Your address {metamaskState.selectedAddress}</h3>
                    <p>Your MATIC Balance is: {metamaskState.balance}</p>
                    <p>
                        Balance of {metamaskState.tokenName} token is: {metamaskState.tokenBalanceInEther}
                    </p>
                    <p>Your USDX Balance is: {metamaskState.usdcBalanceInEther}</p>
                    <p>Your NFT Balance is: {metamaskState.mock721Balance || 0}</p>

                    {/* <p>Pool reserves: {() => reserves() || 0}</p> */}
                    {/* <button onClick={() => mintTokens(7)}>Mint 7 Tokens</button> */}
                </div>
            )}
        </>
    );
}

export default Metamask;