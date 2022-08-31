import { RandomInflation, RandomInflationClaim } from "../../generated/schema";
import {
    Claim,
    EntropySeedReveal,
    EntropyVDFSeedCommit
} from "../../generated/templates/RandomInflation/RandomInflation";
import { loadOrCreateAccount } from "../currency";

// Claim(address indexed who, uint256 sequence)
export function handleClaim(event: Claim): void {
    // create new claim
    const claim = new RandomInflationClaim(
        event.transaction.hash.toHexString()
    );
    claim.sequenceNumber = event.params.sequence;

    const account = loadOrCreateAccount(event.params.who);
    claim.account = account.id;

    claim.randomInflation = event.address.toHexString();

    claim.save();
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
