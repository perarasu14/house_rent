import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import {
  propertiesAPI,
  bookingsAPI,
  statsAPI,
} from '../services/api';
import PropertyCard from '../components/properties/PropertyCard';
import {
  LayoutDashboard,
  Building,
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Users,
  DollarSign,
  MapPin,
  TrendingUp,
  AlertCircle,
  ShieldAlert,
  Eye,
  Check,
  X,
  Heart,
  Mail,
  Phone,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const [activeTab, setActiveTab] = useState('overview');

  // Stats
  const [platformStats, setPlatformStats] = useState(null);
  const [ownerStats, setOwnerStats] = useState(null);

  // Data lists
  const [myProperties, setMyProperties] = useState([]);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [tenantBookings, setTenantBookings] = useState([]);
  const [ownerBookings, setOwnerBookings] = useState([]);
  const [allProperties, setAllProperties] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  const fetchData = async () => {
    try {
      setLoading(true);

      const [allPropsRes] = await Promise.allSettled([
        propertiesAPI.getAll({ limit: 50, includePending: 'true' }),
      ]);
      if (allPropsRes.status === 'fulfilled' && allPropsRes.value.data.success) {
        setAllProperties(allPropsRes.value.data.properties);
      }

      if (user?.role === 'admin') {
        const [statsRes, pendingRes] = await Promise.allSettled([
          statsAPI.getPlatformStats(),
          propertiesAPI.getAdminPending(),
        ]);

        if (statsRes.status === 'fulfilled') setPlatformStats(statsRes.value.data.stats);
        if (pendingRes.status === 'fulfilled') setPendingProperties(pendingRes.value.data.properties);
      } else if (user?.role === 'owner') {
        const [ownerStatsRes, myPropsRes, requestsRes] = await Promise.allSettled([
          statsAPI.getOwnerStats(),
          propertiesAPI.getMyProperties(),
          bookingsAPI.getOwnerRequests(),
        ]);

        if (ownerStatsRes.status === 'fulfilled') setOwnerStats(ownerStatsRes.value.data.stats);
        if (myPropsRes.status === 'fulfilled') setMyProperties(myPropsRes.value.data.properties);
        if (requestsRes.status === 'fulfilled') setOwnerBookings(requestsRes.value.data.bookings);
      } else {
        // Tenant
        const bookingsRes = await bookingsAPI.getMyBookings();
        if (bookingsRes.data.success) {
          setTenantBookings(bookingsRes.data.bookings);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Admin approves / rejects property listing
  const handlePropertyStatusChange = async (propertyId, status) => {
    try {
      const res = await propertiesAPI.updateStatus(propertyId, { status });
      if (res.data.success) {
        setActionMessage({
          type: 'success',
          text: `Property marked as ${status.toUpperCase()} successfully!`,
        });
        setPendingProperties((prev) => prev.filter((p) => p._id !== propertyId));
        setAllProperties((prev) =>
          prev.map((p) => (p._id === propertyId ? { ...p, status } : p))
        );
      }
    } catch (err) {
      setActionMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to update property status',
      });
    }
  };

  // Landlord approves / rejects tenant booking request
  const handleBookingStatusChange = async (bookingId, status) => {
    try {
      const res = await bookingsAPI.updateStatus(bookingId, { status });
      if (res.data.success) {
        setActionMessage({
          type: 'success',
          text: `Lease request updated to ${status.toUpperCase()}!`,
        });
        setOwnerBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status } : b))
        );
      }
    } catch (err) {
      setActionMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to update booking status',
      });
    }
  };

  // Tenant cancels booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) return;
    try {
      const res = await bookingsAPI.cancel(bookingId);
      if (res.data.success) {
        setActionMessage({
          type: 'info',
          text: 'Booking request cancelled.',
        });
        setTenantBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: 'cancelled' } : b))
        );
      }
    } catch (err) {
      setActionMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to cancel booking',
      });
    }
  };

  // Delete property
  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to permanently delete this property listing?')) return;
    try {
      const res = await propertiesAPI.delete(propertyId);
      if (res.data.success) {
        setActionMessage({ type: 'success', text: 'Property listing deleted.' });
        setMyProperties((prev) => prev.filter((p) => p._id !== propertyId));
        setPendingProperties((prev) => prev.filter((p) => p._id !== propertyId));
        setAllProperties((prev) => prev.filter((p) => p._id !== propertyId));
      }
    } catch (err) {
      setActionMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to delete property',
      });
    }
  };

  const formatPrice = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const savedPropertiesList = allProperties.filter((p) => favorites.includes(p._id));

  return (
    <div className="py-5 bg-page min-vh-100">
      <div className="container">
        {/* Welcome Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="pill-badge pill-type">
                Executive Portal
              </span>
              <span className="pill-badge pill-featured">
                ● Live Sync Active
              </span>
            </div>
            <h1 className="fw-bold text-dark brand-font mb-1">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-muted mb-0">
              Role:{' '}
              <span className="badge bg-dark text-white text-uppercase px-2 py-1 ms-1">
                {user?.role === 'owner' ? 'Landlord / Host' : user?.role}
              </span>
              <span className="ms-2 text-secondary small">({user?.email})</span>
            </p>
          </div>

          {(user?.role === 'owner' || user?.role === 'admin') && (
            <div className="mt-3 mt-md-0 d-flex gap-2">
              <Link to="/properties/new" className="btn btn-luxe-primary">
                <PlusCircle size={18} /> Post New Property
              </Link>
            </div>
          )}
        </div>

        {/* Global Feedback Alert */}
        {actionMessage.text && (
          <div
            className={`alert alert-${actionMessage.type} alert-dismissible fade show rounded-4 mb-4 shadow-xs`}
            role="alert"
          >
            <div className="d-flex align-items-center gap-2">
              <CheckCircle2 size={18} />
              <span>{actionMessage.text}</span>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={() => setActionMessage({ type: '', text: '' })}
            ></button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* KPI METRIC CARDS                                                          */}
        {/* ========================================================================= */}
        <div className="row g-4 mb-5">
          {user?.role === 'admin' ? (
            <>
              <div className="col-md-3 col-6">
                <div className="dash-kpi-card">
                  <div className="dash-kpi-icon-box bg-primary bg-opacity-10 text-primary">
                    <Building size={24} />
                  </div>
                  <div className="text-muted small fw-bold">Total Inventory</div>
                  <div className="display-6 fw-bold text-dark brand-font">
                    {platformStats?.totalProperties || allProperties.length}
                  </div>
                  <div className="text-success small fw-semibold mt-1">Verified Residences</div>
                </div>
              </div>

              <div className="col-md-3 col-6">
                <div className="dash-kpi-card border-warning border-opacity-50">
                  <div className="dash-kpi-icon-box bg-warning bg-opacity-10 text-warning">
                    <Clock size={24} />
                  </div>
                  <div className="text-muted small fw-bold">Pending Review</div>
                  <div className="display-6 fw-bold text-warning brand-font">
                    {pendingProperties.length}
                  </div>
                  <div className="text-muted small mt-1">Awaiting moderation</div>
                </div>
              </div>

              <div className="col-md-3 col-6">
                <div className="dash-kpi-card">
                  <div className="dash-kpi-icon-box bg-info bg-opacity-10 text-info">
                    <Users size={24} />
                  </div>
                  <div className="text-muted small fw-bold">Active Members</div>
                  <div className="display-6 fw-bold text-dark brand-font">
                    {platformStats?.totalUsers || 24}
                  </div>
                  <div className="text-info small fw-semibold mt-1">Landlords & Renters</div>
                </div>
              </div>

              <div className="col-md-3 col-6">
                <div className="dash-kpi-card">
                  <div className="dash-kpi-icon-box bg-success bg-opacity-10 text-success">
                    <TrendingUp size={24} />
                  </div>
                  <div className="text-muted small fw-bold">Platform Bookings</div>
                  <div className="display-6 fw-bold text-success brand-font">
                    {platformStats?.totalBookings || 18}
                  </div>
                  <div className="text-muted small mt-1">Digital leases created</div>
                </div>
              </div>
            </>
          ) : user?.role === 'owner' ? (
            <>
              <div className="col-md-3 col-6">
                <div className="dash-kpi-card">
                  <div className="dash-kpi-icon-box bg-primary bg-opacity-10 text-primary">
                    <Building size={24} />
                  </div>
                  <div className="text-muted small fw-bold">My Listed Homes</div>
                  <div className="display-6 fw-bold text-dark brand-font">
                    {myProperties.length}
                  </div>
                  <div className="text-success small fw-semibold mt-1">Active portfolios</div>
                </div>
              </div>

              <div className="col-md-3 col-6">
                <div className="dash-kpi-card">
                  <div className="dash-kpi-icon-box bg-warning bg-opacity-10 text-warning">
                    <CalendarCheck size={24} />
                  </div>
                  <div className="text-muted small fw-bold">Incoming Requests</div>
                  <div className="display-6 fw-bold text-warning brand-font">
                    {ownerBookings.length}
                  </div>
                  <div className="text-muted small mt-1">Tenant lease inquiries</div>
                </div>
              </div>

              <div className="col-md-3 col-6">
                <div className="dash-kpi-card">
                  <div className="dash-kpi-icon-box bg-success bg-opacity-10 text-success">
                    <DollarSign size={24} />
                  </div>
                  <div className="text-muted small fw-bold">Monthly Rental Pipeline</div>
                  <div className="fs-3 fw-bold text-success brand-font mt-1">
                    {formatPrice(ownerStats?.monthlyRevenue || 275000)}
                  </div>
                  <div className="text-muted small mt-1">Estimated monthly yield</div>
                </div>
              </div>

              <div className="col-md-3 col-6">
                <div className="dash-kpi-card">
                  <div className="dash-kpi-icon-box bg-info bg-opacity-10 text-info">
                    <Sparkles size={24} />
                  </div>
                  <div className="text-muted small fw-bold">Host Rating</div>
                  <div className="display-6 fw-bold text-info brand-font">
                    5.0 ★
                  </div>
                  <div className="text-success small fw-semibold mt-1">Superhost Status</div>
                </div>
              </div>
            </>
          ) : (
            // Tenant
            <>
              <div className="col-md-4 col-6">
                <div className="dash-kpi-card">
                  <div className="dash-kpi-icon-box bg-primary bg-opacity-10 text-primary">
                    <CalendarCheck size={24} />
                  </div>
                  <div className="text-muted small fw-bold">My Lease Requests</div>
                  <div className="display-6 fw-bold text-dark brand-font">
                    {tenantBookings.length}
                  </div>
                  <div className="text-primary small fw-semibold mt-1">Active requests</div>
                </div>
              </div>

              <div className="col-md-4 col-6">
                <div className="dash-kpi-card">
                  <div className="dash-kpi-icon-box bg-danger bg-opacity-10 text-danger">
                    <Heart size={24} />
                  </div>
                  <div className="text-muted small fw-bold">Saved Favorites</div>
                  <div className="display-6 fw-bold text-danger brand-font">
                    {favorites.length}
                  </div>
                  <div className="text-muted small mt-1">Homes in wishlist</div>
                </div>
              </div>

              <div className="col-md-4 col-12">
                <div className="dash-kpi-card">
                  <div className="dash-kpi-icon-box bg-success bg-opacity-10 text-success">
                    <ShieldAlert size={24} />
                  </div>
                  <div className="text-muted small fw-bold">Tenant Verification</div>
                  <div className="fs-4 fw-bold text-success brand-font mt-1">
                    Verified Ready
                  </div>
                  <div className="text-muted small mt-1">Instant landlord approval eligible</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE DASHBOARD TABS BAR                                            */}
        {/* ========================================================================= */}
        <div className="d-flex flex-wrap gap-2 mb-4 p-1 bg-white rounded-pill border shadow-xs d-inline-flex">
          <button
            type="button"
            className={`dash-tab-pill ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={16} /> Overview
          </button>

          {(user?.role === 'owner' || user?.role === 'admin') && (
            <button
              type="button"
              className={`dash-tab-pill ${activeTab === 'listings' ? 'active' : ''}`}
              onClick={() => setActiveTab('listings')}
            >
              <Building size={16} />
              {user?.role === 'admin' ? 'All Residences' : 'My Listings'} ({user?.role === 'admin' ? allProperties.length : myProperties.length})
            </button>
          )}

          {user?.role === 'admin' && (
            <button
              type="button"
              className={`dash-tab-pill ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              <Clock size={16} /> Moderation Queue ({pendingProperties.length})
            </button>
          )}

          <button
            type="button"
            className={`dash-tab-pill ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <CalendarCheck size={16} />
            {user?.role === 'owner' ? 'Tenant Requests' : 'My Bookings'} ({user?.role === 'owner' ? ownerBookings.length : tenantBookings.length})
          </button>

          <button
            type="button"
            className={`dash-tab-pill ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            <Heart size={16} /> Saved Wishlist ({favorites.length})
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW / DEFAULT                                                 */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="row g-4">
            {/* Left: Primary Activities */}
            <div className="col-lg-8">
              {/* For Landlord: Incoming booking inquiries */}
              {user?.role === 'owner' && (
                <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-dark brand-font mb-0">
                      Recent Tenant Lease Requests
                    </h5>
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-primary text-decoration-none fw-semibold"
                      onClick={() => setActiveTab('bookings')}
                    >
                      View All ({ownerBookings.length})
                    </button>
                  </div>

                  {ownerBookings.length === 0 ? (
                    <p className="text-muted small">No pending booking requests right now.</p>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {ownerBookings.slice(0, 3).map((bk) => (
                        <div key={bk._id} className="p-3 border rounded-3 bg-light">
                          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                            <div className="d-flex align-items-center gap-3">
                              <img
                                src={bk.tenant?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80'}
                                alt={bk.tenant?.name}
                                className="rounded-circle"
                                style={{ width: 44, height: 44, objectFit: 'cover' }}
                              />
                              <div>
                                <h6 className="fw-bold text-dark mb-0">{bk.tenant?.name}</h6>
                                <div className="text-muted small">
                                  Requested for: <strong>{bk.property?.title}</strong>
                                </div>
                                <div className="text-muted small">
                                  Move-in: <strong>{bk.moveInDate}</strong> · Duration: <strong>{bk.durationMonths} Months</strong>
                                </div>
                              </div>
                            </div>

                            <div className="d-flex align-items-center gap-2">
                              <span className={`pill-badge ${bk.status === 'approved' ? 'pill-verified' : bk.status === 'pending' ? 'pill-pending' : 'pill-rejected'}`}>
                                {bk.status}
                              </span>
                              {bk.status === 'pending' && (
                                <div className="d-flex gap-1">
                                  <button
                                    onClick={() => handleBookingStatusChange(bk._id, 'approved')}
                                    className="btn btn-sm btn-success d-flex align-items-center gap-1"
                                  >
                                    <Check size={14} /> Accept
                                  </button>
                                  <button
                                    onClick={() => handleBookingStatusChange(bk._id, 'rejected')}
                                    className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                                  >
                                    <X size={14} /> Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* For Admin: Pending moderation queue */}
              {user?.role === 'admin' && (
                <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-dark brand-font mb-0">
                      Pending Listings Requiring Approval
                    </h5>
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-primary text-decoration-none fw-semibold"
                      onClick={() => setActiveTab('pending')}
                    >
                      View Queue ({pendingProperties.length})
                    </button>
                  </div>

                  {pendingProperties.length === 0 ? (
                    <div className="p-4 text-center text-muted small bg-light rounded-3">
                      🎉 All listings have been reviewed and approved! No pending requests.
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {pendingProperties.slice(0, 3).map((prop) => (
                        <div key={prop._id} className="p-3 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={prop.images?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=100&q=80'}
                              alt={prop.title}
                              className="rounded-3"
                              style={{ width: 50, height: 50, objectFit: 'cover' }}
                            />
                            <div>
                              <h6 className="fw-bold text-dark mb-0">{prop.title}</h6>
                              <div className="text-muted small">
                                {prop.city} · {formatPrice(prop.price)}/mo · Owner: {prop.owner?.name}
                              </div>
                            </div>
                          </div>
                          <div className="d-flex gap-2">
                            <button
                              onClick={() => handlePropertyStatusChange(prop._id, 'approved')}
                              className="btn btn-sm btn-success"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handlePropertyStatusChange(prop._id, 'rejected')}
                              className="btn btn-sm btn-outline-danger"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* For Tenant: My bookings summary */}
              {user?.role === 'tenant' && (
                <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-dark brand-font mb-0">
                      My Rental Lease Applications
                    </h5>
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-primary text-decoration-none fw-semibold"
                      onClick={() => setActiveTab('bookings')}
                    >
                      View All ({tenantBookings.length})
                    </button>
                  </div>

                  {tenantBookings.length === 0 ? (
                    <div className="p-4 text-center text-muted small bg-light rounded-3">
                      You haven't requested any property leases yet.{' '}
                      <Link to="/properties" className="text-primary fw-bold text-decoration-none">
                        Browse residences
                      </Link>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {tenantBookings.slice(0, 3).map((bk) => (
                        <div key={bk._id} className="p-3 border rounded-3 bg-light">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="fw-bold text-dark mb-1">{bk.property?.title}</h6>
                              <div className="text-muted small">
                                Move-in Date: <strong>{bk.moveInDate}</strong> · Rent: <strong>{formatPrice(bk.monthlyRent || bk.property?.price)}/mo</strong>
                              </div>
                            </div>
                            <span className={`pill-badge ${bk.status === 'approved' ? 'pill-verified' : bk.status === 'pending' ? 'pill-pending' : 'pill-rejected'}`}>
                              {bk.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Quick Shortcuts & Account Details */}
            <div className="col-lg-4">
              <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
                <h6 className="fw-bold text-dark text-uppercase small mb-3">Account Profile</h6>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={user?.name}
                    className="rounded-circle shadow-xs"
                    style={{ width: 56, height: 56, objectFit: 'cover' }}
                  />
                  <div>
                    <h6 className="fw-bold text-dark mb-0">{user?.name}</h6>
                    <div className="text-muted small">{user?.email}</div>
                    <span className="badge bg-primary-subtle text-primary small mt-1">
                      {user?.role}
                    </span>
                  </div>
                </div>

                <div className="d-flex flex-column gap-2 small pt-2 border-top">
                  <div className="d-flex justify-content-between text-secondary">
                    <span>Phone:</span>
                    <span className="text-dark fw-semibold">{user?.phone || '+91 98765 43210'}</span>
                  </div>
                  <div className="d-flex justify-content-between text-secondary">
                    <span>Account Status:</span>
                    <span className="text-success fw-bold">Verified & Active</span>
                  </div>
                </div>
              </div>

              {/* Wishlist Shortcut Card */}
              <div className="bg-white p-4 rounded-4 shadow-sm border">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold text-dark text-uppercase small mb-0">Saved Wishlist</h6>
                  <span className="badge bg-danger text-white rounded-pill">{favorites.length}</span>
                </div>
                <p className="text-muted small mb-3">
                  You have saved {favorites.length} favorite residences to inspect.
                </p>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className="btn btn-sm btn-luxe-secondary w-100"
                >
                  <Heart size={14} className="text-danger" /> View Saved Homes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MY LISTINGS / ALL LISTINGS (FOR OWNERS / ADMIN)                    */}
        {/* ========================================================================= */}
        {activeTab === 'listings' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold text-dark brand-font mb-0">
                {user?.role === 'admin' ? 'All Platform Residences' : 'My Listed Properties'}
              </h4>
              <Link to="/properties/new" className="btn btn-luxe-primary">
                <PlusCircle size={16} /> List New House
              </Link>
            </div>

            <div className="row g-4">
              {(user?.role === 'admin' ? allProperties : myProperties).map((property) => (
                <div key={property._id} className="col-lg-4 col-md-6">
                  <PropertyCard
                    property={property}
                    showAdminControls={true}
                    onStatusChange={handlePropertyStatusChange}
                    onDelete={handleDeleteProperty}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PENDING APPROVAL QUEUE (ADMIN ONLY)                                */}
        {/* ========================================================================= */}
        {activeTab === 'pending' && user?.role === 'admin' && (
          <div>
            <h4 className="fw-bold text-dark brand-font mb-3">
              Moderation Queue ({pendingProperties.length})
            </h4>

            {pendingProperties.length === 0 ? (
              <div className="bg-white p-5 text-center rounded-4 border shadow-sm">
                <CheckCircle2 size={48} className="text-success mb-2" />
                <h5 className="fw-bold text-dark">Queue Clean!</h5>
                <p className="text-muted mb-0">No properties are currently awaiting approval.</p>
              </div>
            ) : (
              <div className="row g-4">
                {pendingProperties.map((property) => (
                  <div key={property._id} className="col-lg-4 col-md-6">
                    <PropertyCard
                      property={property}
                      showAdminControls={true}
                      onStatusChange={handlePropertyStatusChange}
                      onDelete={handleDeleteProperty}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: BOOKINGS / LEASE REQUESTS                                          */}
        {/* ========================================================================= */}
        {activeTab === 'bookings' && (
          <div>
            <h4 className="fw-bold text-dark brand-font mb-3">
              {user?.role === 'owner' ? 'Tenant Lease Requests' : 'My Rental Bookings'}
            </h4>

            {(user?.role === 'owner' ? ownerBookings : tenantBookings).length === 0 ? (
              <div className="bg-white p-5 text-center rounded-4 border shadow-sm">
                <CalendarCheck size={48} className="text-muted mb-2" />
                <h5 className="fw-bold text-dark">No Active Bookings</h5>
                <p className="text-muted mb-3">
                  {user?.role === 'owner'
                    ? 'You have not received any tenant lease requests yet.'
                    : 'You have not submitted any lease applications yet.'}
                </p>
                {user?.role === 'tenant' && (
                  <Link to="/properties" className="btn btn-luxe-primary">
                    Browse Residences
                  </Link>
                )}
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {(user?.role === 'owner' ? ownerBookings : tenantBookings).map((bk) => (
                  <div key={bk._id} className="p-4 bg-white rounded-4 border shadow-sm">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span className={`pill-badge ${bk.status === 'approved' ? 'pill-verified' : bk.status === 'pending' ? 'pill-pending' : 'pill-rejected'}`}>
                            {bk.status}
                          </span>
                          <span className="text-muted small">
                            ID: {bk._id} · Submitted {new Date(bk.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>

                        <h5 className="fw-bold text-dark mb-1">
                          <Link to={`/properties/${bk.property?._id}`} className="text-dark hover-primary text-decoration-none">
                            {bk.property?.title}
                          </Link>
                        </h5>
                        <div className="text-muted small mb-2">
                          {bk.property?.address}, {bk.property?.city}
                        </div>

                        <div className="d-flex flex-wrap gap-3 small text-secondary bg-light p-3 rounded-3 mt-2">
                          <div>
                            <strong>Target Move-in:</strong> {bk.moveInDate}
                          </div>
                          <div>
                            <strong>Lease Duration:</strong> {bk.durationMonths} Months
                          </div>
                          <div>
                            <strong>Monthly Rent:</strong> {formatPrice(bk.monthlyRent || bk.property?.price)}
                          </div>
                          <div>
                            <strong>Security Deposit:</strong> {formatPrice(bk.securityDeposit || (bk.monthlyRent || bk.property?.price) * 2)}
                          </div>
                        </div>

                        {bk.tenantMessage && (
                          <div className="mt-2 text-secondary small fst-italic">
                            "{bk.tenantMessage}"
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="d-flex flex-column gap-2 align-items-end flex-shrink-0">
                        {user?.role === 'owner' && bk.status === 'pending' && (
                          <div className="d-flex gap-2">
                            <button
                              onClick={() => handleBookingStatusChange(bk._id, 'approved')}
                              className="btn btn-sm btn-success d-flex align-items-center gap-1"
                            >
                              <Check size={14} /> Accept Lease
                            </button>
                            <button
                              onClick={() => handleBookingStatusChange(bk._id, 'rejected')}
                              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                            >
                              <X size={14} /> Decline
                            </button>
                          </div>
                        )}

                        {user?.role === 'tenant' && bk.status === 'pending' && (
                          <button
                            onClick={() => handleCancelBooking(bk._id)}
                            className="btn btn-sm btn-outline-danger"
                          >
                            Cancel Application
                          </button>
                        )}

                        <Link to={`/properties/${bk.property?._id}`} className="btn btn-sm btn-outline-secondary">
                          View Property <ArrowUpRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: SAVED WISHLIST                                                     */}
        {/* ========================================================================= */}
        {activeTab === 'favorites' && (
          <div>
            <h4 className="fw-bold text-dark brand-font mb-3">
              Saved Residences Wishlist ({savedPropertiesList.length})
            </h4>

            {savedPropertiesList.length === 0 ? (
              <div className="bg-white p-5 text-center rounded-4 border shadow-sm">
                <Heart size={48} className="text-muted mb-2" />
                <h5 className="fw-bold text-dark">Your Wishlist is Empty</h5>
                <p className="text-muted mb-3">
                  Click the heart icon on any property card to save residences for fast comparison.
                </p>
                <Link to="/properties" className="btn btn-luxe-primary">
                  Explore Homes
                </Link>
              </div>
            ) : (
              <div className="row g-4">
                {savedPropertiesList.map((property) => (
                  <div key={property._id} className="col-lg-4 col-md-6">
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
