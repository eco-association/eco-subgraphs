import {
    NewGeneration as NewGenerationEvent,
    PolicyDecisionStart,
    TimedPolicies
} from "../../generated/TimedPolicies/TimedPolicies";
import { PolicyProposals } from "../../generated/templates/PolicyProposals/PolicyProposals";
import { PolicyProposals as PolicyProposalsTemplate } from "../../generated/templates";
import { Generation, PolicyProposal } from "../../generated/schema";
import { loadContractAddresses } from ".";

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
    newPolicyProposals.proposalEnds = policyProposalsContract.proposalEnds();
    const blockNumber = policyProposalsContract.blockNumber();
    newPolicyProposals.blockNumber = blockNumber;
    newPolicyProposals.totalVotingPower =
        policyProposalsContract.totalVotingPower(blockNumber);
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
    generation.blockNumber = event.block.number;

    const timedPoliciesContract = TimedPolicies.bind(event.address);
    generation.nextGenerationStart =
        timedPoliciesContract.nextGenerationStart();

    generation.save();
}
