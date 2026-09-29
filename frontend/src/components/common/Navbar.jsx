import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import {
  Home,
  PlusCircle,
  LayoutDashboard,
  Heart,
  LogOut,
  LogIn,
  Sparkles,
  Shield,
  User,
  Key,
  Compass,
} from 'lucide-react';
import { INITIAL_USERS } from '../../services/mockData';

const Navbar = () => {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 1-Click Role Switcher for instant demoing & testing
  const switchDemoAccount = (roleType) => {
    if (roleType === 'guest') {
      logout();
      navigate('/');
      return;
    }

    let targetUser = INITIAL_USERS[3]; // default tenant
    if (roleType === 'admin') targetUser = INITIAL_USERS[0];
    if (roleType === 'owner') targetUser = INITIAL_USERS[1];

    localStorage.setItem('househunt_user', JSON.stringify(targetUser));
    localStorage.setItem('househunt_token', 'mock_jwt_token_' + targetUser._id);
    updateUser(targetUser);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="pill-badge pill-rejected">Admin</span>;
      case 'owner':
        return <span className="pill-badge pill-pending">Landlord</span>;
      default:
        return <span className="pill-badge pill-type">Tenant</span>;
    }
  };

  return (
    <>
      {/* Top Demo Toolbar: Instant role switcher */}
      <div className="demo-role-bar">
        <div className="container d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-center gap-2 text-secondary">
            <Sparkles size={14} className="text-warning" />
            <span className="fw-semibold">Interactive Demo Mode:</span>
            <span className="text-muted d-none d-sm-inline">Switch user roles with 1-click</span>
          </div>
          <div className="d-flex align-items-center gap-1">
            <button
              onClick={() => switchDemoAccount('admin')}
              className={`demo-role-btn ${user?.role === 'admin' ? 'active' : ''}`}
              title="Test as Platform Administrator"
            >
              👑 Admin (Sarah)
            </button>
            <button
              onClick={() => switchDemoAccount('owner')}
              className={`demo-role-btn ${user?.role === 'owner' ? 'active' : ''}`}
              title="Test as Property Landlord"
            >
              🏡 Landlord (Vikram)
            </button>
            <button
              onClick={() => switchDemoAccount('tenant')}
              className={`demo-role-btn ${user?.role === 'tenant' ? 'active' : ''}`}
              title="Test as Tenant Renter"
            >
              🔑 Tenant (Rahul)
            </button>
            {isAuthenticated && (
              <button
                onClick={() => switchDemoAccount('guest')}
                className="demo-role-btn text-muted"
                title="Log out and view as guest"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Glass Navbar */}
      <header className="luxe-navbar glass-nav">
        <div className="container py-2">
          <div className="d-flex align-items-center justify-content-between">
            {/* Brand Logo */}
            <Link to="/" className="d-flex align-items-center gap-3 text-decoration-none">
              <div className="brand-logo-icon">
                <Home size={22} strokeWidth={2.5} />
              </div>
              <div>
                <div className="d-flex align-items-center gap-1">
                  <span className="brand-font fs-4 fw-bolder text-dark" style={{ letterSpacing: '-0.5px' }}>
                    House<span style={{ color: 'var(--color-brand-600)' }}>Hunt</span>
                  </span>
                  <span
                    className="badge bg-dark text-white text-uppercase"
                    style={{ fontSize: '0.62rem', letterSpacing: '0.08em', padding: '0.2rem 0.45rem' }}
                  >
                    LUXE
                  </span>
                </div>
                <div className="text-muted" style={{ fontSize: '0.72rem', marginTop: '-4px' }}>
                  Verified Real Estate Marketplace
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="d-none d-lg-flex align-items-center gap-1">
              <Link
                to="/"
                className={`nav-link-custom ${location.pathname === '/' ? 'active' : ''}`}
              >
                Home
              </Link>
              <Link
                to="/properties"
                className={`nav-link-custom ${
                  location.pathname.startsWith('/properties') && location.pathname !== '/properties/new'
                    ? 'active'
                    : ''
                }`}
              >
                <Compass size={16} /> Explore Residences
              </Link>
              <Link
                to="/properties?propertyType=Villa"
                className="nav-link-custom"
              >
                Villas
              </Link>
              <Link
                to="/properties?propertyType=Penthouse"
                className="nav-link-custom"
              >
                Penthouses
              </Link>

              {isAuthenticated && (user?.role === 'owner' || user?.role === 'admin') && (
                <Link
                  to="/properties/new"
                  className={`nav-link-custom ${location.pathname === '/properties/new' ? 'active' : ''}`}
                >
                  <PlusCircle size={16} /> Post Property
                </Link>
              )}

              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className={`nav-link-custom ${location.pathname === '/dashboard' ? 'active' : ''}`}
                >
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
              )}
            </nav>

            {/* Right Action Icons & User Dropdown */}
            <div className="d-flex align-items-center gap-2">
              {/* Favorites shortcut */}
              <Link
                to="/properties?favorites=true"
                className="btn btn-light rounded-circle p-2 position-relative border"
                style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Saved Favorite Properties"
              >
                <Heart size={18} className={favorites.length > 0 ? 'text-danger fill-danger' : 'text-secondary'} />
                {favorites.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                    {favorites.length}
                  </span>
                )}
              </Link>

              {/* List Property CTA (for owners/admin or guest) */}
              <Link
                to={isAuthenticated && (user?.role === 'owner' || user?.role === 'admin') ? '/properties/new' : '/login'}
                className="btn btn-luxe-primary d-none d-md-inline-flex"
                style={{ padding: '0.55rem 1.15rem', fontSize: '0.88rem' }}
              >
                <PlusCircle size={16} /> List Property
              </Link>

              {isAuthenticated ? (
                <div className="dropdown">
                  <button
                    className="btn btn-light d-flex align-items-center gap-2 border rounded-pill py-1 px-2 pe-3 shadow-xs"
                    type="button"
                    id="userMenuBtn"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={user?.name}
                      className="rounded-circle"
                      style={{ width: 32, height: 32, objectFit: 'cover' }}
                    />
                    <div className="text-start d-none d-sm-block">
                      <div className="fw-bold text-dark small leading-tight">
                        {user?.name?.split(' ')[0]}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {user?.role}
                      </div>
                    </div>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2 p-2 rounded-4" style={{ minWidth: 230 }}>
                    <li className="px-3 py-2 border-bottom">
                      <div className="fw-bold text-dark">{user?.name}</div>
                      <div className="text-muted small text-truncate">{user?.email}</div>
                      <div className="mt-1">{getRoleBadge(user?.role)}</div>
                    </li>
                    <li>
                      <Link to="/dashboard" className="dropdown-item py-2 mt-1 rounded-3 d-flex align-items-center gap-2">
                        <LayoutDashboard size={16} className="text-primary" />
                        My Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link to="/properties?favorites=true" className="dropdown-item py-2 rounded-3 d-flex align-items-center gap-2">
                        <Heart size={16} className="text-danger" />
                        Saved Homes ({favorites.length})
                      </Link>
                    </li>
                    {(user?.role === 'owner' || user?.role === 'admin') && (
                      <li>
                        <Link to="/properties/new" className="dropdown-item py-2 rounded-3 d-flex align-items-center gap-2">
                          <PlusCircle size={16} className="text-success" />
                          List New House
                        </Link>
                      </li>
                    )}
                    <li>
                      <hr className="dropdown-divider my-1" />
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="dropdown-item py-2 text-danger rounded-3 d-flex align-items-center gap-2"
                      >
                        <LogOut size={16} />
                        Log Out
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <Link to="/login" className="btn btn-luxe-secondary py-2 px-3 small">
                    <LogIn size={15} /> Sign In
                  </Link>
                  <Link to="/register" className="btn btn-luxe-primary py-2 px-3 small d-none d-sm-inline-flex">
                    <Sparkles size={15} /> Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
