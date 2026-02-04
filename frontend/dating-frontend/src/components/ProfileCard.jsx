export default function ProfileCard({ profile }) {
  if (!profile) return null;

  // Find elements by type (extendable for more types later)
  const photoElement = profile.elements.find(e => e.type === "photo");
  const caption = photoElement ? photoElement.caption : "";
  const bioElement = profile.elements.find(e => e.type === "bio");
  const bioText = bioElement ? bioElement.text : "";

  return (
    <div className="profile-card-stack">
      {/* Card 1: Photo */}
      {photoElement && (
        <div className="element-card photo-card">
          <img src={photoElement.url} alt={caption || "Profile"} className="profile-photo" />
        </div>
      )}

      {/* Card 2: Photo caption, as a topic & subtopic */}
      {caption && (
        <div className="element-card info-card">
          <div className="element-topic">Caption</div>
          <div className="element-subtopic">{caption}</div>
        </div>
      )}

      {/* Card 3: Name and age as topic/subtopic */}
      <div className="element-card info-card">
        <div className="element-topic">Name / Age</div>
        <div className="element-subtopic">{profile.name}</div>
      </div>

      {/* Card 4: Bio as topic/subtopic */}
      {bioText && (
        <div className="element-card info-card">
          <div className="element-topic">Bio</div>
          <div className="element-subtopic">{bioText}</div>
        </div>
      )}
    </div>
  );
}