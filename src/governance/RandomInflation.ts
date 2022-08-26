import { log } from "@graphprotocol/graph-ts";
import { RandomInflation } from "../../generated/schema";
import {
    Claim,
    EntropySeedReveal,
    EntropyVDFSeedCommit
} from "../../generated/templates/RandomInflation/RandomInflation";

// Claim(address indexed who, uint256 sequence)
export function handleClaim(event: Claim): void {
    log.info("Claim: who = {}, sequence = {}", [
        event.params.who.toHexString(),
        event.params.sequence.toString()
    ]);
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
