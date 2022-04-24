task("addVoting", "add new voting")
  .addParam("voteContractAddress", "address of contract in network")
  .addParam("candidates", "array of candidates")
  .setAction(async (taskArgs) => {
    const Vote = await ethers.getContractFactory("Vote");
    const vote = await Vote.attach(taskArgs.voteContractAddress);
    
    await vote.addVoting(taskArgs.candidates.split(',')); //TODO:  
    const votingId = await vote.getCountOfVoting() - 1;   //Not transactional, may be incorrect if created in parallel
    console.log("id of voting: " + votingId);
});

task("getVotingInfo", "get info of votings on contract")
  .addParam("voteContractAddress", "voteContractAddress")
  .addParam("votingId", "ID of voting")
  .setAction(async (taskArgs) => {
    const Vote = await ethers.getContractFactory("Vote");
    const vote = await Vote.attach(taskArgs.voteContractAddress);

    console.log("VotingId: " + taskArgs.votingId);

    const status = await vote.getVotingStatus(0);
    console.log("status: " + status + " (0-NOTEXIST, 1-STARTED, 2-FIHISHED, 3-WITHDRAWN)");

    const  startTime= await vote.getVotingStartTime(taskArgs.votingId);
    let dateTime = new Date();
    dateTime.setTime(startTime * 1000);
    dateTime.toUTCString();
    console.log("startTime: " + dateTime.toUTCString() + " (" + startTime + ")");
    const endTime = await vote.getVotingEndTime(taskArgs.votingId);
    dateTime.setTime(endTime * 1000);
    console.log("endTime: " + dateTime.toUTCString() + " (" + endTime + ")");

    const candidates = await vote.getCandidates(taskArgs.votingId);
    for (const c of candidates) {
      let votes = await vote.getCandidateVotes(taskArgs.votingId, c);
      console.log("candidate: " + c + " - votes: " + votes);
    }
});

task("vote", "vote for a candidate ")
  .addParam("voteContractAddress", "voteContractAddress")
  .addParam("votingId", "ID of voting")
  .addParam("candidate", "address of candidate")
  .setAction(async (taskArgs) => {
    const Vote = await ethers.getContractFactory("Vote");
    const vote = await Vote.attach(taskArgs.voteContractAddress);
    const VOTEPRICE = ethers.utils.parseEther("0.01");

    await vote.vote(taskArgs.votingId, taskArgs.candidate , {value: VOTEPRICE } )
});

task("finish", "finish the voting")
  .addParam("voteContractAddress", "voteContractAddress")
  .addParam("votingId", "ID of voting")
  .setAction(async (taskArgs) => {
    const Vote = await ethers.getContractFactory("Vote");
    const vote = await Vote.attach(taskArgs.voteContractAddress);

    await vote.finish(taskArgs.votingId)
});

task("withdrawn", "withdrawn fee")
  .addParam("voteContractAddress", "voteContractAddress")
  .addParam("votingId", "ID of voting")
  .addParam("to", "address to which to send")
  .setAction(async (taskArgs) => {
    const Vote = await ethers.getContractFactory("Vote");
    const vote = await Vote.attach(taskArgs.voteContractAddress);

    await vote.withdrawn(taskArgs.votingId, taskArgs.to)
});