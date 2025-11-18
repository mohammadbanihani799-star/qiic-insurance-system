import React from 'react';
import '../index.css';

const ProgressBar = ({ currentStep = 1, totalSteps = 4 }) => {
  // Calculate progress percentages for dual-layer design
  const lightPercentage = Math.min(((currentStep - 1) / totalSteps) * 100 + 30, 100);
  const greenPercentage = Math.min((currentStep / totalSteps) * 100, lightPercentage - 8);

  return (
    <div className="progress">
      <div className="scale-progress">
        <div className="light" style={{ width: `${lightPercentage}%` }}></div>
        <div className="green" style={{ width: `${greenPercentage}%` }}></div>
      </div>
    </div>
  );
};

export default ProgressBar;
