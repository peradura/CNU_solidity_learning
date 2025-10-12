import hre from "hardhat";
import { expect } from "chai";
import { MyToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("mytoken deploy", () => {
  let myTokenC: MyToken;
  let signers: HardhatEthersSigner[];
  before("should deploy", async () => {
    signers = await hre.ethers.getSigners();
    myTokenC = await hre.ethers.deployContract("MyToken", [
      "MyToken",
      "MT",
      18,
    ]);
  });
  it("should return name", async () => {
    expect(await myTokenC.name()).to.equal("MyToken");
  });
  it("should return symbol", async () => {
    expect(await myTokenC.symbol()).to.equal("MT");
  });
  it("should return decimals", async () => {
    expect(await myTokenC.decimals()).to.equal(18);
  });
  it("should return 0 totalSupply", async () => {
    expect(await myTokenC.totalSupply()).equal(1n * 10n ** 18n);
  });
  it("should return 0 balance for signer 0", async () => {
    const signer0 = signers[0];
    expect(await myTokenC.balanceOf(signer0)).equal(1n * 10n ** 18n);
  });
});
