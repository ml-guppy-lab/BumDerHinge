import React, { useState, useRef } from "react";
import girl1 from '../assets/girl 1.webp';
import girl2 from '../assets/girl 2.webp';
// import profiles from "../profiles";
import ProfileCard from "./ProfileCard";
import JudgmentOverlay from "./JudgmentOverlay";
import { useNavigate } from 'react-router-dom';

export default function IPhoneFrame() {
  const [profile, setProfile] = useState(null);
  const [profileIdx, setProfileIdx] = useState(0);
  const [judgment, setJudgment] = useState(null);
  const [isLoadingJudgment, setIsLoadingJudgment] = useState(false);
  const contentRef = useRef(null);
  const navigate = useNavigate();

  // Map image filenames to imported images
  const imageMap = {
    'girl 1.webp': girl1,
    'girl 2.webp': girl2,
  };

  const fetchAIJudgment = (index) => {
    setIsLoadingJudgment(true);
    fetch(`http://localhost:8000/api/judge/${index}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to get AI judgment");
        return res.json();
      })
      .then((data) => {
        setJudgment(data);
        setIsLoadingJudgment(false);
      })
      .catch((err) => {
        console.error("Error fetching AI judgment:", err);
        setIsLoadingJudgment(false);
      });
  };

  const fetchProfile = (index) => {
    fetch(`http://localhost:8000/api/profiles/${index}`)
      .then((res) => {
        if (!res.ok) throw new Error("No more profiles");
        return res.json();
      })
      .then((data) => {
        // Map profilePic and all element image URLs
        if (data.profilePic && imageMap[data.profilePic]) {
          data.profilePic = imageMap[data.profilePic];
        }
        if (Array.isArray(data.elements)) {
          data.elements = data.elements.map(el => {
            if (el.type === 'image' && el.url && imageMap[el.url]) {
              return { ...el, url: imageMap[el.url] };
            }
            return el;
          });
        }
        setProfile(data);
        setProfileIdx(index);
        // Scroll back to top
        setTimeout(() => {
          if (contentRef.current) contentRef.current.scrollTop = 0;
        }, 0);
        
        // Fetch AI judgment for this profile
        fetchAIJudgment(index);
      })
      .catch((err) => {
        setProfile(null);
        alert("No more profiles!");
      });
  };

  React.useEffect(() => {
    fetchProfile(0);
  }, []);

  const handleNext = () => {
    setJudgment(null); // Clear current judgment
    fetchProfile(profileIdx + 1);
  };

  const closeJudgment = () => {
    setJudgment(null);
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100">
      <div className="mb-3 w-100 d-flex justify-content-start">
        <button className="btn btn-outline-secondary" onClick={() => navigate('/')}> 
          ◀ Home
        </button>
      </div>
      <div className="iphone-frame shadow">
        <div className="iphone-notch" />
        <div className="iphone-content" ref={contentRef}>
          {profile ? (
            <ProfileCard profile={profile} />
          ) : (
            <div>Loading profile...</div>
          )}
          <div className="swipe-buttons mt-4 d-flex justify-content-between">
            <button className="btn btn-danger swipe-left px-5" onClick={handleNext}>❌ Left</button>
            <button className="btn btn-success swipe-right px-5" onClick={handleNext}>✅ Right</button>
          </div>
        </div>
      </div>
      
      {/* AI Judgment Overlay */}
      {judgment && (
        <JudgmentOverlay 
          decision={judgment.decision} 
          reason={judgment.reason} 
          onClose={closeJudgment} 
        />
      )}
      
      {/* Loading animation for AI judgment */}
      {isLoadingJudgment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          <div style={{
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{
              fontSize: '80px',
              marginBottom: '20px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}>
              🤖
            </div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              marginBottom: '12px',
              letterSpacing: '1px'
            }}>
              AI is Judging...
            </h2>
            <div style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
              marginTop: '20px'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: 'white',
                animation: 'bounce 1.4s ease-in-out infinite'
              }}></div>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: 'white',
                animation: 'bounce 1.4s ease-in-out 0.2s infinite'
              }}></div>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: 'white',
                animation: 'bounce 1.4s ease-in-out 0.4s infinite'
              }}></div>
            </div>
            <style>{`
              @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
              }
              @keyframes bounce {
                0%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-15px); }
              }
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
}