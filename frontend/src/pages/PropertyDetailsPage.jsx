import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { propertiesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import BookingModal from '../components/bookings/BookingModal';
import {
  Bed,
  Bath,
  Maximize2,
  MapPin,
  Calendar,
  CheckCircle,
  Star,
  Phone,
  Mail,
  Share2,
  Heart,
  Video,
  ShieldCheck,
  Send,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Layers,
  MessageCircle,
} from 'lucide-react';

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const res = await propertiesAPI.getById(id);
      if (res.data.success) {
        setProperty(res.data.property);
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Property not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    if (!isAuthenticated) {
      setReviewError('Please login to post a verified review.');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await propertiesAPI.addReview(id, {
        rating: Number(newRating),
        comment: newComment,
      });

      if (res.data.success) {
        setReviewSuccess('Thank you! Your verified review has been published.');
        setReviews([res.data.review, ...reviews]);
        setNewComment('');
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5 min-vh-50">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading property...</span>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container py-5 text-center">
        <AlertCircle size={50} className="text-danger mb-3" />
        <h3 className="fw-bold">Property Not Found</h3>
        <p className="text-muted mb-4">{error || 'The requested property listing does not exist.'}</p>
        <Link to="/properties" className="btn btn-luxe-primary">
          Back to Listings
        </Link>
      </div>
    );
  }

  const formatPrice = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const images =
    property.images && property.images.length > 0
      ? property.images
      : ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80'];

  const favorited = isFavorite(property._id);

  return (
    <div className="py-4 bg-page min-vh-100">
      <div className="container">
        {/* Top Navigation Row: Back, Badges, Wishlist & Share */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <Link
            to="/properties"
            className="text-secondary fw-semibold small d-inline-flex align-items-center gap-1 hover-primary"
          >
            <ArrowLeft size={16} /> Back to Search Results
          </Link>
          <div className="d-flex align-items-center gap-2">
            <button
              onClick={() => toggleFavorite(property._id)}
              className={`btn btn-sm ${favorited ? 'btn-danger' : 'btn-outline-secondary'} rounded-pill d-inline-flex align-items-center gap-1`}
              style={{ fontSize: '0.8rem' }}
            >
              <Heart size={14} className={favorited ? 'fill-white' : ''} />
              {favorited ? 'Saved' : 'Save'}
            </button>

            <button
              onClick={handleShare}
              className="btn btn-sm btn-outline-secondary rounded-pill d-inline-flex align-items-center gap-1"
              style={{ fontSize: '0.8rem' }}
              title="Copy property link to clipboard"
            >
              <Share2 size={14} />
              {copiedShare ? 'Copied Link!' : 'Share'}
            </button>

            <span className="pill-badge pill-type">{property.propertyType}</span>
            {property.status !== 'approved' && (
              <span className="pill-badge pill-pending">Status: {property.status}</span>
            )}
          </div>
        </div>

        {/* Title, Address & Rating Bar */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start mb-4 gap-3">
          <div>
            <h1 className="fw-bold text-dark brand-font mb-2">{property.title}</h1>
            <div className="d-flex align-items-center text-muted">
              <MapPin size={16} className="text-danger me-1 flex-shrink-0" />
              <span>{property.address}, {property.city}, {property.state} - {property.pincode}</span>
            </div>
          </div>

          {/* Rating Badge */}
          <div className="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded-4 border shadow-xs flex-shrink-0">
            <Star size={22} className="text-warning fill-warning" />
            <div>
              <div className="fw-bold text-dark fs-5 leading-none">{property.ratingsAverage || 4.9} / 5.0</div>
              <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                ({property.ratingsCount || reviews.length} verified reviews)
              </div>
            </div>
          </div>
        </div>

        {/* Architectural Photo Gallery */}
        <div className="row g-3 mb-5">
          <div className="col-12">
            <img
              src={images[activeImageIndex]}
              alt={property.title}
              className="gallery-hero-image"
            />
          </div>
          {images.length > 1 && (
            <div className="col-12">
              <div className="row g-2">
                {images.map((img, idx) => (
                  <div key={idx} className="col-3 col-md-2">
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className={`gallery-strip-thumb ${activeImageIndex === idx ? 'active' : ''}`}
                      onClick={() => setActiveImageIndex(idx)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content & Sidebar Columns */}
        <div className="row g-4">
          {/* Left Column: Details, Specs, Amenities, 3D Tour & Reviews */}
          <div className="col-lg-8">
            {/* Quick Specs Highlights Card */}
            <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
              <h5 className="fw-bold text-dark brand-font mb-3">Residence Overview</h5>
              <div className="row g-3 text-center">
                <div className="col-4 col-md-2">
                  <div className="p-3 rounded-3 bg-light h-100">
                    <Bed size={22} className="text-primary mb-1" />
                    <div className="fw-bold text-dark">{property.bedrooms} Beds</div>
                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Bedrooms</div>
                  </div>
                </div>
                <div className="col-4 col-md-2">
                  <div className="p-3 rounded-3 bg-light h-100">
                    <Bath size={22} className="text-primary mb-1" />
                    <div className="fw-bold text-dark">{property.bathrooms} Baths</div>
                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Bathrooms</div>
                  </div>
                </div>
                <div className="col-4 col-md-3">
                  <div className="p-3 rounded-3 bg-light h-100">
                    <Maximize2 size={22} className="text-primary mb-1" />
                    <div className="fw-bold text-dark">{property.areaSqFt} Sq Ft</div>
                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Carpet Area</div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="p-3 rounded-3 bg-light h-100">
                    <Layers size={22} className="text-primary mb-1" />
                    <div className="fw-bold text-dark text-truncate">{property.furnishing}</div>
                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Furnishing</div>
                  </div>
                </div>
                <div className="col-6 col-md-2">
                  <div className="p-3 rounded-3 bg-light h-100">
                    <CheckCircle size={22} className="text-success mb-1" />
                    <div className="fw-bold text-success">Ready</div>
                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Move-in</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
              <h5 className="fw-bold text-dark brand-font mb-3">About this Residence</h5>
              <p className="text-secondary leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                {property.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
              <h5 className="fw-bold text-dark brand-font mb-3">Included Amenities & Services</h5>
              <div className="row g-2">
                {property.amenities && property.amenities.length > 0 ? (
                  property.amenities.map((amenity, index) => (
                    <div key={index} className="col-md-4 col-6">
                      <div className="amenity-card-luxe">
                        <CheckCircle size={16} className="text-success flex-shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-muted">Standard essential utilities included.</div>
                )}
              </div>
            </div>

            {/* 3D Walkthrough Video Section */}
            {property.videoTourUrl && (
              <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Video size={22} className="text-danger" />
                  <h5 className="fw-bold text-dark brand-font mb-0">3D Spatial Walkthrough Tour</h5>
                </div>
                <div className="ratio ratio-16x9 rounded-4 overflow-hidden border shadow-inner">
                  <iframe
                    src={property.videoTourUrl}
                    title="Virtual Property Tour"
                    allowFullScreen
                  ></iframe>
                </div>
                <p className="text-muted small mt-2 mb-0">
                  Inspect every bedroom, balcony, and floor plan virtually from anywhere before scheduling in-person visits.
                </p>
              </div>
            )}

            {/* Reviews Section */}
            <div className="bg-white p-4 rounded-4 shadow-sm border">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold text-dark brand-font mb-0">
                  Tenant Feedback & Reviews ({reviews.length})
                </h5>
              </div>

              {/* Review Submission Form */}
              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit} className="p-3 bg-light rounded-4 mb-4">
                  <h6 className="fw-bold text-dark mb-2">Leave a Verified Tenant Review</h6>
                  {reviewError && <div className="alert alert-danger py-2 small mb-2">{reviewError}</div>}
                  {reviewSuccess && <div className="alert alert-success py-2 small mb-2">{reviewSuccess}</div>}

                  <div className="d-flex align-items-center gap-3 mb-3">
                    <label className="small fw-bold text-secondary mb-0">Rating Score:</label>
                    <select
                      className="form-select form-select-sm"
                      style={{ width: 140 }}
                      value={newRating}
                      onChange={(e) => setNewRating(e.target.value)}
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                      <option value="4">⭐⭐⭐⭐ (4/5)</option>
                      <option value="3">⭐⭐⭐ (3/5)</option>
                      <option value="2">⭐⭐ (2/5)</option>
                      <option value="1">⭐ (1/5)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <textarea
                      rows="3"
                      className="form-control form-input-luxe"
                      placeholder="Share your experience regarding property upkeep, acoustics, and landlord responsiveness..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-sm btn-luxe-primary"
                    disabled={submittingReview}
                  >
                    <Send size={14} /> Submit Review
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-light rounded-4 text-center mb-4">
                  <p className="text-muted small mb-2">Have you lived in or toured this residence?</p>
                  <Link to="/login" className="btn btn-sm btn-luxe-secondary">
                    Log in to write a review
                  </Link>
                </div>
              )}

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <p className="text-muted small">No verified reviews for this property yet.</p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="p-3 border rounded-3 bg-white">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={rev.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                            alt={rev.user?.name}
                            className="rounded-circle"
                            style={{ width: 34, height: 34, objectFit: 'cover' }}
                          />
                          <div>
                            <span className="fw-bold text-dark small">{rev.user?.name}</span>
                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                              Verified Tenant
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center text-warning small">
                          {'★'.repeat(rev.rating)}
                          <span className="text-muted ms-1">({rev.rating}/5)</span>
                        </div>
                      </div>
                      <p className="text-secondary small mb-1">{rev.comment}</p>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {new Date(rev.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Pricing & Booking Dock Card */}
          <div className="col-lg-4">
            <div className="booking-dock-card">
              {/* Monthly Price Display */}
              <div className="mb-3">
                <span className="text-muted small text-uppercase fw-bold" style={{ fontSize: '0.72rem' }}>
                  Monthly Rent Rate
                </span>
                <div className="d-flex align-items-baseline gap-1 mt-1">
                  <span className="display-6 fw-bold brand-font text-dark" style={{ letterSpacing: '-0.5px' }}>
                    {formatPrice(property.price)}
                  </span>
                  <span className="text-muted">/ month</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-3 bg-light rounded-4 mb-4">
                <div className="d-flex justify-content-between small text-secondary mb-2">
                  <span>Security Deposit:</span>
                  <span className="fw-bold text-dark">
                    {formatPrice(property.securityDeposit || property.price * 2)}
                  </span>
                </div>
                <div className="d-flex justify-content-between small text-secondary mb-2">
                  <span>Notice Period:</span>
                  <span className="fw-semibold text-dark">1 Month</span>
                </div>
                <div className="d-flex justify-content-between small text-secondary">
                  <span>Building Maintenance:</span>
                  <span className="text-success fw-bold">Included</span>
                </div>
              </div>

              {/* Booking CTA Button */}
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="btn btn-luxe-primary w-100 py-3 mb-3 fw-bold fs-6"
                style={{ borderRadius: 'var(--radius-md)' }}
              >
                Request Rental Lease
              </button>

              <div className="text-center small text-muted d-flex align-items-center justify-content-center gap-1 mb-4">
                <ShieldCheck size={16} className="text-success" />
                <span>Free cancellation before landlord confirmation</span>
              </div>

              {/* Landlord Contact & Host Profile Card */}
              <div className="pt-3 border-top">
                <span className="text-muted small text-uppercase fw-bold d-block mb-3" style={{ fontSize: '0.72rem' }}>
                  Property Host
                </span>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <img
                    src={property.owner?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
                    alt={property.owner?.name}
                    className="rounded-circle shadow-xs"
                    style={{ width: 52, height: 52, objectFit: 'cover' }}
                  />
                  <div>
                    <h6 className="fw-bold text-dark mb-0">{property.owner?.name || 'Property Owner'}</h6>
                    <span className="pill-badge pill-verified mt-1" style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}>
                      <ShieldCheck size={12} /> Verified Superhost
                    </span>
                  </div>
                </div>

                <p className="text-muted small mb-3">
                  {property.owner?.bio || 'Experienced verified property host on HouseHunt.'}
                </p>

                <div className="d-flex flex-column gap-2 small text-secondary">
                  {property.owner?.phone && (
                    <a
                      href={`tel:${property.owner.phone}`}
                      className="d-flex align-items-center gap-2 p-2 rounded-3 border text-dark hover-primary"
                    >
                      <Phone size={15} className="text-primary" />
                      <span>{property.owner.phone}</span>
                    </a>
                  )}
                  {property.owner?.email && (
                    <a
                      href={`mailto:${property.owner.email}`}
                      className="d-flex align-items-center gap-2 p-2 rounded-3 border text-dark hover-primary"
                    >
                      <Mail size={15} className="text-primary" />
                      <span>{property.owner.email}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        property={property}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={() => {
          navigate('/dashboard');
        }}
      />
    </div>
  );
};

export default PropertyDetailsPage;
