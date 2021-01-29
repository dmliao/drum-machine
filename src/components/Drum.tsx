import { useGLTF } from '@react-three/drei'
import React, { useMemo, useRef, useEffect, useState } from 'react'
import { MeshProps, useFrame, useLoader, useThree } from 'react-three-fiber'
import { Box3, BoxBufferGeometry, BufferGeometry, Geometry, Matrix4, Mesh, MeshBasicMaterial, Object3D, Quaternion, Vector3 } from 'three'
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as YUKA from 'yuka'
import { findMesh, getYUKAPoints } from '../utils';
import { DRUM_ID } from '../utils/drumIds';
import { registry } from './Collisions';

function getMeshAndObb(node, id: DRUM_ID): [(Mesh | null), YUKA.OBB] {
  const mesh = findMesh(node)
  mesh?.geometry.computeBoundingBox()

  const points = getYUKAPoints(node)
  const obb = new YUKA.OBB().fromPoints(points)
  registry.registerDrum(obb, id)

  return [mesh, obb]
}

function updateOBBHelper(worldPositionRef: Vector3, worldQuatRef: Quaternion, mesh: Mesh, obb: YUKA.OBB) {
  mesh.geometry.boundingBox?.getCenter(worldPositionRef)
  mesh.localToWorld(worldPositionRef)
  mesh.getWorldQuaternion(worldQuatRef)
  obb.center.copy(worldPositionRef)
  obb.rotation.fromQuaternion(worldQuatRef)
}

export const Drum = (props) => {
  const model = useLoader<GLTFResult>(GLTFLoader, '/assets/drums_blend/drum-kit.glb');
  console.log(model)

  // you have to do scaling of GLTF objects
  // on the model itself, outside of the react context
  // model.scene.scale.multiplyScalar (1/1000)

  // CALCULATE BOUNDING BOXES
  // OH NO I AM DOING THIS BY HANDDDDDDD
  
  // SNARE
  const snareBox: Box3 = useMemo(() => {
    const box = new Box3().setFromObject(model.nodes.snare_body)
    registry.registerDrum(box, DRUM_ID.SNARE)
    return box
  }, [model]);

  // HI HAT
  const hatBox: Box3 = useMemo(() => {
    const box = new Box3().setFromObject(model.nodes.hat_body)
    registry.registerDrum(box, DRUM_ID.HAT)
    return box
  }, [model])
  
  // HI TOM
  const hiTomWorldPosition = new Vector3()
  const hiTomWorldQuaternion = new Quaternion()
  const [hiTomMesh, hiTomOBB]: [Mesh, YUKA.OBB] = useMemo(() => {
    return getMeshAndObb(model.nodes.hi_tom_body, DRUM_ID.HI_TOM)
  })

  // MID TOM - mid_tom_body
  const lowTomWorldPosition = new Vector3()
  const lowTomWorldQuaternion = new Quaternion()
  const [loTomMesh, loTomOBB]: [Mesh, YUKA.OBB] = useMemo(() => {
    return getMeshAndObb(model.nodes.mid_tom_body, DRUM_ID.LOW_TOM)
  })

  // FLOOR TOM - floor_tom_body
  const floorTomWorldPosition = new Vector3()
  const floorTomWorldQuaternion = new Quaternion()
  const [floorTomMesh, floorTomOBB]: [Mesh, YUKA.OBB] = useMemo(() => {
    return getMeshAndObb(model.nodes.floor_tom_body, DRUM_ID.FLOOR_TOM)
  })

  // RIDE CYMBAL - ride_cymbal_body
  const rideWorldPosition = new Vector3()
  const rideWorldQuaternion = new Quaternion()
  const [rideMesh, rideObb]: [Mesh, YUKA.OBB] = useMemo(() => {
    return getMeshAndObb(model.nodes.ride_cymbal_bod, DRUM_ID.RIDE)
  })
  
  // CRASH CYMBAL - crash_cymbal_body

  useFrame(() => {
    // this is not performant, but doesn't require manual matrix updates.
    snareBox.setFromObject(model.nodes.snare_body)
    hatBox.setFromObject(model.nodes.hat_body)

    updateOBBHelper(hiTomWorldPosition, hiTomWorldQuaternion, hiTomMesh, hiTomOBB)
    updateOBBHelper(lowTomWorldPosition, lowTomWorldQuaternion, loTomMesh, loTomOBB)
    updateOBBHelper(floorTomWorldPosition, floorTomWorldQuaternion, floorTomMesh, floorTomOBB)
    updateOBBHelper(rideWorldPosition, rideWorldQuaternion, rideMesh, rideObb)
  })

  return <><group
    position={[0,0,-1]}
    rotation={[0, Math.PI, 0]}
    dispose={null}>
    <primitive 
    object={model.scene}
     />

  </group>
  <box3Helper
    box={snareBox} />
    <box3Helper
    box={hatBox} />
  </>
}