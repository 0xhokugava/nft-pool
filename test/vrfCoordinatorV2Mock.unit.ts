import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import "dotenv/config";
import {
  RandomNumbersGenerator,
  VRFCoordinatorV2Mock,
} from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { deployTest } from "./deployVRF.ts";

describe("vrfCoordinatorV2Mock unit test", async () => {
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock;
  let randomizer: RandomNumbersGenerator;

  let testDeploy: any;

  beforeEach(async () => {
    testDeploy = await deployTest();
    randomizer = testDeploy.randomizer;
    vrfCoordinatorV2Mock = testDeploy.vrfCoordinatorV2Mock;
    [owner, user] = await ethers.getSigners();
  });

  it("Should get random numbers and print it in console", async () => {
    let numberOfDigits: number = 1;
    await randomizer.connect(owner).requestRandomWords(numberOfDigits);
    await vrfCoordinatorV2Mock.fulfillRandomWords(await randomizer.getLastRequestId(), randomizer.address);
    let getNumbers: BigNumber[] = (
      await randomizer.getRequestStatus(await randomizer.getLastRequestId())
    ).randomWords;

    console.log(getNumbers);

  });
});
