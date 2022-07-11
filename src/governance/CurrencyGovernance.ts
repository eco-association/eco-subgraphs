import { ProposalCreation, ProposalRetraction } from "../../generated/templates/CurrencyGovernance/CurrencyGovernance";

import { store } from "@graphprotocol/graph-ts";
import { MonetaryProposal, CurrencyGovernance } from "../../generated/schema";


// ProposalCreation(address indexed trusteeAddress, 
//  uint256 _numberOfRecipients, 
//  uint256 _randomInflationReward, 
//  uint256 _lockupDuration,
//  uint256 _lockupInterest,
//  uint256 _inflationMultiplier)
export function handleProposalCreation(event: ProposalCreation): void {

    let id = event.address.toHexString() + "-" + event.params.trusteeAddress.toHexString();
    // load or create a new proposal
    let monetaryProposal = MonetaryProposal.load(id);
    
    if (!monetaryProposal) {
        monetaryProposal = new MonetaryProposal(id);
        
        // get generation
        let currencyGovernance = CurrencyGovernance.load(event.address.toHexString());
        if (currencyGovernance) {
            monetaryProposal.generation = currencyGovernance.generation;
        }
    }
    
    // set attributes
    monetaryProposal.trustee = event.params.trusteeAddress.toHexString();
    monetaryProposal.inflationMultiplier = event.params._inflationMultiplier;
    monetaryProposal.numberOfRecipients = event.params._numberOfRecipients;
    monetaryProposal.randomInflationReward = event.params._randomInflationReward;
    monetaryProposal.lockupDuration = event.params._lockupDuration;
    monetaryProposal.lockupInterest = event.params._lockupInterest;
    monetaryProposal.enacted = false;
    
    monetaryProposal.save();
}


// ProposalRetraction(address indexed trustee)
export function handleProposalRetraction(event: ProposalRetraction): void {

    let id = event.address.toHexString() + "-" + event.params.trustee.toHexString();

    // remove the proposal from the store
    store.remove("MonetaryProposal", id);

}

