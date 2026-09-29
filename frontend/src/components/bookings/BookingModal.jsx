import React, { useState } from 'react';
import { bookingsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, CreditCard, Send, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';

const BookingModal = ({ property, isOpen, onClose, onSuccess }) => {
  const { isAuthenticated, user } = useAuth();
  const [moveInDate, setMoveInDate] = useState('');
  const [durationMonths, setDurationMonths] = useState(11);
  const [tenantMessage, setTenantMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !property) return null;

  const deposit = property.securityDeposit || property.price * 2;
  const upfrontTotal = property.price + deposit;

  const formatPrice = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      setError('You must be logged in to request a rental lease. Please sign in or use the 1-click demo switcher on top.');
      return;
    }

    if (!moveInDate) {
      setError('Please select an intended move-in date.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await bookingsAPI.create({
        propertyId: property._id,
        moveInDate,
        durationMonths: Number(durationMonths),
        tenantMessage,
      });

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess(res.data.booking);
          onClose();
        }, 2200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rental request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', zIndex: 1050 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content rounded-4 border-0 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="modal-header bg-white border-bottom px-4 py-3">
            <div className="d-flex align-items-center gap-3">
              <img
                src={property.images?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=100&q=80'}
                alt={property.title}
                className="rounded-3"
                style={{ width: 48, height: 48, objectFit: 'cover' }}
              />
              <div>
                <h5 className="modal-title fw-bold text-dark brand-font mb-0">
                  Request Rental Lease
                </h5>
                <p className="text-muted small mb-0 text-truncate" style={{ maxWidth: 450 }}>
                  {property.title} · {property.city}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body p-4 bg-page">
            {success ? (
              <div className="text-center py-5">
                <CheckCircle2 size={58} className="text-success mb-3 animate-bounce" />
                <h4 className="fw-bold text-dark brand-font">Rental Request Dispatched!</h4>
                <p className="text-muted mb-4 px-md-5">
                  Your lease inquiry and reservation request has been transmitted directly to landlord{' '}
                  <strong>{property.owner?.name || 'the property owner'}</strong>. You can track updates in your Dashboard.
                </p>
                <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                <span className="ms-2 text-muted small">Redirecting to your Dashboard...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-3">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="row g-3 mb-4">
                  {/* Move-in Date */}
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-dark">
                      Target Move-in Date <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <Calendar size={16} className="text-primary" />
                      </span>
                      <input
                        type="date"
                        className="form-control form-input-luxe border-start-0"
                        min={new Date().toISOString().split('T')[0]}
                        value={moveInDate}
                        onChange={(e) => setMoveInDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Lease Duration */}
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-dark">
                      Lease Duration
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <Clock size={16} className="text-primary" />
                      </span>
                      <select
                        className="form-select form-input-luxe border-start-0"
                        value={durationMonths}
                        onChange={(e) => setDurationMonths(e.target.value)}
                      >
                        <option value="6">6 Months (Standard)</option>
                        <option value="11">11 Months (Most Popular)</option>
                        <option value="24">24 Months (Long Term)</option>
                        <option value="36">36 Months (Corporate)</option>
                      </select>
                    </div>
                  </div>

                  {/* Message to Landlord */}
                  <div className="col-12">
                    <label className="form-label small fw-bold text-dark">
                      Introductory Note to Landlord (Optional)
                    </label>
                    <textarea
                      rows="3"
                      className="form-control form-input-luxe"
                      placeholder="Mention your profession, household members, or any custom move-in requirements..."
                      value={tenantMessage}
                      onChange={(e) => setTenantMessage(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                {/* Financial Summary Card */}
                <div className="bg-white p-3 rounded-4 border mb-4">
                  <span className="small fw-bold text-uppercase text-muted d-block mb-2" style={{ fontSize: '0.72rem' }}>
                    Transparent Lease Financials
                  </span>
                  <div className="d-flex justify-content-between small text-secondary mb-1">
                    <span>1st Month Rental:</span>
                    <span className="fw-semibold text-dark">{formatPrice(property.price)}</span>
                  </div>
                  <div className="d-flex justify-content-between small text-secondary mb-1">
                    <span>Security Deposit (Refundable):</span>
                    <span className="fw-semibold text-dark">{formatPrice(deposit)}</span>
                  </div>
                  <div className="d-flex justify-content-between small text-secondary mb-2">
                    <span>Platform Brokerage Fee:</span>
                    <span className="text-success fw-bold">₹0 (Free / Zero Markup)</span>
                  </div>
                  <div className="d-flex justify-content-between pt-2 border-top fw-bold text-dark">
                    <span>Total Initial Move-in Commitment:</span>
                    <span className="text-primary fs-6">{formatPrice(upfrontTotal)}</span>
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-1 text-muted small">
                    <ShieldCheck size={16} className="text-success" />
                    <span>No advance payment deducted right now</span>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-luxe-secondary"
                      onClick={onClose}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-luxe-primary"
                      disabled={submitting}
                    >
                      {submitting ? 'Transmitting Request...' : 'Send Lease Request'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
