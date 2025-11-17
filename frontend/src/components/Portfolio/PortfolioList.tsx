import React, { FC } from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Button, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';

export interface PortfolioRead {
  id: number;
  name: string;
  created_at: string;
  active: boolean;
}

interface PortfolioListProps {
  portfolios: PortfolioRead[];
  role: 'advisor' | 'client';
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const PortfolioList: FC<PortfolioListProps> = ({ portfolios, role, onEdit, onDelete }) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Created At</TableCell>
          <TableCell>Active</TableCell>
          <TableCell>Details</TableCell>
          {role === 'advisor' && <TableCell>Actions</TableCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {portfolios.map(p => (
          <TableRow key={p.id}>
            <TableCell>{p.name}</TableCell>
            <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
            <TableCell>{p.active ? 'Yes' : 'No'}</TableCell>
            <TableCell>
              <MuiLink component={Link} to={`/portfolios/${p.id}`}>View</MuiLink>
            </TableCell>
            {role === 'advisor' && (
              <TableCell>
                <Button size="small" onClick={() => onEdit && onEdit(p.id)} sx={{ mr: 1 }}>
                  Edit
                </Button>
                <Button size="small" color="error" onClick={() => onDelete && onDelete(p.id)}>
                  Delete
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
