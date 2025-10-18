import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import PortfolioService from '../services/portfolioService';
import { Portfolio } from '../types/portfolio';

const PortfolioList: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    PortfolioService.getAllPortfolios()
      .then((data) => setPortfolios(data))
      .catch((err) => {
        console.error('Failed to fetch portfolios:', err);
        setPortfolios([]);
      });
  }, []);

  const handleItemClick = (id: string) => {
    navigate(`/portfolio/${id}`);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Client Portfolios
      </Typography>

      {portfolios.length === 0 ? (
        <Typography>No portfolios available.</Typography>
      ) : (
        <List>
          {portfolios.map((portfolio) => (
            <React.Fragment key={portfolio.id}>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleItemClick(portfolio.id)}>
                  <ListItemText
                    primary={portfolio.clientName}
                    secondary={<Link to={`/portfolio/${portfolio.id}`}>View Details</Link>}
                  />
                </ListItemButton>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default PortfolioList;