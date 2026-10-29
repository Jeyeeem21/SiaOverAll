import React, { useState, useEffect } from 'react';
import './SkeletonLoader.css';

function SkeletonLoader({ type = 'form', count = 1 }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderFormSkeleton = () => {
    if (isMobile) {
      // Mobile version - single column, fewer sections
      return (
        <div className="skeleton-form">
          <div className="skeleton-header"></div>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="skeleton-section">
              <div className="skeleton-title"></div>
              <div className="skeleton-row">
                <div className="skeleton-input"></div>
              </div>
              <div className="skeleton-row">
                <div className="skeleton-input"></div>
              </div>
            </div>
          ))}
          <div className="skeleton-button"></div>
        </div>
      );
    }

    // Web version - two columns, more sections
    return (
      <div className="skeleton-form">
        <div className="skeleton-header"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton-section">
            <div className="skeleton-title"></div>
            <div className="skeleton-row">
              <div className="skeleton-input"></div>
              <div className="skeleton-input"></div>
            </div>
            <div className="skeleton-row">
              <div className="skeleton-input"></div>
              <div className="skeleton-input"></div>
            </div>
          </div>
        ))}
        <div className="skeleton-button"></div>
      </div>
    );
  };

  const renderCardSkeleton = () => {
    return (
      <div className="skeleton-card">
        <div className="skeleton-card-header">
          <div className="skeleton-title-short"></div>
          <div className="skeleton-badge"></div>
        </div>
        <div className="skeleton-row">
          <div className="skeleton-text"></div>
        </div>
        <div className="skeleton-row">
          <div className="skeleton-text"></div>
        </div>
        <div className="skeleton-row">
          <div className="skeleton-text"></div>
        </div>
        <div className="skeleton-footer">
          <div className="skeleton-text-small"></div>
        </div>
      </div>
    );
  };

  const renderSkeleton = () => {
    switch (type) {
      case 'form':
        return renderFormSkeleton();
      case 'card':
        return renderCardSkeleton();
      default:
        return <div className="skeleton-form"></div>;
    }
  };

  return (
    <div className="skeleton-container">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="skeleton-item">
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
}

export default SkeletonLoader;
