import { InflationRootHashProposal } from "../../generated/schema";

import {
    RootHashAcceptance,
    InflationRootHashProposal as InflationRootHashProposalContract
} from "../../generated/templates/InflationRootHashProposal/InflationRootHashProposal";

export function handleRootHashAcceptance(event: RootHashAcceptance): void {
    const inflationRootHashProposal = InflationRootHashProposal.load(
        event.address.toHexString()
    );

    const inflationRootHashProposalContract =
        InflationRootHashProposalContract.bind(event.address);

    if (inflationRootHashProposal) {
        inflationRootHashProposal.acceptedRootHash =
            inflationRootHashProposalContract.acceptedRootHash();
        inflationRootHashProposal.acceptedTotalSum = event.params.totalSum;
        inflationRootHashProposal.acceptedAmountOfAccounts =
            event.params.amountOfAccounts;
        inflationRootHashProposal.feeCollectionEnds =
            inflationRootHashProposalContract.feeCollectionEnds();
        inflationRootHashProposal.accepted = true;
        inflationRootHashProposal.save();
    }
}
