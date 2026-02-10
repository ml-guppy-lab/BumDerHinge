import React, { useState, useRef } from "react";
import girl1 from '../assets/girl 1.webp';
import girl2 from '../assets/girl 2.webp';
// import profiles from "../profiles";
import ProfileCard from "./ProfileCard";
import { useNavigate } from 'react-router-dom';

export default function IPhoneFrame() {
  const [profile, setProfile] = useState(null);
  const [profileIdx, setProfileIdx] = useState(0); // For future use if you want to fetch next
  const contentRef = useRef(null);
  const navigate = useNavigate();

  // Map image filenames to imported images
  const imageMap = {
    'girl 1.webp': girl1,
    'girl 2.webp': girl2,
  };

  React.useEffect(() => {
    fetch("http://localhost:8000/api/profiles/0")
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
      })
      .catch((err) => setProfile(null));
  }, []);

  const handleNext = () => {
    // For now, just alert no more profiles (implement next profile fetch if needed)
    alert("No more profiles!");
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
    </div>
  );
}