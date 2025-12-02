// ignition/modules/deploy.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeployModule = buildModule("DeployModule", (m) => {
  const myTokenC = m.contract("MyToken", ["MyToken", "MT", 18, 100]);

  const tinyBankC = m.contract("TinyBank", [myTokenC]);

  m.call(myTokenC, "setManager", [tinyBankC]);

  return { myTokenC, tinyBankC };
});

export default DeployModule;
