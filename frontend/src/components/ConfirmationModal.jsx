export default function ConfirmationModal({ title, message, onConfirm, onCancel, confirmText = 'OK', cancelText = 'Cancel', confirmColor = 'emerald' }) {
  if (!message) return null

  const colorClasses = {
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
    red: 'bg-red-600 hover:bg-red-700',
    blue: 'bg-blue-600 hover:bg-blue-700'
  }

  return (
    <div className="app-confirmation-modal app-modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onCancel}>
      <div 
        className="app-modal-panel bg-white max-w-md animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="app-modal-header">
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          </div>
        )}

        {/* Message body */}
        <div className="app-modal-body">
          <p className="text-gray-700 leading-relaxed">{message}</p>
        </div>

        {/* Footer with buttons */}
        <div className="app-modal-footer flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2.5 rounded-lg font-medium text-white transition-colors ${colorClasses[confirmColor] || colorClasses.emerald}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
