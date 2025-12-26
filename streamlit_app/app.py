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

# Custom CSS for Professional Enterprise Styling
def add_custom_css():
    st.markdown("""
    <style>
        /* IMPORT FONT (Inter for a clean look) */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        /* GLOBAL VARIABLES */
        :root {
            --primary-color: #0f172a; /* Deep Navy */
            --secondary-color: #334155; /* Slate */
            --accent-color: #2563eb; /* Royal Blue */
            --background-color: #f8f9fa; /* Light Gray/Off-White */
            --card-bg: #ffffff;
            --text-color: #1e293b;
        }

        html, body, [class*="css"] {
            font-family: 'Inter', sans-serif;
            color: var(--text-color);
        }

        /* MAIN APP BACKGROUND */
        .stApp {
            background-color: var(--background-color);
            /* subtle abstract blockchain/tech background - increased visibility */
            background-image: linear-gradient(rgba(248, 249, 250, 0.85), rgba(248, 249, 250, 0.85)), 
                            url('https://images.unsplash.com/photo-1639322537228-ad71c429d243?q=80&w=2070&auto=format&fit=crop');
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
        }

        /* SIDEBAR STYLING - DARK THEME for PROFESSIONAL CONTRAST */
        [data-testid="stSidebar"] {
            background-color: var(--primary-color);
            border-right: 1px solid #e2e8f0;
        }
        [data-testid="stSidebar"] * {
            color: #ecf0f1 !important;
        }
        [data-testid="stSidebar"] .stRadio > div[role="radiogroup"] > label {
            background-color: transparent;
            border: 1px solid rgba(255,255,255,0.1);
            margin-bottom: 5px;
            border-radius: 6px;
            padding: 10px;
            transition: background 0.2s;
        }
        [data-testid="stSidebar"] .stRadio > div[role="radiogroup"] > label:hover {
            background-color: rgba(255,255,255,0.05);
        }
        [data-testid="stRadio"] div[role="radiogroup"] > label[data-checked="true"] {
             background-color: var(--accent-color) !important;
             border-color: var(--accent-color) !important;
        }

        /* MAIN CONTENT CONTAINERS (CARDS) */
        .block-container {
            padding-top: 2rem;
            max-width: 1200px;
        }

        /* METRIC CARDS */
        div[data-testid="metric-container"] {
            background-color: var(--card-bg);
            border: 1px solid #e2e8f0;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }
        [data-testid="stMetricValue"] {
            color: var(--primary-color);
            font-weight: 700;
        }
        [data-testid="stMetricLabel"] {
            color: #64748b; /* Slate 500 */
            font-size: 0.875rem;
            font-weight: 500;
        }

        /* BUTTONS */
        .stButton>button {
            background-color: var(--accent-color);
            color: white;
            border-radius: 6px;
            border: none;
            padding: 0.5rem 1rem;
            font-weight: 500;
            transition: all 0.2s;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .stButton>button:hover {
            background-color: #1d4ed8; /* Darker Blue */
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        /* FORM INPUTS */
        .stTextInput>div>div>input {
            border-radius: 6px;
            border: 1px solid #cbd5e1;
            color: var(--primary-color);
        }
        .stTextInput>div>div>input:focus {
            border-color: var(--accent-color);
            box-shadow: 0 0 0 1px var(--accent-color);
        }

        /* HEADERS */
        h1, h2, h3 {
            color: var(--primary-color);
            font-weight: 700;
            letter-spacing: -0.025em;
        }
        
        /* TABS */
        .stTabs [data-baseweb="tab-list"] {
            gap: 2rem;
            border-bottom: 2px solid #e2e8f0;
        }
        .stTabs [data-baseweb="tab"] {
            height: auto;
            white-space: pre-wrap;
            background-color: transparent;
            border: none;
            color: #64748b;
            font-weight: 500;
            padding-bottom: 10px;
        }
        .stTabs [aria-selected="true"] {
            color: var(--accent-color);
            border-bottom: 2px solid var(--accent-color);
        }
        
        /* EXPANDERS */
        .streamlit-expanderHeader {
            background-color: var(--card-bg);
            border-radius: 6px;
            border: 1px solid #e2e8f0;
        }
        
        /* ALERTS/MESSAGES */
        .stAlert {
            background-color: #ecfdf5; /* Success Green light */
            border: 1px solid #a7f3d0;
            color: #065f46;
        }
        
    </style>
    """, unsafe_allow_html=True)

def auth_page():
    add_custom_css()
    
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        st.markdown("<h1 style='text-align: center;'>🏛️ Government Fund Allocation</h1>", unsafe_allow_html=True)
        st.markdown("<p style='text-align: center; color: gray;'>Secure, Transparent, and Efficient Fund Management</p>", unsafe_allow_html=True)
        
        tab1, tab2 = st.tabs(["🔐 Login", "📝 Sign Up"])
        
        with tab1:
            st.markdown("### User Login")
            with st.form("login_form"):
                email = st.text_input("Email", placeholder="admin@gov.com")
                password = st.text_input("Password", type="password", placeholder="••••••")
                submit = st.form_submit_button("Login")
                
                if submit:
                    if not email or not password:
                        st.error("⚠️ Please enter both email and password")
                        return

                    with st.spinner("Authenticating..."):
                        response = api_request("POST", "/auth/login", {"email": email, "password": password})
                    
                    if response and response.get("success"):
                        st.session_state.token = response['data']['token']
                        st.session_state.user = response['data']['user']
                        st.balloons()
                        st.success("Login Successful!")
                        st.rerun()
                    else:
                        msg = response.get("message") if response else "Connection refused"
                        st.error(f"❌ Login Failed: {msg}")

        with tab2:
            st.markdown("### Create an Account")
            with st.form("register_form"):
                name = st.text_input("Full Name", placeholder="John Doe")
                email_reg = st.text_input("Email Address", placeholder="john@example.com")
                password_reg = st.text_input("Password (min 6 chars)", type="password", placeholder="••••••")
                
                role = st.selectbox("Role", ["beneficiary", "authority", "auditor", "admin"])
                
                col_r1, col_r2 = st.columns(2)
                with col_r1:
                    organization = st.text_input("Organization (Optional)")
                with col_r2:
                    wallet = st.text_input("Wallet Address (Optional)")
                
                submit_reg = st.form_submit_button("Sign Up")
                
                if submit_reg:
                    if not name or not email_reg or not password_reg:
                        st.warning("⚠️ Name, Email and Password are required!")
                    elif len(password_reg) < 6:
                        st.warning("⚠️ Password must be at least 6 characters long.")
                    else:
                        data = {
                            "name": name,
                            "email": email_reg,
                            "password": password_reg,
                            "role": role,
                            "organization": organization,
                            "walletAddress": wallet
                        }
                        
                        with st.spinner("Creating Account..."):
                            response = api_request("POST", "/auth/register", data)
                        
                        if response and response.get("success"):
                            st.success("✅ Registration Successful! Please switch to the Login tab.")
                            st.balloons()
                        else:
                            error_msg = response.get("message") if response else "Unknown Error"
                            if response and 'errors' in response:
                                error_msg = " | ".join([e['msg'] for e in response['errors']])
                            st.error(f"❌ Registration Failed: {error_msg}")

def dashboard_page():
    add_custom_css()
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
                fig_status = px.pie(df_status, values='count', names='_id', title='Distribution by Status', hole=0.4)
                fig_status.update_layout(showlegend=True)
                st.plotly_chart(fig_status)
            else:
                st.info("No status data available")
                
        with col_c2:
            st.subheader("Funds by Category")
            cat_data = data['byCategory']
            if cat_data:
                df_cat = pd.DataFrame(cat_data)
                fig_cat = px.bar(df_cat, x='_id', y='total', title='Allocation by Category', color='_id')
                st.plotly_chart(fig_cat)
            else:
                st.info("No category data available")
    else:
        st.error("Failed to load dashboard data")

def funds_page():
    add_custom_css()
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
    add_custom_css()
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
    auth_page()
else:
    # Sidebar
    with st.sidebar:
        st.title("Navigation")
        st.markdown("---")
        page = st.radio("Go to", ["Dashboard", "Funds", "Profile"], label_visibility="collapsed")
        st.markdown("---")
        if st.button("Logout", key="sidebar_logout"):
            st.session_state.token = None
            st.session_state.user = None
            st.rerun()
        
    if page == "Dashboard":
        dashboard_page()
    elif page == "Funds":
        funds_page()
    elif page == "Profile":
        profile_page()
