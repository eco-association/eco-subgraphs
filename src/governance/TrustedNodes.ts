import { store, Address } from "@graphprotocol/graph-ts";
import {
    TrustedNodeAddition,
    TrustedNodeRemoval,
} from "../../generated/TrustedNodes/TrustedNodes";

import { Trustee, TrusteeCohort } from "../../generated/schema";

function loadOrCreateTrustee(node: Address): Trustee {
    let trustee = Trustee.load(node.toHexString());
    if (!trustee) {
        trustee = new Trustee(node.toHexString());
        trustee.cohorts = [];
    }
    return trustee;
}

// TrustedNodeAdded(address indexed node)
export function handleTrustedNodeAdded(event: TrustedNodeAddition): void {
    const cohortId = event.params.cohort;

    // load/create a cohort for this addition
    let cohort = TrusteeCohort.load(cohortId.toString());

    if (!cohort) {
        cohort = new TrusteeCohort(cohortId.toString());
        cohort.number = cohortId;
    }
    cohort.save();

    // load/create the trustee and add the cohort to it's array
    const trustee = loadOrCreateTrustee(event.params.node);
    trustee.cohorts = trustee.cohorts.concat([cohortId.toString()]);
    trustee.save();
}

// TrustedNodeRemoved(address indexed node)
export function handleTrustedNodeRemoved(event: TrustedNodeRemoval): void {
    const id = event.params.node.toHexString();
    store.remove("Trustee", id);
}
