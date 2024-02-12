import { ethers } from "hardhat";
import zapperAbi from "../artifacts/contracts/Zapper.sol/Zapper.json"
import nftkAbi from "../artifacts/contracts/token/NFTKeeper.sol/NFTKeeper.json"

async function main() {
    // const NFTK: any = await ethers.getContractFactory("NFTKeeper");
    // const nftk: any = await NFTK.deploy();
    // await nftk.deployed();

    // const Zapper: any = await ethers.getContractFactory("Zapper");
    // const zapper: any = await Zapper.deploy(nftk.address);
    // await zapper.deployed();

    // console.log(`NFTK address is ${nftk.address}`);
    // console.log(`Zapper address is ${zapper.address}`);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});