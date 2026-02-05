import React from 'react';
import { useNavigate } from 'react-router-dom';
import bumderLogo from '../assets/logo/bumderhinge.png';

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100">
      <img
        src={bumderLogo}
        alt="BumDerHinge Logo"
        style={{ width: 180, height: 180, objectFit: 'contain' }}
        className="mb-3"
      />
      <h1 className="mb-5 fw-bold" style={{ letterSpacing: '2px' }}>BumDerHinge</h1>
      <button
        className="btn btn-primary btn-lg px-5 py-3"
        style={{ fontSize: '1.6rem', borderRadius: "2rem" }}
        onClick={() => navigate('/swipe')}
      >
        AI Swipe
      </button>
    </div>
  );
};

export default HomePage;