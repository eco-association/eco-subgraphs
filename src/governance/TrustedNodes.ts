import { store, Address, BigInt, log } from "@graphprotocol/graph-ts";
import { Trustee, TrustedNodes, TrusteeCohort } from "../../generated/schema";
import {
    RewardsTrackingUpdate as RewardsTrackingUpdateEvent,
    TrustedNodeAddition as TrustedNodeAdditionEvent,
    TrustedNodeRemoval as TrustedNodeRemovalEvent,
    TrustedNodes as TrustedNodesContract,
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

function loadOrCreateCohort(cohortId: BigInt): TrusteeCohort {
    let cohort = TrusteeCohort.load(cohortId.toString());
    if (!cohort) {
        cohort = new TrusteeCohort(cohortId.toString());
        cohort.node = "0";
        cohort.number = cohortId;
        cohort.save();
    }
    return cohort;
}

function loadOrCreateTrustedNode(address: Address): TrustedNodes {
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

        loadOrCreateCohort(trustedNodes.cohort());

        trustedEntity.save();
    }
    return trustedEntity;
}

// TrustedNodeAdded(address indexed node)
export function handleTrustedNodeAdded(event: TrustedNodeAdditionEvent): void {
    const cohortId = event.params.cohort;

    // load/create the trusted node entity
    loadOrCreateTrustedNode(event.address);

    // load/create a cohort for this addition
    loadOrCreateCohort(cohortId);

    // load/create the trustee and add the cohort to it's array
    const trustee = loadOrCreateTrustee(event.params.node);
    trustee.cohorts = trustee.cohorts.concat([cohortId.toString()]);
    trustee.save();
}

// TrustedNodeRemoved(address indexed node)
export function handleTrustedNodeRemoved(event: TrustedNodeRemovalEvent): void {
    const id = event.params.node.toHexString();
    store.remove("Trustee", id);
}

export function handleRewardsTrackingUpdate(
    event: RewardsTrackingUpdateEvent
): void {
    const trustedNodesEntity = loadOrCreateTrustedNode(event.address);
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
