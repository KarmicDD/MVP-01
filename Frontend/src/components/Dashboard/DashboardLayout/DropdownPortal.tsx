import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
}

const DropdownPortal: React.FC<PortalProps> = ({ children }) => {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Check if portal root exists, if not create it
    let element = document.getElementById('dropdown-portal-root');
    if (!element) {
      element = document.createElement('div');
      element.id = 'dropdown-portal-root';
      element.style.position = 'fixed';
      element.style.zIndex = '9999';
      element.style.top = '0';
      element.style.left = '0';
      element.style.width = '100%';
      element.style.height = '0';
      element.style.overflow = 'visible';
      document.body.appendChild(element);
    }
    setPortalRoot(element);

    // Cleanup function
    return () => {
      // We don't remove the portal root on unmount as other dropdowns might use it
    };
  }, []);

  // Only render in the portal if it exists
  if (!portalRoot) return null;
  
  return createPortal(children, portalRoot);
};

export default DropdownPortal;
