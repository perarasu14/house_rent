import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { propertiesAPI, statsAPI } from '../services/api';
import PropertyCard from '../components/properties/PropertyCard';
import {
  Search,
  MapPin,
  Building,
  ShieldCheck,
  Video,
  Key,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Compass,
  SlidersHorizontal,
  Home,
  Star,
  Award,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

const CATEGORIES = [
  { label: 'All Residences', value: '', icon: '✨' },
  { label: 'Penthouses', value: 'Penthouse', icon: '🏙️' },
  { label: 'Luxury Villas', value: 'Villa', icon: '🏡' },
  { label: 'Modern Apartments', value: 'Apartment', icon: '🏢' },
  { label: 'Studio Lofts', value: 'Studio', icon: '🛋️' },
  { label: 'Independent Houses', value: 'Independent House', icon: '🏰' },
];

const CITIES = [
  {
    name: 'Bangalore',
    tagline: 'Silicon Valley of India',
    listings: '450+ Homes',
    img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Mumbai',
    tagline: 'Sea-facing & Coastal Luxury',
    listings: '380+ Homes',
    img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Hyderabad',
    tagline: 'Cyberabad & Jubilee Hills',
    listings: '290+ Homes',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Goa',
    tagline: 'Beachfront Villas & Retreats',
    listings: '160+ Homes',
    img: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=600&q=80',
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [platformStats, setPlatformStats] = useState({
    approvedProperties: 12,
    totalUsers: 34,
    activeCities: 6,
    totalBookings: 18,
  });
  const [loading, setLoading] = useState(true);

  // Hero search form state
  const [searchCity, setSearchCity] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchTab, setSearchTab] = useState('monthly'); // monthly | vacation | studio

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propsRes, statsRes] = await Promise.allSettled([
          propertiesAPI.getAll({ limit: 6, sortBy: 'rating' }),
          statsAPI.getPlatformStats(),
        ]);

        if (propsRes.status === 'fulfilled' && propsRes.value.data.success) {
          setFeaturedProperties(propsRes.value.data.properties);
        }

        if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
          setPlatformStats(statsRes.value.data.stats);
        }
      } catch (err) {
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity) params.append('city', searchCity);
    if (searchType) params.append('propertyType', searchType);
    if (searchKeyword) params.append('keyword', searchKeyword);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div>
      {/* -------------------------------------------------------------------- */}
      {/* HERO SECTION WITH DUAL AMBIENT MESHES                                */}
      {/* -------------------------------------------------------------------- */}
      <section className="hero-wrapper">
        <div className="hero-mesh-1"></div>
        <div className="hero-mesh-2"></div>

        <div className="container position-relative z-1">
          <div className="row align-items-center g-5">
            <div className="col-lg-8">
              {/* Luxury Badge */}
              <div className="hero-badge mb-3 animate-pulse-subtle">
                <Sparkles size={16} className="text-warning" />
                <span>Next-Gen Architectural Real Estate · 0% Brokerage</span>
              </div>

              {/* Main Headline */}
              <h1 className="hero-headline">
                Find Your Sanctuary in India's <span className="hero-gradient-text">Finest Metros</span>
              </h1>
              <p className="hero-subtext mb-4">
                Explore handpicked luxury apartments, modern penthouses, and private pool villas.
                Direct verified landlords, 3D spatial walkthroughs, and seamless digital leases.
              </p>

              {/* Search Console Dock */}
              <div className="search-dock-container">
                {/* Search Dock Tabs */}
                <div className="search-dock-tabs">
                  <button
                    type="button"
                    className={`search-dock-tab ${searchTab === 'monthly' ? 'active' : ''}`}
                    onClick={() => {
                      setSearchTab('monthly');
                      setSearchType('');
                    }}
                  >
                    Monthly Lease
                  </button>
                  <button
                    type="button"
                    className={`search-dock-tab ${searchTab === 'vacation' ? 'active' : ''}`}
                    onClick={() => {
                      setSearchTab('vacation');
                      setSearchType('Villa');
                    }}
                  >
                    Luxury Villas
                  </button>
                  <button
                    type="button"
                    className={`search-dock-tab ${searchTab === 'studio' ? 'active' : ''}`}
                    onClick={() => {
                      setSearchTab('studio');
                      setSearchType('Studio');
                    }}
                  >
                    Designer Studios
                  </button>
                </div>

                {/* Dock Input Card */}
                <div className="search-dock-card">
                  <form onSubmit={handleHeroSearch}>
                    <div className="row g-2 align-items-center">
                      {/* City Selector */}
                      <div className="col-md-4 col-12">
                        <div className="search-dock-input-group">
                          <label className="search-dock-label">Destination</label>
                          <div className="d-flex align-items-center gap-2">
                            <MapPin size={17} className="text-danger flex-shrink-0" />
                            <select
                              className="search-dock-input"
                              value={searchCity}
                              onChange={(e) => setSearchCity(e.target.value)}
                            >
                              <option value="">All Major Metros</option>
                              <option value="Bangalore">Bangalore</option>
                              <option value="Mumbai">Mumbai</option>
                              <option value="Hyderabad">Hyderabad</option>
                              <option value="Gurugram">Gurugram / NCR</option>
                              <option value="Pune">Pune</option>
                              <option value="Goa">Goa</option>
                              <option value="Chennai">Chennai</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Property Type Selector */}
                      <div className="col-md-4 col-12 border-start-md">
                        <div className="search-dock-input-group">
                          <label className="search-dock-label">Property Type</label>
                          <div className="d-flex align-items-center gap-2">
                            <Building size={17} className="text-primary flex-shrink-0" />
                            <select
                              className="search-dock-input"
                              value={searchType}
                              onChange={(e) => setSearchType(e.target.value)}
                            >
                              <option value="">All Types</option>
                              <option value="Penthouse">Penthouse Duplex</option>
                              <option value="Villa">Luxury Private Villa</option>
                              <option value="Apartment">Modern Apartment</option>
                              <option value="Studio">Studio Loft</option>
                              <option value="Independent House">Independent House</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Submit CTA */}
                      <div className="col-md-4 col-12">
                        <button
                          type="submit"
                          className="btn btn-luxe-primary w-100 py-3"
                          style={{ borderRadius: 'var(--radius-lg)' }}
                        >
                          <Search size={18} /> Search Residences
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Quick Stat Highlights */}
            <div className="col-lg-4">
              <div className="row g-3">
                <div className="col-6">
                  <div className="hero-stat-card">
                    <div className="hero-stat-num">
                      {platformStats?.approvedProperties || 12}+
                    </div>
                    <div className="text-light text-opacity-80 small fw-semibold">
                      Curated Homes
                    </div>
                  </div>
                </div>

                <div className="col-6">
                  <div className="hero-stat-card">
                    <div className="hero-stat-num">0%</div>
                    <div className="text-light text-opacity-80 small fw-semibold">
                      Brokerage Markup
                    </div>
                  </div>
                </div>

                <div className="col-6">
                  <div className="hero-stat-card">
                    <div className="hero-stat-num">4.9★</div>
                    <div className="text-light text-opacity-80 small fw-semibold">
                      Verified Tenant Score
                    </div>
                  </div>
                </div>

                <div className="col-6">
                  <div className="hero-stat-card">
                    <div className="hero-stat-num">100%</div>
                    <div className="text-light text-opacity-80 small fw-semibold">
                      Direct Landlords
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* CATEGORY EXPLORER STRIP                                              */}
      {/* -------------------------------------------------------------------- */}
      <section className="py-3 bg-white border-bottom">
        <div className="container">
          <div className="category-strip">
            {CATEGORIES.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const url = cat.value ? `/properties?propertyType=${cat.value}` : '/properties';
                  navigate(url);
                }}
                className={`category-chip ${searchType === cat.value && cat.value ? 'active' : ''}`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* FEATURED PROPERTIES SECTION                                          */}
      {/* -------------------------------------------------------------------- */}
      <section className="py-5 bg-page">
        <div className="container py-lg-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
            <div>
              <span className="pill-badge pill-type mb-2">
                Handpicked Residences
              </span>
              <h2 className="display-6 fw-bold text-dark brand-font">Featured Available Listings</h2>
              <p className="text-muted mb-0">
                Explore premium homes thoroughly vetted for architectural quality and landlord responsiveness.
              </p>
            </div>
            <Link
              to="/properties"
              className="btn btn-luxe-secondary mt-3 mt-md-0 d-inline-flex align-items-center gap-2"
            >
              Browse All Properties <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading residences...</span>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {featuredProperties.slice(0, 6).map((property) => (
                <div key={property._id} className="col-lg-4 col-md-6">
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* METRO CITIES SHOWCASE                                                */}
      {/* -------------------------------------------------------------------- */}
      <section className="py-5 bg-white border-top border-bottom">
        <div className="container py-lg-3">
          <div className="text-center mb-5" style={{ maxWidth: 640, margin: '0 auto' }}>
            <span className="pill-badge pill-type mb-2">Prime Destinations</span>
            <h2 className="display-6 fw-bold text-dark brand-font">Explore Top Metro Destinations</h2>
            <p className="text-muted">
              From high-tech urban centers to tranquil sea promenades, find curated residences where you belong.
            </p>
          </div>

          <div className="row g-4">
            {CITIES.map((city, idx) => (
              <div key={idx} className="col-lg-3 col-md-6">
                <div
                  onClick={() => navigate(`/properties?city=${city.name}`)}
                  className="rounded-4 overflow-hidden position-relative shadow-sm"
                  style={{
                    height: 280,
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-6px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                >
                  <img
                    src={city.img}
                    alt={city.name}
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                  />
                  <div
                    className="position-absolute inset-0 w-100 h-100"
                    style={{
                      background: 'linear-gradient(180deg, transparent 40%, rgba(15, 23, 42, 0.85) 100%)',
                      top: 0,
                      left: 0,
                    }}
                  ></div>
                  <div className="position-absolute bottom-0 start-0 p-3 text-white">
                    <h5 className="fw-bold mb-0">{city.name}</h5>
                    <div className="small text-light text-opacity-80">{city.tagline}</div>
                    <span className="badge bg-white text-dark mt-2" style={{ fontSize: '0.72rem' }}>
                      {city.listings}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* VALUE PROPOSITION: ZERO BROKERAGE, VIRTUAL TOURS, VERIFIED HOSTS     */}
      {/* -------------------------------------------------------------------- */}
      <section className="py-5 bg-page">
        <div className="container py-lg-4">
          <div className="text-center mb-5" style={{ maxWidth: 650, margin: '0 auto' }}>
            <span className="pill-badge pill-verified mb-2">The HouseHunt Standard</span>
            <h2 className="display-6 fw-bold text-dark brand-font">Why High-Net-Worth Renters Choose Us</h2>
            <p className="text-muted">
              We dismantled traditional brokerage bottlenecks to deliver effortless leasing with total transparency.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="p-4 bg-white rounded-4 shadow-sm border h-100">
                <div
                  className="rounded-3 d-inline-flex p-3 mb-3 text-primary"
                  style={{ background: 'rgba(99, 102, 241, 0.1)' }}
                >
                  <ShieldCheck size={26} />
                </div>
                <h5 className="fw-bold text-dark mb-2">Strict Host Vetting</h5>
                <p className="text-muted small mb-0">
                  Every property undergoes rigorous ownership moderation before going live. Zero duplicate or spam listings.
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="p-4 bg-white rounded-4 shadow-sm border h-100">
                <div
                  className="rounded-3 d-inline-flex p-3 mb-3 text-danger"
                  style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                >
                  <Video size={26} />
                </div>
                <h5 className="fw-bold text-dark mb-2">3D Spatial Tours</h5>
                <p className="text-muted small mb-0">
                  Inspect every balcony, bath, and architectural fixture virtually before scheduling physical walk-ins.
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="p-4 bg-white rounded-4 shadow-sm border h-100">
                <div
                  className="rounded-3 d-inline-flex p-3 mb-3 text-success"
                  style={{ background: 'rgba(16, 185, 129, 0.1)' }}
                >
                  <Key size={26} />
                </div>
                <h5 className="fw-bold text-dark mb-2">Instant Digital Leases</h5>
                <p className="text-muted small mb-0">
                  Request custom move-in dates with transparent security deposit structures and free cancellation before approval.
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="p-4 bg-white rounded-4 shadow-sm border h-100">
                <div
                  className="rounded-3 d-inline-flex p-3 mb-3 text-warning"
                  style={{ background: 'rgba(245, 158, 11, 0.1)' }}
                >
                  <Users size={26} />
                </div>
                <h5 className="fw-bold text-dark mb-2">Direct Owner Access</h5>
                <p className="text-muted small mb-0">
                  Direct communication channels with owners. Zero middleman agent commissions or surprise retainers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* LANDLORD CALL TO ACTION                                              */}
      {/* -------------------------------------------------------------------- */}
      <section className="py-5 bg-white">
        <div className="container">
          <div
            className="p-5 rounded-4 text-white position-relative overflow-hidden shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 60%, #4338ca 100%)',
            }}
          >
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-white bg-opacity-10 border border-white border-opacity-20 mb-3">
                  <Award size={16} className="text-warning" />
                  <span className="small fw-semibold">For Property Owners & Investors</span>
                </div>
                <h3 className="display-6 fw-bold mb-3">Own a House, Penthouse or Luxury Villa?</h3>
                <p className="text-light text-opacity-80 mb-4 pe-lg-5 lead" style={{ fontSize: '1.05rem' }}>
                  List your property on HouseHunt and connect with thousands of pre-screened, credit-ready tenants.
                  Manage inquiries, approve bookings, and maintain complete control with 0% listing fee.
                </p>
                <div className="d-flex flex-wrap gap-3">
                  <Link to="/properties/new" className="btn btn-light fw-bold text-dark px-4 py-2 rounded-pill shadow-sm">
                    List Your Property for Free
                  </Link>
                  <Link to="/register" className="btn btn-outline-light fw-semibold px-4 py-2 rounded-pill">
                    Create Landlord Account
                  </Link>
                </div>
              </div>
              <div className="col-lg-4 text-center d-none d-lg-block">
                <div className="p-4 bg-white bg-opacity-10 rounded-4 border border-white border-opacity-20 backdrop-blur">
                  <div className="fs-1 fw-bold text-warning mb-1">0%</div>
                  <div className="fw-semibold">Listing Commission</div>
                  <hr className="border-white opacity-25 my-3" />
                  <div className="small text-light text-opacity-80">
                    Keep 100% of your rental income with direct tenant agreements.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
