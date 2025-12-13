import React from 'react';
import { Container, Typography, Card, CardContent } from '@mui/material';

function Profile({ user }) {
    return (
        <Container maxWidth="md">
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Profile
            </Typography>
            <Card>
                <CardContent>
                    <Typography variant="h6">Name: {user?.name}</Typography>
                    <Typography>Email: {user?.email}</Typography>
                    <Typography>Role: {user?.role}</Typography>
                    <Typography>Organization: {user?.organization}</Typography>
                </CardContent>
            </Card>
        </Container>
    );
}

export default Profile;
