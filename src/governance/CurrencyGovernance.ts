import { Address, BigInt, store } from "@graphprotocol/graph-ts";
import {
    CurrencyGovernance as CurrencyGovernanceContract,
    ProposalCreation,
    ProposalRetraction,
    VoteCast,
    VoteResult,
    VoteReveal
} from "../../generated/templates/CurrencyGovernance/CurrencyGovernance";
import {
    MonetaryProposal,
    CurrencyGovernance,
    MonetaryCommit,
    MonetaryVote,
    TrustedNodes
} from "../../generated/schema";
import { NULL_ADDRESS } from "../constants";
import { loadOrCreateTrustee } from "./TrustedNodes";

// ProposalCreation(address indexed trusteeAddress,
//  uint256 _numberOfRecipients,
//  uint256 _randomInflationReward,
//  uint256 _lockupDuration,
//  uint256 _lockupInterest,
//  uint256 _inflationMultiplier
//  string  _description)
export function handleProposalCreation(event: ProposalCreation): void {
    const id = `${event.address.toHexString()}-${event.params.trusteeAddress.toHexString()}`;
    // load or create a new proposal
    let monetaryProposal = MonetaryProposal.load(id);

    if (!monetaryProposal) {
        monetaryProposal = new MonetaryProposal(id);

        // get generation
        const currencyGovernance = CurrencyGovernance.load(
            event.address.toHexString()
        );
        if (currencyGovernance) {
            monetaryProposal.generation = currencyGovernance.generation;
        }

        monetaryProposal.trustee = event.params.trusteeAddress.toHexString();
        monetaryProposal.enacted = false;
        monetaryProposal.score = BigInt.fromString("0");
    }

    // set attributes
    monetaryProposal.inflationMultiplier = event.params._inflationMultiplier;
    monetaryProposal.numberOfRecipients = event.params._numberOfRecipients;
    monetaryProposal.randomInflationReward =
        event.params._randomInflationReward;
    monetaryProposal.lockupDuration = event.params._lockupDuration;
    monetaryProposal.lockupInterest = event.params._lockupInterest;
    monetaryProposal.description = event.params._description;

    monetaryProposal.save();
}

// ProposalRetraction(address indexed trustee)
export function handleProposalRetraction(event: ProposalRetraction): void {
    const id = `${event.address.toHexString()}-${event.params.trustee.toHexString()}`;
    // remove the proposal from the store
    store.remove("MonetaryProposal", id);
}

// CurrencyGovernance.VoteCast(address indexed trustee)
export function handleVoteCast(event: VoteCast): void {
    const id = `${event.address.toHexString()}-${event.params.trustee.toHexString()}`;

    // load/create commit entity
    let commit = MonetaryCommit.load(id);

    if (!commit) {
        // new commit
        commit = new MonetaryCommit(id);

        commit.trustee = event.params.trustee.toHexString();
        commit.currencyGovernance = event.address.toHexString();
    }
    // bind contract
    const currencyGovernanceContract = CurrencyGovernanceContract.bind(
        event.address
    );

    // get commit hash
    commit.hash = currencyGovernanceContract.commitments(event.params.trustee);

    commit.save();
}

// CurrencyGovernance.VoteReveal(address indexed voter, address[] votes)
export function handleVoteReveal(event: VoteReveal): void {
    // create new monetary vote entity
    const newMonetaryVote = new MonetaryVote(
        `${event.address.toHexString()}-${event.params.voter.toHexString()}`
    );

    // bind contract
    const currencyGovernanceContract = CurrencyGovernanceContract.bind(
        event.address
    );

    newMonetaryVote.currencyGovernance = event.address.toHexString();
    newMonetaryVote.trustee = event.params.voter.toHexString();

    const votes: string[] = [];
    for (let i = 0; i < event.params.votes.length; i++) {
        votes.push(event.params.votes[i].toHexString());

        // if not default proposal
        if (event.params.votes[i].toHexString() != NULL_ADDRESS) {
            const id = `${event.address.toHexString()}-${event.params.votes[
                i
            ].toHexString()}`;
            // update score of monetary proposal
            const proposal = MonetaryProposal.load(id);
            if (proposal) {
                proposal.score = currencyGovernanceContract.score(
                    event.params.votes[i]
                );
                proposal.save();
            }
        }
    }
    newMonetaryVote.rankedProposals = votes;

    newMonetaryVote.save();

    // update the default proposal score
    // load currency governance entity
    const currencyGovernance = CurrencyGovernance.load(
        event.address.toHexString()
    );
    if (currencyGovernance) {
        currencyGovernance.defaultProposalScore =
            currencyGovernanceContract.score(Address.fromString(NULL_ADDRESS));
        currencyGovernance.save();
    }

    // Increase vote rewards for trustee
    const trustee = loadOrCreateTrustee(event.params.voter);
    trustee.votingRecord = trustee.votingRecord.plus(BigInt.fromString("1"));
    trustee.save();

    // decrease the unallocated rewards
    const trustedNodes = TrustedNodes.load("0");
    if (
        trustedNodes &&
        trustedNodes.unallocatedRewardsCount.gt(BigInt.fromString("0"))
    ) {
        trustedNodes.unallocatedRewardsCount =
            trustedNodes.unallocatedRewardsCount.minus(BigInt.fromString("1"));
        trustedNodes.save();
    }
}

// CurrencyGovernance.VoteResult(address indexed winner)
export function handleVoteResult(event: VoteResult): void {
    if (event.params.winner.toHexString() != NULL_ADDRESS) {
        const winningProposal = MonetaryProposal.load(
            `${event.address.toHexString()}-${event.params.winner.toHexString()}`
        );

        if (winningProposal) {
            winningProposal.enacted = true;
            winningProposal.save();
        }
    } else {
        // default proposal won
        const currencyGovernance = CurrencyGovernance.load(
            event.address.toHexString()
        );

        if (currencyGovernance) {
            currencyGovernance.defaultProposalEnacted = true;
            currencyGovernance.save();
        }
    }
}
