import factoryArtifact from "@uniswap/v2-core/build/UniswapV2Factory.json";
import routerArtifact from "@uniswap/v2-periphery/build/UniswapV2Router02.json";
import pairArtifact from "@uniswap/v2-periphery/build/IUniswapV2Pair.json";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import uniPairAbi from "../scripts/abi/uniswappair.abi.json"
import zapperAbi from "../artifacts/contracts/Zapper.sol/Zapper.json"

async function main() {
    const [owner, user1, user2] = await ethers.getSigners();
    let factory: any;
    let router: any;
    let zapper: any;
    console.log(`Deploying contracts with the account: ${owner.address}`);
    const Factory = new ethers.ContractFactory(
        factoryArtifact.abi,
        factoryArtifact.bytecode,
        owner
    );
    factory = await Factory.deploy(owner.address);


    const USDT = await ethers.getContractFactory("MockERC20", owner);
    const usdt = await USDT.deploy("USD token", "USDT");
    console.log(`USDT deployed to ${usdt.address}`);

    const Router = new ethers.ContractFactory(
        routerArtifact.abi,
        routerArtifact.bytecode,
        owner
    );
    router = await Router.deploy(factory.address, usdt.address);

    const NFTK = await ethers.getContractFactory("NFTKeeper", owner);
    const nftk = await NFTK.deploy("NFT Keeper", "NFTK");
    console.log(`NFTK deployed to ${nftk.address}`);

    const MockERC721 = await ethers.getContractFactory("MockERC721", owner);
    const mockErc721 = await MockERC721.deploy();
    console.log(`NFTK deployed to ${mockErc721.address}`);

    const pairAddress = await factory.connect(owner).createPair(usdt.address, nftk.address);
    const pairCreated = await pairAddress.wait();
    // const eventsLength = pairCreated.events.length;
    const pairCreationEvent = await pairCreated.events[0];
    const monkeyPairAddress = pairCreationEvent.args.pair;
    console.log(`Pair is on ${monkeyPairAddress} address`);

    const MonkeyPair = new ethers.Contract(monkeyPairAddress, uniPairAbi, owner)
    const token0 = await MonkeyPair.token0();
    const token1 = await MonkeyPair.token1();

    if (usdt.address > nftk.address) {
        expect(token0).to.be.equals(nftk.address);
        expect(token1).to.be.equals(usdt.address);
    } else {
        expect(token0).to.be.equals(usdt.address);
        expect(token1).to.be.equals(nftk.address);
    }

    const Zapper = new ethers.ContractFactory(
        zapperAbi.abi,
        zapperAbi.bytecode,
        owner
    );
    zapper = await Zapper.deploy(nftk.address);

    for (let j = 1; j < 6; j++) {    
        await mockErc721.connect(owner).mint(user1.address, j);
    }

    console.log(`user1 nft balance is ${await mockErc721.balanceOf(user1.address)}`);

    const addLiquidity = await zapper.connect(user1).addLiquidityWithNFT(
        usdt.address,
        mockErc721.address, 
        monkeyPairAddress, 
        100, 
        [1], 
        router.address, 
        user1.address
    );
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});