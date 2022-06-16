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

  get policyProposal(): Bytes {
    let value = this.get("policyProposal");
    return value!.toBytes();
  }

  set policyProposal(value: Bytes) {
    this.set("policyProposal", Value.fromBytes(value));
  }

  get policyVote(): Bytes {
    let value = this.get("policyVote");
    return value!.toBytes();
  }

  set policyVote(value: Bytes) {
    this.set("policyVote", Value.fromBytes(value));
  }

  get communityProposals(): Array<string> {
    let value = this.get("communityProposals");
    return value!.toStringArray();
  }

  set communityProposals(value: Array<string>) {
    this.set("communityProposals", Value.fromStringArray(value));
  }
}

export class PolicyProposal extends Entity {
  constructor(id: Bytes) {
    super();
    this.set("id", Value.fromBytes(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save PolicyProposal entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.BYTES,
        `Entities of type PolicyProposal must have an ID of type Bytes but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("PolicyProposal", id.toBytes().toHexString(), this);
    }
  }

  static load(id: Bytes): PolicyProposal | null {
    return changetype<PolicyProposal | null>(
      store.get("PolicyProposal", id.toHexString())
    );
  }

  get id(): Bytes {
    let value = this.get("id");
    return value!.toBytes();
  }

  set id(value: Bytes) {
    this.set("id", Value.fromBytes(value));
  }

  get generation(): string | null {
    let value = this.get("generation");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set generation(value: string | null) {
    if (!value) {
      this.unset("generation");
    } else {
      this.set("generation", Value.fromString(<string>value));
    }
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    return value!.toBigInt();
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
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

  get generation(): string | null {
    let value = this.get("generation");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set generation(value: string | null) {
    if (!value) {
      this.unset("generation");
    } else {
      this.set("generation", Value.fromString(<string>value));
    }
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

  get proposal(): string | null {
    let value = this.get("proposal");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set proposal(value: string | null) {
    if (!value) {
      this.unset("proposal");
    } else {
      this.set("proposal", Value.fromString(<string>value));
    }
  }

  get amount(): BigInt {
    let value = this.get("amount");
    return value!.toBigInt();
  }

  set amount(value: BigInt) {
    this.set("amount", Value.fromBigInt(value));
  }
}

export class PolicyVotes extends Entity {
  constructor(id: Bytes) {
    super();
    this.set("id", Value.fromBytes(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save PolicyVotes entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.BYTES,
        `Entities of type PolicyVotes must have an ID of type Bytes but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("PolicyVotes", id.toBytes().toHexString(), this);
    }
  }

  static load(id: Bytes): PolicyVotes | null {
    return changetype<PolicyVotes | null>(
      store.get("PolicyVotes", id.toHexString())
    );
  }

  get id(): Bytes {
    let value = this.get("id");
    return value!.toBytes();
  }

  set id(value: Bytes) {
    this.set("id", Value.fromBytes(value));
  }

  get generation(): string | null {
    let value = this.get("generation");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set generation(value: string | null) {
    if (!value) {
      this.unset("generation");
    } else {
      this.set("generation", Value.fromString(<string>value));
    }
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    return value!.toBigInt();
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }

  get proposal(): string | null {
    let value = this.get("proposal");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set proposal(value: string | null) {
    if (!value) {
      this.unset("proposal");
    } else {
      this.set("proposal", Value.fromString(<string>value));
    }
  }

  get votes(): Array<Bytes> {
    let value = this.get("votes");
    return value!.toBytesArray();
  }

  set votes(value: Array<Bytes>) {
    this.set("votes", Value.fromBytesArray(value));
  }
}

export class CommunityProposalVote extends Entity {
  constructor(id: Bytes) {
    super();
    this.set("id", Value.fromBytes(id));
  }

  save(): void {
    let id = this.get("id");
    assert(
      id != null,
      "Cannot save CommunityProposalVote entity without an ID"
    );
    if (id) {
      assert(
        id.kind == ValueKind.BYTES,
        `Entities of type CommunityProposalVote must have an ID of type Bytes but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("CommunityProposalVote", id.toBytes().toHexString(), this);
    }
  }

  static load(id: Bytes): CommunityProposalVote | null {
    return changetype<CommunityProposalVote | null>(
      store.get("CommunityProposalVote", id.toHexString())
    );
  }

  get id(): Bytes {
    let value = this.get("id");
    return value!.toBytes();
  }

  set id(value: Bytes) {
    this.set("id", Value.fromBytes(value));
  }

  get policyVote(): Bytes | null {
    let value = this.get("policyVote");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBytes();
    }
  }

  set policyVote(value: Bytes | null) {
    if (!value) {
      this.unset("policyVote");
    } else {
      this.set("policyVote", Value.fromBytes(<Bytes>value));
    }
  }

  get voter(): Bytes {
    let value = this.get("voter");
    return value!.toBytes();
  }

  set voter(value: Bytes) {
    this.set("voter", Value.fromBytes(value));
  }

  get vote(): boolean {
    let value = this.get("vote");
    return value!.toBoolean();
  }

  set vote(value: boolean) {
    this.set("vote", Value.fromBoolean(value));
  }

  get amount(): BigInt {
    let value = this.get("amount");
    return value!.toBigInt();
  }

  set amount(value: BigInt) {
    this.set("amount", Value.fromBigInt(value));
  }
}
