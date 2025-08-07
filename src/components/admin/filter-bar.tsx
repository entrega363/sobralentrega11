import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, X } from 'lucide-react'

export interface FilterOption {
  key: string
  label: string
  options: { value: string; label: string }[]
}

interface FilterBarProps {
  onSearch?: (query: string) => void
  onFilter?: (filters: Record<string, any>) => void
  filters?: FilterOption[]
  searchPlaceholder?: string
}

export function FilterBar({ 
  onSearch, 
  onFilter, 
  filters = [], 
  searchPlaceholder = 'Buscar...' 
}: FilterBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...activeFilters }
    
    if (value === 'all' || value === '') {
      delete newFilters[key]
    } else {
      newFilters[key] = value
    }
    
    setActiveFilters(newFilters)
    onFilter?.(newFilters)
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    setActiveFilters({})
    onSearch?.('')
    onFilter?.({})
  }

  const hasActiveFilters = searchQuery || Object.keys(activeFilters).length > 0

  return (
    <div className="bg-white p-4 border-b border-gray-200">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={activeFilters[filter.key] || 'all'}
              onValueChange={(value) => handleFilterChange(filter.key, value)}
            >
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
          <span className="text-sm text-gray-500">Filtros ativos:</span>
          {Object.entries(activeFilters).map(([key, value]) => {
            const filter = filters.find(f => f.key === key)
            const option = filter?.options.find(o => o.value === value)
            
            return (
              <div
                key={key}
                className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
              >
                <span>{filter?.label}: {option?.label}</span>
                <button
                  onClick={() => handleFilterChange(key, '')}
                  className="hover:bg-blue-200 rounded p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}