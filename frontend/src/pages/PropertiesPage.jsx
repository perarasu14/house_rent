import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { propertiesAPI } from '../services/api';
import PropertyCard from '../components/properties/PropertyCard';
import PropertyFilterBar from '../components/properties/PropertyFilterBar';
import { useFavorites } from '../context/FavoritesContext';
import { Home, Frown, RotateCcw, LayoutGrid, StretchHorizontal, X, Heart } from 'lucide-react';

const PropertiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { favorites } = useFavorites();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [isFavoritesOnly, setIsFavoritesOnly] = useState(searchParams.get('favorites') === 'true');

  // Initialize filters from URL params
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    city: searchParams.get('city') || '',
    propertyType: searchParams.get('propertyType') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    furnishing: searchParams.get('furnishing') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
  });

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 9,
        sortBy: filters.sortBy,
      };

      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.city) params.city = filters.city;
      if (filters.propertyType) params.propertyType = filters.propertyType;
      if (filters.bedrooms && filters.bedrooms !== 'All') params.bedrooms = filters.bedrooms;
      if (filters.furnishing && filters.furnishing !== 'All') params.furnishing = filters.furnishing;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;

      const res = await propertiesAPI.getAll(params);
      if (res.data.success) {
        let list = res.data.properties;
        if (isFavoritesOnly) {
          list = list.filter((p) => favorites.includes(p._id));
        }
        setProperties(list);
        setTotalCount(isFavoritesOnly ? list.length : res.data.total);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [filters, currentPage, isFavoritesOnly, favorites]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const updated = { ...prev, [key]: value };
      const newParams = new URLSearchParams();
      Object.entries(updated).forEach(([k, v]) => {
        if (v) newParams.set(k, v);
      });
      if (isFavoritesOnly) newParams.set('favorites', 'true');
      setSearchParams(newParams);
      return updated;
    });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      keyword: '',
      city: '',
      propertyType: '',
      bedrooms: '',
      furnishing: '',
      maxPrice: '',
      sortBy: 'newest',
    };
    setFilters(defaultFilters);
    setIsFavoritesOnly(false);
    setSearchParams(new URLSearchParams());
    setCurrentPage(1);
  };

  const removeFilterKey = (key) => {
    handleFilterChange(key, '');
  };

  const activeFilterList = [];
  if (filters.keyword) activeFilterList.push({ key: 'keyword', label: `Keyword: "${filters.keyword}"` });
  if (filters.city) activeFilterList.push({ key: 'city', label: `City: ${filters.city}` });
  if (filters.propertyType) activeFilterList.push({ key: 'propertyType', label: `Type: ${filters.propertyType}` });
  if (filters.bedrooms) activeFilterList.push({ key: 'bedrooms', label: `${filters.bedrooms} BHK` });
  if (filters.furnishing) activeFilterList.push({ key: 'furnishing', label: filters.furnishing });
  if (filters.maxPrice) activeFilterList.push({ key: 'maxPrice', label: `Up to ₹${Number(filters.maxPrice).toLocaleString('en-IN')}` });

  return (
    <div className="py-5 bg-page min-vh-100">
      <div className="container">
        {/* Header with Title and Mode Switcher */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="pill-badge pill-type">
                Verified Inventory
              </span>
              {isFavoritesOnly && (
                <span className="pill-badge bg-danger text-white">
                  <Heart size={12} className="fill-white" /> Saved Favorites Filter Active
                </span>
              )}
            </div>
            <h1 className="fw-bold text-dark brand-font mb-1">
              Explore Luxury Residences
            </h1>
            <p className="text-muted mb-0">
              Browse vetted apartments, penthouses, and private estates available for direct leasing.
            </p>
          </div>

          {/* View Mode Toggle: Grid vs List */}
          <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
            <span className="text-muted small fw-semibold">View:</span>
            <div className="btn-group border rounded-pill p-1 bg-white shadow-xs">
              <button
                type="button"
                className={`btn btn-sm rounded-pill d-flex align-items-center gap-1 ${
                  viewMode === 'grid' ? 'btn-primary' : 'btn-light border-0'
                }`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid size={15} /> Grid
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill d-flex align-items-center gap-1 ${
                  viewMode === 'list' ? 'btn-primary' : 'btn-light border-0'
                }`}
                onClick={() => setViewMode('list')}
              >
                <StretchHorizontal size={15} /> List
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <PropertyFilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          isFavoritesOnly={isFavoritesOnly}
          onToggleFavoritesOnly={() => {
            setIsFavoritesOnly(!isFavoritesOnly);
            const p = new URLSearchParams(searchParams);
            if (!isFavoritesOnly) p.set('favorites', 'true');
            else p.delete('favorites');
            setSearchParams(p);
          }}
        />

        {/* Active Filter Chips & Summary */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
          <div className="d-flex flex-wrap align-items-center gap-2">
            <span className="text-secondary small fw-bold">
              Showing <span className="text-primary fw-bold">{properties.length}</span> of {totalCount} properties
            </span>

            {activeFilterList.map((item) => (
              <span
                key={item.key}
                className="badge bg-white text-dark border rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1 shadow-xs"
                style={{ fontSize: '0.8rem' }}
              >
                {item.label}
                <button
                  type="button"
                  className="btn-close ms-1"
                  style={{ width: '0.5rem', height: '0.5rem' }}
                  onClick={() => removeFilterKey(item.key)}
                ></button>
              </span>
            ))}

            {isFavoritesOnly && (
              <span
                className="badge bg-danger text-white rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1"
                style={{ fontSize: '0.8rem' }}
              >
                Saved Favorites Only
                <button
                  type="button"
                  className="btn-close btn-close-white ms-1"
                  style={{ width: '0.5rem', height: '0.5rem' }}
                  onClick={() => setIsFavoritesOnly(false)}
                ></button>
              </span>
            )}
          </div>
        </div>

        {/* Listings Display */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading residences...</span>
            </div>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 border p-5 shadow-sm">
            <Frown size={50} className="text-muted mb-3" />
            <h4 className="fw-bold text-dark">No Matching Residences Found</h4>
            <p className="text-muted mb-4 px-md-5">
              We couldn't find any homes matching your current filter criteria.
              {isFavoritesOnly ? ' You currently have no saved favorites matching this filter.' : ' Try expanding your budget range or selecting another city.'}
            </p>
            <button onClick={handleResetFilters} className="btn btn-luxe-primary">
              <RotateCcw size={16} /> Reset All Filters
            </button>
          </div>
        ) : (
          <>
            <div className={`row g-4 mb-5 ${viewMode === 'list' ? 'row-cols-1' : ''}`}>
              {properties.map((property) => (
                <div
                  key={property._id}
                  className={viewMode === 'list' ? 'col-12' : 'col-lg-4 col-md-6'}
                >
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center">
                <nav aria-label="Properties pagination">
                  <ul className="pagination gap-1">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link rounded-3 border"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <li
                        key={page}
                        className={`page-item ${currentPage === page ? 'active' : ''}`}
                      >
                        <button
                          className="page-link rounded-3 border"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link rounded-3 border"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PropertiesPage;
