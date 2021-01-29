import { useController } from '@react-three/xr'
import React, { useEffect } from 'react'
import { MeshProps, useThree } from 'react-three-fiber'
import { PerspectiveCamera } from 'three'
import { STICK_ID } from '../utils/drumIds'
import Collisions from './Collisions'
import { Drum } from './Drum'
import Drumstick from './Drumstick'

function Scene(props: MeshProps) {
  
    const { setDefaultCamera } = useThree()
    useEffect(() => {
        const sceneCamera = new PerspectiveCamera()
        sceneCamera.position.set(0, 1.6, 0)
        setDefaultCamera(sceneCamera)
    }, [])
    
    const rightController = useController('right')
    const leftController = useController('left')
  
  return (
    <>
        <Collisions />
        <Drum />
        <Drumstick name={STICK_ID.RIGHT} controller={rightController} />
        <Drumstick name={STICK_ID.LEFT} controller={leftController} />
    </>
  )
}

export default Scene;