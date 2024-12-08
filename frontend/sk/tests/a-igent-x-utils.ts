import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  AgentListed,
  AgentMinted,
  AgentRated,
  AgentRented,
  AgentSold,
  Approval,
  ApprovalForAll,
  OwnershipTransferred,
  PriceUpdated,
  RentalEnded,
  Transfer
} from "../generated/AIgentX/AIgentX"

export function createAgentListedEvent(
  tokenId: BigInt,
  marketPrice: BigInt,
  rentPrice: BigInt
): AgentListed {
  let agentListedEvent = changetype<AgentListed>(newMockEvent())

  agentListedEvent.parameters = new Array()

  agentListedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  agentListedEvent.parameters.push(
    new ethereum.EventParam(
      "marketPrice",
      ethereum.Value.fromUnsignedBigInt(marketPrice)
    )
  )
  agentListedEvent.parameters.push(
    new ethereum.EventParam(
      "rentPrice",
      ethereum.Value.fromUnsignedBigInt(rentPrice)
    )
  )

  return agentListedEvent
}

export function createAgentMintedEvent(
  owner: Address,
  tokenId: BigInt,
  uuid: string,
  name: string
): AgentMinted {
  let agentMintedEvent = changetype<AgentMinted>(newMockEvent())

  agentMintedEvent.parameters = new Array()

  agentMintedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  agentMintedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  agentMintedEvent.parameters.push(
    new ethereum.EventParam("uuid", ethereum.Value.fromString(uuid))
  )
  agentMintedEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )

  return agentMintedEvent
}

export function createAgentRatedEvent(
  tokenId: BigInt,
  rater: Address,
  rating: BigInt
): AgentRated {
  let agentRatedEvent = changetype<AgentRated>(newMockEvent())

  agentRatedEvent.parameters = new Array()

  agentRatedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  agentRatedEvent.parameters.push(
    new ethereum.EventParam("rater", ethereum.Value.fromAddress(rater))
  )
  agentRatedEvent.parameters.push(
    new ethereum.EventParam("rating", ethereum.Value.fromUnsignedBigInt(rating))
  )

  return agentRatedEvent
}

export function createAgentRentedEvent(
  renter: Address,
  tokenId: BigInt,
  duration: BigInt
): AgentRented {
  let agentRentedEvent = changetype<AgentRented>(newMockEvent())

  agentRentedEvent.parameters = new Array()

  agentRentedEvent.parameters.push(
    new ethereum.EventParam("renter", ethereum.Value.fromAddress(renter))
  )
  agentRentedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  agentRentedEvent.parameters.push(
    new ethereum.EventParam(
      "duration",
      ethereum.Value.fromUnsignedBigInt(duration)
    )
  )

  return agentRentedEvent
}

export function createAgentSoldEvent(
  from: Address,
  to: Address,
  tokenId: BigInt,
  price: BigInt
): AgentSold {
  let agentSoldEvent = changetype<AgentSold>(newMockEvent())

  agentSoldEvent.parameters = new Array()

  agentSoldEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  agentSoldEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  agentSoldEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  agentSoldEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )

  return agentSoldEvent
}

export function createApprovalEvent(
  owner: Address,
  approved: Address,
  tokenId: BigInt
): Approval {
  let approvalEvent = changetype<Approval>(newMockEvent())

  approvalEvent.parameters = new Array()

  approvalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromAddress(approved))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return approvalEvent
}

export function createApprovalForAllEvent(
  owner: Address,
  operator: Address,
  approved: boolean
): ApprovalForAll {
  let approvalForAllEvent = changetype<ApprovalForAll>(newMockEvent())

  approvalForAllEvent.parameters = new Array()

  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved))
  )

  return approvalForAllEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createPriceUpdatedEvent(
  tokenId: BigInt,
  marketPrice: BigInt,
  rentPrice: BigInt
): PriceUpdated {
  let priceUpdatedEvent = changetype<PriceUpdated>(newMockEvent())

  priceUpdatedEvent.parameters = new Array()

  priceUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  priceUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "marketPrice",
      ethereum.Value.fromUnsignedBigInt(marketPrice)
    )
  )
  priceUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "rentPrice",
      ethereum.Value.fromUnsignedBigInt(rentPrice)
    )
  )

  return priceUpdatedEvent
}

export function createRentalEndedEvent(
  tokenId: BigInt,
  renter: Address
): RentalEnded {
  let rentalEndedEvent = changetype<RentalEnded>(newMockEvent())

  rentalEndedEvent.parameters = new Array()

  rentalEndedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  rentalEndedEvent.parameters.push(
    new ethereum.EventParam("renter", ethereum.Value.fromAddress(renter))
  )

  return rentalEndedEvent
}

export function createTransferEvent(
  from: Address,
  to: Address,
  tokenId: BigInt
): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent())

  transferEvent.parameters = new Array()

  transferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return transferEvent
}
