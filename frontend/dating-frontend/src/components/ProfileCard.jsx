export default function ProfileCard({ profile }) {
  if (!profile) return null;

  return (
    <div className="profile-card">
      <div className="profile-name">{profile.name}</div>
      {profile.elements.map((element, idx) =>
        element.type === "photo" ? (
          <div key={idx} style={{width: "100%"}}>
            <img src={element.url} alt={element.caption} className="profile-photo" />
            <div className="photo-caption">{element.caption}</div>
          </div>
        ) : (
          <div key={idx} className="profile-bio">{element.text}</div>
        )
      )}
    </div>
  );
}