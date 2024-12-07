import { useState } from 'react'
import { ethers } from 'ethers'
import { Button } from '../shared/Button'
import { Input } from '../shared/Input'
import { Switch } from '../shared/Switch'

export function ListAgent({ agent, onSubmit, onCancel }) {
  const [marketPrice, setMarketPrice] = useState('')
  const [rentPrice, setRentPrice] = useState('')
  const [isForSale, setIsForSale] = useState(false)
  const [isForRent, setIsForRent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit({
        marketPrice: ethers.utils.parseEther(marketPrice),
        rentPrice: ethers.utils.parseEther(rentPrice),
        isForSale,
        isForRent
      })
    } catch (error) {
      console.error('Error listing agent:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span>List for Sale</span>
          <Switch
            checked={isForSale}
            onChange={setIsForSale}
          />
        </div>
        {isForSale && (
          <Input
            label="Sale Price (ETH)"
            type="number"
            step="0.001"
            value={marketPrice}
            onChange={(e) => setMarketPrice(e.target.value)}
            required={isForSale}
          />
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span>List for Rent</span>
          <Switch
            checked={isForRent}
            onChange={setIsForRent}
          />
        </div>
        {isForRent && (
          <Input
            label="Rent Price (ETH/day)"
            type="number"
            step="0.001"
            value={rentPrice}
            onChange={(e) => setRentPrice(e.target.value)}
            required={isForRent}
          />
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
          disabled={!isForSale && !isForRent}
        >
          List Agent
        </Button>
      </div>
    </form>
  )
} 