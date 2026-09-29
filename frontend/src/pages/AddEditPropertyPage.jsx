import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { propertiesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Building,
  MapPin,
  IndianRupee,
  Layers,
  Image as ImageIcon,
  Video,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  Bed,
  Bath,
  Maximize2,
} from 'lucide-react';

const ALL_AMENITIES = [
  'WiFi',
  'Air Conditioning',
  'Swimming Pool',
  'Gym',
  'Parking',
  'Power Backup',
  'Security',
  'Pet Friendly',
  'Club House',
  'Private Terrace',
  'EV Charger',
  'Solar Power',
];

const AddEditPropertyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: 'Apartment',
    price: '',
    securityDeposit: '',
    address: '',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '',
    bedrooms: 2,
    bathrooms: 2,
    areaSqFt: 1450,
    furnishing: 'Furnished',
    amenities: ['WiFi', 'Parking', 'Security', 'Air Conditioning'],
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    ],
    videoTourUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (isEditing) {
      const fetchProperty = async () => {
        try {
          setLoading(true);
          const res = await propertiesAPI.getById(id);
          if (res.data.success) {
            const p = res.data.property;
            setFormData({
              title: p.title || '',
              description: p.description || '',
              propertyType: p.propertyType || 'Apartment',
              price: p.price || '',
              securityDeposit: p.securityDeposit || '',
              address: p.address || '',
              city: p.city || 'Bangalore',
              state: p.state || 'Karnataka',
              pincode: p.pincode || '',
              bedrooms: p.bedrooms || 1,
              bathrooms: p.bathrooms || 1,
              areaSqFt: p.areaSqFt || 800,
              furnishing: p.furnishing || 'Furnished',
              amenities: p.amenities || [],
              images: p.images && p.images.length > 0 ? p.images : [],
              videoTourUrl: p.videoTourUrl || '',
            });
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load property data');
        } finally {
          setLoading(false);
        }
      };
      fetchProperty();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const handleAddImage = (e) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, newImageUrl.trim()],
    }));
    setNewImageUrl('');
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== indexToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.description || !formData.price || !formData.address) {
      setError('Please fill out all required fields (Title, Description, Rent, Street Address).');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        price: Number(formData.price),
        securityDeposit: Number(formData.securityDeposit) || Number(formData.price) * 2,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        areaSqFt: Number(formData.areaSqFt),
      };

      if (isEditing) {
        await propertiesAPI.update(id, payload);
      } else {
        await propertiesAPI.create(payload);
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save property listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5 bg-page min-vh-100">
      <div className="container" style={{ maxWidth: 960 }}>
        {/* Breadcrumb Back */}
        <div className="mb-3">
          <Link
            to="/dashboard"
            className="text-secondary fw-semibold small d-inline-flex align-items-center gap-1 hover-primary"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        {/* Studio Header */}
        <div className="mb-4">
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="pill-badge pill-type">
              Listing Studio
            </span>
          </div>
          <h1 className="fw-bold text-dark brand-font mb-1">
            {isEditing ? 'Edit Property Listing' : 'Publish a New Luxury Residence'}
          </h1>
          <p className="text-muted mb-0">
            Showcase your residence with high-res photos, 3D tours, and clear lease terms to verified tenants.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-3 px-4 rounded-4 mb-4 shadow-xs">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Basic Information */}
          <div className="bg-white p-4 p-md-5 rounded-4 border shadow-sm mb-4">
            <h5 className="fw-bold text-dark brand-font mb-3 d-flex align-items-center gap-2">
              <Building size={20} className="text-primary" /> Basic Information
            </h5>

            <div className="row g-3">
              <div className="col-12">
                <label className="form-label small fw-bold text-dark">
                  Property Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="form-control form-input-luxe"
                  placeholder="e.g. Skyline Azure 3BHK Penthouse with Private Terrace Garden"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">Property Type</label>
                <select
                  name="propertyType"
                  className="form-select form-input-luxe"
                  value={formData.propertyType}
                  onChange={handleChange}
                >
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Luxury Villa</option>
                  <option value="Penthouse">Duplex Penthouse</option>
                  <option value="Studio">Studio Loft</option>
                  <option value="Independent House">Independent House</option>
                  <option value="Gated Community">Gated Community</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">Furnishing Status</label>
                <select
                  name="furnishing"
                  className="form-select form-input-luxe"
                  value={formData.furnishing}
                  onChange={handleChange}
                >
                  <option value="Furnished">Fully Furnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label small fw-bold text-dark">
                  Detailed Architectural Description <span className="text-danger">*</span>
                </label>
                <textarea
                  name="description"
                  rows="4"
                  className="form-control form-input-luxe"
                  placeholder="Describe interior finishes, views, kitchen appliances, community amenities, and neighborhood highlights..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Terms */}
          <div className="bg-white p-4 p-md-5 rounded-4 border shadow-sm mb-4">
            <h5 className="fw-bold text-dark brand-font mb-3 d-flex align-items-center gap-2">
              <Sparkles size={20} className="text-warning" /> Pricing & Financial Terms
            </h5>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">
                  Monthly Rent (₹) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  min="5000"
                  className="form-control form-input-luxe"
                  placeholder="e.g. 75000"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">
                  Security Deposit (₹)
                </label>
                <input
                  type="number"
                  name="securityDeposit"
                  className="form-control form-input-luxe"
                  placeholder="Default is 2 months rent"
                  value={formData.securityDeposit}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Layout & Specifications */}
          <div className="bg-white p-4 p-md-5 rounded-4 border shadow-sm mb-4">
            <h5 className="fw-bold text-dark brand-font mb-3 d-flex align-items-center gap-2">
              <Layers size={20} className="text-info" /> Layout & Carpet Area
            </h5>

            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label small fw-bold text-dark">Bedrooms</label>
                <select
                  name="bedrooms"
                  className="form-select form-input-luxe"
                  value={formData.bedrooms}
                  onChange={handleChange}
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Bedroom' : 'Bedrooms'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-bold text-dark">Bathrooms</label>
                <select
                  name="bathrooms"
                  className="form-select form-input-luxe"
                  value={formData.bathrooms}
                  onChange={handleChange}
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Bathroom' : 'Bathrooms'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-bold text-dark">
                  Carpet Area (Sq Ft) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  name="areaSqFt"
                  min="200"
                  className="form-control form-input-luxe"
                  value={formData.areaSqFt}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 4: Location */}
          <div className="bg-white p-4 p-md-5 rounded-4 border shadow-sm mb-4">
            <h5 className="fw-bold text-dark brand-font mb-3 d-flex align-items-center gap-2">
              <MapPin size={20} className="text-danger" /> Physical Location
            </h5>

            <div className="row g-3">
              <div className="col-12">
                <label className="form-label small fw-bold text-dark">
                  Street Address & Building Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  className="form-control form-input-luxe"
                  placeholder="e.g. Tower 4, 18th Floor, Indiranagar 100ft Road"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-bold text-dark">City</label>
                <select
                  name="city"
                  className="form-select form-input-luxe"
                  value={formData.city}
                  onChange={handleChange}
                >
                  <option value="Bangalore">Bangalore</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Gurugram">Gurugram / NCR</option>
                  <option value="Pune">Pune</option>
                  <option value="Goa">Goa</option>
                  <option value="Chennai">Chennai</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-bold text-dark">State</label>
                <input
                  type="text"
                  name="state"
                  className="form-control form-input-luxe"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-bold text-dark">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  className="form-control form-input-luxe"
                  placeholder="e.g. 560038"
                  value={formData.pincode}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Section 5: Curated Amenities */}
          <div className="bg-white p-4 p-md-5 rounded-4 border shadow-sm mb-4">
            <h5 className="fw-bold text-dark brand-font mb-3">Included Amenities & Services</h5>
            <div className="row g-2">
              {ALL_AMENITIES.map((amenity) => {
                const selected = formData.amenities.includes(amenity);
                return (
                  <div key={amenity} className="col-md-4 col-6">
                    <button
                      type="button"
                      onClick={() => handleAmenityToggle(amenity)}
                      className={`w-100 p-2 rounded-3 text-start small border d-flex align-items-center gap-2 ${
                        selected
                          ? 'border-primary bg-primary bg-opacity-10 text-primary fw-bold'
                          : 'border-subtle bg-white text-secondary'
                      }`}
                    >
                      <CheckCircle
                        size={16}
                        className={selected ? 'text-primary' : 'text-muted opacity-25'}
                      />
                      <span>{amenity}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 6: Photography & Media */}
          <div className="bg-white p-4 p-md-5 rounded-4 border shadow-sm mb-4">
            <h5 className="fw-bold text-dark brand-font mb-3 d-flex align-items-center gap-2">
              <ImageIcon size={20} className="text-primary" /> Photography & Virtual Tour
            </h5>

            {/* Photo List Preview */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-dark">Uploaded Photos ({formData.images.length})</label>
              <div className="row g-2 mb-3">
                {formData.images.map((url, idx) => (
                  <div key={idx} className="col-md-3 col-6">
                    <div className="position-relative rounded-3 overflow-hidden border" style={{ height: 120 }}>
                      <img src={url} alt={`Property upload ${idx + 1}`} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 rounded-circle p-1"
                        style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Photo Input */}
              <div className="input-group">
                <input
                  type="url"
                  className="form-control form-input-luxe"
                  placeholder="Paste direct high-resolution image URL (e.g. Unsplash)..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="btn btn-luxe-secondary"
                >
                  <Plus size={16} /> Add Image
                </button>
              </div>
            </div>

            {/* Virtual Tour Video URL */}
            <div>
              <label className="form-label small fw-bold text-dark">
                3D Spatial or Video Walkthrough URL (Embeddable)
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Video size={16} className="text-danger" />
                </span>
                <input
                  type="url"
                  name="videoTourUrl"
                  className="form-control form-input-luxe border-start-0"
                  placeholder="https://www.youtube-nocookie.com/embed/..."
                  value={formData.videoTourUrl}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="d-flex justify-content-end gap-3">
            <Link to="/dashboard" className="btn btn-luxe-secondary px-4">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-luxe-primary px-5 py-3 fw-bold"
              disabled={loading}
            >
              {loading ? 'Submitting Residence...' : isEditing ? 'Save Changes' : 'Publish Residence'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditPropertyPage;
