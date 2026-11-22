import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ColumnDef } from '@tanstack/react-table'
import { Table } from './Table'

interface Row {
  name: string
  repos: number
}

const columns: ColumnDef<Row, any>[] = [
  { accessorKey: 'name', header: 'Pattern' },
  { accessorKey: 'repos', header: 'Repos', meta: { right: true } },
]

const meta: Meta = { title: 'ui/Table' }
export default meta

export const Sortable: StoryObj = {
  render: () => (
    <Table<Row>
      caption="Patterns"
      columns={columns}
      initialSort={[{ id: 'repos', desc: true }]}
      data={[
        { name: 'pausable', repos: 1292 },
        { name: 'ttl bump', repos: 3048 },
        { name: 'require auth', repos: 900 },
      ]}
    />
  ),
}
