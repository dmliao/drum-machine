import { BoxBufferGeometry, BufferGeometry, Geometry, Mesh, MeshBasicMaterial, Object3D } from "three"
import * as YUKA from 'yuka'

export const findMesh = (node: Object3D): Mesh | null => {
    console.log('traversing', node.name)
    let mesh;
    
    node.traverse((obj) => {
      console.log('examining ', obj)
      if(obj instanceof Mesh) {
        console.log('found a mesh')
        mesh = obj;
        return;
      }
    })
    if (mesh) {
      return mesh;
    }
    return null;
  }

const findGeometry = (node: Object3D): Geometry | BufferGeometry | null => {
    const mesh = findMesh(node)
    if (!mesh) {
      return null;
    }
    return mesh.geometry
  }
  

export const getYUKAPoints = (node: Object3D): YUKA.Vector3[] => {
    const geometry = findGeometry(node)
    const points: YUKA.Vector3[] = []
    if (!geometry) {
      return points
    }
    const nonIndexedGeo = (geometry as BufferGeometry).toNonIndexed()
    nonIndexedGeo.applyMatrix4( node.matrixWorld ); // bake model transformation
    const position = nonIndexedGeo.getAttribute('position')
  
    
    for ( let i = 0; i < position.count; i ++ ) {
  
      const x = position.getX( i );
      const y = position.getY( i );
      const z = position.getZ( i );
  
      points.push( new YUKA.Vector3( x, y, z ) );
  
    }
  
    return points
  }
  

export function createOBBHelper( obb ) {

	const center = obb.center;
	const size = new YUKA.Vector3().copy( obb.halfSizes ).multiplyScalar( 2 );
	const rotation = new YUKA.Quaternion().fromMatrix3( obb.rotation );

	const geometry = new BoxBufferGeometry( size.x, size.y, size.z );
	const material = new MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
	const mesh = new Mesh( geometry, material );

	mesh.position.copy( center );
	mesh.quaternion.copy( rotation );

	return mesh;

}