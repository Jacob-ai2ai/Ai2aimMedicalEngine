/**
 * Report Builder Service
 * Dynamic report generation with filtering, sorting, and export
 */

export interface ReportFilter {
  field: string
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in'
  value: any
}

export interface ReportConfig {
  id: string
  title: string
  description: string
  category: 'productivity' | 'billing' | 'marketing' | 'clinical' | 'inventory'
  dataSource: string // API endpoint or table name
  columns: ReportColumn[]
  defaultFilters?: ReportFilter[]
  defaultSort?: { field: string; direction: 'asc' | 'desc' }
  groupBy?: string[]
  aggregations?: ReportAggregation[]
}

export interface ReportColumn {
  id: string
  label: string
  field: string
  type: 'text' | 'number' | 'date' | 'currency' | 'percentage' | 'badge'
  format?: (value: any) => string
  sortable?: boolean
  filterable?: boolean
  aggregate?: 'sum' | 'avg' | 'count' | 'min' | 'max'
}

export interface ReportAggregation {
  field: string
  function: 'sum' | 'avg' | 'count' | 'min' | 'max'
  label: string
}

export interface ReportData {
  rows: any[]
  totalRows: number
  aggregations?: Record<string, number>
  generatedAt: string
}

export class ReportBuilder {
  /**
   * Generate report data based on configuration
   */
  static async generateReport(
    config: ReportConfig,
    filters: ReportFilter[] = [],
    page: number = 1,
    limit: number = 100
  ): Promise<ReportData> {
    // Build query parameters
    const queryParams = new URLSearchParams()
    queryParams.append('page', page.toString())
    queryParams.append('limit', limit.toString())

    // Apply filters
    filters.forEach(filter => {
      queryParams.append(`filter[${filter.field}]`, JSON.stringify({
        operator: filter.operator,
        value: filter.value
      }))
    })

    // Apply sorting
    if (config.defaultSort) {
      queryParams.append('sort', config.defaultSort.field)
      queryParams.append('direction', config.defaultSort.direction)
    }

    // Fetch data from API
    const response = await fetch(`${config.dataSource}?${queryParams.toString()}`)
    const result = await response.json()

    // Calculate aggregations if specified
    const aggregations: Record<string, number> = {}
    if (config.aggregations && result.data) {
      config.aggregations.forEach(agg => {
        const values = result.data.map((row: any) => Number(row[agg.field]) || 0)
        switch (agg.function) {
          case 'sum':
            aggregations[agg.label] = values.reduce((sum: number, val: number) => sum + val, 0)
            break
          case 'avg':
            aggregations[agg.label] = values.reduce((sum: number, val: number) => sum + val, 0) / values.length
            break
          case 'count':
            aggregations[agg.label] = values.length
            break
          case 'min':
            aggregations[agg.label] = Math.min(...values)
            break
          case 'max':
            aggregations[agg.label] = Math.max(...values)
            break
        }
      })
    }

    return {
      rows: result.data || [],
      totalRows: result.pagination?.total || 0,
      aggregations,
      generatedAt: new Date().toISOString()
    }
  }

  /**
   * Export report to CSV
   */
  static exportToCSV(data: ReportData, config: ReportConfig): string {
    const headers = config.columns.map(col => col.label).join(',')
    const rows = data.rows.map(row => 
      config.columns.map(col => {
        const value = row[col.field]
        // Escape CSV values
        const formatted = typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value
        return formatted
      }).join(',')
    ).join('\n')

    return `${headers}\n${rows}`
  }

  /**
   * Export report to JSON
   */
  static exportToJSON(data: ReportData, config: ReportConfig): string {
    return JSON.stringify({
      report: config.title,
      generatedAt: data.generatedAt,
      totalRows: data.totalRows,
      aggregations: data.aggregations,
      data: data.rows
    }, null, 2)
  }

  /**
   * Download report file
   */
  static downloadReport(data: string, filename: string, format: 'csv' | 'json') {
    const mimeType = format === 'csv' ? 'text/csv' : 'application/json'
    const blob = new Blob([data], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }
}
