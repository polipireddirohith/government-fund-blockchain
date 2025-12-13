import React from 'react';
import { Container, Typography, Card, CardContent } from '@mui/material';

function FundDetails({ user }) {
    return (
        <Container maxWidth="lg">
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Fund Details
            </Typography>
            <Card>
                <CardContent>
                    <Typography>Fund details will be displayed here</Typography>
                </CardContent>
            </Card>
        </Container>
    );
}

export default FundDetails;
