import React from 'react';
import { Container, Typography, Card, CardContent } from '@mui/material';

function FundList({ user }) {
    return (
        <Container maxWidth="xl">
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                All Funds
            </Typography>
            <Card>
                <CardContent>
                    <Typography>Fund list will be displayed here</Typography>
                </CardContent>
            </Card>
        </Container>
    );
}

export default FundList;
