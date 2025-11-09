import hre from "hardhat";
import { expect } from "chai";
import { DECIMALS, MINTING_AMOUNT } from "./constant";
import { MyToken, TinyBank } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("TinyBank", () => {
  let signers: HardhatEthersSigner[];
  let myTokenC: MyToken;
  let tinyBankC: TinyBank;
  let owner: HardhatEthersSigner;
  let managers: HardhatEthersSigner[];

  beforeEach(async () => {
    signers = await hre.ethers.getSigners();
    myTokenC = await hre.ethers.deployContract("MyToken", [
      "MyToken",
      "MT",
      DECIMALS,
      MINTING_AMOUNT,
    ]);

    owner = signers[0];
    managers = signers.slice(1, 6);
    const managerAddresses = managers.map((m) => m.address);

    tinyBankC = await hre.ethers.deployContract("TinyBank", [
      await myTokenC.getAddress(),
      owner.address,
      managerAddresses,
    ]);

    await myTokenC.setManager(await tinyBankC.getAddress());
  });

  describe("Initialized state check", () => {
    it("should return totalStaked 0", async () => {
      expect(await tinyBankC.totalStaked()).equal(0);
    });
    it("should return staked 0 amount of signer0", async () => {
      const signer0 = signers[0];
      expect(await tinyBankC.staked(signer0.address)).equal(0);
    });
  });

  describe("Staking", async () => {
    it("should return staked amount", async () => {
      const signer0 = signers[0];
      const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
      await myTokenC.approve(await tinyBankC.getAddress(), stakingAmount);
      await tinyBankC.stake(stakingAmount);
      expect(await tinyBankC.staked(signer0.address)).equal(stakingAmount);
      expect(await tinyBankC.totalStaked()).equal(stakingAmount);
      expect(await myTokenC.balanceOf(await tinyBankC.getAddress())).equal(
        await tinyBankC.totalStaked()
      );
    });
    describe("Withdraw", () => {
      it("should return 0 staked after withdrawing total token", async () => {
        const signer0 = signers[0];
        const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
        await myTokenC.approve(await tinyBankC.getAddress(), stakingAmount);
        await tinyBankC.stake(stakingAmount);
        await tinyBankC.withdraw(stakingAmount);
        expect(await tinyBankC.staked(signer0.address)).equal(0);
      });
    });
  });

  describe("reward", () => {
    it("should reward 1MT every blocks", async () => {
      const signer0 = signers[0];
      const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
      await myTokenC.approve(await tinyBankC.getAddress(), stakingAmount);
      await tinyBankC.stake(stakingAmount);

      const BLOCKS = 5n;
      const transferAmount = hre.ethers.parseUnits("1", DECIMALS);
      for (var i = 0; i < BLOCKS; i++) {
        await myTokenC.transfer(transferAmount, signer0.address);
      }

      await tinyBankC.withdraw(stakingAmount);

      expect(await myTokenC.balanceOf(signer0.address)).equal(
        hre.ethers.parseUnits((MINTING_AMOUNT + 6n).toString(), DECIMALS)
      );
    });

    it("should revert when non-manager tries to confirm", async () => {
      const hacker = signers[10];
      await expect(tinyBankC.connect(hacker).comfirm()).to.be.revertedWith(
        "you are not one of the managers"
      );
    });

    it("should revert when setting reward before all managers confirm", async () => {
      const rewardToChange = hre.ethers.parseUnits("100", DECIMALS);

      await tinyBankC.connect(managers[0]).comfirm();
      await tinyBankC.connect(managers[1]).comfirm();
      await tinyBankC.connect(managers[2]).comfirm();

      await expect(
        tinyBankC.connect(owner).setRewardPerBlock(rewardToChange)
      ).to.be.revertedWith("not all managers comfirmed yet");
    });

    it("should set reward after all managers confirm and reset confirmations", async () => {
      const rewardToChange = hre.ethers.parseUnits("100", DECIMALS);

      for (const manager of managers) {
        await tinyBankC.connect(manager).comfirm();
      }

      await expect(tinyBankC.connect(owner).setRewardPerBlock(rewardToChange))
        .to.not.be.reverted;

      expect(await tinyBankC.rewardPerBlock()).to.equal(rewardToChange);

      await expect(
        tinyBankC.connect(owner).setRewardPerBlock(rewardToChange)
      ).to.be.revertedWith("not all managers comfirmed yet");
    });
  });
});
