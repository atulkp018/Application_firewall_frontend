import React, { useState, useEffect } from 'react';
import { useTable, useSortBy, useGlobalFilter, usePagination } from 'react-table';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import './../styles/PolicyManagement.css';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
    <p className="text-lg text-gray-600 font-medium">Loading policies...</p>
  </div>
);

const PolicyManagement = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch policies from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://44.204.255.126:6538/api/allPolicies');
        if (typeof response.data.data === 'string') {
          const parsedData = JSON.parse(response.data.data);
          setData(parsedData);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle delete policy
  const handleDelete = async (policyId) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      try {
        await axios.delete(`http://44.204.255.126:6538/api/deletePolicy/${policyId}`);
        // Remove the deleted policy from the state
        setData((prevData) => prevData.filter((policy) => policy.id !== policyId));
        alert('Policy deleted successfully.');
      } catch (error) {
        console.error('Error deleting policy:', error);
        alert('Failed to delete policy. Please try again.');
      }
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Purpose',
        accessor: 'purpose',
      },
      {
        Header: 'Description',
        accessor: 'description',
      },
      {
        Header: 'Endpoint',
        accessor: 'endpoint',
        Cell: ({ value }) => value.replace(/-/g, '.'),
      },
      {
        Header: 'Actions',
        Cell: ({ row }) => (
          <div className="action-buttons">
            <button
              className="view-details-btn"
              onClick={() =>
                navigate('/PolicyDetails', {
                  state: {
                    name: row.original.name,
                    endpoint: row.original.endpoint,
                  },
                })
              }
            >
              View Details
            </button>
            <button
              className="delete-policy-btn"
              onClick={() => handleDelete(row.original.id)}
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    [navigate]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state,
    setGlobalFilter,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const { globalFilter, pageIndex, pageSize } = state;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="policy-management-container">
      <div className="header">
        <h1>Policy Management</h1>
        <div className="flex flex-col">
          <button
            className="create-policy-btn mb:4"
            onClick={() => navigate('/policy-form')}
          >
            Create A New Policy
          </button>
          <button
            className="create-policy-app-btn"
            onClick={() => navigate('/policy-form-app')}
          >
            Create Application Specific Policy
          </button>
        </div>
      </div>

      <div className="table-container">
        <div className="search-container">
          <input
            className="search-input"
            value={globalFilter || ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search policies..."
          />
        </div>

        <div className="table-wrapper">
          <table {...getTableProps()} className="policy-table">
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      className={
                        column.isSorted
                          ? column.isSortedDesc
                            ? 'sort-desc'
                            : 'sort-asc'
                          : ''
                      }
                    >
                      {column.render('Header')}
                      <span className="sort-indicator">
                        {column.isSorted
                          ? column.isSortedDesc
                            ? ' 🔽'
                            : ' 🔼'
                          : ''}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.map((row) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {data.length > 0 && (
          <div className="pagination">
            <button
              className="pagination-button"
              onClick={() => gotoPage(0)}
              disabled={!canPreviousPage}
            >
              {'<<'}
            </button>
            <button
              className="pagination-button"
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
            >
              {'<'}
            </button>
            <span className="pagination-info">
              Page{' '}
              <strong>
                {pageIndex + 1} of {pageOptions.length}
              </strong>
            </span>
            <button
              className="pagination-button"
              onClick={() => nextPage()}
              disabled={!canNextPage}
            >
              {'>'}
            </button>
            <button
              className="pagination-button"
              onClick={() => gotoPage(pageCount - 1)}
              disabled={!canNextPage}
            >
              {'>>'}
            </button>
            <select
              className="pagination-select"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 40, 50].map((size) => (
                <option key={size} value={size}>
                  Show {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {data.length === 0 && (
          <div className="no-data-message">
            No policies found. Create a new policy to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyManagement;
