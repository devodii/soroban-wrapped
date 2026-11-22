import { ArrowDown, ArrowUp } from 'lucide-react'
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import * as React from 'react'
import { cx } from '../cx'
import './Table.scss'

export function Table<Row>({
  columns,
  data,
  onRow,
  initialSort,
  caption,
}: {
  columns: ColumnDef<Row, any>[]
  data: Row[]
  onRow?: (row: Row) => void
  initialSort?: SortingState
  caption: string
}) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSort ?? [])
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="sw-table-wrap">
      <table className="sw-table-table">
        <caption className="sw-table-caption">{caption}</caption>
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => {
                const sorted = header.column.getIsSorted()
                return (
                  <th
                    key={header.id}
                    className={cx(
                      (header.column.columnDef.meta as { right?: boolean } | undefined)?.right &&
                        'sw-table-right',
                    )}
                    aria-sort={
                      sorted ? (sorted === 'desc' ? 'descending' : 'ascending') : undefined
                    }
                  >
                    <button
                      type="button"
                      disabled={!header.column.getCanSort()}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {sorted === 'desc' && <ArrowDown size={12} />}
                      {sorted === 'asc' && <ArrowUp size={12} />}
                    </button>
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={cx(onRow && 'sw-table-clickable')}
              onClick={onRow ? () => onRow(row.original) : undefined}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={cx(
                    (cell.column.columnDef.meta as { right?: boolean } | undefined)?.right &&
                      'sw-table-right',
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
