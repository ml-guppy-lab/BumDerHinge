import { useState, useRef } from "react";
import profiles from "../profiles";
import ProfileCard from "./ProfileCard";

export default function IPhoneFrame() {
  const [profileIdx, setProfileIdx] = useState(0);
  const contentRef = useRef(null);

  const currentProfile = profiles[profileIdx];

  const handleNext = () => {
    if (profileIdx < profiles.length - 1) {
      setProfileIdx(profileIdx + 1);
      setTimeout(() => {
        // Scroll back to top of iphone-content div
        if (contentRef.current) contentRef.current.scrollTop = 0;
      }, 0);
    } else {
      alert("No more profiles!");
    }
  };

  return (
    <div className="iphone-frame">
      <div className="iphone-notch" />
      <div className="iphone-content" ref={contentRef}>
        <ProfileCard profile={currentProfile} />
        <div className="swipe-buttons">
          <button className="swipe-left" onClick={handleNext}>❌ Left</button>
          <button className="swipe-right" onClick={handleNext}>✅ Right</button>
        </div>
      </div>
    </div>
  );
}