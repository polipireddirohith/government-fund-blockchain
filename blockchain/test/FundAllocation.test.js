const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FundAllocation", function () {
    let fundAllocation;
    let owner, authority1, authority2, auditor, beneficiary;
    let AUTHORITY_ROLE, AUDITOR_ROLE;

    beforeEach(async function () {
        // Get signers
        [owner, authority1, authority2, auditor, beneficiary] = await ethers.getSigners();

        // Deploy contract
        const FundAllocation = await ethers.getContractFactory("FundAllocation");
        fundAllocation = await FundAllocation.deploy();
        await fundAllocation.waitForDeployment();

        // Get role hashes
        AUTHORITY_ROLE = await fundAllocation.AUTHORITY_ROLE();
        AUDITOR_ROLE = await fundAllocation.AUDITOR_ROLE();

        // Grant roles
        await fundAllocation.grantRole(AUTHORITY_ROLE, authority1.address);
        await fundAllocation.grantRole(AUTHORITY_ROLE, authority2.address);
        await fundAllocation.grantRole(AUDITOR_ROLE, auditor.address);
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const DEFAULT_ADMIN_ROLE = await fundAllocation.DEFAULT_ADMIN_ROLE();
            expect(await fundAllocation.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
        });

        it("Should grant roles correctly", async function () {
            expect(await fundAllocation.hasRole(AUTHORITY_ROLE, authority1.address)).to.be.true;
            expect(await fundAllocation.hasRole(AUTHORITY_ROLE, authority2.address)).to.be.true;
            expect(await fundAllocation.hasRole(AUDITOR_ROLE, auditor.address)).to.be.true;
        });
    });

    describe("Fund Allocation", function () {
        it("Should allocate fund successfully", async function () {
            const tx = await fundAllocation.connect(authority1).allocateFund(
                "School Building Project",
                "Construction of new school building",
                0, // Education category
                ethers.parseEther("10"),
                beneficiary.address
            );

            await expect(tx)
                .to.emit(fundAllocation, "FundAllocated")
                .withArgs(1, "School Building Project", ethers.parseEther("10"), beneficiary.address, authority1.address);

            const fund = await fundAllocation.funds(1);
            expect(fund.projectName).to.equal("School Building Project");
            expect(fund.totalAmount).to.equal(ethers.parseEther("10"));
            expect(fund.beneficiary).to.equal(beneficiary.address);
        });

        it("Should fail if non-authority tries to allocate", async function () {
            await expect(
                fundAllocation.connect(beneficiary).allocateFund(
                    "Test Project",
                    "Test Description",
                    0,
                    ethers.parseEther("5"),
                    beneficiary.address
                )
            ).to.be.reverted;
        });

        it("Should fail with zero amount", async function () {
            await expect(
                fundAllocation.connect(authority1).allocateFund(
                    "Test Project",
                    "Test Description",
                    0,
                    0,
                    beneficiary.address
                )
            ).to.be.revertedWith("Amount must be greater than 0");
        });
    });

    describe("Fund Approval", function () {
        beforeEach(async function () {
            await fundAllocation.connect(authority1).allocateFund(
                "Test Project",
                "Test Description",
                0,
                ethers.parseEther("10"),
                beneficiary.address
            );
        });

        it("Should approve fund successfully", async function () {
            await expect(fundAllocation.connect(authority2).approveFund(1))
                .to.emit(fundAllocation, "FundApproved")
                .withArgs(1, authority2.address, 1);

            const fund = await fundAllocation.funds(1);
            expect(fund.approvalCount).to.equal(1);
        });

        it("Should change status to Approved after required approvals", async function () {
            await fundAllocation.connect(authority2).approveFund(1);
            await fundAllocation.connect(owner).approveFund(1);

            const fund = await fundAllocation.funds(1);
            expect(fund.status).to.equal(1); // Approved status
        });

        it("Should not allow double approval from same authority", async function () {
            await fundAllocation.connect(authority2).approveFund(1);

            await expect(
                fundAllocation.connect(authority2).approveFund(1)
            ).to.be.revertedWith("Already approved by this authority");
        });

        it("Should not allow self-approval", async function () {
            await expect(
                fundAllocation.connect(authority1).approveFund(1)
            ).to.be.revertedWith("Cannot approve own allocation");
        });
    });

    describe("Fund Release", function () {
        beforeEach(async function () {
            await fundAllocation.connect(authority1).allocateFund(
                "Test Project",
                "Test Description",
                0,
                ethers.parseEther("10"),
                beneficiary.address
            );
            await fundAllocation.connect(authority2).approveFund(1);
            await fundAllocation.connect(owner).approveFund(1);
        });

        it("Should release fund successfully", async function () {
            const releaseAmount = ethers.parseEther("5");

            await expect(
                fundAllocation.connect(authority1).releaseFund(1, releaseAmount, { value: releaseAmount })
            ).to.emit(fundAllocation, "FundReleased")
                .withArgs(1, releaseAmount, beneficiary.address);

            const fund = await fundAllocation.funds(1);
            expect(fund.releasedAmount).to.equal(releaseAmount);
            expect(fund.status).to.equal(2); // Released status
        });

        it("Should mark as completed when fully released", async function () {
            const totalAmount = ethers.parseEther("10");

            await fundAllocation.connect(authority1).releaseFund(1, totalAmount, { value: totalAmount });

            const fund = await fundAllocation.funds(1);
            expect(fund.status).to.equal(3); // Completed status
        });

        it("Should not release more than allocated", async function () {
            const excessAmount = ethers.parseEther("15");

            await expect(
                fundAllocation.connect(authority1).releaseFund(1, excessAmount, { value: excessAmount })
            ).to.be.revertedWith("Amount exceeds total allocation");
        });
    });

    describe("Milestones", function () {
        beforeEach(async function () {
            await fundAllocation.connect(authority1).allocateFund(
                "Test Project",
                "Test Description",
                0,
                ethers.parseEther("10"),
                beneficiary.address
            );
        });

        it("Should add milestone successfully", async function () {
            const deadline = Math.floor(Date.now() / 1000) + 86400; // 1 day from now

            await expect(
                fundAllocation.connect(authority1).addMilestone(
                    1,
                    "Phase 1 Completion",
                    ethers.parseEther("3"),
                    deadline
                )
            ).to.emit(fundAllocation, "MilestoneAdded")
                .withArgs(1, 1, ethers.parseEther("3"));

            const milestones = await fundAllocation.getFundMilestones(1);
            expect(milestones.length).to.equal(1);
            expect(milestones[0].description).to.equal("Phase 1 Completion");
        });

        it("Should update milestone status", async function () {
            const deadline = Math.floor(Date.now() / 1000) + 86400;

            await fundAllocation.connect(authority1).addMilestone(
                1,
                "Phase 1 Completion",
                ethers.parseEther("3"),
                deadline
            );

            await fundAllocation.connect(beneficiary).updateMilestoneStatus(
                1,
                0,
                2, // Completed status
                "QmTestIPFSHash123"
            );

            const milestones = await fundAllocation.getFundMilestones(1);
            expect(milestones[0].status).to.equal(2);
            expect(milestones[0].proofDocument).to.equal("QmTestIPFSHash123");
        });
    });

    describe("View Functions", function () {
        beforeEach(async function () {
            await fundAllocation.connect(authority1).allocateFund(
                "Test Project",
                "Test Description",
                0,
                ethers.parseEther("10"),
                beneficiary.address
            );
        });

        it("Should get fund details correctly", async function () {
            const details = await fundAllocation.getFundDetails(1);

            expect(details.projectName).to.equal("Test Project");
            expect(details.totalAmount).to.equal(ethers.parseEther("10"));
            expect(details.beneficiary).to.equal(beneficiary.address);
        });

        it("Should get beneficiary funds", async function () {
            const funds = await fundAllocation.getBeneficiaryFunds(beneficiary.address);
            expect(funds.length).to.equal(1);
            expect(funds[0]).to.equal(1);
        });

        it("Should get total funds count", async function () {
            expect(await fundAllocation.getTotalFunds()).to.equal(1);

            await fundAllocation.connect(authority1).allocateFund(
                "Another Project",
                "Description",
                1,
                ethers.parseEther("5"),
                beneficiary.address
            );

            expect(await fundAllocation.getTotalFunds()).to.equal(2);
        });
    });

    describe("Access Control", function () {
        it("Should pause and unpause contract", async function () {
            await fundAllocation.pause();

            await expect(
                fundAllocation.connect(authority1).allocateFund(
                    "Test",
                    "Test",
                    0,
                    ethers.parseEther("1"),
                    beneficiary.address
                )
            ).to.be.revertedWith("Pausable: paused");

            await fundAllocation.unpause();

            await expect(
                fundAllocation.connect(authority1).allocateFund(
                    "Test",
                    "Test",
                    0,
                    ethers.parseEther("1"),
                    beneficiary.address
                )
            ).to.not.be.reverted;
        });

        it("Should set required approvals", async function () {
            await fundAllocation.setRequiredApprovals(3);
            expect(await fundAllocation.requiredApprovals()).to.equal(3);
        });
    });
});
