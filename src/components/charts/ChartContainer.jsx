import React from 'react';

const ChartContainer = ({ title, description, children, className = '' }) => {
  return (
    <div className={`card animate-fade-in-up ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {description && (
          <p className="text-gray-600 text-sm">{description}</p>
        )}
      </div>
      <div className="chart-container">
        {children}
      </div>
    </div>
  );
};

export default ChartContainer;