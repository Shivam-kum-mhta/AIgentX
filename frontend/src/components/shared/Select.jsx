import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'

export function Select({ 
  value, 
  onChange, 
  options, 
  label,
  className = '' 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block mb-2 text-sm font-medium text-gray-200">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-3 rounded-xl
          bg-gray-800/50 backdrop-blur-sm
          border border-gray-700/50
          focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20
          transition-all duration-200
          text-left flex items-center justify-between
          group
        `}
      >
        <span className="flex items-center">
          {selectedOption?.icon && (
            <span className="mr-2">{selectedOption.icon}</span>
          )}
          {selectedOption?.label}
        </span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-40 w-full mt-2 bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`
                    w-full px-4 py-3 text-left flex items-center
                    hover:bg-gray-700/50 transition-colors
                    ${option.value === value ? 'bg-purple-500/10 text-purple-400' : ''}
                  `}
                >
                  {option.icon && <span className="mr-2">{option.icon}</span>}
                  {option.label}
                  {option.value === value && (
                    <Check className="w-4 h-4 ml-auto text-purple-400" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  )
} 