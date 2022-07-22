import {
    PolicyDecisionStart,
    TimedPolicies,
} from "../../generated/TimedPolicies/TimedPolicies";
import { PolicyProposals } from "../../generated/templates/PolicyProposals/PolicyProposals";
import { PolicyProposals as PolicyProposalsTemplate } from "../../generated/templates";
import { PolicyProposal } from "../../generated/schema";
import { loadContractAddresses } from ".";

// TimedPolicies.PolicyDesicionStarted(address contractAddress)
export function handlePolicyDesicionStarted(event: PolicyDecisionStart): void {
    // get the new address
    const timedPoliciesContract = TimedPolicies.bind(event.address);

    const policyProposalsAddress = event.params.contractAddress;

    // get generation
    const generationNum = timedPoliciesContract.generation();

    // subscribe to events from this generation's PolicyProposals contract
    PolicyProposalsTemplate.create(policyProposalsAddress);
    const policyProposalsContract = PolicyProposals.bind(
        policyProposalsAddress
    );

    // create policyProposal entity
    const newPolicyProposals = new PolicyProposal(
        policyProposalsAddress.toHexString()
    );
    newPolicyProposals.generation = generationNum.toString();
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
