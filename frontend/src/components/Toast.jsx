import { useEffect } from 'react'

export default function Toast({ type = 'success', message, onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return

    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [message, duration, onClose])

  if (!message) return null

  const isError = type === 'error'
  const isWarning = type === 'warning'
  const isInfo = type === 'info'

  return (
    <div className="fixed top-6 right-6 z-[9999] animate-slide-in-right max-w-md w-full px-4">
      <div 
        className={`
          rounded-2xl shadow-2xl overflow-hidden backdrop-blur-lg border-2
          ${isError ? 'bg-red-50/95 border-red-200' : ''}
          ${isWarning ? 'bg-amber-50/95 border-amber-200' : ''}
          ${isInfo ? 'bg-blue-50/95 border-blue-200' : ''}
          ${!isError && !isWarning && !isInfo ? 'bg-emerald-50/95 border-emerald-200' : ''}
        `}
      >
        <div className="p-4 flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {isError ? (
              <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            ) : isWarning ? (
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            ) : isInfo ? (
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>

          {/* Message */}
          <div className="flex-1 pt-1.5 pr-2">
            <p className={`
              text-sm font-semibold leading-snug
              ${isError ? 'text-red-900' : ''}
              ${isWarning ? 'text-amber-900' : ''}
              ${isInfo ? 'text-blue-900' : ''}
              ${!isError && !isWarning && !isInfo ? 'text-emerald-900' : ''}
            `}>
              {message}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className={`
              flex-shrink-0 rounded-lg p-1.5 transition-all hover:scale-110 active:scale-95
              ${isError ? 'hover:bg-red-100 text-red-700' : ''}
              ${isWarning ? 'hover:bg-amber-100 text-amber-700' : ''}
              ${isInfo ? 'hover:bg-blue-100 text-blue-700' : ''}
              ${!isError && !isWarning && !isInfo ? 'hover:bg-emerald-100 text-emerald-700' : ''}
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className={`
          h-1.5 w-full
          ${isError ? 'bg-red-100' : ''}
          ${isWarning ? 'bg-amber-100' : ''}
          ${isInfo ? 'bg-blue-100' : ''}
          ${!isError && !isWarning && !isInfo ? 'bg-emerald-100' : ''}
        `}>
          <div 
            className={`
              h-full
              ${isError ? 'bg-gradient-to-r from-red-500 to-red-600' : ''}
              ${isWarning ? 'bg-gradient-to-r from-amber-500 to-amber-600' : ''}
              ${isInfo ? 'bg-gradient-to-r from-blue-500 to-blue-600' : ''}
              ${!isError && !isWarning && !isInfo ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : ''}
            `}
            style={{ 
              animation: `progress ${duration}ms linear forwards`,
              transformOrigin: 'left'
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  )
}
