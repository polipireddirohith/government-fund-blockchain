import React from 'react';
import { Container, Typography, Card, CardContent } from '@mui/material';

function Reports({ user }) {
    return (
        <Container maxWidth="xl">
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Reports & Analytics
            </Typography>
            <Card>
                <CardContent>
                    <Typography>Reports and analytics will be displayed here</Typography>
                </CardContent>
            </Card>
        </Container>
    );
}

export default Reports;
