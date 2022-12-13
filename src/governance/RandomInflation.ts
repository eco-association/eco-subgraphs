import { RandomInflation, RandomInflationClaim } from "../../generated/schema";
import {
    Claim,
    EntropySeedReveal,
    EntropyVDFSeedCommit,
} from "../../generated/templates/RandomInflation/RandomInflation";
import { loadOrCreateAccount } from "../currency";
import { HistoryRecord } from "./entities/HistoryRecord";

// Claim(address indexed who, uint256 sequence)
export function handleClaim(event: Claim): void {
    const account = loadOrCreateAccount(event.params.who);

    // create new claim
    const id = event.transaction.hash.toHexString();
    const claim = new RandomInflationClaim(id);
    claim.account = account.id;
    claim.sequenceNumber = event.params.sequence;
    claim.randomInflation = event.address.toHexString();
    claim.save();

    HistoryRecord.createRandomInflationClaimRecord(
        id,
        event.block.timestamp,
        event.params.who
    );
}

// EntropyVDFSeedCommit(uint256 seed)
export function handleEntropyVDFSeedCommit(event: EntropyVDFSeedCommit): void {
    const randomInflation = RandomInflation.load(event.address.toHexString());
    if (randomInflation) {
        randomInflation.seedCommit = event.params.seed;
        randomInflation.save();
    }
}

// EntropySeedReveal(bytes32)
export function handleEntropySeedReveal(event: EntropySeedReveal): void {
    const randomInflation = RandomInflation.load(event.address.toHexString());
    if (randomInflation) {
        randomInflation.seedReveal = event.params.seed;
        randomInflation.save();
    }
}
