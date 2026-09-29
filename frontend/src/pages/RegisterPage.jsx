import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Phone, Home, AlertCircle, ArrowRight, CheckCircle2, Shield, Key } from 'lucide-react';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('tenant');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in name, email, and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const res = await register({
        name,
        email,
        password,
        role,
        phone,
      });

      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container bg-page">
      <div className="auth-mesh"></div>

      <div className="auth-card" style={{ maxWidth: 540 }}>
        {/* Brand Header */}
        <div className="text-center mb-4">
          <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none mb-3">
            <div className="brand-logo-icon">
              <Home size={22} strokeWidth={2.5} />
            </div>
            <span className="brand-font fs-2 fw-bold text-dark">
              House<span style={{ color: 'var(--color-brand-600)' }}>Hunt</span>
            </span>
          </Link>
          <h4 className="fw-bold text-dark brand-font">Join the Marketplace</h4>
          <p className="text-muted small">Connect directly with verified landlords and renters</p>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-3">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Picker Radio Cards */}
          <div className="mb-4">
            <label className="form-label small fw-bold text-dark mb-2">
              Select Your Role
            </label>
            <div className="row g-2">
              <div className="col-6">
                <div
                  onClick={() => setRole('tenant')}
                  className={`role-select-box ${role === 'tenant' ? 'selected' : ''}`}
                >
                  <Key size={24} className="text-primary mb-1 mx-auto" />
                  <div className="fw-bold small text-dark">I am a Tenant</div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>Looking to rent homes</div>
                </div>
              </div>

              <div className="col-6">
                <div
                  onClick={() => setRole('owner')}
                  className={`role-select-box ${role === 'owner' ? 'selected' : ''}`}
                >
                  <Home size={24} className="text-warning mb-1 mx-auto" />
                  <div className="fw-bold small text-dark">I am a Landlord</div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>Looking to list homes</div>
                </div>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div className="mb-3">
            <label className="form-label small fw-bold text-dark">Full Name</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <User size={16} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control form-input-luxe border-start-0"
                placeholder="Rahul Verma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label small fw-bold text-dark">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <Mail size={16} className="text-muted" />
              </span>
              <input
                type="email"
                className="form-control form-input-luxe border-start-0"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="mb-3">
            <label className="form-label small fw-bold text-dark">Phone Number</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <Phone size={16} className="text-muted" />
              </span>
              <input
                type="tel"
                className="form-control form-input-luxe border-start-0"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="form-label small fw-bold text-dark">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <Lock size={16} className="text-muted" />
              </span>
              <input
                type="password"
                className="form-control form-input-luxe border-start-0"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-luxe-primary w-100 py-3 mb-3 fw-bold fs-6"
            style={{ borderRadius: 'var(--radius-md)' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Creating Profile...
              </>
            ) : (
              <>
                Complete Registration <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-muted small mt-3">
          Already have an account?{' '}
          <Link to="/login" className="text-primary fw-bold text-decoration-none">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
