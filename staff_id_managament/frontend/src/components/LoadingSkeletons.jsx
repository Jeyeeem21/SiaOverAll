const Bar = ({ className = '' }) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
)

export function TableRowSkeleton({ columns = 5, rows = 5 }) {
  return Array.from({ length: rows }).map((_, rowIndex) => (
    <tr key={rowIndex} className="animate-pulse border-b border-gray-100 last:border-0">
      {Array.from({ length: columns }).map((__, columnIndex) => (
        <td key={columnIndex} className="px-5 py-3.5">
          <Bar className={columnIndex === 0 ? 'h-3 w-20' : columnIndex === 1 ? 'h-3 w-32' : 'h-3 w-full max-w-28'} />
        </td>
      ))}
    </tr>
  ))
}

export function TableSkeleton({ columns = 5, rows = 5 }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-5 py-3"><Bar className="h-2.5 w-16" /></th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white"><TableRowSkeleton columns={columns} rows={rows} /></tbody>
      </table>
    </div>
  )
}

export function CardGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-start gap-3 animate-pulse">
            <Bar className="h-14 w-14 flex-none rounded-xl" />
            <div className="flex-1 space-y-2">
              <Bar className="h-4 w-3/4" />
              <Bar className="h-3 w-1/2" />
              <Bar className="h-3 w-2/3" />
            </div>
          </div>
          <div className="mt-4 flex gap-2 animate-pulse"><Bar className="h-9 flex-1" /><Bar className="h-9 w-20" /></div>
        </div>
      ))}
    </div>
  )
}

export function StatusPageSkeleton() {
  return (
    <div className="workflow-page">
      <div className="workflow-surface bg-white">
        <div className="workflow-header animate-pulse space-y-2"><Bar className="h-6 w-52" /><Bar className="h-3 w-80" /></div>
        <div className="workflow-toolbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 animate-pulse"><Bar className="h-10" /><Bar className="h-10" /></div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, index) => <Bar key={index} className="h-28" />)}
          </div>
        </div>
        <div className="workflow-content pt-0"><TableSkeleton columns={5} rows={4} /></div>
      </div>
    </div>
  )
}
