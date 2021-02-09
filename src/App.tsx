import React, { Suspense } from 'react';
import './App.css';
import { VRCanvas } from '@react-three/xr';
import Box from './components/Box';
import Scene from './components/Scene';


function App() {
  return (
    <div className="App">
      <VRCanvas camera={{ position: [0, 1.12, 0], rotation: [0, 0, 0] }} shadowMap>
        <directionalLight args={["#FFFFFF", 0.6]} position={[-0.5, 1, 1]} castShadow />
        <Suspense fallback={<Box position={[0, 0, 0]}/>}>
          <Scene />
        </Suspense>
      </VRCanvas>
    </div>
  );
}

export default App;
