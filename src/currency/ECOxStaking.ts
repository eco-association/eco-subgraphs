import { UpdatedVotes } from "../../generated/ECOxStaking/ECOxStaking";
import { sECOxBalance } from "../../generated/schema";

import { loadOrCreateAccount } from ".";

// ECOxStaking.UpdatedVotes(address delegate, uint256 newBalance)
export function handleUpdatedVotes(event: UpdatedVotes): void {
    const delegate = loadOrCreateAccount(event.params.voter.toHexString());

    delegate.sECOx = event.params.newVotes;
    delegate.save();

    // create new historical sECOx balance entry
    let newBalance = new sECOxBalance(event.transaction.hash);
    newBalance.account = delegate.id;
    newBalance.value = delegate.sECOx;
    newBalance.blockNumber = event.block.number;
    newBalance.save();

}
