import React from 'react';
import { MaterialReactTable } from 'material-react-table';
import { Box, Button, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ReceiptIcon from '@mui/icons-material/Receipt';

const InvoiceTable = ({ filteredData, loading, handleSort, sortKey, sortOrder }) => {
    const columns = [
        {
            accessorKey: 'invoice_list.invoice_no',
            header: 'Invoice ID',
            size: 120,
        },
        {
            accessorKey: 'invoice_list.project_name',
            header: 'Project Name',
        },
        {
            accessorKey: 'invoice_list.due_date',
            header: 'Invoice Date',
        },
        {
            accessorKey: 'invoice_list.invoice_status',
            header: 'Invoice Status',
            Cell: ({ cell }) => {
                const status = cell.getValue();
                const colorClass =
                    status === 'overdue'
                        ? 'bg-red-500'
                        : status === 'draft' || status === 'On hold'
                            ? 'bg-yellow-500'
                            : status === 'Viewed'
                                ? 'bg-blue-500'
                                : status === 'Sent'
                                    ? 'bg-sky-500'
                                    : status === 'Draft'
                                        ? 'bg-purple-500'
                                        : status === 'Paid'
                                            ? 'bg-emerald-500'
                                            : status === 'Void'
                                                ? 'bg-neutral-500'
                                                : status === 'Partially Paid'
                                                    ? 'bg-orange-500'
                                                    : 'bg-green-400';

                return (
                    <span
                        className={`px-3 py-1 rounded-md text-white text-xs font-medium ${colorClass}`}
                    >
                        {status}
                    </span>
                );
            },
        },
        {
            accessorKey: 'invoice_list.contact_person',
            header: 'Contact Person',
        },
        {
            accessorKey: 'invoice_list.contact_email',
            header: 'Contact Email',
        },
        {
            accessorKey: 'invoice_list.Phone_number',
            header: 'Contact Phone',
        },
        {
            accessorKey: 'actions',
            header: 'Action',
            enableSorting: false,
            Cell: ({ row }) => (
                <Box display="flex" justifyContent="center" gap={1}>
                    <Button
                        size="small"
                        variant="contained"
                        color="success"
                        sx={{ fontSize: '12px', px: 2, borderRadius: '20px' }}
                    >
                        View
                    </Button>
                    <Button size="small" variant="text">
                        <DownloadIcon fontSize="small" />
                    </Button>
                    <Button size="small" sx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#333' } }}>
                        <ReceiptIcon fontSize="small" />
                    </Button>
                </Box>
            ),
        },
    ];

    return (
        <MaterialReactTable
            columns={columns}
            data={filteredData}
            state={{ isLoading: loading }}
            enableStickyHeader
            enableColumnResizing
            muiTableBodyCellProps={{
                sx: {
                    textAlign: 'center',
                    fontSize: '14px',
                    px: 1,
                },
            }}
            muiTableHeadCellProps={{
                sx: {
                    backgroundColor: '#E5E7EB', // gray-200
                    color: '#fff',
                    textAlign: 'center',
                    px: 1,
                },
            }}
            muiTableContainerProps={{
                sx: {
                    maxHeight: '70vh',
                },
            }}
            enableSorting
            initialState={{ density: 'compact' }}
            muiTablePaperProps={{
                sx: {
                    overflowX: 'auto',
                    width: '100%',
                },
            }}
            muiTableProps={{
                sx: {
                    minWidth: '100%',
                },
            }}
        />
    );
};

export default InvoiceTable;
