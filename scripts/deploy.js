async function main() {
    const Vote = await ethers.getContractFactory("Vote");
    const vote = await Vote.deploy();
  
    await vote.deployed();
  
    console.log("Vote deployed to:", vote.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });