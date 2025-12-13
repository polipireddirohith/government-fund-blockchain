import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Divider,
} from '@mui/material';
import {
    Dashboard,
    AccountBalance,
    List as ListIcon,
    Assessment,
    Person,
} from '@mui/icons-material';

const DRAWER_WIDTH = 240;

function Sidebar({ open, user }) {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', roles: ['admin', 'authority', 'auditor', 'beneficiary'] },
        { text: 'Allocate Fund', icon: <AccountBalance />, path: '/allocate', roles: ['admin', 'authority'] },
        { text: 'All Funds', icon: <ListIcon />, path: '/funds', roles: ['admin', 'authority', 'auditor', 'beneficiary'] },
        { text: 'Reports', icon: <Assessment />, path: '/reports', roles: ['admin', 'auditor'] },
        { text: 'Profile', icon: <Person />, path: '/profile', roles: ['admin', 'authority', 'auditor', 'beneficiary'] },
    ];

    const filteredMenuItems = menuItems.filter(item =>
        item.roles.includes(user?.role)
    );

    return (
        <Drawer
            variant="persistent"
            open={open}
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: DRAWER_WIDTH,
                    boxSizing: 'border-box',
                },
            }}
        >
            <Toolbar />
            <Divider />
            <List>
                {filteredMenuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            selected={location.pathname === item.path}
                            onClick={() => navigate(item.path)}
                        >
                            <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );
}

export default Sidebar;
