import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { Trustee, TrustedNodes, TrusteeCohort } from "../../generated/schema";
import {
    RewardsTrackingUpdate as RewardsTrackingUpdateEvent,
    TrustedNodeAddition as TrustedNodeAdditionEvent,
    TrustedNodeRemoval as TrustedNodeRemovalEvent,
    TrustedNodes as TrustedNodesContract
} from "../../generated/TrustedNodes/TrustedNodes";

export function loadOrCreateTrustee(node: Address): Trustee {
    let trustee = Trustee.load(node.toHexString());
    if (!trustee) {
        trustee = new Trustee(node.toHexString());
        trustee.votingRecord = BigInt.fromString("0");
        trustee.lastYearVotingRecord = BigInt.fromString("0");
        trustee.fullyVestedRewards = BigInt.fromString("0");
        trustee.cohorts = [];
    }
    return trustee;
}

function loadOrCreateCohort(
    cohortId: BigInt,
    blockNumber: BigInt
): TrusteeCohort {
    let cohort = TrusteeCohort.load(cohortId.toString());
    if (!cohort) {
        cohort = new TrusteeCohort(cohortId.toString());
        cohort.node = "0";
        cohort.number = cohortId;
        cohort.blockNumber = blockNumber;
        cohort.save();
    }
    return cohort;
}

function loadOrCreateTrustedNode(
    address: Address,
    blockNumber: BigInt
): TrustedNodes {
    let trustedEntity = TrustedNodes.load("0");
    if (!trustedEntity) {
        trustedEntity = new TrustedNodes("0");
        const trustedNodes = TrustedNodesContract.bind(address);
        trustedEntity.hoard = trustedNodes.hoard();
        trustedEntity.yearStartGen = trustedNodes.yearStartGen();
        trustedEntity.yearEnd = trustedNodes.yearEnd();
        trustedEntity.voteReward = trustedNodes.voteReward();
        trustedEntity.unallocatedRewardsCount =
            trustedNodes.unallocatedRewardsCount();

        loadOrCreateCohort(trustedNodes.cohort(), blockNumber);

        trustedEntity.save();
    }
    return trustedEntity;
}

// TrustedNodeAdded(address indexed node)
export function handleTrustedNodeAdded(event: TrustedNodeAdditionEvent): void {
    const cohortId = event.params.cohort;

    // load/create the trusted node entity
    loadOrCreateTrustedNode(event.address, event.block.number);

    // load/create a cohort for this addition
    loadOrCreateCohort(cohortId, event.block.number);

    // load/create the trustee and add the cohort to it's array
    const trustee = loadOrCreateTrustee(event.params.node);
    trustee.cohorts = trustee.cohorts.concat([cohortId.toString()]);
    trustee.save();
}

// TrustedNodeRemoved(address indexed node)
export function handleTrustedNodeRemoved(event: TrustedNodeRemovalEvent): void {
    // remove trustee from cohort
    const id = event.params.node.toHexString();
    const trustee = Trustee.load(id);
    if (trustee) {
        trustee.cohorts = trustee.cohorts.splice(
            trustee.cohorts.indexOf(event.params.cohort.toString()),
            1
        );
        trustee.save();
    }
}

export function handleRewardsTrackingUpdate(
    event: RewardsTrackingUpdateEvent
): void {
    const trustedNodesEntity = loadOrCreateTrustedNode(
        event.address,
        event.block.number
    );
    const trustedNodes = TrustedNodesContract.bind(event.address);
    trustedNodesEntity.yearEnd = trustedNodes.yearEnd();
    trustedNodesEntity.yearStartGen = trustedNodes.yearStartGen();
    trustedNodesEntity.unallocatedRewardsCount =
        trustedNodes.unallocatedRewardsCount();

    const cohort = trustedNodes.cohort();
    const numTrustees = trustedNodes.numTrustees().toI32();

    for (let i = 0; i < numTrustees; i++) {
        const trusteeAddress = trustedNodes.getTrustedNodeFromCohort(
            cohort,
            BigInt.fromU32(i)
        );
        log.info("Updated trustee {}", [trusteeAddress.toHexString()]);
        const trustee = loadOrCreateTrustee(trusteeAddress);
        trustee.votingRecord = BigInt.fromString("0");
        trustee.lastYearVotingRecord =
            trustedNodes.lastYearVotingRecord(trusteeAddress);
        trustee.fullyVestedRewards =
            trustedNodes.fullyVestedRewards(trusteeAddress);
        trustee.save();
    }
}
