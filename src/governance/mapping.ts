import { PolicyDecisionStarted, TimedPolicies } from "../../generated/TimedPolicies/TimedPolicies";
import { PolicyProposals, ProposalAdded, ProposalRefunded, ProposalSupported, ProposalUnsupported, SupportThresholdReached, VotingStarted } from "../../generated/templates/PolicyProposals/PolicyProposals";
import { PolicyVotes, PolicyVoteCast, VoteCompleted } from "../../generated/templates/PolicyVotes/PolicyVotes";
import { Proposal } from "../../generated/templates/PolicyProposals/Proposal";
import { PolicyProposals as PolicyProposalsTemplate, PolicyVotes as PolicyVotesTemplate } from "../../generated/templates";
import { CommunityProposal, CommunityProposalSupport, CommunityProposalVote, Generation, PolicyProposal, PolicyVote } from "../../generated/schema";

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
    newPolicyProposals.proposalEnds = policyProposalsContract.proposalEnds();
    newPolicyProposals.blockNumber = policyProposalsContract.blockNumber();
    newPolicyProposals.totalVotingPower = policyProposalsContract.totalVotingPower(newPolicyProposals.blockNumber);
    newPolicyProposals.save();
    
}

// PolicyPropsals.ProposalAdded(address proposer, address proposalAddress)
export function handleProposalAdded(event: ProposalAdded): void {
    // create a new proposal entity
    let proposal = new CommunityProposal(event.params.proposalAddress);
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
    support.proposal = event.params.proposalAddress;

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
    let proposal = CommunityProposal.load(event.params.proposalAddress);
    if (proposal) {
        proposal.reachedSupportThreshold = true;
        proposal.save();
    }
}

// PolicyProposals.ProposalRefunded(address proposer, address proposalAddress)
export function handleProposalRefunded(event: ProposalRefunded): void {
    let proposal = CommunityProposal.load(event.params.proposalAddress);
    if (proposal) {
        proposal.refunded = true;
        proposal.save();
    }
}

// PolicyPropsals.VotingStarted(address contractAddress)
export function handleVotingStarted(event: VotingStarted): void {
    // subscribe to policyVotes events
    PolicyVotesTemplate.create(event.params.contractAddress);

    // new entity for vote
    let newPolicyVotes = new PolicyVote(event.params.contractAddress);

    // get generation from policyProposals
    let policyProposal = PolicyProposal.load(event.address);
    if (policyProposal) {
        newPolicyVotes.generation = policyProposal.generation;
    }

    // get the policyVotes contract and grab additonal arguments
    let policyVoteContract = PolicyVotes.bind(event.params.contractAddress);
    newPolicyVotes.voteEnds = policyVoteContract.voteEnds();
    newPolicyVotes.ENACTION_DELAY = policyVoteContract.ENACTION_DELAY();
    newPolicyVotes.blockNumber = policyVoteContract.blockNumber();
    newPolicyVotes.totalVotingPower = policyVoteContract.totalVotingPower(newPolicyVotes.blockNumber);
    newPolicyVotes.proposal = policyVoteContract.proposal();

    // save entity
    newPolicyVotes.save();
}


// PolicyVotes.PolicyVoteCast(address indexed voter, bool vote, uint256 amount)
export function handlePolicyVoteCast(event: PolicyVoteCast): void {
    let support = CommunityProposalVote.load(event.params.voter);
    if (!support) {
        // new support
        support = new CommunityProposalVote(event.params.voter);
        support.policyVote = event.address;
    }
    support.amount = event.params.amount;
    support.vote = event.params.vote;
    support.save();
}

// PolicyVotes.VoteCompleted(Result result)
export function handleVoteCompleted(event: VoteCompleted): void {
    // get entity
    let policyVote = PolicyVote.load(event.address);
    // determine and set result
    if (policyVote) {
        if (event.params.result === 0) {
            policyVote.result = "Accepted";
        }
        else if (event.params.result === 1) {
            policyVote.result = "Rejected";
        }
        else {
            policyVote.result = "Failed";
        }
        policyVote.save();
    }
}