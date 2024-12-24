import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from 'react-table';
import { Search } from 'lucide-react';
import { X } from 'lucide-react';
import './../styles/Endpoint-Management.css';
import { toast } from 'react-hot-toast';

// Enhanced Loader Component
const Loader = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] gap-8">
    <div className="relative">
      {/* Outer rotating ring */}
      <div className="absolute inset-0 rounded-full animate-spin-slow">
        <div className="h-16 w-16 rounded-full border-4 border-transparent border-t-indigo-600 border-l-indigo-600"></div>
      </div>
      
      {/* Middle pulsing ring */}
      <div className="absolute inset-0 rounded-full animate-pulse">
        <div className="h-16 w-16 rounded-full border-4 border-indigo-400/30"></div>
      </div>
      
      {/* Inner spinning circle */}
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full animate-spin">
          <div className="h-16 w-16 rounded-full border-4 border-transparent border-r-indigo-500"></div>
        </div>
        
        {/* Center dot */}
        <div className="absolute inset-[6px] rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 animate-pulse"></div>
      </div>
    </div>
    
    {/* Loading text with shimmer effect */}
    <div className="relative">
      <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
        Loading endpoints
        <span className="animate-ellipsis">...</span>
      </div>
      {/* Shimmer overlay */}
      <div className="absolute inset-0 w-full animate-shimmer">
        <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </div>
    </div>
    
    {/* Status message */}
    <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
      Fetching endpoint data
    </p>
  </div>
);

const EndpointManagement = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [endpointInput, setEndpointInput] = useState(['', '', '', '']);
  const [appName, setAppName] = useState('');
  const navigate = useNavigate();

  // Handle Endpoint Input Change
  const handleEndpointChange = (index, value) => {
    const newEndpointInput = [...endpointInput];
    newEndpointInput[index] = value;
    setEndpointInput(newEndpointInput);
  };

  // Handle Add App Submission
  const handleAddApp = async () => {
    // Validate inputs
    if (endpointInput.some(part => part === '')) {
      alert('Please complete the entire IP address');
      return;
    }
    if (!appName.trim()) {
      alert('Please enter an App Name');
      return;
    }

    // Construct full endpoint IP
    const fullEndpoint = endpointInput.join('-');

    try {
      const response = await axios.post(`https://context-aware-firewall-sih-2024.onrender.com/api/${fullEndpoint}/${appName}/addApp`);
      
      // Handle successful response
      toast.success("App added successfully !")
      
      // Reset form and close modal
      setEndpointInput(['', '', '', '']);
      setAppName('');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding app:', error);
      toast.error('Failed to add app. Please try again.');
    }

  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://44.204.255.126:6538/api/endpoints');
        if (typeof response.data === 'string') {
          const parsedData = JSON.parse(response.data);
          setData(parsedData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = useMemo(
    () => [
      {
        Header: 'Endpoint Name',
        accessor: 'name',
      },
      {
        Header: 'IP Address',
        accessor: 'endpoint',
        Cell: ({ value }) => value.replace(/-/g, '.'),
      },
      {
        Header: 'Actions',
        Cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/endpoint-details/${row.original._id.$oid}`)}
              className="view-button"
            >
              View Details
            </button>
            <button
              onClick={() => navigate('/policy-form')}
              className="deploy-button"
            >
              Deploy Policy
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="add-app-button bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
            >
              Add App
            </button>
          </div>
        ),
      },
    ],
    [navigate]
  );

  const tableData = useMemo(
    () => (data?.endpoints || []),
    [data]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    setGlobalFilter,
    state: { pageIndex, pageSize, globalFilter },
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
      data: tableData,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  return (
    <div className="endpoint-management-container">
      <div className="header">
        <h1>Endpoint Management</h1>
      </div>
      
      <div className="table-container">
        {isLoading ? (
          <Loader />
        ) : (
          <>
            <div className="search-container">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                value={globalFilter || ''}
                onChange={e => setGlobalFilter(e.target.value)}
                placeholder="Search endpoints..."
                className="search-input"
              />
            </div>

            <div className="overflow-x-auto">
              <table {...getTableProps()} className="endpoint-table">
                <thead>
                  {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map(column => (
                        <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                          {column.render('Header')}
                          <span>
                            {column.isSorted
                              ? column.isSortedDesc
                                ? ' ↓'
                                : ' ↑'
                              : ''}
                          </span>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                  {page.map(row => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()}>
                        {row.cells.map(cell => (
                          <td {...cell.getCellProps()}>
                            {cell.render('Cell')}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => gotoPage(0)}
                  disabled={!canPreviousPage}
                  className="pagination-button"
                >
                  {'<<'}
                </button>
                <button
                  onClick={() => previousPage()}
                  disabled={!canPreviousPage}
                  className="pagination-button"
                >
                  {'<'}
                </button>
                <button
                  onClick={() => nextPage()}
                  disabled={!canNextPage}
                  className="pagination-button"
                >
                  {'>'}
                </button>
                <button
                  onClick={() => gotoPage(pageCount - 1)}
                  disabled={!canNextPage}
                  className="pagination-button"
                >
                  {'>>'}
                </button>
                <span className="pagination-info">
                  Page{' '}
                  <strong>
                    {pageIndex + 1} of {pageOptions.length}
                  </strong>
                </span>
              </div>
              <select
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
                className="page-size-select"
              >
                {[10, 20, 30, 40, 50].map(size => (
                  <option key={size} value={size}>
                    Show {size}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>
      {/* Add App Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-white">Add New App</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xl font-semibold text-gray-100">Endpoint IPv4</label>
                <div className="flex items-center gap-2">
                  {endpointInput.map((value, index) => (
                    <React.Fragment key={index}>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleEndpointChange(index, e.target.value)}
                        maxLength="3"
                        placeholder="XXX"
                        className="w-16 bg-gray-700 border border-gray-600 rounded-lg px-2 py-2.5 text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {index < 3 && <span className="text-gray-400">.</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xl font-semibold text-gray-100">App Name</label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="Enter App Name"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={handleAddApp}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg transition duration-300"
                >
                  Add App
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EndpointManagement;