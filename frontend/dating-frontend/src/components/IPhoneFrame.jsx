import React, { useState, useRef } from "react";
// Test images
// import girl1 from '../assets/girl 1.webp';
// import girl2 from '../assets/girl 2.webp';

// Friends images
import gopal1 from '../assets/friends/gopal1.png';
import gopal2 from '../assets/friends/gopal2.png';
import gopal3 from '../assets/friends/gopal3.png';
import sarvan1 from '../assets/friends/sarvan1.png';
import sarvan2 from '../assets/friends/sarvan2.png';
import sarvan3 from '../assets/friends/sarvan3.png';
import aryan1 from '../assets/friends/aryan1.png';
import aryan2 from '../assets/friends/aryan2.png';
import aryan3 from '../assets/friends/aryan3.png';
import rishab1 from '../assets/friends/rishab1.png';
// import rishab2 from '../assets/friends/rishab2.png';
// import rishab3 from '../assets/friends/rishab3.png';
import ambika1 from '../assets/friends/ambika1.png';
import ambika2 from '../assets/friends/ambika2.png';
import ambika3 from '../assets/friends/ambika3.png';
import gunjan1 from '../assets/friends/gunjan1.png';
import gunjan2 from '../assets/friends/gunjan2.png';
import gunjan3 from '../assets/friends/gunjan3.png';
import sonal1 from '../assets/friends/sonal1.png';
import sonal2 from '../assets/friends/sonal2.png';
import sonal3 from '../assets/friends/sonal3.png';
import aman1 from '../assets/friends/aman1.jpg';
import aman2 from '../assets/friends/aman2.jpg';
import aman3 from '../assets/friends/aman3.jpg';

import ProfileCard from "./ProfileCard";
import JudgmentOverlay from "./JudgmentOverlay";
import { useNavigate } from 'react-router-dom';

export default function IPhoneFrame() {
  const [profile, setProfile] = useState(null);
  const [profileIdx, setProfileIdx] = useState(0);
  const [judgment, setJudgment] = useState(null);
  const [isLoadingJudgment, setIsLoadingJudgment] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const contentRef = useRef(null);
  const abortControllerRef = useRef(null);
  const currentJudgmentIndexRef = useRef(null);
  const navigate = useNavigate();

  // Map image filenames to imported images
  const imageMap = {
    // Test images
    // 'girl 1.webp': girl1,
    // 'girl 2.webp': girl2,
    
    // Friends images
    'gopal1.png': gopal1,
    'gopal2.png': gopal2,
    'gopal3.png': gopal3,
    'sarvan1.png': sarvan1,
    'sarvan2.png': sarvan2,
    'sarvan3.png': sarvan3,
    'aryan1.png': aryan1,
    'aryan2.png': aryan2,
    'aryan3.png': aryan3,
    'rishab1.png': rishab1,
    // 'rishab2.png': rishab2,
    // 'rishab3.png': rishab3,
    'ambika1.png': ambika1,
    'ambika2.png': ambika2,
    'ambika3.png': ambika3,
    'gunjan1.png': gunjan1,
    'gunjan2.png': gunjan2,
    'gunjan3.png': gunjan3, 
    'sonal1.png': sonal1,
    'sonal2.png': sonal2,
    'sonal3.png': sonal3,
    'aman1.png': aman1,
    'aman2.png': aman2,
    'aman3.png': aman3,
  };

  const fetchAIJudgment = (index, expectedProfileId) => {
    console.log('fetchAIJudgment called with index:', index, 'expectedProfileId:', expectedProfileId);
    
    // If we're already loading this exact profile, don't start another request
    if (currentJudgmentIndexRef.current === index) {
      console.log('Already loading or loaded judgment for profile', index, 'skipping duplicate request');
      return;
    }
    
    // Cancel any pending request for a different profile
    if (abortControllerRef.current) {
      console.log('Aborting previous request');
      abortControllerRef.current.abort();
    }
    
    // Track which profile we're judging
    currentJudgmentIndexRef.current = index;
    
    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();
    
    setIsLoadingJudgment(true);
    console.log('Making fetch request to:', `http://localhost:8000/api/judge/${index}`);
    
    fetch(`http://localhost:8000/api/judge/${index}`, {
      signal: abortControllerRef.current.signal
    })
      .then((res) => {
        console.log('Received response:', res.status);
        if (!res.ok) throw new Error("Failed to get AI judgment");
        return res.json();
      })
      .then((data) => {
        console.log('AI judgment data:', data);
        // Only set judgment if it matches the expected profile
        if (data.profile_id === expectedProfileId) {
          setJudgment(data);
        } else {
          console.log('Judgment profile_id mismatch:', data.profile_id, 'vs', expectedProfileId);
        }
        setIsLoadingJudgment(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') {
          console.log('AI judgment request cancelled');
        } else {
          console.error("Error fetching AI judgment:", err);
        }
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
        console.log('Calling fetchAIJudgment for index:', index, 'profileId:', data.id);
        fetchAIJudgment(index, data.id);
      })
      .catch((err) => {
        setProfile(null);
        alert("No more profiles!");
      });
  };

  React.useEffect(() => {
    fetchProfile(0);
    
    // Cleanup function to prevent duplicate calls in StrictMode
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleNext = (direction = null) => {
    if (direction) {
      // Start swipe animation
      setSwipeDirection(direction);
      
      // Wait for animation to complete before loading next profile
      setTimeout(() => {
        setJudgment(null); // Clear current judgment
        currentJudgmentIndexRef.current = null; // Reset to allow new profile judgment
        setSwipeDirection(null); // Reset animation state
        fetchProfile(profileIdx + 1);
      }, 500); // Match animation duration
    } else {
      setJudgment(null);
      currentJudgmentIndexRef.current = null;
      fetchProfile(profileIdx + 1);
    }
  };

  const closeJudgment = () => {
    setJudgment(null);
  };

  const handleAutoAction = (isRight) => {
    // First, scroll down smoothly
    if (contentRef.current) {
      const scrollHeight = contentRef.current.scrollHeight;
      const clientHeight = contentRef.current.clientHeight;
      const maxScroll = scrollHeight - clientHeight;
      
      contentRef.current.scrollTo({
        top: maxScroll,
        behavior: 'smooth'
      });
    }

    // After scrolling completes (1 second), automatically click the button
    setTimeout(() => {
      // Close the judgment overlay first
      setJudgment(null);
      
      // Then trigger swipe animation and proceed to next profile
      setTimeout(() => {
        handleNext(isRight ? 'right' : 'left');
      }, 500);
    }, 1000);
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
          <div className={`profile-container ${swipeDirection === 'left' ? 'swiping-left' : ''} ${swipeDirection === 'right' ? 'swiping-right' : ''}`}>
            {profile ? (
              <ProfileCard profile={profile} />
            ) : (
              <div>Loading profile...</div>
            )}
          </div>
          <div className="swipe-buttons mt-4 d-flex justify-content-between">
            <button className="btn btn-danger swipe-left px-5" onClick={() => handleNext('left')} disabled={swipeDirection !== null}>❌ Left</button>
            <button className="btn btn-success swipe-right px-5" onClick={() => handleNext('right')} disabled={swipeDirection !== null}>✅ Right</button>
          </div>
        </div>
      </div>
      
      {/* AI Judgment Overlay */}
      {judgment && (
        <JudgmentOverlay 
          decision={judgment.decision} 
          reason={judgment.reason} 
          onClose={closeJudgment}
          onAutoAction={handleAutoAction}
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
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          pointerEvents: 'none',
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          <div style={{
            textAlign: 'center',
            color: 'white',
            pointerEvents: 'none'
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