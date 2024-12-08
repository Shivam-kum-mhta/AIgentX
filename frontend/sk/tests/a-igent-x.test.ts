import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { AgentListed } from "../generated/schema"
import { AgentListed as AgentListedEvent } from "../generated/AIgentX/AIgentX"
import { handleAgentListed } from "../src/a-igent-x"
import { createAgentListedEvent } from "./a-igent-x-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let tokenId = BigInt.fromI32(234)
    let marketPrice = BigInt.fromI32(234)
    let rentPrice = BigInt.fromI32(234)
    let newAgentListedEvent = createAgentListedEvent(
      tokenId,
      marketPrice,
      rentPrice
    )
    handleAgentListed(newAgentListedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("AgentListed created and stored", () => {
    assert.entityCount("AgentListed", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "AgentListed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "tokenId",
      "234"
    )
    assert.fieldEquals(
      "AgentListed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "marketPrice",
      "234"
    )
    assert.fieldEquals(
      "AgentListed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "rentPrice",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
