import { XRController } from "@react-three/xr";
import React, { useEffect, useState, useMemo } from "react";
import { MeshProps, useFrame, useLoader, useThree } from "react-three-fiber";
import { PerspectiveCamera, Mesh, Vector3, Object3D } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as YUKA from 'yuka'
import { getYUKAPoints } from "../utils";
import { STICK_ID } from "../utils/drumIds";
import { registry } from "./Collisions";

interface DrumstickProps extends MeshProps {
  controller?: XRController;
  name: STICK_ID
}

function Drumstick(props: DrumstickProps) {
  const {scene} = useLoader<GLTFResult>(
    GLTFLoader,
    "/assets/drumstick.glb"
  );

  const drumstickScene = useMemo(() => scene.clone(), [scene])
  const [active, setIsActive] = useState(false)

  const OBB: YUKA.OBB = useMemo(() => {
    const drumstickPoints = getYUKAPoints(drumstickScene)
    const obb = new YUKA.OBB().fromPoints(drumstickPoints)

    // add to registry
    registry.registerDrumstick(obb, props.name)
    return obb
  }, [drumstickScene])

  useFrame(() => {
    const drumstick = (drumstickScene as Object3D);
    if (!props.controller) {
        if (active) {
            setIsActive(false)
            registry.setStickActivity(false, props.name)
        }
      return;
    }
    if (!active) {
        setIsActive(true)
        registry.setStickActivity(true, props.name)
    }
    const { grip: controller } = props.controller;
    const forward = new Vector3(0, 0, -0.175);
    forward.applyQuaternion(controller.quaternion);
    const position = new Vector3().copy(controller.position).add(forward);

    drumstick.position.set(position.x, position.y, position.z)
    drumstick.rotation.setFromQuaternion(controller.quaternion)

    OBB.center.copy(position)
    OBB.rotation.fromQuaternion(controller.quaternion)
  });

  return (
    props.controller ?
    <group dispose={null}>
      <primitive object={drumstickScene} />
    </group> : null
  );
}

export default Drumstick;
