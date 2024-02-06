import { ethers } from "hardhat";
import pairArtifact from "@uniswap/v2-core/build/UniswapV2Pair.json";
import { init } from "./init";

const gasPrice = ethers.utils.parseUnits("21", "gwei");
const gasLimit = 2100000;

const gasConfig = { gasPrice: gasPrice, gasLimit: gasLimit };

async function main() {
    //***** INIT SECTION *******//
    const [owner, user1] = await ethers.getSigners();
    const config = await init(owner);

    /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
    /*                   ADD LIQUIDITY FLOW                       */
    /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/

    //***** MINT SECTION *******//
    await config.usdt.connect(owner).mint(owner.address, config.usdtAmountForMint);
    await config.usdt.connect(owner).mint(user1.address, config.usdtAmountForMint);
    for (let j = 1; j < 6; j++) {
        await config.mockErc721.connect(owner).mint(owner.address, j);
    }

    //***** PAIR SECTION *******//
    await config.uniswap.factory.connect(owner).createPair(config.usdt.address, config.nftk.address);
    const pairAddress = await config.uniswap.factory.getPair(config.usdt.address, config.nftk.address);
    const pair = new ethers.Contract(pairAddress, pairArtifact.abi, owner);

    //***** APPROVAL SECTION *******//
    await config.mockErc721.connect(owner).setApprovalForAll(config.project.zapper.address, true);
    const userUsdtBalance = await config.usdt.balanceOf(owner.address);
    // Instant approve from sender to zapper contract
    await config.usdt.connect(owner).approve(config.project.zapper.address, ethers.constants.MaxUint256);

    console.log("Reserves before adding liquidity");
    console.log(await pair.getReserves());
    await config.project.zapper.connect(owner).addLiquidityWithNFT(
        config.usdt.address,
        config.mockErc721.address,
        pair.address,
        userUsdtBalance,
        config.nftBatch,
        config.uniswap.router.address,
        owner.address,
        config.deadline,
        gasConfig
    );
    console.log("Reserves after adding liquidity");
    console.log(await pair.getReserves());


    /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
    /*                          SWAP FLOW                         */
    /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/

    console.log(`💰 USDT balance of owner is ${await config.usdt.balanceOf(owner.address)} and user1 balance is ${await config.usdt.balanceOf(user1.address)}`);

    await config.usdt.connect(user1).approve(config.project.zapper.address, ethers.constants.MaxUint256);
    await config.project.zapper.connect(user1).swap(
        config.usdt.address, 
        config.nftk.address, 
        ethers.utils.parseEther("1"), 
        user1.address,
        config.uniswap.router.address,
        gasConfig
    );

    console.log(`💰 USDT fee balance of contract is ${await config.project.zapper.getFeeBalance(config.usdt.address)}`);
    console.log(`💰 USDT balance after swap of owner is ${await config.usdt.balanceOf(owner.address)} and user1 balance is ${await config.usdt.balanceOf(user1.address)}`);
    console.log(`💰 NFTS balance after swap of owner is ${await config.nftk.balanceOf(owner.address)} and user1 balance is ${await config.nftk.balanceOf(user1.address)}`);

    /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
    /*                   REMOVE LIQUIDITY FLOW                    */
    /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/

    await pair.connect(owner).approve(config.project.zapper.address, ethers.constants.MaxUint256);

    await config.project.zapper.connect(owner).removeLiquidity(
        await pair.token0(),
        await pair.token1(),
        config.uniswap.factory.address,
        config.uniswap.router.address,
        owner.address,
        gasConfig
    );

    console.log("Reserves after liquidity removal");
    console.log(await pair.getReserves());
    console.log(`💰 User NFTK balance equals ${await config.nftk.balanceOf(owner.address)}`)
    console.log(`💰 User USDT balance equals ${await config.usdt.balanceOf(owner.address)}`)


    await config.usdt.connect(owner).mint(owner.address, config.usdtAmountForMint);

    let balance = await config.mockErc721.balanceOf(config.project.zapper.address);

    console.log("NFT balance " + balance);

    await config.project.zapper.lotteryOption(config.mockErc721.address, config.usdt.address);

    balance = await config.mockErc721.balanceOf(config.project.zapper.address);
    console.log("NFT balance " + balance);
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});