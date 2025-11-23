"use client"

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchPlaceholder?: string
  searchKey?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Search...",
  searchKey = "",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  })

  return (
    <div className="space-y-4">
      {/* Search */}
      {searchKey && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="input-base max-w-sm"
          />
        </motion.div>
      )}

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <Card className="card-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30 dark:bg-muted/20">
                  {table.getHeaderGroups().map((headerGroup) =>
                    headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-6 py-4 text-left text-sm font-semibold text-foreground dark:text-foreground">
                        {header.isPlaceholder ? null : (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => header.column.toggleSorting()}
                            className="flex items-center gap-2 cursor-pointer select-none text-foreground dark:text-foreground hover:text-primary dark:hover:text-primary transition-colors duration-200"
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && (
                              <motion.div
                                animate={{ rotate: header.column.getIsSorted() === "desc" ? 180 : 0 }}
                                className="w-4 h-4 flex items-center justify-center text-foreground dark:text-foreground"
                              >
                                {header.column.getIsSorted() === "desc" ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : header.column.getIsSorted() === "asc" ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronsUpDown className="w-4 h-4 opacity-50" />
                                )}
                              </motion.div>
                            )}
                          </motion.button>
                        )}
                      </th>
                    )),
                  )}
                </tr>
              </thead>
              <tbody className="bg-card dark:bg-card">
                {table.getRowModel().rows.map((row, index) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    onMouseEnter={() => setHoveredRowId(row.id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                    className={`border-b border-border transition-colors duration-200 ${hoveredRowId === row.id ? "bg-muted/50 dark:bg-muted/30" : "bg-card dark:bg-card"
                      }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 text-sm text-foreground dark:text-foreground">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20 dark:bg-muted/10"
          >
            <div className="text-sm text-muted-foreground dark:text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <div className="flex gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="button-outline bg-transparent text-foreground dark:text-foreground"
                >
                  Previous
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="button-outline bg-transparent text-foreground dark:text-foreground"
                >
                  Next
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  )
}
