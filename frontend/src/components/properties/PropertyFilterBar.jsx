import React from 'react';
import { Search, MapPin, Building, RotateCcw, SlidersHorizontal, IndianRupee, Sparkles, Heart } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';

const CITIES = ['All', 'Bangalore', 'Mumbai', 'Hyderabad', 'Gurugram', 'Pune', 'Goa', 'Chennai'];
const TYPES = ['All', 'Apartment', 'Villa', 'Penthouse', 'Studio', 'Independent House'];
const BEDROOMS = ['All', '1', '2', '3', '4+'];
const FURNISHING = ['All', 'Furnished', 'Semi-Furnished', 'Unfurnished'];

const PropertyFilterBar = ({ filters, onFilterChange, onReset, isFavoritesOnly, onToggleFavoritesOnly }) => {
  const { favorites } = useFavorites();

  const formatPrice = (val) => {
    if (!val) return 'Any Budget';
    return `₹${Number(val).toLocaleString('en-IN')}/mo`;
  };

  return (
    <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
      {/* Quick Filter Tag Chips Row */}
      <div className="d-flex align-items-center gap-2 overflow-auto pb-3 mb-3 border-bottom scrollbar-none">
        <span className="text-muted small fw-bold text-uppercase flex-shrink-0" style={{ fontSize: '0.72rem' }}>
          Quick Filters:
        </span>
        <button
          type="button"
          onClick={onToggleFavoritesOnly}
          className={`btn btn-sm rounded-pill d-inline-flex align-items-center gap-1 ${
            isFavoritesOnly ? 'btn-danger' : 'btn-outline-secondary'
          }`}
          style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
        >
          <Heart size={14} className={isFavoritesOnly ? 'fill-white' : ''} />
          Saved Favorites ({favorites.length})
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('maxPrice', filters.maxPrice === '50000' ? '' : '50000')}
          className={`btn btn-sm rounded-pill ${
            filters.maxPrice === '50000' ? 'btn-primary' : 'btn-outline-secondary'
          }`}
          style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
        >
          Under ₹50,000
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('propertyType', filters.propertyType === 'Villa' ? '' : 'Villa')}
          className={`btn btn-sm rounded-pill ${
            filters.propertyType === 'Villa' ? 'btn-primary' : 'btn-outline-secondary'
          }`}
          style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
        >
          🏡 Villas
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('propertyType', filters.propertyType === 'Penthouse' ? '' : 'Penthouse')}
          className={`btn btn-sm rounded-pill ${
            filters.propertyType === 'Penthouse' ? 'btn-primary' : 'btn-outline-secondary'
          }`}
          style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
        >
          🏙️ Penthouses
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('furnishing', filters.furnishing === 'Furnished' ? '' : 'Furnished')}
          className={`btn btn-sm rounded-pill ${
            filters.furnishing === 'Furnished' ? 'btn-primary' : 'btn-outline-secondary'
          }`}
          style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
        >
          🛋️ Fully Furnished
        </button>
      </div>

      {/* Main Filter Row: Keyword, City, Property Type */}
      <div className="row g-3 align-items-center mb-3">
        <div className="col-lg-6 col-md-12">
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <Search size={18} className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control form-input-luxe border-start-0"
              placeholder="Search by neighborhood, street, residence name, or amenity..."
              value={filters.keyword || ''}
              onChange={(e) => onFilterChange('keyword', e.target.value)}
            />
          </div>
        </div>

        {/* City Selector */}
        <div className="col-lg-3 col-md-6">
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <MapPin size={18} className="text-danger" />
            </span>
            <select
              className="form-select form-input-luxe border-start-0"
              value={filters.city || 'All'}
              onChange={(e) => onFilterChange('city', e.target.value === 'All' ? '' : e.target.value)}
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Metros / Cities' : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Property Type Selector */}
        <div className="col-lg-3 col-md-6">
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <Building size={18} className="text-primary" />
            </span>
            <select
              className="form-select form-input-luxe border-start-0"
              value={filters.propertyType || 'All'}
              onChange={(e) =>
                onFilterChange('propertyType', e.target.value === 'All' ? '' : e.target.value)
              }
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === 'All' ? 'All Residences' : t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Secondary Controls: Bedrooms, Furnishing, Price Slider, Sort, Reset */}
      <div className="row g-3 align-items-end pt-3 border-top">
        {/* Bedrooms */}
        <div className="col-lg-2 col-md-4 col-6">
          <label className="form-label small fw-bold text-secondary mb-1">Bedrooms</label>
          <select
            className="form-select form-select-sm"
            value={filters.bedrooms || 'All'}
            onChange={(e) =>
              onFilterChange('bedrooms', e.target.value === 'All' ? '' : e.target.value)
            }
          >
            {BEDROOMS.map((b) => (
              <option key={b} value={b}>
                {b === 'All' ? 'Any Bedrooms' : `${b} BHK`}
              </option>
            ))}
          </select>
        </div>

        {/* Furnishing */}
        <div className="col-lg-2 col-md-4 col-6">
          <label className="form-label small fw-bold text-secondary mb-1">Furnishing</label>
          <select
            className="form-select form-select-sm"
            value={filters.furnishing || 'All'}
            onChange={(e) =>
              onFilterChange('furnishing', e.target.value === 'All' ? '' : e.target.value)
            }
          >
            {FURNISHING.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Max Budget Slider */}
        <div className="col-lg-3 col-md-4 col-12">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <label className="form-label small fw-bold text-secondary mb-0">Max Budget</label>
            <span className="badge bg-primary-subtle text-primary fw-bold small">
              {formatPrice(filters.maxPrice)}
            </span>
          </div>
          <input
            type="range"
            className="form-range"
            min="20000"
            max="250000"
            step="5000"
            value={filters.maxPrice || 250000}
            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
          />
        </div>

        {/* Sort */}
        <div className="col-lg-3 col-md-6 col-8">
          <label className="form-label small fw-bold text-secondary mb-1">Sort By</label>
          <select
            className="form-select form-select-sm"
            value={filters.sortBy || 'newest'}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
          >
            <option value="newest">Newest Listed First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated (Tenant Reviews)</option>
            <option value="area">Largest Carpet Area</option>
          </select>
        </div>

        {/* Reset */}
        <div className="col-lg-2 col-md-6 col-4 d-grid">
          <button
            type="button"
            onClick={onReset}
            className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center gap-1"
            style={{ height: '31px' }}
          >
            <RotateCcw size={14} /> Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyFilterBar;
