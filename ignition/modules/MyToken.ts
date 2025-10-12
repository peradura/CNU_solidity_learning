import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MyTokenDeploy", (m) => {
  const myToeknC = m.contract("MyToken", ["MyToken", "MT", 18]);
  return { myToeknC };
});
