import factoryArtifact from "@uniswap/v2-core/build/UniswapV2Factory.json";
import routerArtifact from "@uniswap/v2-periphery/build/UniswapV2Router02.json";
import weth9Artifact from "@uniswap/v2-periphery/build/WETH9.json";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import zapperAbi from "../frontend/app/src/abi/Zapper.json";

export async function deployTokens(owner: any) {
  const USDT = await ethers.getContractFactory("MockERC20", owner);
  const usdt = await USDT.deploy("USD token", "USDT");

  const NFTK = await ethers.getContractFactory("NFTKeeper", owner);
  const nftk = await NFTK.deploy();

  const MockERC721 = await ethers.getContractFactory("MockERC721", owner);
  const mockErc721 = await MockERC721.deploy();

  return { usdt, nftk, mockErc721 };
}

export async function deployZapper(owner: SignerWithAddress, nftk: any) {
  const Zapper = new ethers.ContractFactory(
    zapperAbi.abi,
    zapperAbi.bytecode,
    owner
  );
  const zapper = await Zapper.deploy(nftk.address);
  return { zapper };
}

export async function deployUniswap(owner: any) {
  let factory: any;
  let router: any;
  const Factory = new ethers.ContractFactory(
    factoryArtifact.abi,
    factoryArtifact.bytecode,
    owner
  );

  factory = await Factory.deploy(owner.address);
  let weth9 = await new ethers.ContractFactory(
    weth9Artifact.interface,
    weth9Artifact.bytecode,
    owner
  ).deploy();

  const Router = new ethers.ContractFactory(
    routerArtifact.abi,
    routerArtifact.bytecode,
    owner
  );

  router = await Router.deploy(factory.address, weth9.address);
  return { factory, router };
}
