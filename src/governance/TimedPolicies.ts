
import { PolicyDecisionStart, TimedPolicies } from "../../generated/TimedPolicies/TimedPolicies";

import { PolicyProposals } from "../../generated/templates/PolicyProposals/PolicyProposals";

import { PolicyProposals as PolicyProposalsTemplate, PolicyVotes as PolicyVotesTemplate } from "../../generated/templates";

import { PolicyProposal } from "../../generated/schema";

import { loadContractAddresses } from "./";


// TimedPolicies.PolicyDesicionStarted(address contractAddress)
export function handlePolicyDesicionStarted(event: PolicyDecisionStart): void {
    // get the new address
    let timedPoliciesContract = TimedPolicies.bind(event.address);

    let policyProposalsAddress = event.params.contractAddress;

    // get generation
    let generationNum = timedPoliciesContract.generation();

    // subscribe to events from this generation's PolicyProposals contract
    PolicyProposalsTemplate.create(policyProposalsAddress);
    let policyProposalsContract = PolicyProposals.bind(policyProposalsAddress);

    // create policyProposal entity
    let newPolicyProposals = new PolicyProposal(policyProposalsAddress.toHexString());
    newPolicyProposals.generation = generationNum.toString();
    newPolicyProposals.proposalEnds = policyProposalsContract.proposalEnds();
    let blockNumber = policyProposalsContract.blockNumber();
    newPolicyProposals.blockNumber = blockNumber;
    newPolicyProposals.totalVotingPower = policyProposalsContract.totalVotingPower(blockNumber);
    newPolicyProposals.save();

    // update contracts with the new PolicyProposals address
    let contracts = loadContractAddresses();
    if (contracts) {
        contracts.policyProposals = event.params.contractAddress.toHexString();
        contracts.save();
    }
    
}