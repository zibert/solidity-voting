const { expect } = require("chai")
const { ethers } = require ("hardhat")

describe("test timing of voting", function () {
    const votePrice = ethers.utils.parseEther("0.01");
    const DURATION = 3600 * 24 * 3;

    beforeEach(async function () {
        [owner, candidate1, candidate2, candidate3, acc1, acc2, acc3, acc4, acc5] = await ethers.getSigners();

        const Vote = await ethers.getContractFactory("Vote", owner)
        vote = await Vote.deploy();
        await vote.deployed();

        await vote.addVoting (
            [candidate1.address, candidate2.address, candidate3.address]
        )

        await vote.connect(acc1).vote(0, candidate1.address , {value: votePrice } )
        await vote.connect(acc2).vote(0, candidate1.address , {value: votePrice } )
        await vote.connect(acc3).vote(0, candidate2.address , {value: votePrice } )
        await vote.connect(acc4).vote(0, candidate3.address , {value: votePrice } )
    })

    it("voting should not be finished in the first three days", async function () {
        await expect(
            vote.connect(owner).finish(0)
        ).to.be.revertedWith("voting is in progress");

        await network.provider.send("evm_increaseTime", [DURATION / 2])
        await network.provider.send("evm_mine") 

        await expect(
            vote.connect(acc1).finish(0)
        ).to.be.revertedWith("voting is in progress");
    })

    it("сommission should not be withdrawn until the vote is finished", async function () {
        await expect(
            vote.connect(owner).withdrawn(0, owner.address)
        ).to.be.revertedWith("voting must be finished");

        await expect(
            vote.connect(acc1).withdrawn(0, acc1.address)
        ).to.be.revertedWith("only owner");
    })

    it("voting can be finished after three days", async function () {

        await network.provider.send("evm_increaseTime", [DURATION + 1])
        await network.provider.send("evm_mine") 

        const finishTx = await vote.connect(acc5).finish(0)
        await expect(() => finishTx).to.changeEtherBalance(candidate1, votePrice.mul(4).mul(9).div(10))

        await expect(
            vote.connect(acc5).finish(0)
        ).to.be.revertedWith("Voting is finished");
    })

    it("сommission cann be withdrawn after vote is finished", async function () {
        
        await network.provider.send("evm_increaseTime", [3600 * 24 * 3 + 1])
        await network.provider.send("evm_mine") 

        await vote.connect(acc5).finish(0)

        await expect(
            vote.connect(acc1).withdrawn(0, acc1.address)
        ).to.be.revertedWith("only owner");

        const withdrawnTx = await vote.connect(owner).withdrawn(0, acc1.address)
        await expect(() => withdrawnTx).to.changeEtherBalance(acc1, votePrice.mul(4).mul(1).div(10))

        await expect(
            vote.connect(acc5).vote(0, candidate2.address , {value: votePrice } )
        ).to.be.revertedWith("Voting is finished");
    })
})