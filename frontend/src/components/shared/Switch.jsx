import { motion } from 'framer-motion'

export function Switch({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full
        ${checked ? 'bg-purple-600' : 'bg-gray-600'}
      `}
    >
      <span className="sr-only">Toggle switch</span>
      <motion.span
        layout
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white
          transition-transform
        `}
        animate={{
          x: checked ? 24 : 4
        }}
      />
    </button>
  )
} 