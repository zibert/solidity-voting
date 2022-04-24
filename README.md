# Voting Project

# Install package

npm i

# Test

npm run testWithCoverage<br />
or<br />
npx hardhat coverage<br />
or<br />
npx hardhat test<br />

# Deploy

## local

npm run deployLocal<br />
or<br />
npx hardhat run --network localhost scripts/deploy.js

## rinkeby

npm run deployRinkeby<br />
or<br />
npx hardhat run --network rinkeby scripts/deploy.js<br />


# Tasks 

## addVoting example: 

npx hardhat addVoting --vote-contract-address 0x4D723ef60eBBe4132657c555855f7481CD819Aea --network rinkeby --candidates 0x70997970c51812dc3a010c7d01b50e0d17dc79c8,0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc

## getVotingInfo example: 

npx hardhat getVotingInfo --vote-contract-address 0x4D723ef60eBBe4132657c555855f7481CD819Aea --network rinkeby --voting-id 0

## vote example: 

npx hardhat vote --vote-contract-address 0x4D723ef60eBBe4132657c555855f7481CD819Aea --network rinkeby --voting-id 0 --candidate 0x70997970c51812dc3a010c7d01b50e0d17dc79c8

## finish example: 

npx hardhat finish --vote-contract-address 0x4D723ef60eBBe4132657c555855f7481CD819Aea --network localhost --voting-id 0

## withdrawn example: 

npx hardhat withdrawn --vote-contract-address 0x4D723ef60eBBe4132657c555855f7481CD819Aea --network rinkeby --voting-id 0 --to 0x70997970c51812dc3a010c7d01b50e0d17dc79c8
