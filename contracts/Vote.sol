//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Vote {
    address owner;

    uint64 votingNumber;
    uint64 constant DURATION = 3 days;
    uint64 constant FEE = 10; //%
    uint64 constant PRICE = 0.01 ether;

    enum VotingStatus { NOTEXIST, STARTED, FIHISHED, WITHDRAWN }

    struct Voting {
        uint256 startTime;
        VotingStatus status;

        mapping(address => bool) voted;
        mapping(address => bool) candidates;
        address[] candidatesArray;

        mapping(address => uint64) votes;
        address candidateToWin;
        uint128 candidateToWinVotesCount;
        uint128 votedCount;
    }

    mapping(uint64 => Voting) public votings;

    constructor() {
        owner = msg.sender;
    }

    function addVoting(address[] memory _candidates) onlyOwner external {
        require(_candidates.length >= 2, "minimum number of participants is 2");
        votings[votingNumber].startTime = block.timestamp;
        votings[votingNumber].status = VotingStatus.STARTED;
        votings[votingNumber].candidatesArray = _candidates;
        for (uint i = 0; i < _candidates.length; i++) {
            votings[votingNumber].candidates[_candidates[i]] = true;
        }
        votings[votingNumber].candidateToWin = _candidates[0];
        votingNumber++;
    }

    function getCountOfVoting() external view returns(uint64) {
        return votingNumber;
    }
    function getVotingStartTime(uint64 _votingNumber) external isVotingExist(_votingNumber) view returns (uint256) {
        return votings[_votingNumber].startTime;
    }

    function getVotingEndTime(uint64 _votingNumber) external isVotingExist(_votingNumber) view returns (uint256) {
        return votings[_votingNumber].startTime + DURATION;
    }

    function getVotingStatus(uint64 _votingNumber) external isVotingExist(_votingNumber) view returns (VotingStatus) {
        return votings[_votingNumber].status;
    }

    function getCandidates(uint64 _votingNumber) external isVotingExist(_votingNumber) view returns (address[] memory) {
        return votings[_votingNumber].candidatesArray;
    }

    function getCandidateVotes(uint64 _votingNumber, address _candidate) external isVotingExist(_votingNumber) view returns(uint128) {
        require(votings[_votingNumber].candidates[_candidate], "address is not in the voting");
        return votings[_votingNumber].votes[_candidate];
    }

    function vote(uint64 _votingNumber, address _candidate) external isVotingInProgress(_votingNumber) payable {
        require(msg.value == PRICE, "Voting price is 0.01 ether");
        require(!votings[_votingNumber].voted[msg.sender], "you have already voted");
        require(votings[_votingNumber].candidates[_candidate], "address is not in the voting");
        if (block.timestamp > votings[_votingNumber].startTime + DURATION) {
            revert("voting period is over");
        }
        votings[_votingNumber].voted[msg.sender] = true;
        votings[_votingNumber].votedCount++;
        votings[_votingNumber].votes[_candidate]++;

        if (votings[_votingNumber].votes[_candidate] > votings[_votingNumber].candidateToWinVotesCount) {
            votings[_votingNumber].candidateToWin = _candidate;
            votings[_votingNumber].candidateToWinVotesCount = votings[_votingNumber].votes[_candidate];
        }
    }

    function finish(uint64 _votingNumber) external isVotingInProgress(_votingNumber)  {
        if (block.timestamp < votings[_votingNumber].startTime + DURATION) {
            revert("voting is in progress");
        }
        votings[_votingNumber].status = VotingStatus.FIHISHED;
        payable(votings[_votingNumber].candidateToWin).transfer(getPercentageOfVoting(100 - FEE, _votingNumber));
    }

    function withdrawn(uint64 _votingNumber, address _to) external isVotingExist(_votingNumber) onlyOwner {
        require(votings[_votingNumber].status == VotingStatus.FIHISHED, "voting must be finished");
        votings[_votingNumber].status = VotingStatus.WITHDRAWN;
        payable(_to).transfer(getPercentageOfVoting(FEE, _votingNumber));
    }

    function getPercentageOfVoting (uint _percent, uint64 _votingNumber) private view returns (uint) {
        return votings[_votingNumber].votedCount * PRICE * _percent / 100;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "only owner");
        _;
    }

    modifier isVotingExist(uint64 _votingNumber) {
        require(votings[_votingNumber].status != VotingStatus.NOTEXIST, "Voting is not exist" );
        _;
    }

    modifier isVotingInProgress(uint64 _votingNumber) {
        require(votings[_votingNumber].status != VotingStatus.NOTEXIST, "Voting is not exist" );
        require(votings[_votingNumber].status != VotingStatus.FIHISHED, "Voting is finished" );
        require(votings[_votingNumber].status != VotingStatus.WITHDRAWN, "Voting is finished" );
        _;
    }
}