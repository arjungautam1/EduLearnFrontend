import React from 'react';

const CourseBanner = ({ category, title, size = 'default' }) => {
  const colors = {
    'Programming': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'Data Science': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'Design': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'Business': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'Language': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'Other': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  };

  const icons = {
    'Programming': 'bi-code-slash',
    'Data Science': 'bi-graph-up',
    'Design': 'bi-palette',
    'Business': 'bi-briefcase',
    'Language': 'bi-translate',
    'Other': 'bi-book'
  };

  const bgColor = colors[category] || colors['Other'];
  const icon = icons[category] || icons['Other'];

  const sizeConfig = {
    small: {
      iconSize: '1.5rem',
      titleSize: '0.8rem',
      padding: '1rem'
    },
    default: {
      iconSize: '2rem',
      titleSize: '0.9rem',
      padding: '1rem'
    },
    large: {
      iconSize: '3rem',
      titleSize: '1.5rem',
      padding: '2rem'
    }
  };

  const config = sizeConfig[size] || sizeConfig.default;

  return (
    <div 
      className="course-banner"
      style={{
        background: bgColor,
        padding: config.padding
      }}
    >
      <i 
        className={`bi ${icon}`} 
        style={{ 
          fontSize: config.iconSize,
          marginBottom: '0.5rem',
          opacity: 0.9 
        }}
      ></i>
      <h6 
        style={{ 
          margin: 0, 
          fontSize: config.titleSize, 
          fontWeight: 600, 
          textShadow: '0 1px 2px rgba(0,0,0,0.2)',
          color: 'white'
        }}
      >
        {size === 'small' ? 
          (title.length > 40 ? title.substring(0, 40) + '...' : title) :
          (title.length > 50 ? title.substring(0, 50) + '...' : title)
        }
      </h6>
      <small 
        style={{ 
          opacity: 0.8, 
          marginTop: '0.25rem',
          color: 'rgba(255,255,255,0.9)'
        }}
      >
        {category}
      </small>
    </div>
  );
};

export default CourseBanner;