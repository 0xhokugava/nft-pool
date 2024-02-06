import { ethers } from "hardhat";
import { deployTokens, deployUniswap, deployZapper } from "./deploy";

export async function init(owner: any) {
    const projectTokens = await deployTokens(owner);
    const usdt = projectTokens.usdt;
    const nftk = projectTokens.nftk;
    const mockErc721 = projectTokens.mockErc721;
    const project = await deployZapper(owner, nftk);
    const uniswap = await deployUniswap(owner);
    const nftBatch = [1, 5, 4];
    const deadline = Math.floor(Date.now() / 1000 + (10 * 60))
    const usdtAmountForMint = ethers.utils.parseEther("3");

    return { usdt, nftk, mockErc721, project, uniswap, nftBatch, deadline, usdtAmountForMint }
}