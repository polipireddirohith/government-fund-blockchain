import React from 'react';
import { Container, Typography, Card, CardContent } from '@mui/material';

function AllocateFund({ user }) {
    return (
        <Container maxWidth="lg">
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Allocate Fund
            </Typography>
            <Card>
                <CardContent>
                    <Typography>Fund allocation form will be implemented here</Typography>
                </CardContent>
            </Card>
        </Container>
    );
}

export default AllocateFund;
