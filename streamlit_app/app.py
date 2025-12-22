import os
import streamlit as st
import requests
import pandas as pd
import plotly.express as px
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Configuration
API_URL = os.getenv("REACT_APP_API_URL", "http://localhost:5000/api")

st.set_page_config(
    page_title="Government Fund Allocation System",
    page_icon="🏛️",
    layout="wide"
)

# Session State for Auth
if 'token' not in st.session_state:
    st.session_state.token = None
if 'user' not in st.session_state:
    st.session_state.user = None

# Helper Functions
def api_request(method, endpoint, data=None):
    headers = {}
    if st.session_state.token:
        headers['Authorization'] = f"Bearer {st.session_state.token}"
    
    url = f"{API_URL}{endpoint}"
    
    try:
        if method == 'GET':
            response = requests.get(url, headers=headers)
        elif method == 'POST':
            response = requests.post(url, json=data, headers=headers)
        elif method == 'PUT':
            response = requests.put(url, json=data, headers=headers)
        else:
            return None
            
        return response.json()
    except Exception as e:
        st.error(f"API Error: {str(e)}")
        return None

def login_page():
    st.title("🏛️ Government Fund Allocation System")
    st.header("Login")
    
    with st.form("login_form"):
        email = st.text_input("Email")
        password = st.text_input("Password", type="password")
        submit = st.form_submit_button("Login")
        
        if submit:
            if not email or not password:
                st.error("Please enter both email and password")
                return

            response = api_request("POST", "/auth/login", {"email": email, "password": password})
            
            if response and response.get("success"):
                st.session_state.token = response['data']['token']
                st.session_state.user = response['data']['user']
                st.success("Login Successful!")
                st.rerun()
            else:
                msg = response.get("message") if response else "Connection refused"
                st.error(f"Login Failed: {msg}")

def dashboard_page():
    st.title(f"Welcome, {st.session_state.user['name']}")
    st.caption(f"Role: {st.session_state.user['role'].upper()} | Organization: {st.session_state.user['organization']}")
    
    # Fetch Stats
    stats = api_request("GET", "/funds/stats/overview")
    
    if stats and stats.get("success"):
        data = stats['data']
        col1, col2, col3 = st.columns(3)
        col1.metric("Total Funds", data['totalFunds'])
        col2.metric("Total Allocated", f"${data['totalAllocated']:,.2f}")
        col3.metric("Total Released", f"${data['totalReleased']:,.2f}")
        
        st.divider()
        
        # Charts
        col_c1, col_c2 = st.columns(2)
        
        with col_c1:
            st.subheader("Funds by Status")
            status_data = data['byStatus']
            if status_data:
                df_status = pd.DataFrame(status_data)
                fig_status = px.pie(df_status, values='count', names='_id', title='Distribution by Status')
                st.plotly_chart(fig_status)
            else:
                st.info("No status data available")
                
        with col_c2:
            st.subheader("Funds by Category")
            cat_data = data['byCategory']
            if cat_data:
                df_cat = pd.DataFrame(cat_data)
                fig_cat = px.bar(df_cat, x='_id', y='total', title='Allocation by Category')
                st.plotly_chart(fig_cat)
            else:
                st.info("No category data available")

def funds_page():
    st.header("Fund Allocations")
    
    # Filters
    col1, col2 = st.columns(2)
    with col1:
        status_filter = st.selectbox("Status", ["All", "Pending", "Approved", "Released", "Rejected"])
    with col2:
        category_filter = st.selectbox("Category", ["All", "Education", "Healthcare", "Infrastructure", "SocialWelfare", "Agriculture"])
        
    # Build Query
    query = ""
    params = []
    if status_filter != "All":
        params.append(f"status={status_filter}")
    if category_filter != "All":
        params.append(f"category={category_filter}")
        
    if params:
        query = "?" + "&".join(params)
        
    response = api_request("GET", f"/funds{query}")
    
    if response and response.get("success"):
        funds = response['data']
        if funds:
            for fund in funds:
                with st.expander(f"{fund['projectName']} ({fund['status']}) - ${fund['totalAmount']:,}"):
                    st.write(f"**Description:** {fund['description']}")
                    st.write(f"**Category:** {fund['category']}")
                    st.write(f"**Beneficiary:** {fund['beneficiary']['name']} ({fund['beneficiary']['organization']})")
                    st.write(f"**Allocated Date:** {fund['createdAt'][:10]}")
                    if fund.get('approvals'):
                         st.write(f"**Approvals:** {len(fund['approvals'])}")
        else:
            st.info("No funds found matching criteria")
            
def profile_page():
    st.header("My Profile")
    user = st.session_state.user
    
    st.text_input("Name", value=user['name'], disabled=True)
    st.text_input("Email", value=user['email'], disabled=True)
    st.text_input("Role", value=user['role'], disabled=True)
    st.text_input("Organization", value=user.get('organization', ''), disabled=True)
    st.text_input("Wallet Address", value=user.get('walletAddress', ''), disabled=True)
    
    if st.button("Logout"):
        st.session_state.token = None
        st.session_state.user = None
        st.rerun()

# Main Router
if not st.session_state.token:
    login_page()
else:
    # Sidebar
    with st.sidebar:
        st.title("Navigation")
        page = st.radio("Go to", ["Dashboard", "Funds", "Profile"])
        
    if page == "Dashboard":
        dashboard_page()
    elif page == "Funds":
        funds_page()
    elif page == "Profile":
        profile_page()
