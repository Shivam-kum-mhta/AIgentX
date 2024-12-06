import { BigInt, Address } from "@graphprotocol/graph-ts"
import {
  TokenMinted as TokenMintedEvent,
  TokenPriceSet as TokenPriceSetEvent,
  TokenSold as TokenSoldEvent
} from "../generated/aigentx/aigentx"
import { NFT, User, Transaction } from "../generated/schema"

function getOrCreateUser(address: Address): User {
  let user = User.load(address.toHexString())
  if (!user) {
    user = new User(address.toHexString())
    user.address = address
    user.save()
  }
  return user
}

export function handleTokenMinted(event: TokenMintedEvent): void {
  let nft = new NFT(event.params.tokenId.toString())
  let creator = getOrCreateUser(event.transaction.from)
  let owner = getOrCreateUser(event.params.to)

  nft.tokenId = event.params.tokenId
  nft.tokenURI = event.params.ipfsHash
  nft.owner = owner.id
  nft.creator = creator.id
  nft.isAIGenerated = event.params.isAIGenerated
  nft.createdAt = event.block.timestamp
  nft.price = BigInt.fromI32(0)

  nft.save()

  let transaction = new Transaction(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  transaction.nft = nft.id
  transaction.user = creator.id
  transaction.type = "MINT"
  transaction.timestamp = event.block.timestamp
  transaction.blockNumber = event.block.number
  transaction.save()
}

export function handleTokenPriceSet(event: TokenPriceSetEvent): void {
  let nft = NFT.load(event.params.tokenId.toString())
  if (nft) {
    nft.price = event.params.price
    nft.save()

    let transaction = new Transaction(
      event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
    )
    transaction.nft = nft.id
    transaction.user = nft.owner
    transaction.type = "PRICE_UPDATE"
    transaction.price = event.params.price
    transaction.timestamp = event.block.timestamp
    transaction.blockNumber = event.block.number
    transaction.save()
  }
}

export function handleTokenSold(event: TokenSoldEvent): void {
  let nft = NFT.load(event.params.tokenId.toString())
  let newOwner = getOrCreateUser(event.params.to)
  
  if (nft) {
    nft.owner = newOwner.id
    nft.price = BigInt.fromI32(0)
    nft.save()

    let transaction = new Transaction(
      event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
    )
    transaction.nft = nft.id
    transaction.user = newOwner.id
    transaction.type = "SALE"
    transaction.price = event.params.price
    transaction.timestamp = event.block.timestamp
    transaction.blockNumber = event.block.number
    transaction.save()
  }
}
