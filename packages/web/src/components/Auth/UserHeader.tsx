import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function UserHeader() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!user) return null;

  // Get user's initial (first letter of name)
  const userInitial = user.name.charAt(0).toUpperCase();

  // Abbreviate user name (keep first name, abbreviate others)
  const abbreviateName = (fullName: string) => {
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length === 1) return nameParts[0];
    
    const firstName = nameParts[0];
    const abbreviatedParts = nameParts.slice(1).map(part => part.charAt(0).toUpperCase());
    return `${firstName} ${abbreviatedParts.join(' ')}`;
  };

  // Truncate email if too long
  const truncateEmail = (email: string, maxLength: number = 25) => {
    if (email.length <= maxLength) return email;
    const [localPart, domain] = email.split('@');
    if (localPart.length > maxLength - domain.length - 4) {
      return `${localPart.substring(0, maxLength - domain.length - 7)}...@${domain}`;
    }
    return email;
  };

  return (
    <>
      <div className="user-avatar-container">
        <div 
          className="user-avatar"
          onClick={() => setShowDropdown(!showDropdown)}
          title={user.name}
        >
          {userInitial}
        </div>
        <div className="user-name" onClick={() => setShowDropdown(!showDropdown)}>
          {abbreviateName(user.name)}
        </div>
        
        {showDropdown && (
          <div className="user-dropdown">
            <div className="user-dropdown-name">{abbreviateName(user.name)}</div>
            <div className="user-dropdown-email">{truncateEmail(user.email)}</div>
            <button 
              className="logout-button" 
              onClick={logout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
