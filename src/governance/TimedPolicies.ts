import { BigInt } from "@graphprotocol/graph-ts";
import {
    NewGeneration as NewGenerationEvent,
    PolicyDecisionStart,
    TimedPolicies,
} from "../../generated/TimedPolicies/TimedPolicies";
import { ECO } from "../../generated/ECO/ECO";
import { PolicyProposals } from "../../generated/templates/PolicyProposals/PolicyProposals";
import { PolicyProposals as PolicyProposalsTemplate } from "../../generated/templates";
import { Generation, PolicyProposal } from "../../generated/schema";
import { loadContractAddresses } from ".";
import { HistoryRecord } from "./entities/HistoryRecord";

// TimedPolicies.PolicyDecisionStarted(address contractAddress)
export function handlePolicyDecisionStarted(event: PolicyDecisionStart): void {
    // get the new address
    const timedPoliciesContract = TimedPolicies.bind(event.address);

    const policyProposalsAddress = event.params.contractAddress;

    // subscribe to events from this generation's PolicyProposals contract
    PolicyProposalsTemplate.create(policyProposalsAddress);
    const policyProposalsContract = PolicyProposals.bind(
        policyProposalsAddress
    );

    // create policyProposal entity
    const newPolicyProposals = new PolicyProposal(
        policyProposalsAddress.toHexString()
    );
    newPolicyProposals.generation = timedPoliciesContract
        .generation()
        .toString();
    newPolicyProposals.refundIfLost = policyProposalsContract.REFUND_IF_LOST();
    newPolicyProposals.proposalEnds = policyProposalsContract.proposalEnds();
    const blockNumber = policyProposalsContract.blockNumber();
    newPolicyProposals.blockNumber = blockNumber;

    const votingPowerResult = policyProposalsContract.try_totalVotingPower(blockNumber);
    if (!votingPowerResult.reverted) {
        newPolicyProposals.totalVotingPower = votingPowerResult.value;
    }
    else {
        const ecoContract = ECO.bind(policyProposalsContract.ecoToken());
        newPolicyProposals.totalVotingPower = ecoContract.totalSupply().plus(BigInt.fromString("10").times(policyProposalsContract.totalECOxSnapshot())).minus(policyProposalsContract.excludedVotingPower());
    }
    newPolicyProposals.save();

    // update contracts with the new PolicyProposals address
    const contracts = loadContractAddresses();
    if (contracts) {
        contracts.policyProposals = event.params.contractAddress.toHexString();
        contracts.save();
    }
}

export function handleNewGeneration(event: NewGenerationEvent): void {
    const generation = new Generation(event.params.generation.toString());
    generation.number = event.params.generation;
    generation.createdAt = event.block.timestamp;
    generation.blockNumber = event.block.number;

    const timedPoliciesContract = TimedPolicies.bind(event.address);
    generation.nextGenerationStart =
        timedPoliciesContract.nextGenerationWindowOpen();

    generation.save();

    HistoryRecord.createGenerationRecord(generation.id, event.block.timestamp);
}
