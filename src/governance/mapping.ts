import { PolicyDecisionStarted, TimedPolicies } from "../../generated/TimedPolicies/TimedPolicies";
import { PolicyProposals, ProposalAdded, ProposalRefunded, ProposalSupported, ProposalUnsupported, SupportThresholdReached, VotingStarted } from "../../generated/templates/PolicyProposals/PolicyProposals";
import { PolicyVotes, PolicyVoteCast, VoteCompleted } from "../../generated/templates/PolicyVotes/PolicyVotes";
import { Proposal } from "../../generated/templates/PolicyProposals/Proposal";
import { PolicyProposals as PolicyProposalsTemplate, PolicyVotes as PolicyVotesTemplate } from "../../generated/templates";
import { CommunityProposal, CommunityProposalSupport, Generation, PolicyProposal } from "../../generated/schema";

import { Bytes, log, store } from "@graphprotocol/graph-ts";

// TimedPolicies.PolicyDesicionStarted(address contractAddress)
export function handlePolicyDesicionStarted(event: PolicyDecisionStarted): void {
    // get the new address
    let timedPoliciesContract = TimedPolicies.bind(event.address);

    let policyProposalsAddress = event.params.contractAddress;

    // create generation
    let generationNum = timedPoliciesContract.internalGeneration();

    let currentGeneration = new Generation(generationNum.toString());
    currentGeneration.save();

    // subscribe to events from this generation's PolicyProposals contract
    PolicyProposalsTemplate.create(policyProposalsAddress);
    let policyProposalsContract = PolicyProposals.bind(policyProposalsAddress);

    // create policyProposal entity
    let newPolicyProposals = new PolicyProposal(policyProposalsAddress);
    newPolicyProposals.generation = generationNum.toString();
    newPolicyProposals.blockNumber = policyProposalsContract.blockNumber()
    newPolicyProposals.save();
    
}

// PolicyPropsals.ProposalAdded(address proposer, address proposalAddress)
export function handleProposalAdded(event: ProposalAdded): void {
    // create a new proposal entity
    let proposal = new CommunityProposal(event.params.proposalAddress.toHexString());
    proposal.proposer = event.params.proposer;

    // get the policyProposals entity for the generation
    let policyProposal = PolicyProposal.load(event.address);
    if (policyProposal) {
        proposal.generation = policyProposal.generation;
    }
    
    // get additional data from the proposal contract itself
    let proposalContract = Proposal.bind(event.params.proposalAddress);
    proposal.name = proposalContract.name();
    proposal.description = proposalContract.description();
    proposal.url = proposalContract.url();
    proposal.reachedSupportThreshold = false;
    proposal.refunded = false;

    proposal.save();
}

// PolicyProposals.ProposalSupported(address supporter, address proposalAddress)
export function handleProposalSupported(event: ProposalSupported): void {
    let id = event.params.supporter.toHexString() + event.params.proposalAddress.toHexString();
    let support = new CommunityProposalSupport(id);
    support.supporter = event.params.supporter;
    support.proposal = event.params.proposalAddress.toHexString();

    // get amount
    let policyProposalsContract = PolicyProposals.bind(event.address);
    support.amount = policyProposalsContract.votingPower(event.params.supporter, policyProposalsContract.blockNumber());

    support.save();
}

// PolicyProposals.ProposalUnsupported(address unsupporter, address proposalAddress)
export function handleProposalUnsupported(event: ProposalUnsupported): void {
    let id = event.params.unsupporter.toHexString() + event.params.proposalAddress.toHexString();
    store.remove('CommunityProposalSupport', id);
}

// PolicyPropsals.SupportThresholdReached(address proposalAddress)
export function handleSupportThresholdReached(event: SupportThresholdReached): void {
    let proposal = CommunityProposal.load(event.params.proposalAddress.toHexString());
    if (proposal) {
        proposal.reachedSupportThreshold = true;
        proposal.save();
    }
}

// PolicyProposals.ProposalRefunded(address proposer, address proposalAddress)
export function handleProposalRefunded(event: ProposalRefunded): void {
    let proposal = CommunityProposal.load(event.params.proposalAddress.toHexString());
    log.info("refund = {}", [event.params.proposalAddress.toHexString()]);
    if (proposal) {
        proposal.refunded = true;
        proposal.save();
    }
    else {
        log.info("refund = {}", [event.params.proposalAddress.toHexString()]);
    }
}

// PolicyPropsals.VotingStarted(address contractAddress)
export function handleVotingStarted(event: VotingStarted): void {
    // TODO
    // get the policyVotes contract
    // save it as a new entity with the same generation as our policyPropsals
    // create instance for listening to its events
}


// PolicyVotes.PolicyVoteCast(address indexed voter, bool vote, uint256 amount)
export function handlePolicyVoteCast(event: PolicyVoteCast): void {
    // TODO
}

// PolicyVotes.VoteCompleted(Result result)
export function handleVoteCompleted(event: VoteCompleted): void {
    // TODO
}