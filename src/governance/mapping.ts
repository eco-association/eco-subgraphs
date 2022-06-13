import { PolicyDecisionStarted, TimedPolicies } from "../../generated/TimedPolicies/TimedPolicies";
import { PolicyProposals, ProposalAdded, SupportThresholdReached, VotingStarted } from "../../generated/templates/PolicyProposals/PolicyProposals";
import { PolicyVotes, PolicyVoteCast, VoteCompleted } from "../../generated/templates/PolicyVotes/PolicyVotes";
import { Proposal } from "../../generated/templates/PolicyProposals/Proposal";
import { PolicyProposals as PolicyProposalsTemplate, PolicyVotes as PolicyVotesTemplate } from "../../generated/templates";
import { CommunityProposal, Generation, PolicyProposal } from "../../generated/schema";

// TimedPolicies.PolicyDesicionStarted(address contractAddress)
export function handlePolicyDesicionStarted(event: PolicyDecisionStarted): void {
    // get the new address
    let timedPoliciesContract = TimedPolicies.bind(event.address);

    // create generation
    let generationNum = timedPoliciesContract.internalGeneration();

    let currentGeneration = new Generation(event.transaction.hash);
    currentGeneration.num = generationNum;
    currentGeneration.save();

    // create a new policyProposals instance
    let address = event.params.contractAddress;

    // subscribe to events from this generation's PolicyProposals contract
    PolicyProposalsTemplate.create(address);
    const policyProposalsContract = PolicyProposals.bind(address);

    // create policyProposal entity
    let newPolicyProposals = new PolicyProposal(address);
    newPolicyProposals.generation = event.transaction.hash;
    newPolicyProposals.blockNumber = policyProposalsContract.blockNumber()
    newPolicyProposals.save();
}

// PolicyPropsals.ProposalAdded(address proposer, address proposalAddress)
export function handleProposalAdded(event: ProposalAdded): void {
    // create a new proposal entity
    let proposal = new CommunityProposal(event.params.proposalAddress);
    proposal.proposer = event.params.proposer;

    // get additional data from the proposal contract itself
    let proposalContract = Proposal.bind(event.params.proposalAddress);
    proposal.name = proposalContract.name();
    proposal.description = proposalContract.description();
    proposal.url = proposalContract.url();
    proposal.reachedSupportThreshold = false;

    proposal.save();
}

// TODO handleProposalSupported

// TODO handleProposalUnsupported

// TODO handleProposalRefunded

// PolicyPropsals.SupportThresholdReached(address proposalAddress)
export function handleSupportThresholdReached(event: SupportThresholdReached): void {
    // get the proposal and update it
    let proposal = CommunityProposal.load(event.params.proposalAddress);

    if (proposal) {
        proposal.reachedSupportThreshold = true;
        proposal.save();
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