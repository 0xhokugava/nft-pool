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

    // const Erc721: any = await ethers.getContractFactory("MockERC721");
    // const mockERC721: any = await Erc721.deploy();
    // await mockERC721.deployed();

    const gasPrice = ethers.utils.parseUnits("61", "gwei"); // Set your desired gas price
    const gasLimit = 6100000;

    const gasConfig = { gasPrice: gasPrice, gasLimit: gasLimit };

    const USDY: any = await ethers.getContractFactory("MockERC20");
    const usdy: any = await USDY.deploy("USDY token", "USDY", gasConfig);
    await usdy.deployed();


    console.log(`USDY mock address is ${usdy.address}`);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});