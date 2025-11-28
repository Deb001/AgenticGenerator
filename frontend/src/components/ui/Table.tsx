import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (value: any, row: T) => React.ReactNode;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
}

function Table<T extends Record<string, any>>({ columns, data }: Props<T>) {
  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full bg-white bg-opacity-10 backdrop-blur-sm text-white">
        <thead className="bg-white bg-opacity-20">
          <tr>
            {columns.map(col => (
              <th key={String(col.accessor)} className="px-4 py-2 text-left font-medium">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-white border-opacity-20 hover:bg-white hover:bg-opacity-20"
            >
              {columns.map(col => (
                <td key={String(col.accessor)} className="px-4 py-2">
                  {col.render ? col.render(row[col.accessor], row) : String(row[col.accessor])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
