const { expect } = require('chai');
const { ethers } = require('hardhat');
const { BigNumber } = require("ethers");

describe('LuckyNftSwap', () => {
    let luckyNftSwapDeployed;
    let luckyNftSwap;

    let exampleNFT_ADeployed;
    let exampleNFT_A;

    let exampleNFT_BDeployed;
    let exampleNFT_B;

    let exampleNFT_CDeployed;
    let exampleNFT_C;

    let exampleNFT_DDeployed;
    let exampleNFT_D;


    let owner, address1, address2, address3, address4;

    before(async () => {

        const ExampleNFT_A = await ethers.getContractFactory('ExampleNFT_A');
        exampleNFT_A = await ExampleNFT_A.deploy();
        exampleNFT_ADeployed = await exampleNFT_A.deployed();

        const ExampleNFT_B = await ethers.getContractFactory('ExampleNFT_B');
        exampleNFT_B = await ExampleNFT_B.deploy();
        exampleNFT_BDeployed = await exampleNFT_B.deployed();

        const ExampleNFT_C = await ethers.getContractFactory('ExampleNFT_C');
        exampleNFT_C = await ExampleNFT_C.deploy();
        exampleNFT_CDeployed = await exampleNFT_C.deployed();

        const ExampleNFT_D = await ethers.getContractFactory('ExampleNFT_D');
        exampleNFT_D = await ExampleNFT_D.deploy();
        exampleNFT_DDeployed = await exampleNFT_D.deployed();

        const LuckyNftSwap = await ethers.getContractFactory('LuckyNftSwap');
       // luckyNftSwap = await LuckyNftSwap.deploy([3]);
       luckyNftSwap = await LuckyNftSwap.deploy([3],[exampleNFT_ADeployed.address,exampleNFT_BDeployed.address]);
        luckyNftSwapDeployed = await luckyNftSwap.deployed();

     

        [owner, address1, address2, address3, address4] = await ethers.getSigners();
      //  console.log('>>ExampleNFT_A<<')
      //  console.log(ExampleNFT_ADeployed.address)
      //  console.log('>>ExampleNFT_A<<')
    })

    it ('should test AllowedCollections list', async() => {
        const AllowedCollections = await luckyNftSwap.getallowedCollections();
        console.log(AllowedCollections)
        expect(AllowedCollections[0]).to.be.equal(exampleNFT_ADeployed.address)
        expect(AllowedCollections[1]).to.be.equal(exampleNFT_BDeployed.address)
    });


    it('should test isGameEndedIsAddressDepositor before user deposit', async () => {
        const isGameEndedIsAddressDepositor = await luckyNftSwap.isGameEndedIsAddressDepositor(address1.address);
        console.log("isGameEndedIsAddressDepositor")
        console.log(isGameEndedIsAddressDepositor)
        console.log("isGameEndedIsAddressDepositor")
        expect(isGameEndedIsAddressDepositor[0]).to.be.equal(false)
        expect(isGameEndedIsAddressDepositor[1]).to.be.equal(false)
    });

    it('Should test deposit 1 nft from Example NFT collection', async () => {
        const mintTx = await exampleNFT_A.safeMint(address1.address);
        await mintTx.wait();
        const approveTx = await exampleNFT_A.connect(address1).approve(luckyNftSwapDeployed.address, 0);
        await approveTx.wait();

        const depositTx = await luckyNftSwap.connect(address1).deposit(exampleNFT_ADeployed.address, 0);
        await depositTx.wait();

        const deposits = await luckyNftSwap.getDeposits()
        console.log(deposits)
        expect(deposits.length).to.be.equal(1);
        expect(deposits[0][0]).to.be.equal(exampleNFT_ADeployed.address);
        expect(deposits[0][1]).to.be.equal(BigNumber.from(0));
        const counter1 = await luckyNftSwap.depositorCounterMap(address1.address);
        console.log(counter1);
        expect(counter1).to.be.equal(BigNumber.from(1));
    });

    it('Should test deposit 1 nft from NFT collection outside whitelist -deposit should be rejected', async () => {
        // Example nft collection D is not on white list 
        const mintTx = await exampleNFT_D.safeMint(address4.address);
        await mintTx.wait();
        const approveTx = await exampleNFT_D.connect(address4).approve(luckyNftSwapDeployed.address, 0);
        await approveTx.wait();
        const depositTx = luckyNftSwap.connect(address4).deposit(exampleNFT_DDeployed.address, 0);
        await expect(depositTx).to.be.revertedWith('NFT Collection is not Allowed')

    });   

    it('Should test BonusDeposit 1 nft from Example NFT C collection', async () => {
        const mintTx = await exampleNFT_C.safeMint(owner.address);
        await mintTx.wait();
        const approveTx = await exampleNFT_C.connect(owner).approve(luckyNftSwapDeployed.address, 0);
        await approveTx.wait();

        const BonusDepositTx = await luckyNftSwap.connect(owner).bonusDeposit(exampleNFT_CDeployed.address, 0);
        await BonusDepositTx.wait();

        const bonusDeposits = await luckyNftSwap.getbonusDeposits()
        console.log(bonusDeposits)
        expect(bonusDeposits.length).to.be.equal(1);
        expect(bonusDeposits[0][0]).to.be.equal(exampleNFT_CDeployed.address);
        expect(bonusDeposits[0][1]).to.be.equal(BigNumber.from(0));



    });    



    it('Should test deposit 1 nft from Another Example NFT collection', async () => {
        const mintTx = await exampleNFT_B.safeMint(address3.address);
        await mintTx.wait();
        const approveTx = await exampleNFT_B.connect(address3).approve(luckyNftSwapDeployed.address, 0);
        await approveTx.wait();

        const depositTx = await luckyNftSwap.connect(address3).deposit(exampleNFT_BDeployed.address, 0);
        await depositTx.wait();

        const deposits = await luckyNftSwap.getDeposits()
        console.log(deposits)
        expect(deposits.length).to.be.equal(2);
        expect(deposits[1][0]).to.be.equal(exampleNFT_BDeployed.address);
        expect(deposits[1][1]).to.be.equal(BigNumber.from(0));
        const counter1 = await luckyNftSwap.depositorCounterMap(address3.address);
        console.log(counter1);
        expect(counter1).to.be.equal(BigNumber.from(2));
    });

    it('Should test deposit until full cap', async () => {
        const mintTx2 = await exampleNFT_A.safeMint(address2.address);
        await mintTx2.wait();
        const approveTx2 = await exampleNFT_A.connect(address2).approve(luckyNftSwapDeployed.address, 1);
        await approveTx2.wait();

        const depositTx2 = await luckyNftSwap.connect(address2).deposit(exampleNFT_ADeployed.address, 1);
        await depositTx2.wait();

        const deposits = await luckyNftSwap.getDeposits()
        console.log(deposits)
        expect(deposits.length).to.be.equal(3);
        expect(deposits[0][0]).to.be.equal(exampleNFT_ADeployed.address);
        expect(deposits[0][1]).to.be.equal(BigNumber.from(0));
        expect(deposits[1][0]).to.be.equal(exampleNFT_BDeployed.address);
        expect(deposits[1][1]).to.be.equal(BigNumber.from(0));
        expect(deposits[2][0]).to.be.equal(exampleNFT_ADeployed.address);
        expect(deposits[2][1]).to.be.equal(BigNumber.from(1));
        const counter2 = await luckyNftSwap.depositorCounterMap(address2.address);
        console.log(counter2);
        expect(counter2).to.be.equal(BigNumber.from(3));

    });
    it('should test isGameEndedIsAddressDepositor after user deposit', async () => {
        const isGameEndedIsAddressDepositor = await luckyNftSwap.isGameEndedIsAddressDepositor(address1.address);
        console.log("isGameEndedIsAddressDepositor")
        console.log(isGameEndedIsAddressDepositor)
        console.log("isGameEndedIsAddressDepositor")
        expect(isGameEndedIsAddressDepositor[0]).to.be.equal(false)
        expect(isGameEndedIsAddressDepositor[1]).to.be.equal(true)
    });

    it('Should test shift', async () => {

        console.log('Testing shift function start')
        const shiftTx = await luckyNftSwap.shift();
        await shiftTx.wait();

        const shiftNumber = await luckyNftSwap.shiftNumber()
        console.log(shiftNumber)
        expect(shiftNumber).to.be.gt(0);
        console.log('Testing shift function end')
    });

    it('Should test withdraw', async () => {
        console.log(address1.address)
        console.log(address2.address)
        console.log(address3.address)
        const withdrawTx1 = await luckyNftSwap.withdraw(address1.address);
        await withdrawTx1.wait()
        const withdrawTx2 = await luckyNftSwap.withdraw(address2.address);
        await withdrawTx2.wait()
        const withdrawTx3 = await luckyNftSwap.withdraw(address3.address);
        await withdrawTx3.wait()

        const owner1 = await exampleNFT_A.ownerOf(0)
        const owner2 = await exampleNFT_A.ownerOf(1)
        const owner3 = await exampleNFT_B.ownerOf(0)

        console.log(owner1)
        console.log(owner2)
        expect(owner1).to.be.oneOf([address1.address, address2.address, address3.address]);
        expect(owner2).to.be.oneOf([address1.address, address2.address, address3.address]);
        expect(owner3).to.be.oneOf([address1.address, address2.address, address3.address]);
    });

    it('Should test bonusDeposit Assigment' ,async () => {
        console.log(address1.address)
        const getDepositAfterShiftPromise = luckyNftSwap.getBonusDepositAfterShift(address1.address);
        console.log(getDepositAfterShiftPromise)
    });

    it('Should fail when trying to get depositor after shift when there is no deposit', async () => {
        const getDepositAfterShiftPromise = luckyNftSwap.getDepositAfterShift(address4.address);

        await expect(getDepositAfterShiftPromise).to.be.revertedWith("No deposit for address found")
    });

    it('should set new pool cap', async () => {
        const setPoolCapTx = await luckyNftSwap.setPoolCap(4);
        await setPoolCapTx.wait()

        const newCap = await luckyNftSwap.poolCap();

        expect(newCap).to.be.equal(BigNumber.from(4))
    });

    it('should test get original deposit', async () => {
        const originalDepositAddress1 = await luckyNftSwap.getOriginalDeposit(address1.address);
        const originalDepositAddress2 = await luckyNftSwap.getOriginalDeposit(address2.address);
        const originalDepositAddress3 = await luckyNftSwap.getOriginalDeposit(address3.address);

        console.log(originalDepositAddress1)

        expect(originalDepositAddress1.nftContractAdcress).to.be.equal(exampleNFT_ADeployed.address)
        expect(originalDepositAddress1.tokenId).to.be.equal(BigNumber.from(0))

        expect(originalDepositAddress2.nftContractAdcress).to.be.equal(exampleNFT_ADeployed.address)
        expect(originalDepositAddress2.tokenId).to.be.equal(BigNumber.from(1))

        expect(originalDepositAddress3.nftContractAdcress).to.be.equal(exampleNFT_BDeployed.address)
        expect(originalDepositAddress3.tokenId).to.be.equal(BigNumber.from(0))
    });

    //TODO: more corner case tests
});