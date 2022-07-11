import { PolicyVoteCast, PolicySplitVoteCast, VoteCompleted } from "../../generated/templates/PolicyVotes/PolicyVotes";

import { CommunityProposalVote, PolicyVote } from "../../generated/schema";

import { BigInt } from "@graphprotocol/graph-ts";

// PolicyVotes.PolicyVoteCast(address voter, bool vote, uint256 amount)
export function handlePolicyVoteCast(event: PolicyVoteCast): void {
    let id = event.params.voter.toHexString() + "-" + event.address.toHexString();

    let vote = CommunityProposalVote.load(id);
    let policyVote = PolicyVote.load(event.address.toHexString());

    let amount = event.params.amount;

    if (policyVote) {
        if (vote) {
            // vote is not new, reset past amounts before setting new values
            policyVote.totalVoteAmount = policyVote.totalVoteAmount.minus(vote.totalAmount);
            policyVote.yesVoteAmount = policyVote.yesVoteAmount.minus(vote.yesAmount);
        }
        else {
            // create new vote entity
            vote = new CommunityProposalVote(id);
            vote.voter = event.params.voter;
            vote.policyVote = event.address.toHexString();
        }
        // set vote values and policyVote values
        policyVote.totalVoteAmount = policyVote.totalVoteAmount.plus(amount);

        if (event.params.vote) {
            policyVote.yesVoteAmount = policyVote.yesVoteAmount.plus(amount);
            vote.yesAmount = amount;
        }
        else {
            vote.yesAmount = BigInt.fromString('0');
        }
        
        vote.totalAmount = amount;

        policyVote.save();
        vote.save();
    }
}

// PolicyVotes.PolicySplitVoteCast(address indexed voter, uint256 votesYes, uint256 votesNo)
export function handlePolicySplitVoteCast(event: PolicySplitVoteCast): void {
    let id = event.params.voter.toHexString() + "-" + event.address.toHexString();

    let vote = CommunityProposalVote.load(id);
    let policyVote = PolicyVote.load(event.address.toHexString());

    let amount = event.params.votesYes.plus(event.params.votesNo);

    if (policyVote) {
        if (vote) {
            // vote is not new, reset past amounts before setting new values
            policyVote.totalVoteAmount = policyVote.totalVoteAmount.minus(vote.totalAmount);
            policyVote.yesVoteAmount = policyVote.yesVoteAmount.minus(vote.yesAmount);
        }
        else {
            // create new vote entity
            vote = new CommunityProposalVote(id);
            vote.voter = event.params.voter;
            vote.policyVote = event.address.toHexString();
        }
        // set vote values and policyVote values
        policyVote.totalVoteAmount = policyVote.totalVoteAmount.plus(amount);

        policyVote.yesVoteAmount = policyVote.yesVoteAmount.plus(event.params.votesYes);
        vote.yesAmount = event.params.votesYes;

        vote.totalAmount = amount;

        policyVote.save();
        vote.save();
    }
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