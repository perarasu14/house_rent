import React from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../../context/FavoritesContext';
import {
  Bed,
  Bath,
  Maximize2,
  MapPin,
  Star,
  ShieldCheck,
  Sparkles,
  Heart,
  ArrowUpRight,
  Camera,
  Layers,
} from 'lucide-react';

const PropertyCard = ({ property, showAdminControls, onStatusChange, onDelete }) => {
  const { isFavorite, toggleFavorite } = useFavorites();

  const {
    _id,
    title,
    propertyType,
    price,
    city,
    address,
    bedrooms,
    bathrooms,
    areaSqFt,
    furnishing,
    images,
    ratingsAverage,
    status,
    featured,
  } = property;

  const displayImage =
    images && images.length > 0
      ? images[0]
      : 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80';

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const favorited = isFavorite(_id);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(_id);
  };

  return (
    <div className="luxe-property-card">
      {/* Visual Image Viewport */}
      <div className="property-image-viewport">
        <Link to={`/properties/${_id}`} className="d-block w-100 h-100">
          <img
            src={displayImage}
            alt={title}
            className="property-main-img"
            loading="lazy"
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="property-overlay-gradient"></div>
        </Link>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className={`property-btn-wishlist ${favorited ? 'active' : ''}`}
          title={favorited ? 'Remove from saved homes' : 'Save to favorite homes'}
          aria-label="Toggle wishlist"
        >
          <Heart size={18} />
        </button>

        {/* Top Badges */}
        <div className="position-absolute top-0 start-0 m-3 d-flex flex-wrap gap-1" style={{ zIndex: 1 }}>
          <span className="pill-badge pill-type bg-white shadow-xs">
            {propertyType}
          </span>
          {featured && (
            <span className="pill-badge pill-featured shadow-xs">
              <Sparkles size={12} /> Curated
            </span>
          )}
        </div>

        {/* Photo Count badge bottom-left */}
        <div
          className="position-absolute bottom-0 start-0 m-3 d-flex align-items-center gap-1 px-2 py-1 rounded-pill bg-dark bg-opacity-75 text-white"
          style={{ fontSize: '0.72rem', fontWeight: 600, backdropFilter: 'blur(6px)' }}
        >
          <Camera size={12} />
          <span>{images?.length || 1} Photos</span>
        </div>

        {/* Rating Score badge bottom-right */}
        <div
          className="position-absolute bottom-0 end-0 m-3 d-flex align-items-center gap-1 px-2 py-1 rounded-pill bg-white shadow-sm text-dark"
          style={{ fontSize: '0.78rem', fontWeight: 700 }}
        >
          <Star size={13} className="text-warning fill-warning" />
          <span>{ratingsAverage || 4.9}</span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-3 d-flex flex-column flex-grow-1">
        {/* Price & Deposit Bar */}
        <div className="d-flex align-items-baseline justify-content-between mb-2">
          <div>
            <span className="fs-5 fw-bold brand-font text-dark" style={{ letterSpacing: '-0.5px' }}>
              {formatPrice(price)}
            </span>
            <span className="text-muted small"> / mo</span>
          </div>
          <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
            Dep: {formatPrice(property.securityDeposit || price * 2)}
          </span>
        </div>

        {/* Title */}
        <h6 className="card-title fw-bold mb-1 text-truncate" title={title}>
          <Link
            to={`/properties/${_id}`}
            className="text-dark text-decoration-none"
            style={{ transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--color-brand-600)')}
            onMouseLeave={(e) => (e.target.style.color = 'inherit')}
          >
            {title}
          </Link>
        </h6>

        {/* Location */}
        <div className="d-flex align-items-center text-muted small mb-3 text-truncate">
          <MapPin size={14} className="me-1 text-danger flex-shrink-0" />
          <span className="text-truncate">{address}, {city}</span>
        </div>

        {/* Specs Grid */}
        <div className="property-specs-grid mb-3">
          <div className="d-flex align-items-center gap-1 justify-content-center">
            <Bed size={15} className="text-primary" />
            <span>{bedrooms} Beds</span>
          </div>
          <div className="d-flex align-items-center gap-1 justify-content-center border-start border-end border-secondary border-opacity-10">
            <Bath size={15} className="text-primary" />
            <span>{bathrooms} Baths</span>
          </div>
          <div className="d-flex align-items-center gap-1 justify-content-center">
            <Maximize2 size={15} className="text-primary" />
            <span>{areaSqFt} sqft</span>
          </div>
        </div>

        {/* Furnishing pill */}
        <div className="d-flex align-items-center justify-content-between mb-3 text-muted small">
          <span className="d-flex align-items-center gap-1" style={{ fontSize: '0.76rem' }}>
            <Layers size={13} className="text-secondary" /> {furnishing || 'Furnished'}
          </span>
          <span className="text-success fw-semibold" style={{ fontSize: '0.76rem' }}>
            ● Move-in Ready
          </span>
        </div>

        {/* Footer Actions */}
        <div className="mt-auto pt-2 border-top">
          {showAdminControls ? (
            <div className="d-flex gap-2">
              {status === 'pending' && (
                <>
                  <button
                    onClick={() => onStatusChange(_id, 'approved')}
                    className="btn btn-sm btn-success flex-grow-1 fw-semibold"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onStatusChange(_id, 'rejected')}
                    className="btn btn-sm btn-outline-danger flex-grow-1 fw-semibold"
                  >
                    Reject
                  </button>
                </>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(_id)}
                  className="btn btn-sm btn-outline-secondary"
                  title="Delete Listing"
                >
                  Delete
                </button>
              )}
            </div>
          ) : (
            <div className="d-flex align-items-center justify-content-between">
              <span className="text-success small fw-semibold d-flex align-items-center gap-1" style={{ fontSize: '0.78rem' }}>
                <ShieldCheck size={15} className="text-success" /> Verified Landlord
              </span>
              <Link
                to={`/properties/${_id}`}
                className="btn btn-sm btn-luxe-primary py-1 px-3"
                style={{ fontSize: '0.82rem' }}
              >
                View Residence <ArrowUpRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
