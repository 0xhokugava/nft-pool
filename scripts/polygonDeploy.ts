import { ethers } from "hardhat";
import zapperAbi from "../frontend/app/src/abi/Zapper.json";
import nftkAbi from "../frontend/app/src/abi/NFTKeeper.json";

async function main() {
  // const NFTK: any = await ethers.getContractFactory("NFTKeeper");
  // const nftk: any = await NFTK.deploy();
  // await nftk.deployed();

  // const Zapper: any = await ethers.getContractFactory("Zapper");
  // const zapper: any = await Zapper.deploy(nftk.address);
  // await zapper.deployed();

  // console.log(`NFTK address is ${nftk.address}`);
  // console.log(`Zapper address is ${zapper.address}`);

  const Erc721: any = await ethers.getContractFactory("MockERC721");
  const mockERC721: any = await Erc721.deploy();
  await mockERC721.deployed();

  console.log(`NFT mock address is ${mockERC721.address}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
