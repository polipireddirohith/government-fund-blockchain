import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    CircularProgress,
} from '@mui/material';
import {
    AccountBalance,
    TrendingUp,
    CheckCircle,
    PendingActions,
} from '@mui/icons-material';
import { getFundStats } from '../services/funds';

function Dashboard({ user }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const response = await getFundStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total Funds',
            value: stats?.totalFunds || 0,
            icon: <AccountBalance sx={{ fontSize: 40 }} />,
            color: '#1976d2',
        },
        {
            title: 'Total Allocated',
            value: `₹${(stats?.totalAllocated || 0).toLocaleString()}`,
            icon: <TrendingUp sx={{ fontSize: 40 }} />,
            color: '#2e7d32',
        },
        {
            title: 'Total Released',
            value: `₹${(stats?.totalReleased || 0).toLocaleString()}`,
            icon: <CheckCircle sx={{ fontSize: 40 }} />,
            color: '#ed6c02',
        },
        {
            title: 'Pending Approvals',
            value: stats?.byStatus?.find(s => s._id === 'Pending')?.count || 0,
            icon: <PendingActions sx={{ fontSize: 40 }} />,
            color: '#d32f2f',
        },
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl">
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Welcome, {user?.name}!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Here's an overview of the fund allocation system
            </Typography>

            <Grid container spacing={3}>
                {statCards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card
                            sx={{
                                height: '100%',
                                background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}dd 100%)`,
                                color: 'white',
                                transition: 'transform 0.3s',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                },
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="h6" sx={{ mb: 1, opacity: 0.9 }}>
                                            {card.title}
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold">
                                            {card.value}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ opacity: 0.7 }}>
                                        {card.icon}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Funds by Category
                            </Typography>
                            {stats?.byCategory && Object.entries(stats.byCategory).map(([category, data]) => (
                                <Box key={category} sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {category}
                                    </Typography>
                                    <Typography variant="h6">
                                        {data.count} funds - ₹{data.allocated.toLocaleString()}
                                    </Typography>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Funds by Status
                            </Typography>
                            {stats?.byStatus && stats.byStatus.map((status) => (
                                <Box key={status._id} sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {status._id}
                                    </Typography>
                                    <Typography variant="h6">
                                        {status.count} funds
                                    </Typography>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}

export default Dashboard;
