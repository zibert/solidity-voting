const { expect } = require("chai")
const { ethers } = require ("hardhat")

describe("Vote", function () {
    const VOTEPRICE = ethers.utils.parseEther("0.01");
    const DURATION = 3600 * 24 * 3;

    async function getTimeStamp(bn) {
        return (
            await ethers.provider.getBlock(bn)
        ).timestamp
    }

    beforeEach(async function () {
        [owner, candidate1, candidate2, candidate3, acc1, acc2, acc3, acc4, acc5] = await ethers.getSigners();

        const Vote = await ethers.getContractFactory("Vote", owner)
        vote = await Vote.deploy();
        await vote.deployed();
    })

    it("count of votings should be 0", async function () {
        const countOfVoting = await vote.getCountOfVoting();
        expect(countOfVoting).to.eq(0);
    })

    it("minimum number of participants is 2", async function () {
        await expect(
            vote.addVoting (
                []
            )
        ).to.be.revertedWith("minimum number of participants is 2");

        await expect(
            vote.addVoting (
                [candidate1.address]
            )
        ).to.be.revertedWith("minimum number of participants is 2");

        const tx = await vote.addVoting (
            [candidate1.address, candidate2.address]
        )
        const votingCount = await vote.getCountOfVoting();
        expect(votingCount).to.eq(1);
    })

    it("only owner can add voting", async function () {
        await expect(
            vote.connect(acc1).addVoting (
                [candidate1.address, candidate2.address]
            )
        ).to.be.revertedWith("only owner");

        const tx = await vote.addVoting (
            [candidate1.address, candidate2.address]
        )
        const votingCount = await vote.getCountOfVoting();
        expect(votingCount).to.eq(1);
    })

    it("addVoting is correct", async function () {
        const tx = await vote.addVoting (
            [candidate1.address, candidate2.address, candidate3.address]
        )
        const votingCount = await vote.getCountOfVoting();
        expect(votingCount).to.eq(1);

        const ts = await getTimeStamp(tx.blockNumber)
        const startTime = await vote.getVotingStartTime(0);
        expect(startTime).to.eq(ts);

        const endTime = await vote.getVotingEndTime(0);
        expect(endTime).to.eq(ts + DURATION);

        const status = await vote.getVotingStatus(0);
        expect(status).to.eq(1);

        const expectedCandidates = [candidate1.address, candidate2.address, candidate3.address]
        const candidates = await vote.getCandidates(0);

        expect(candidates[0]).to.eq(expectedCandidates[0]);
        expect(candidates[1]).to.eq(expectedCandidates[1]);
        expect(candidates[2]).to.eq(expectedCandidates[2]);

        const votes = await vote.getCandidateVotes(0, candidate1.address);
        expect(votes).to.eq(0);

        await expect(
            vote.getCandidateVotes(0, acc1.address) 
        ).to.be.revertedWith("address is not in the voting");
    })

    it("vote is correct", async function () {
        const tx = await vote.addVoting (
            [candidate1.address, candidate2.address, candidate3.address]
        )

        const votes = await vote.getCandidateVotes(0, candidate1.address);
        expect(votes).to.eq(0);

        await expect(
            vote.connect(acc1).vote(0, acc2.address , {value: VOTEPRICE } )
        ).to.be.revertedWith("address is not in the voting");

        await expect(
            vote.connect(acc1).vote(0, candidate1.address , {value: VOTEPRICE.mul(2) } )
        ).to.be.revertedWith("Voting price is 0.01 ether");

        await expect(
            vote.connect(acc1).vote(0, candidate1.address , {value: VOTEPRICE.div(2) } )
        ).to.be.revertedWith("Voting price is 0.01 ether");

        const voteTx = await vote.connect(acc2).vote(0, candidate1.address , {value: VOTEPRICE } )
        await expect(() => voteTx).to.changeEtherBalance(acc2, VOTEPRICE.mul(-1))

        const votesInc = await vote.getCandidateVotes(0, candidate1.address);
        expect(votesInc).to.eq(1);

        await expect(
            vote.connect(acc2).vote(0, candidate1.address , {value: VOTEPRICE } )
        ).to.be.revertedWith("you have already voted");
    })

    it("voting period is over", async function () {
        const tx = await vote.addVoting (
            [candidate1.address, candidate2.address, candidate3.address]
        )

        await network.provider.send("evm_increaseTime", [3600 * 24 * 3 + 1])
        await network.provider.send("evm_mine") 

        await expect(
            vote.connect(acc2).vote(0, candidate1.address , {value: VOTEPRICE } )
        ).to.be.revertedWith("voting period is over");
    })

    it("isVotingExist is correct", async function () {
        const tx = await vote.addVoting (
            [candidate1.address, candidate2.address, candidate3.address]
        )

        await expect(
            vote.vote(2, candidate1.address , {value: VOTEPRICE } )
        ).to.be.revertedWith("Voting is not exist");

        await expect(
            vote.getVotingStartTime(2)
        ).to.be.revertedWith("Voting is not exist");
    })
})