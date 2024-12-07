import { forwardRef } from 'react'

export const Input = forwardRef(({
  label,
  error,
  multiline = false,
  className = '',
  ...props
}, ref) => {
  const baseStyles = 'w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800'

  const Component = multiline ? 'textarea' : 'input'

  return (
    <div className={className}>
      {label && (
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}
        </label>
      )}
      <Component
        ref={ref}
        className={`${baseStyles} ${error ? 'border-red-500' : ''}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}) 