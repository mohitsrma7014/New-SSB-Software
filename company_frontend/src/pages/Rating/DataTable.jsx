import React, { useMemo } from "react";
import { useTable, useSortBy, usePagination, useGlobalFilter } from "react-table";
import { CSVLink } from "react-csv";

const DataTable = ({ data }) => {
  const columns = useMemo(
    () => [
      { Header: "Component", accessor: "component" },
      { Header: "Customer", accessor: "customer" },
      { Header: "Pieces", accessor: "total_schedule_pices" },
      { Header: "Required RM", accessor: "total_schedule_weight" },
      { Header: "Dispatched", accessor: "dispatched" },
      { Header: "Balance", accessor: "balance" },
      { Header: "Location", accessor: "location" },
      { Header: "Verified By", accessor: "verified_by" },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    setGlobalFilter,
    state: { pageIndex, pageSize, globalFilter },
  } = useTable(
    { columns, data, initialState: { pageIndex: 0, pageSize: 10 } },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const csvData = useMemo(() => {
    return data.map((item) => ({
      Component: item.component,
      Customer: item.customer,
      pices: item.pices,
      "Required RM": item.weight,
      Dispatched: item.dispatched,
      Balance: item.balance,
      Location: item.location,
      "Verified By": item.verified_by,
    }));
  }, [data]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-black">
      {/* Search & Export CSV */}
      <div className="flex justify-between items-center mb-4">
        <input
          value={globalFilter || ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search..."
          className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-black"
          aria-label="Search table data"
        />
        <CSVLink data={csvData} filename={"data.csv"}>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
            Export CSV
          </button>
        </CSVLink>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table {...getTableProps()} className="w-full border-collapse text-black">
          <thead>
            {headerGroups.map((headerGroup, index) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={index} className="bg-gray-200 dark:bg-gray-700">
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="p-2 text-left border-b dark:border-gray-700 text-black"
                  >
                    {column.render("Header")}
                    <span>{column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}</span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row, index) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} key={index} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()} className="p-2 border-b dark:border-gray-700 text-black">
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex items-center justify-between text-black">
        <div>
          <button onClick={() => gotoPage(0)} disabled={!canPreviousPage} className="mr-2 px-2 py-1 border rounded">
            {"<<"}
          </button>
          <button onClick={() => previousPage()} disabled={!canPreviousPage} className="mr-2 px-2 py-1 border rounded">
            {"<"}
          </button>
          <button onClick={() => nextPage()} disabled={!canNextPage} className="mr-2 px-2 py-1 border rounded">
            {">"}
          </button>
          <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} className="px-2 py-1 border rounded">
            {">>"}
          </button>
        </div>
        <span>
          Page {" "}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>
        </span>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-black"
        >
          {[10, 20, 30, 40, 50].map((size) => (
            <option key={size} value={size}>
              Show {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DataTable;
