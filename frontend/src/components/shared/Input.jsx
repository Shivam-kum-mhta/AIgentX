import { forwardRef } from 'react'
import { motion } from 'framer-motion'

export const Input = forwardRef(({
  label,
  error,
  multiline = false,
  className = '',
  ...props
}, ref) => {
  const baseStyles = `
    w-full px-4 py-3 rounded-xl 
    bg-gray-800/50 backdrop-blur-sm
    border border-gray-700/50
    focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    placeholder:text-gray-500
  `

  const Component = multiline ? 'textarea' : 'input'

  return (
    <motion.div 
      className={className}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {label && (
        <label className="block mb-2 text-sm font-medium text-gray-200">
          {label}
        </label>
      )}
      <div className="relative">
        <Component
          ref={ref}
          className={`${baseStyles} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
          {...props}
        />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-1 text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  )
}) 