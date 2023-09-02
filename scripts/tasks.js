const { ethers } = require("hardhat");
const { toUtf8Bytes, keccak256, parseEther } = ethers.utils;

async function task() {
  const [owner, otherAccount] = await ethers.getSigners();
  const governor = await ethers.getContractAt(
    "MyGovernor",
    "0x9b37B5FDf23168b76293f2ebE626947DC673E596"
  );
  const token = await ethers.getContractAt(
    "MyToken",
    "0xdBCa59dD9Ef98415f7dE588963df02Cadc3E218E"
  );

  await token.delegate(owner.address);
  //console.log(governor);


  const tx = await governor.propose(
    [token.address],
    [0],
    [
      token.interface.encodeFunctionData("mint", [
        owner.address,
        parseEther("1000"),
      ]),
    ],
    "Give the owner more token"
  );

  //console.log("transaction", tx);

  const receipt = await tx.wait();
  //console.log("reciept", receipt);

  const event = receipt.events.find((x) => x.event === "ProposalCreated");
  const { proposalId } = event.args;

  const tx2 = await governor.castVote(proposalId, 1);

  await governor.execute(
    [token.address],
    [0],
    [
      token.interface.encodeFunctionData("mint", [
        owner.address,
        parseEther("25000"),
      ]),
    ],
    keccak256(toUtf8Bytes("Give the owner more tokens!"))
  );



}

task().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});