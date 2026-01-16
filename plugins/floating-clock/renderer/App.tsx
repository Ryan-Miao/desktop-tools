import React, { useState } from 'react';
import FloatingClock from './Clock';
import StatsPanel from './StatsPanel';

const App: React.FC = () => {
  const [showStats, setShowStats] = useState(false);

  return (
    <>
      <FloatingClock />
      {showStats && <StatsPanel onClose={() => setShowStats(false)} />}
    </>
  );
};

export default App;
