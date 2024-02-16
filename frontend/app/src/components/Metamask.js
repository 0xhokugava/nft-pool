import React, { useState } from "react";
import { ethers } from "ethers";
import ZapperABI from "../abi/Zapper.json";
import NftkABI from "../abi/NFTKeeper.json";
import UniPairABI from "../abi/UniPair.json";
import UniFactoryV2 from "../abi/UniFactoryV2.json";
import UniRouterV2 from "../abi/UniFactoryV2.json";
import UsdcAbi from "../abi/Usdc.json";
import MockNftAbi from "../abi/MockNFT.json";

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
    const usdc = new ethers.Contract(
      "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
      UsdcAbi,
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
      "0x5C3EcfA917A6AD5371a10b08B2aA086172604023",
      MockNftAbi,
      provider
    );

    const balance = await provider.getBalance(accounts[0]);
    const balanceInEther = ethers.formatEther(balance);
    const tokenName = await nftkContract.name();
    const tokenBalance = await nftkContract.balanceOf(accounts[0]);
    const tokenUnits = await nftkContract.decimals();
    const tokenBalanceInEther = ethers.formatUnits(tokenBalance, tokenUnits);

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
      usdc: usdc,
      signer: signer,
      pair: pair,
    });
  };

  const mintNft = async tokenIds => {
    if (tokenIds > 8) {
      console.log("Huge request");
    } else {
      for (let i = 1; i < tokenIds; i++) {
        await metamaskState.mockNft
          .connect(metamaskState.signer)
          .mint(metamaskState.signer, i);
      }
    }
  };

  const addLiquidity = async () => {
    const gasPrice = ethers.parseUnits("21", "gwei");
    const gasLimit = 2100000;
    const gasConfig = { gasPrice: gasPrice, gasLimit: gasLimit };
    console.log(MockNftAbi);
    await MockNftAbi.setApprovalForAll(
      "0xA87eeA6C0DedC684D9F1CA6499c3bA12138C71b3",
      true
    );
    await NftkABI.approve(metamaskState.zapper.address, ethers.MaxUint256);

    console.log("Reserves before adding liquidity");
    console.log(await metamaskState.pair.getReserves());

    await ZapperABI.addLiquidityWithNFT(
      NftkABI.address,
      MockNftAbi.address,
      metamaskState.pair.address,
      metamaskState.amount,
      metamaskState.nfts,
      metamaskState.router.address,
      metamaskState.receiver,
      metamaskState.deadline,
      gasConfig
    );

    console.log("Reserves after adding liquidity");
    console.log(await metamaskState.pair.getReserves());
  };

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
            Balance of NFTK token {metamaskState.tokenName} is:{" "}
            {metamaskState.tokenBalanceInEther}
          </p>

          <button onClick={() => mintNft(7)}>Mint 7 NFTs</button>
          <button onClick={addLiquidity}>Add liquidity</button>
        </div>
      )}
    </>
  );
}

export default Metamask;
