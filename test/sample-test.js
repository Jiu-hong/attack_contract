const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Deploy Bank contract which is able to be attacked", function () {
  let deployer, user, attacker;

    beforeEach(async function () {
        [deployer, user, attacker] = await ethers.getSigners();
      
        const BankFactory = await ethers.getContractFactory("Bank", deployer);
        this.bankContract = await BankFactory.deploy();
      
        await this.bankContract.deposit({ value: ethers.utils.parseEther("100") });
        await this.bankContract.connect(user).deposit({ value: ethers.utils.parseEther("50") });
      
        const AttackerFactory = await ethers.getContractFactory("Attacker", attacker);
        this.attackerContract = await AttackerFactory.deploy(this.bankContract.address);
    });

    describe("Test Bank contract", function () {
        it("Should accept deposts", async function () {
            const deployerBalance = await this.bankContract.balanceOf(deployer.address);
            expect(deployerBalance).to.eq(ethers.utils.parseEther("100"));

            const userBalance = await this.bankContract.balanceOf(user.address);
            expect(userBalance).to.eq(ethers.utils.parseEther("50"));
        });

        it("Should accept withdrawls", async function () {
            await this.bankContract.withdraw();

            const deployerBalance = await this.bankContract.balanceOf(deployer.address);
            const userBalance = await this.bankContract.balanceOf(user.address);

            expect(deployerBalance).to.eq(0);
            expect(userBalance).to.eq(ethers.utils.parseEther("50"));
        })

        it("Perform Attack", async function () {
            console.log("");
            console.log("*** Before ***");
            console.log(`Bank's balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(this.bankContract.address)).toString()}`);
            console.log(`Attacker's balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address)).toString()}`)

            await this.attackerContract.attack({ value: ethers.utils.parseEther("10") });

            console.log("");
            console.log("*** After ***");
            console.log(`Bank's balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(this.bankContract.address)).toString()}`);
            console.log(`Attacker's balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address)).toString()}`)
            console.log("")

            expect(await ethers.provider.getBalance(this.bankContract.address)).to.eq(0);
        })
    })
});

describe("Deploy Bank contract which is nonReentrant", function () {
    let deployer, user, attacker;
  
      beforeEach(async function () {
          [deployer, user, attacker] = await ethers.getSigners();
        
          const BankFactory = await ethers.getContractFactory("NonReentrant_Bank", deployer);
          this.bankContract = await BankFactory.deploy();
        
          await this.bankContract.deposit({ value: ethers.utils.parseEther("100") });
          await this.bankContract.connect(user).deposit({ value: ethers.utils.parseEther("50") });
        
          const AttackerFactory = await ethers.getContractFactory("Attacker", attacker);
          this.attackerContract = await AttackerFactory.deploy(this.bankContract.address);
      });
  
      describe("Test Bank contract which is unable to be attacked", function () {
  
          it("It cannot perform Attack", async function () {
              console.log("");
              console.log("*** Before ***");
              console.log(`Bank's balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(this.bankContract.address)).toString()}`);
              console.log(`Attacker's balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address)).toString()}`)
  
              await expect(this.attackerContract.attack({ value: ethers.utils.parseEther("10") })).to.be.revertedWith("Address: unable to send value, recipient may have reverted");

              console.log("");
              console.log("*** After ***");
              console.log(`Bank's balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(this.bankContract.address)).toString()}`);
              console.log(`Attacker's balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address)).toString()}`)
              console.log("")
  

          })
      })
  });


// describe('hooks', function () {
   
  
//     beforeEach(function () {
//         console.log("before each here1")
//     });
  
//     describe("ggg", function () {
//         it("hhh", async function () {
//             console.log("in it 1")
//         })
        
//         it("aaa", async function () {
//             console.log("in it 2")
//          })
//     });

//     describe("ggg2", function () {
//         it("hhh2", async function () {
//             console.log("in it 12")
//         })
        
//         it("aaa2", async function () {
//             console.log("in it 22")
//          })
//     });
// })