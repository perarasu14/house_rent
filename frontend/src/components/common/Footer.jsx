import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Mail, Phone, MapPin, Heart, Sparkles, ShieldCheck, Send, Check } from 'lucide-react';

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="luxe-footer">
      <div className="container">
        <div className="row g-5 mb-5">
          {/* Brand Col */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="brand-logo-icon">
                <Home size={22} strokeWidth={2.5} />
              </div>
              <span className="brand-font fs-3 fw-bold text-white">
                House<span style={{ color: 'var(--color-brand-500)' }}>Hunt</span>
              </span>
              <span className="badge bg-white bg-opacity-10 text-white small" style={{ fontSize: '0.65rem' }}>
                LUXE
              </span>
            </div>
            <p className="text-secondary small pe-lg-4 leading-relaxed mb-4">
              India's premier marketplace for curated architectural residences, penthouses, and private villas.
              Zero brokerage markups, direct landlord relationships, and 3D spatial walkthroughs.
            </p>
            <div className="d-flex align-items-center gap-2 text-white small">
              <ShieldCheck size={18} className="text-success" />
              <span>100% Verified Landlords & Escrow Leases</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="text-white fw-bold mb-3 brand-font">Residences</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><Link to="/properties" className="footer-link">All Residences</Link></li>
              <li><Link to="/properties?propertyType=Penthouse" className="footer-link">Duplex Penthouses</Link></li>
              <li><Link to="/properties?propertyType=Villa" className="footer-link">Luxury Villas</Link></li>
              <li><Link to="/properties?propertyType=Apartment" className="footer-link">Modern Apartments</Link></li>
              <li><Link to="/properties?propertyType=Studio" className="footer-link">Studio Lofts</Link></li>
            </ul>
          </div>

          {/* Cities */}
          <div className="col-lg-3 col-md-6 col-6">
            <h6 className="text-white fw-bold mb-3 brand-font">Metro Destinations</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><Link to="/properties?city=Bangalore" className="footer-link">Rent in Bangalore</Link></li>
              <li><Link to="/properties?city=Mumbai" className="footer-link">Rent in Mumbai</Link></li>
              <li><Link to="/properties?city=Hyderabad" className="footer-link">Rent in Hyderabad</Link></li>
              <li><Link to="/properties?city=Gurugram" className="footer-link">Rent in Delhi NCR / Gurugram</Link></li>
              <li><Link to="/properties?city=Goa" className="footer-link">Rent in Goa (Coastal)</Link></li>
              <li><Link to="/properties?city=Pune" className="footer-link">Rent in Pune</Link></li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-bold mb-3 brand-font">Luxe Journal</h6>
            <p className="text-secondary small mb-3">
              Receive curated off-market villa drops and executive residence alerts.
            </p>
            <form onSubmit={handleSubscribe}>
              <div className="input-group mb-2">
                <input
                  type="email"
                  className="form-control form-input-luxe text-dark"
                  placeholder="name@email.com"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  style={{ borderRadius: 'var(--radius-md) 0 0 var(--radius-md)', fontSize: '0.85rem' }}
                />
                <button
                  type="submit"
                  className="btn btn-luxe-primary"
                  style={{ borderRadius: '0 var(--radius-md) var(--radius-md) 0', padding: '0.6rem 1rem' }}
                >
                  {subscribed ? <Check size={16} /> : <Send size={16} />}
                </button>
              </div>
              {subscribed && (
                <div className="text-success small fw-semibold">
                  ✓ You have been subscribed!
                </div>
              )}
            </form>
          </div>
        </div>

        <hr className="border-secondary border-opacity-25 my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 text-secondary small">
          <div>
            &copy; {new Date().getFullYear()} HouseHunt Luxe Technologies Inc. All rights reserved.
          </div>
          <div className="d-flex align-items-center gap-1">
            Built with modern MERN Architecture for Discerning Renters & Landlords.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
