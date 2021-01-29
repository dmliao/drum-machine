import React, { useRef, useMemo, useState } from "react";
import { MeshProps, useFrame, useThree } from "react-three-fiber";
import { AudioListener, Box3, Mesh, Vector3 } from "three";
import { OBB, AABB } from "yuka";
import { AudioHandler } from "../utils/Audio";
import { DRUM_ID, STICK_ID } from "../utils/drumIds";

interface DrumstickCollisions {
  [STICK_ID.LEFT]?: OBB;
  [STICK_ID.RIGHT]?: OBB;
}

interface DrumCollision {
  name: DRUM_ID;
  box: OBB | Box3;
}

interface CollisionData {
    stick: STICK_ID,
    collideWith: STICK_ID | DRUM_ID,
    position?: Vector3,
}

type DrumCollisions = DrumCollision[];

// oh no, static export hack
class CollisionRegistry {
  protected drumsticks: DrumstickCollisions;
  protected drums: DrumCollisions;

  protected isLeftStickActive = false;
  protected isRightStickActive = false;
  constructor() {
    this.drumsticks = {};
    this.drums = [];
  }
  public registerDrumstick(obb: OBB, stick: STICK_ID): void {
    this.drumsticks[stick] = obb;
  }

  public registerDrum(boundingBox: OBB | Box3, name: DRUM_ID): void {
    const existingDrum = this.drums.find((drumCollision) => {
      return drumCollision.name === name;
    });

    if (!existingDrum) {
      this.drums.push({
        name,
        box: boundingBox,
      });
      return;
    }
    existingDrum.box = boundingBox;
  }

  public setStickActivity(isActive: boolean, stick: STICK_ID): void {
    if (stick === STICK_ID.LEFT) {
      this.isLeftStickActive = isActive;
    } else {
      this.isRightStickActive = isActive;
    }
  }

  public getDrumBox(name: DRUM_ID): OBB | Box3 | undefined {
    const existingDrum = this.drums.find((drumCollision) => {
      return drumCollision.name === name;
    });
    return existingDrum;
  }

  public getDrumBoxes(): DrumCollisions {
    return this.drums;
  }

  public getDrumstickBox(name: STICK_ID): OBB | undefined {
    if (name === STICK_ID.LEFT && !this.isLeftStickActive) {
      return undefined;
    }

    if (name === STICK_ID.RIGHT && !this.isRightStickActive) {
      return undefined;
    }
    return this.drumsticks[name];
  }
}

export const registry: CollisionRegistry = new CollisionRegistry();
const tempAABB: AABB = new AABB();

function getStickCollision(name: STICK_ID): CollisionData | undefined {
  const box = registry.getDrumstickBox(name);
  if (!box) {
    return undefined;
  }
  const drumboxes = registry.getDrumBoxes();
  for (let drumbox of drumboxes) {
    const drumboxObj = drumbox.box;
    if (drumboxObj instanceof Box3) {
      tempAABB.min.copy(drumboxObj.min);
      tempAABB.max.copy(drumboxObj.max);

      if (box.intersectsAABB(tempAABB)) {
        return {
            stick: name,
            collideWith: drumbox.name,
            position: tempAABB.center
        };
      }
      continue;
    }

    if (box.intersectsOBB(drumbox.box)) {
        return {
            stick: name,
            collideWith: drumbox.name,
            position: box.center
        };
    }
  }

  const otherStick = name === STICK_ID.LEFT ? STICK_ID.RIGHT : STICK_ID.LEFT;
  const otherStickBox = registry.getDrumstickBox(otherStick);
  if (otherStickBox && box.intersectsOBB(otherStickBox)) {
    return {
        stick: name,
        collideWith: otherStick,
        position: box.center
    };
  }

  return undefined;
}

function Collisions(props) {
  const [leftStick, setLeftStick] = useState(undefined);
  const [rightStick, setRightStick] = useState(undefined);

  const { camera } = useThree();

  let audioHandler: AudioHandler = useMemo(() => {
        const listener = new AudioListener();
        camera.add( listener as any )
        return new AudioHandler(listener)
  }, [camera])

  useFrame(() => {
    // process collisions! from the registry! ahaha this is untestable
    const newLeftState = getStickCollision(STICK_ID.LEFT);
    const leftStickId = newLeftState ? newLeftState.collideWith : undefined
    if (leftStickId !== leftStick) {
      // we have a new collision! (or stopped colliding)
      if (newLeftState) {
        // play a sound
        console.log("LEFT STICK COLLIDED: ", newLeftState);
        audioHandler.playSound(newLeftState.collideWith, newLeftState.position)
      }

      setLeftStick(leftStickId);
    }

    const newRightState = getStickCollision(STICK_ID.RIGHT);
    const rightStickId = newRightState ? newRightState.collideWith : undefined;
    if (rightStickId != rightStick) {
      // new collision!
      if (newRightState) {
        // play a sound
        console.log("RIGHT STICK COLLIDED: ", newRightState);
        audioHandler.playSound(newRightState.collideWith, newRightState.position)
      }

      setRightStick(rightStickId);
    }
  });

  return <></>;
}

export default Collisions;
