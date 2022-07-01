import { PolicyVoteCast, VoteCompleted } from "../../generated/templates/PolicyVotes/PolicyVotes";

import { CommunityProposalVote, PolicyVote } from "../../generated/schema";

// PolicyVotes.PolicyVoteCast(address voter, bool vote, uint256 amount)
export function handlePolicyVoteCast(event: PolicyVoteCast): void {
    let vote = CommunityProposalVote.load(event.params.voter.toHexString());
    let policyVote = PolicyVote.load(event.address.toHexString());

    let voteAmount = event.params.amount;

    // check and set vote stats
    if (policyVote) {
        if (event.params.vote) {
            // add to yes amount if vote is for (whether vote is new or not)
            policyVote.yesVoteAmount = policyVote.yesVoteAmount.plus(voteAmount);
        }
        else if (vote) {
            // if vote is against and vote is not new, remove from yes amount
            policyVote.yesVoteAmount = policyVote.yesVoteAmount.minus(voteAmount);
        }
        policyVote.save();
    }

    if (!vote) {
        // new vote
        vote = new CommunityProposalVote(event.params.voter.toHexString());
        vote.policyVote = event.address.toHexString();
    }

    vote.amount = voteAmount;
    vote.vote = event.params.vote;
    vote.save();
}

// PolicyVotes.VoteCompleted(Result result)
export function handleVoteCompleted(event: VoteCompleted): void {
    // get entity
    let policyVote = PolicyVote.load(event.address.toHexString());
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