import { useState } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export interface ColumnDef<T> {
  key: string
  header: string
  cell?: (row: T) => React.ReactNode
  sortable?: boolean
  width?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  loading?: boolean
  onRowAction?: (action: string, row: T) => void
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
  }
  emptyMessage?: string
}

export function DataTable<T extends Record<string, any>>({ 
  data, 
  columns, 
  loading = false,
  pagination,
  emptyMessage = 'Nenhum registro encontrado'
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (columnKey: string) => {
    if (!columns.find(col => col.key === columnKey)?.sortable) return

    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0

    const aValue = a[sortColumn]
    const bValue = b[sortColumn]

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const renderCell = (row: T, column: ColumnDef<T>) => {
    if (column.cell) {
      return column.cell(row)
    }
    return row[column.key]
  }

  const renderLoadingSkeleton = () => (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          {columns.map((column) => (
            <TableCell key={column.key}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )

  const renderEmptyState = () => (
    <TableRow>
      <TableCell colSpan={columns.length} className="text-center py-8">
        <div className="text-gray-500">
          <div className="text-4xl mb-2">📋</div>
          <p>{emptyMessage}</p>
        </div>
      </TableCell>
    </TableRow>
  )

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1
  const startItem = pagination ? (pagination.page - 1) * pagination.pageSize + 1 : 1
  const endItem = pagination ? Math.min(pagination.page * pagination.pageSize, pagination.total) : data.length

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead 
                  key={column.key}
                  className={`${column.width || ''} ${column.sortable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && sortColumn === column.key && (
                      <span className="text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              renderLoadingSkeleton()
            ) : sortedData.length === 0 ? (
              renderEmptyState()
            ) : (
              sortedData.map((row, index) => (
                <TableRow key={row.id || index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {renderCell(row, column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
          <div className="text-sm text-gray-700">
            Mostrando {startItem} a {endItem} de {pagination.total} registros
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.page === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm text-gray-700">
              Página {pagination.page} de {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(totalPages)}
              disabled={pagination.page === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}