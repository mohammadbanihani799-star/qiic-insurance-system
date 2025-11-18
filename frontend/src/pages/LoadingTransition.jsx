import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from './Loading';

const LoadingTransition = ({ nextRoute, duration = 3000 }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(nextRoute);
    }, duration);

    return () => clearTimeout(timer);
  }, [navigate, nextRoute, duration]);

  return <Loading />;
};

export default LoadingTransition;
