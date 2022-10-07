import { PolicyVote } from "../../generated/schema";
import { PolicyVote as PolicyVoteEvent, VoteCompletion } from "../../generated/templates/PolicyVotes/PolicyVotes";
import { Proposal } from "./entities/Proposal";
import { VoteManager } from "./entities/VoteManager";

// PolicyVotes.PolicyVote(address indexed voter, uint256 votesYes, uint256 votesNo)
export function handlePolicyVote(event: PolicyVoteEvent): void {
    const policy = PolicyVote.load(event.address.toHexString());
    if (policy) {
        const voteManager = new VoteManager(event.params.voter, policy);
        voteManager.resetVote();
        voteManager.voteSplit(event.params.votesYes, event.params.votesNo);
        voteManager.checkMajority(event.block.timestamp);
        voteManager.save();
    }
}

// PolicyVotes.VoteCompleted(Result result)
export function handleVoteCompletion(event: VoteCompletion): void {
    // get entity
    const policyVote = PolicyVote.load(event.address.toHexString());
    // determine and set result
    if (policyVote) {
        if (event.params.result === 0) {
            policyVote.result = "Accepted";
        } else if (event.params.result === 1) {
            policyVote.result = "Rejected";
        } else {
            policyVote.result = "Failed";
        }
        policyVote.save();

        const proposal = Proposal.load(policyVote.proposal);
        proposal.historyRecord("ProposalResult", event.block.timestamp);
    }
}
