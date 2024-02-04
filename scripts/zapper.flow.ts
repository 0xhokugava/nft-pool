import { ethers } from "hardhat";
import pairArtifact from "@uniswap/v2-core/build/UniswapV2Pair.json";
import { deployTokens, deployUniswap, deployZapper } from "./deploy"

const gasPrice = ethers.utils.parseUnits("21", "gwei"); // Set your desired gas price
const gasLimit = 2100000;

const gasConfig = { gasPrice: gasPrice, gasLimit: gasLimit };

async function main() {
    //***** INIT SECTION START *******//
    const [owner, user1] = await ethers.getSigners();
    const projectTokens = await deployTokens(owner);
    const usdt = projectTokens.usdt;
    const nftk = projectTokens.nftk;
    const mockErc721 = projectTokens.mockErc721;
    const project = await deployZapper(owner, nftk);
    const uniswap = await deployUniswap(owner);
    const nftBatch = [1, 2, 3];
    const deadline = Math.floor(Date.now() / 1000 + (10 * 60))
    const usdtAmountForMint = ethers.utils.parseEther("3");
    //***** INIT SECTION END *******//

    /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
    /*                   ADD LIQUIDITY FLOW                       */
    /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/

    //***** MINT SECTION START *******//
    await usdt.mint(owner.address, usdtAmountForMint);
    for (let j = 1; j < 6; j++) {
        await projectTokens.mockErc721.connect(owner).mint(owner.address, j);
    }
    //***** MINT SECTION END *******//

    //***** PAIR SECTION START *******//
    await uniswap.factory.connect(owner).createPair(usdt.address, nftk.address);
    const pairAddress = await uniswap.factory.getPair(usdt.address, nftk.address);
    const pair = new ethers.Contract(pairAddress, pairArtifact.abi, owner);
    //***** PAIR SECTION END *******//

    //***** APPROVAL SECTION START *******//
    await projectTokens.mockErc721.connect(owner).setApprovalForAll(project.zapper.address, true);
    const userUsdtBalance = await usdt.balanceOf(owner.address);
    // Instant approve from sender to zapper contract
    await usdt.connect(owner).approve(project.zapper.address, ethers.constants.MaxUint256);
    //***** APPROVAL SECTION END *******//

    console.log("Reserves before adding liquidity");
    console.log(await pair.getReserves());
    await project.zapper.connect(owner).addLiquidityWithNFT(
        usdt.address,
        mockErc721.address,
        pair.address,
        userUsdtBalance,
        nftBatch,
        uniswap.router.address,
        owner.address,
        deadline,
        gasConfig
    );
    console.log("Reserves after adding liquidity");
    console.log(await pair.getReserves());


    /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
    /*                   REMOVE LIQUIDITY FLOW                    */
    /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/

    await pair.connect(owner).approve(project.zapper.address, ethers.constants.MaxUint256);

    await project.zapper.connect(owner).removeLiquidity(
        await pair.token0(),
        await pair.token1(),
        uniswap.factory.address,
        uniswap.router.address,
        owner.address,
        gasConfig
    );

    console.log("Reserves after liquidity removal");
    console.log(await pair.getReserves());
    console.log(`💰 User NFTK balance equals ${await nftk.balanceOf(owner.address)}`)
    console.log(`💰 User USDT balance equals ${await usdt.balanceOf(owner.address)}`)
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});