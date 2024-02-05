import { ethers } from "hardhat";
import {
  RandomNumbersGenerator,
  RandomNumbersGenerator__factory,
  VRFCoordinatorV2Mock,
  VRFCoordinatorV2Mock__factory,
} from "../typechain-types";
import { ContractReceipt, ContractTransaction, BigNumber } from "ethers";

let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock;
let randomizer: RandomNumbersGenerator;
let subscriptionId: BigNumber;

export const deployTest = async (): Promise<any> => {
  const BASE_FEE: string = "100000000000000000";
  const GAS_PRICE_LINK: string = "1000000000";

  let coordinatorMock: VRFCoordinatorV2Mock__factory =
    await ethers.getContractFactory("VRFCoordinatorV2Mock");

  let RandomNumbersGenerator: RandomNumbersGenerator__factory =
    await ethers.getContractFactory("RandomNumbersGenerator");

  vrfCoordinatorV2Mock = await coordinatorMock.deploy(BASE_FEE, GAS_PRICE_LINK);

  let tx: ContractTransaction = await vrfCoordinatorV2Mock.createSubscription();
  const transactionReceipt: ContractReceipt = await tx.wait(1);
  if (transactionReceipt.events) {
    subscriptionId = ethers.BigNumber.from(
      transactionReceipt.events[0].topics[1]
    );
  }

  await vrfCoordinatorV2Mock.fundSubscription(
    subscriptionId,
    ethers.utils.parseEther("7")
  );

  randomizer = await RandomNumbersGenerator.deploy(
    subscriptionId,
    vrfCoordinatorV2Mock.address
  );

  await vrfCoordinatorV2Mock.addConsumer(subscriptionId, randomizer.address);
  return { randomizer, vrfCoordinatorV2Mock };
};
