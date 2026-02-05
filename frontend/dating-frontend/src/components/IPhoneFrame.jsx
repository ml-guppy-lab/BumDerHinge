// import { useState, useRef } from "react";
// import profiles from "../profiles";
// import ProfileCard from "./ProfileCard";

// export default function IPhoneFrame() {
//   const [profileIdx, setProfileIdx] = useState(0);
//   const contentRef = useRef(null);

//   const currentProfile = profiles[profileIdx];

//   const handleNext = () => {
//     if (profileIdx < profiles.length - 1) {
//       setProfileIdx(profileIdx + 1);
//       setTimeout(() => {
//         // Scroll back to top of iphone-content div
//         if (contentRef.current) contentRef.current.scrollTop = 0;
//       }, 0);
//     } else {
//       alert("No more profiles!");
//     }
//   };

//   return (
//     <div className="iphone-frame">
//       <div className="iphone-notch" />
//       <div className="iphone-content" ref={contentRef}>
//         <ProfileCard profile={currentProfile} />
//         <div className="swipe-buttons">
//           <button className="swipe-left" onClick={handleNext}>❌ Left</button>
//           <button className="swipe-right" onClick={handleNext}>✅ Right</button>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useRef } from "react";
import profiles from "../profiles";
import ProfileCard from "./ProfileCard";
import { useNavigate } from 'react-router-dom';

export default function IPhoneFrame() {
  const [profileIdx, setProfileIdx] = useState(0);
  const contentRef = useRef(null);
  const navigate = useNavigate();

  const currentProfile = profiles[profileIdx];

  const handleNext = () => {
    if (profileIdx < profiles.length - 1) {
      setProfileIdx(profileIdx + 1);
      setTimeout(() => {
        if (contentRef.current) contentRef.current.scrollTop = 0;
      }, 0);
    } else {
      alert("No more profiles!");
    }
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
          <ProfileCard profile={currentProfile} />
          <div className="swipe-buttons mt-4 d-flex justify-content-between">
            <button className="btn btn-danger swipe-left px-5" onClick={handleNext}>❌ Left</button>
            <button className="btn btn-success swipe-right px-5" onClick={handleNext}>✅ Right</button>
          </div>
        </div>
      </div>
    </div>
  );
}