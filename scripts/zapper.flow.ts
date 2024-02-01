import { expect } from "chai";
import { ethers } from "hardhat";
import pairArtifact from "@uniswap/v2-core/build/UniswapV2Pair.json";
import { deployTokens, deployUniswap, deployZapper } from "./common"

const gasPrice = ethers.utils.parseUnits("21", "gwei"); // Set your desired gas price
const gasLimit = 2100000;

const gasConfig = { gasPrice: gasPrice, gasLimit: gasLimit };

async function main() {
    // SETUP section
    const [owner, user1] = await ethers.getSigners();
    const projectTokens = await deployTokens(owner);
    const usdt = projectTokens.usdt;
    const nftk = projectTokens.nftk;
    const mockErc721 = projectTokens.mockErc721;
    const project = await deployZapper(owner, nftk);
    const uniswap = await deployUniswap(owner);
    const nftBatch = [1,2,3];

    //Mint section
    // USDT minted to owner
    const usdtAmountForMint = ethers.utils.parseEther("3");
    await usdt.mint(owner.address, usdtAmountForMint);

    // Mint NFTs to owner (5 items)
    for (let j = 1; j < 6; j++) {
        await projectTokens.mockErc721.connect(owner).mint(owner.address, j);
    }
    console.log(`owner nft balance is ${await mockErc721.balanceOf(owner.address)}`);

    // Create pair
    await uniswap.factory.connect(owner).createPair(usdt.address, nftk.address);
    const pairAddress = await uniswap.factory.getPair(usdt.address, nftk.address);

    const pair = new ethers.Contract(pairAddress, pairArtifact.abi, owner);

    await projectTokens.mockErc721.connect(owner).setApprovalForAll(project.zapper.address, true);

    const userUsdtBalance = await usdt.balanceOf(owner.address);
    console.log(`User USDT balance equals ${userUsdtBalance}`)

    await usdt.connect(owner).approve(uniswap.router.address, ethers.constants.MaxUint256);
    await nftk.connect(owner).approve(uniswap.router.address, ethers.constants.MaxUint256);

    const deadline = Math.floor(Date.now() / 1000 + (10 * 60))

    const addLiquidity = await project.zapper.connect(owner).addLiquidityWithNFT(
        usdt.address,
        nftk.address,
        pair.address,
        userUsdtBalance,
        nftBatch,
        uniswap.router.address,
        owner.address, 
        deadline, 
        gasConfig
    );
    console.log(addLiquidity);
    console.log(await pair.getReserves());
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});