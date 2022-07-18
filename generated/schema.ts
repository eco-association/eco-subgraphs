// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class ContractAddresses extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save ContractAddresses entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type ContractAddresses must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("ContractAddresses", id.toString(), this);
    }
  }

  static load(id: string): ContractAddresses | null {
    return changetype<ContractAddresses | null>(
      store.get("ContractAddresses", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get policy(): string {
    let value = this.get("policy");
    return value!.toString();
  }

  set policy(value: string) {
    this.set("policy", Value.fromString(value));
  }

  get currencyTimer(): string {
    let value = this.get("currencyTimer");
    return value!.toString();
  }

  set currencyTimer(value: string) {
    this.set("currencyTimer", Value.fromString(value));
  }

  get timedPolicies(): string {
    let value = this.get("timedPolicies");
    return value!.toString();
  }

  set timedPolicies(value: string) {
    this.set("timedPolicies", Value.fromString(value));
  }

  get currencyGovernance(): string {
    let value = this.get("currencyGovernance");
    return value!.toString();
  }

  set currencyGovernance(value: string) {
    this.set("currencyGovernance", Value.fromString(value));
  }

  get policyProposals(): string {
    let value = this.get("policyProposals");
    return value!.toString();
  }

  set policyProposals(value: string) {
    this.set("policyProposals", Value.fromString(value));
  }

  get policyVotes(): string {
    let value = this.get("policyVotes");
    return value!.toString();
  }

  set policyVotes(value: string) {
    this.set("policyVotes", Value.fromString(value));
  }

  get eco(): string {
    let value = this.get("eco");
    return value!.toString();
  }

  set eco(value: string) {
    this.set("eco", Value.fromString(value));
  }

  get ecox(): string {
    let value = this.get("ecox");
    return value!.toString();
  }

  set ecox(value: string) {
    this.set("ecox", Value.fromString(value));
  }

  get ecoxStaking(): string {
    let value = this.get("ecoxStaking");
    return value!.toString();
  }

  set ecoxStaking(value: string) {
    this.set("ecoxStaking", Value.fromString(value));
  }

  get trustedNodes(): string {
    let value = this.get("trustedNodes");
    return value!.toString();
  }

  set trustedNodes(value: string) {
    this.set("trustedNodes", Value.fromString(value));
  }
}

export class Generation extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Generation entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Generation must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Generation", id.toString(), this);
    }
  }

  static load(id: string): Generation | null {
    return changetype<Generation | null>(store.get("Generation", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get number(): BigInt {
    let value = this.get("number");
    return value!.toBigInt();
  }

  set number(value: BigInt) {
    this.set("number", Value.fromBigInt(value));
  }

  get currencyGovernance(): string {
    let value = this.get("currencyGovernance");
    return value!.toString();
  }

  set currencyGovernance(value: string) {
    this.set("currencyGovernance", Value.fromString(value));
  }

  get policyProposal(): string | null {
    let value = this.get("policyProposal");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set policyProposal(value: string | null) {
    if (!value) {
      this.unset("policyProposal");
    } else {
      this.set("policyProposal", Value.fromString(<string>value));
    }
  }

  get policyVote(): string | null {
    let value = this.get("policyVote");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set policyVote(value: string | null) {
    if (!value) {
      this.unset("policyVote");
    } else {
      this.set("policyVote", Value.fromString(<string>value));
    }
  }

  get communityProposals(): Array<string> {
    let value = this.get("communityProposals");
    return value!.toStringArray();
  }

  set communityProposals(value: Array<string>) {
    this.set("communityProposals", Value.fromStringArray(value));
  }

  get monetaryProposals(): Array<string> {
    let value = this.get("monetaryProposals");
    return value!.toStringArray();
  }

  set monetaryProposals(value: Array<string>) {
    this.set("monetaryProposals", Value.fromStringArray(value));
  }
}

export class CurrencyGovernance extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save CurrencyGovernance entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type CurrencyGovernance must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("CurrencyGovernance", id.toString(), this);
    }
  }

  static load(id: string): CurrencyGovernance | null {
    return changetype<CurrencyGovernance | null>(
      store.get("CurrencyGovernance", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get generation(): string {
    let value = this.get("generation");
    return value!.toString();
  }

  set generation(value: string) {
    this.set("generation", Value.fromString(value));
  }

  get proposalEnds(): BigInt {
    let value = this.get("proposalEnds");
    return value!.toBigInt();
  }

  set proposalEnds(value: BigInt) {
    this.set("proposalEnds", Value.fromBigInt(value));
  }

  get votingEnds(): BigInt {
    let value = this.get("votingEnds");
    return value!.toBigInt();
  }

  set votingEnds(value: BigInt) {
    this.set("votingEnds", Value.fromBigInt(value));
  }

  get revealEnds(): BigInt {
    let value = this.get("revealEnds");
    return value!.toBigInt();
  }

  set revealEnds(value: BigInt) {
    this.set("revealEnds", Value.fromBigInt(value));
  }

  get defaultProposalMultiplier(): BigInt {
    let value = this.get("defaultProposalMultiplier");
    return value!.toBigInt();
  }

  set defaultProposalMultiplier(value: BigInt) {
    this.set("defaultProposalMultiplier", Value.fromBigInt(value));
  }

  get defaultProposalScore(): BigInt {
    let value = this.get("defaultProposalScore");
    return value!.toBigInt();
  }

  set defaultProposalScore(value: BigInt) {
    this.set("defaultProposalScore", Value.fromBigInt(value));
  }

  get defaultProposalEnacted(): boolean {
    let value = this.get("defaultProposalEnacted");
    return value!.toBoolean();
  }

  set defaultProposalEnacted(value: boolean) {
    this.set("defaultProposalEnacted", Value.fromBoolean(value));
  }

  get commits(): Array<string> {
    let value = this.get("commits");
    return value!.toStringArray();
  }

  set commits(value: Array<string>) {
    this.set("commits", Value.fromStringArray(value));
  }

  get votes(): Array<string> {
    let value = this.get("votes");
    return value!.toStringArray();
  }

  set votes(value: Array<string>) {
    this.set("votes", Value.fromStringArray(value));
  }
}

export class MonetaryProposal extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save MonetaryProposal entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type MonetaryProposal must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("MonetaryProposal", id.toString(), this);
    }
  }

  static load(id: string): MonetaryProposal | null {
    return changetype<MonetaryProposal | null>(
      store.get("MonetaryProposal", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get generation(): string {
    let value = this.get("generation");
    return value!.toString();
  }

  set generation(value: string) {
    this.set("generation", Value.fromString(value));
  }

  get trustee(): string {
    let value = this.get("trustee");
    return value!.toString();
  }

  set trustee(value: string) {
    this.set("trustee", Value.fromString(value));
  }

  get enacted(): boolean {
    let value = this.get("enacted");
    return value!.toBoolean();
  }

  set enacted(value: boolean) {
    this.set("enacted", Value.fromBoolean(value));
  }

  get numberOfRecipients(): BigInt {
    let value = this.get("numberOfRecipients");
    return value!.toBigInt();
  }

  set numberOfRecipients(value: BigInt) {
    this.set("numberOfRecipients", Value.fromBigInt(value));
  }

  get randomInflationReward(): BigInt {
    let value = this.get("randomInflationReward");
    return value!.toBigInt();
  }

  set randomInflationReward(value: BigInt) {
    this.set("randomInflationReward", Value.fromBigInt(value));
  }

  get lockupDuration(): BigInt {
    let value = this.get("lockupDuration");
    return value!.toBigInt();
  }

  set lockupDuration(value: BigInt) {
    this.set("lockupDuration", Value.fromBigInt(value));
  }

  get lockupInterest(): BigInt {
    let value = this.get("lockupInterest");
    return value!.toBigInt();
  }

  set lockupInterest(value: BigInt) {
    this.set("lockupInterest", Value.fromBigInt(value));
  }

  get inflationMultiplier(): BigInt {
    let value = this.get("inflationMultiplier");
    return value!.toBigInt();
  }

  set inflationMultiplier(value: BigInt) {
    this.set("inflationMultiplier", Value.fromBigInt(value));
  }

  get score(): BigInt {
    let value = this.get("score");
    return value!.toBigInt();
  }

  set score(value: BigInt) {
    this.set("score", Value.fromBigInt(value));
  }
}

export class MonetaryCommit extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save MonetaryCommit entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type MonetaryCommit must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("MonetaryCommit", id.toString(), this);
    }
  }

  static load(id: string): MonetaryCommit | null {
    return changetype<MonetaryCommit | null>(store.get("MonetaryCommit", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get hash(): Bytes {
    let value = this.get("hash");
    return value!.toBytes();
  }

  set hash(value: Bytes) {
    this.set("hash", Value.fromBytes(value));
  }

  get currencyGovernance(): string {
    let value = this.get("currencyGovernance");
    return value!.toString();
  }

  set currencyGovernance(value: string) {
    this.set("currencyGovernance", Value.fromString(value));
  }

  get trustee(): string {
    let value = this.get("trustee");
    return value!.toString();
  }

  set trustee(value: string) {
    this.set("trustee", Value.fromString(value));
  }
}

export class MonetaryVote extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save MonetaryVote entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type MonetaryVote must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("MonetaryVote", id.toString(), this);
    }
  }

  static load(id: string): MonetaryVote | null {
    return changetype<MonetaryVote | null>(store.get("MonetaryVote", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get rankedProposals(): Array<string> {
    let value = this.get("rankedProposals");
    return value!.toStringArray();
  }

  set rankedProposals(value: Array<string>) {
    this.set("rankedProposals", Value.fromStringArray(value));
  }

  get currencyGovernance(): string {
    let value = this.get("currencyGovernance");
    return value!.toString();
  }

  set currencyGovernance(value: string) {
    this.set("currencyGovernance", Value.fromString(value));
  }

  get trustee(): string {
    let value = this.get("trustee");
    return value!.toString();
  }

  set trustee(value: string) {
    this.set("trustee", Value.fromString(value));
  }
}

export class TrusteeCohort extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save TrusteeCohort entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type TrusteeCohort must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("TrusteeCohort", id.toString(), this);
    }
  }

  static load(id: string): TrusteeCohort | null {
    return changetype<TrusteeCohort | null>(store.get("TrusteeCohort", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get number(): BigInt {
    let value = this.get("number");
    return value!.toBigInt();
  }

  set number(value: BigInt) {
    this.set("number", Value.fromBigInt(value));
  }

  get trustees(): Array<string> {
    let value = this.get("trustees");
    return value!.toStringArray();
  }

  set trustees(value: Array<string>) {
    this.set("trustees", Value.fromStringArray(value));
  }
}

export class Trustee extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Trustee entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Trustee must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Trustee", id.toString(), this);
    }
  }

  static load(id: string): Trustee | null {
    return changetype<Trustee | null>(store.get("Trustee", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get cohorts(): Array<string> {
    let value = this.get("cohorts");
    return value!.toStringArray();
  }

  set cohorts(value: Array<string>) {
    this.set("cohorts", Value.fromStringArray(value));
  }

  get proposals(): Array<string> {
    let value = this.get("proposals");
    return value!.toStringArray();
  }

  set proposals(value: Array<string>) {
    this.set("proposals", Value.fromStringArray(value));
  }
}

export class PolicyProposal extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save PolicyProposal entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type PolicyProposal must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("PolicyProposal", id.toString(), this);
    }
  }

  static load(id: string): PolicyProposal | null {
    return changetype<PolicyProposal | null>(store.get("PolicyProposal", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get generation(): string {
    let value = this.get("generation");
    return value!.toString();
  }

  set generation(value: string) {
    this.set("generation", Value.fromString(value));
  }

  get proposalEnds(): BigInt {
    let value = this.get("proposalEnds");
    return value!.toBigInt();
  }

  set proposalEnds(value: BigInt) {
    this.set("proposalEnds", Value.fromBigInt(value));
  }

  get totalVotingPower(): BigInt {
    let value = this.get("totalVotingPower");
    return value!.toBigInt();
  }

  set totalVotingPower(value: BigInt) {
    this.set("totalVotingPower", Value.fromBigInt(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    return value!.toBigInt();
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }

  get support(): Array<string> {
    let value = this.get("support");
    return value!.toStringArray();
  }

  set support(value: Array<string>) {
    this.set("support", Value.fromStringArray(value));
  }
}

export class CommunityProposal extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save CommunityProposal entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type CommunityProposal must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("CommunityProposal", id.toString(), this);
    }
  }

  static load(id: string): CommunityProposal | null {
    return changetype<CommunityProposal | null>(
      store.get("CommunityProposal", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get generation(): string {
    let value = this.get("generation");
    return value!.toString();
  }

  set generation(value: string) {
    this.set("generation", Value.fromString(value));
  }

  get proposer(): Bytes {
    let value = this.get("proposer");
    return value!.toBytes();
  }

  set proposer(value: Bytes) {
    this.set("proposer", Value.fromBytes(value));
  }

  get name(): string {
    let value = this.get("name");
    return value!.toString();
  }

  set name(value: string) {
    this.set("name", Value.fromString(value));
  }

  get description(): string {
    let value = this.get("description");
    return value!.toString();
  }

  set description(value: string) {
    this.set("description", Value.fromString(value));
  }

  get url(): string {
    let value = this.get("url");
    return value!.toString();
  }

  set url(value: string) {
    this.set("url", Value.fromString(value));
  }

  get reachedSupportThreshold(): boolean {
    let value = this.get("reachedSupportThreshold");
    return value!.toBoolean();
  }

  set reachedSupportThreshold(value: boolean) {
    this.set("reachedSupportThreshold", Value.fromBoolean(value));
  }

  get refunded(): boolean {
    let value = this.get("refunded");
    return value!.toBoolean();
  }

  set refunded(value: boolean) {
    this.set("refunded", Value.fromBoolean(value));
  }

  get totalSupportAmount(): BigInt {
    let value = this.get("totalSupportAmount");
    return value!.toBigInt();
  }

  set totalSupportAmount(value: BigInt) {
    this.set("totalSupportAmount", Value.fromBigInt(value));
  }

  get support(): Array<string> {
    let value = this.get("support");
    return value!.toStringArray();
  }

  set support(value: Array<string>) {
    this.set("support", Value.fromStringArray(value));
  }
}

export class CommunityProposalSupport extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(
      id != null,
      "Cannot save CommunityProposalSupport entity without an ID"
    );
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type CommunityProposalSupport must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("CommunityProposalSupport", id.toString(), this);
    }
  }

  static load(id: string): CommunityProposalSupport | null {
    return changetype<CommunityProposalSupport | null>(
      store.get("CommunityProposalSupport", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get supporter(): Bytes {
    let value = this.get("supporter");
    return value!.toBytes();
  }

  set supporter(value: Bytes) {
    this.set("supporter", Value.fromBytes(value));
  }

  get proposal(): string {
    let value = this.get("proposal");
    return value!.toString();
  }

  set proposal(value: string) {
    this.set("proposal", Value.fromString(value));
  }

  get policyProposal(): string {
    let value = this.get("policyProposal");
    return value!.toString();
  }

  set policyProposal(value: string) {
    this.set("policyProposal", Value.fromString(value));
  }

  get amount(): BigInt {
    let value = this.get("amount");
    return value!.toBigInt();
  }

  set amount(value: BigInt) {
    this.set("amount", Value.fromBigInt(value));
  }
}

export class PolicyVote extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save PolicyVote entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type PolicyVote must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("PolicyVote", id.toString(), this);
    }
  }

  static load(id: string): PolicyVote | null {
    return changetype<PolicyVote | null>(store.get("PolicyVote", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get generation(): string {
    let value = this.get("generation");
    return value!.toString();
  }

  set generation(value: string) {
    this.set("generation", Value.fromString(value));
  }

  get voteEnds(): BigInt {
    let value = this.get("voteEnds");
    return value!.toBigInt();
  }

  set voteEnds(value: BigInt) {
    this.set("voteEnds", Value.fromBigInt(value));
  }

  get ENACTION_DELAY(): BigInt {
    let value = this.get("ENACTION_DELAY");
    return value!.toBigInt();
  }

  set ENACTION_DELAY(value: BigInt) {
    this.set("ENACTION_DELAY", Value.fromBigInt(value));
  }

  get totalVotingPower(): BigInt {
    let value = this.get("totalVotingPower");
    return value!.toBigInt();
  }

  set totalVotingPower(value: BigInt) {
    this.set("totalVotingPower", Value.fromBigInt(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    return value!.toBigInt();
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }

  get proposal(): string {
    let value = this.get("proposal");
    return value!.toString();
  }

  set proposal(value: string) {
    this.set("proposal", Value.fromString(value));
  }

  get result(): string | null {
    let value = this.get("result");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set result(value: string | null) {
    if (!value) {
      this.unset("result");
    } else {
      this.set("result", Value.fromString(<string>value));
    }
  }

  get yesVoteAmount(): BigInt {
    let value = this.get("yesVoteAmount");
    return value!.toBigInt();
  }

  set yesVoteAmount(value: BigInt) {
    this.set("yesVoteAmount", Value.fromBigInt(value));
  }

  get totalVoteAmount(): BigInt {
    let value = this.get("totalVoteAmount");
    return value!.toBigInt();
  }

  set totalVoteAmount(value: BigInt) {
    this.set("totalVoteAmount", Value.fromBigInt(value));
  }

  get votes(): Array<string> {
    let value = this.get("votes");
    return value!.toStringArray();
  }

  set votes(value: Array<string>) {
    this.set("votes", Value.fromStringArray(value));
  }
}

export class CommunityProposalVote extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(
      id != null,
      "Cannot save CommunityProposalVote entity without an ID"
    );
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type CommunityProposalVote must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("CommunityProposalVote", id.toString(), this);
    }
  }

  static load(id: string): CommunityProposalVote | null {
    return changetype<CommunityProposalVote | null>(
      store.get("CommunityProposalVote", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get voter(): Bytes {
    let value = this.get("voter");
    return value!.toBytes();
  }

  set voter(value: Bytes) {
    this.set("voter", Value.fromBytes(value));
  }

  get policyVote(): string {
    let value = this.get("policyVote");
    return value!.toString();
  }

  set policyVote(value: string) {
    this.set("policyVote", Value.fromString(value));
  }

  get yesAmount(): BigInt {
    let value = this.get("yesAmount");
    return value!.toBigInt();
  }

  set yesAmount(value: BigInt) {
    this.set("yesAmount", Value.fromBigInt(value));
  }

  get totalAmount(): BigInt {
    let value = this.get("totalAmount");
    return value!.toBigInt();
  }

  set totalAmount(value: BigInt) {
    this.set("totalAmount", Value.fromBigInt(value));
  }
}

export class Account extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Account entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Account must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Account", id.toString(), this);
    }
  }

  static load(id: string): Account | null {
    return changetype<Account | null>(store.get("Account", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get ECO(): BigInt {
    let value = this.get("ECO");
    return value!.toBigInt();
  }

  set ECO(value: BigInt) {
    this.set("ECO", Value.fromBigInt(value));
  }

  get ECOx(): BigInt {
    let value = this.get("ECOx");
    return value!.toBigInt();
  }

  set ECOx(value: BigInt) {
    this.set("ECOx", Value.fromBigInt(value));
  }

  get sECOx(): BigInt {
    let value = this.get("sECOx");
    return value!.toBigInt();
  }

  set sECOx(value: BigInt) {
    this.set("sECOx", Value.fromBigInt(value));
  }

  get approvedECO(): Array<string> {
    let value = this.get("approvedECO");
    return value!.toStringArray();
  }

  set approvedECO(value: Array<string>) {
    this.set("approvedECO", Value.fromStringArray(value));
  }

  get historicalECOBalances(): Array<string> {
    let value = this.get("historicalECOBalances");
    return value!.toStringArray();
  }

  set historicalECOBalances(value: Array<string>) {
    this.set("historicalECOBalances", Value.fromStringArray(value));
  }

  get historicalsECOxBalances(): Array<Bytes> {
    let value = this.get("historicalsECOxBalances");
    return value!.toBytesArray();
  }

  set historicalsECOxBalances(value: Array<Bytes>) {
    this.set("historicalsECOxBalances", Value.fromBytesArray(value));
  }
}

export class ECOAllowance extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save ECOAllowance entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type ECOAllowance must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("ECOAllowance", id.toString(), this);
    }
  }

  static load(id: string): ECOAllowance | null {
    return changetype<ECOAllowance | null>(store.get("ECOAllowance", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get owner(): string {
    let value = this.get("owner");
    return value!.toString();
  }

  set owner(value: string) {
    this.set("owner", Value.fromString(value));
  }

  get spender(): string {
    let value = this.get("spender");
    return value!.toString();
  }

  set spender(value: string) {
    this.set("spender", Value.fromString(value));
  }

  get value(): BigInt {
    let value = this.get("value");
    return value!.toBigInt();
  }

  set value(value: BigInt) {
    this.set("value", Value.fromBigInt(value));
  }
}

export class Token extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Token entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Token must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Token", id.toString(), this);
    }
  }

  static load(id: string): Token | null {
    return changetype<Token | null>(store.get("Token", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get name(): string {
    let value = this.get("name");
    return value!.toString();
  }

  set name(value: string) {
    this.set("name", Value.fromString(value));
  }

  get symbol(): string {
    let value = this.get("symbol");
    return value!.toString();
  }

  set symbol(value: string) {
    this.set("symbol", Value.fromString(value));
  }

  get decimals(): i32 {
    let value = this.get("decimals");
    return value!.toI32();
  }

  set decimals(value: i32) {
    this.set("decimals", Value.fromI32(value));
  }

  get totalSupply(): BigInt {
    let value = this.get("totalSupply");
    return value!.toBigInt();
  }

  set totalSupply(value: BigInt) {
    this.set("totalSupply", Value.fromBigInt(value));
  }
}

export class ECOBalance extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save ECOBalance entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type ECOBalance must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("ECOBalance", id.toString(), this);
    }
  }

  static load(id: string): ECOBalance | null {
    return changetype<ECOBalance | null>(store.get("ECOBalance", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get account(): string {
    let value = this.get("account");
    return value!.toString();
  }

  set account(value: string) {
    this.set("account", Value.fromString(value));
  }

  get value(): BigInt {
    let value = this.get("value");
    return value!.toBigInt();
  }

  set value(value: BigInt) {
    this.set("value", Value.fromBigInt(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    return value!.toBigInt();
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }
}

export class InflationMultiplier extends Entity {
  constructor(id: Bytes) {
    super();
    this.set("id", Value.fromBytes(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save InflationMultiplier entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.BYTES,
        `Entities of type InflationMultiplier must have an ID of type Bytes but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("InflationMultiplier", id.toBytes().toHexString(), this);
    }
  }

  static load(id: Bytes): InflationMultiplier | null {
    return changetype<InflationMultiplier | null>(
      store.get("InflationMultiplier", id.toHexString())
    );
  }

  get id(): Bytes {
    let value = this.get("id");
    return value!.toBytes();
  }

  set id(value: Bytes) {
    this.set("id", Value.fromBytes(value));
  }

  get value(): BigInt {
    let value = this.get("value");
    return value!.toBigInt();
  }

  set value(value: BigInt) {
    this.set("value", Value.fromBigInt(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    return value!.toBigInt();
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }
}

export class sECOxBalance extends Entity {
  constructor(id: Bytes) {
    super();
    this.set("id", Value.fromBytes(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save sECOxBalance entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.BYTES,
        `Entities of type sECOxBalance must have an ID of type Bytes but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("sECOxBalance", id.toBytes().toHexString(), this);
    }
  }

  static load(id: Bytes): sECOxBalance | null {
    return changetype<sECOxBalance | null>(
      store.get("sECOxBalance", id.toHexString())
    );
  }

  get id(): Bytes {
    let value = this.get("id");
    return value!.toBytes();
  }

  set id(value: Bytes) {
    this.set("id", Value.fromBytes(value));
  }

  get account(): string {
    let value = this.get("account");
    return value!.toString();
  }

  set account(value: string) {
    this.set("account", Value.fromString(value));
  }

  get value(): BigInt {
    let value = this.get("value");
    return value!.toBigInt();
  }

  set value(value: BigInt) {
    this.set("value", Value.fromBigInt(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    return value!.toBigInt();
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }
}
