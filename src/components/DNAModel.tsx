import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Connector = {
  strandIndex: number;
};

export function DNAModel() {
  const group = useRef<THREE.Group>(null);
  const base = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const leftRefs = useRef<Array<THREE.Mesh | null>>([]);
  const rightRefs = useRef<Array<THREE.Mesh | null>>([]);
  const connectorRefs = useRef<Array<THREE.Mesh | null>>([]);

  const { left, right, connectors, points, turns, radius, height } = useMemo(() => {
    const points = 150;
    const radius = 1.55;
    const height = 13.5;
    const turns = 6.5;

    const leftPoints: [number, number, number][] = [];
    const rightPoints: [number, number, number][] = [];
    const connectorData: Connector[] = [];

    for (let i = 0; i < points; i++) {
      const t = i / (points - 1);
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * height;

      const a = new THREE.Vector3(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      );
      const b = new THREE.Vector3(
        Math.cos(angle + Math.PI) * radius,
        y,
        Math.sin(angle + Math.PI) * radius
      );

      leftPoints.push([a.x, a.y, a.z]);
      rightPoints.push([b.x, b.y, b.z]);

      if (i % 3 === 0) {
        connectorData.push({
          strandIndex: i,
        });
      }
    }

    return { left: leftPoints, right: rightPoints, connectors: connectorData, points, turns, radius, height };
  }, [base]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const phase = t * 0.2;

    for (let i = 0; i < points; i++) {
      const progress = i / (points - 1);
      const angle = progress * Math.PI * 2 * turns + phase;
      const y = (progress - 0.5) * height;

      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;
      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;

      leftRefs.current[i]?.position.set(x1, y, z1);
      rightRefs.current[i]?.position.set(x2, y, z2);
    }

    for (let i = 0; i < connectors.length; i++) {
      const mesh = connectorRefs.current[i];
      if (!mesh) continue;

      const strandIndex = connectors[i].strandIndex;
      const progress = strandIndex / (points - 1);
      const angle = progress * Math.PI * 2 * turns + phase;
      const y = (progress - 0.5) * height;

      const a = new THREE.Vector3(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      );
      const b = new THREE.Vector3(
        Math.cos(angle + Math.PI) * radius,
        y,
        Math.sin(angle + Math.PI) * radius
      );

      const direction = new THREE.Vector3().subVectors(b, a);
      const length = direction.length();
      const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
      direction.normalize();

      mesh.position.copy(mid);
      mesh.quaternion.setFromUnitVectors(base, direction);
      mesh.scale.set(1, length / 2.7, 1);
    }
  });

  return (
    <group ref={group} rotation={[0.3, -0.35, 1.1]}>
      {left.map((position, index) => (
        <mesh
          key={`left-${index}`}
          position={position}
          ref={(el) => {
            leftRefs.current[index] = el;
          }}
        >
          <sphereGeometry args={[0.075, 18, 18]} />
          <meshStandardMaterial
            color="#6fffc6"
            emissive="#18d489"
            emissiveIntensity={1.1}
            roughness={0.25}
            metalness={0.15}
          />
        </mesh>
      ))}

      {right.map((position, index) => (
        <mesh
          key={`right-${index}`}
          position={position}
          ref={(el) => {
            rightRefs.current[index] = el;
          }}
        >
          <sphereGeometry args={[0.075, 18, 18]} />
          <meshStandardMaterial
            color="#a8ffdc"
            emissive="#2ae89c"
            emissiveIntensity={0.95}
            roughness={0.25}
            metalness={0.1}
          />
        </mesh>
      ))}

      {connectors.map((_, index) => (
        <mesh
          key={`connector-${index}`}
          ref={(el) => {
            connectorRefs.current[index] = el;
          }}
        >
          <cylinderGeometry args={[0.02, 0.02, 2.7, 10]} />
          <meshStandardMaterial
            color="#c9ffe8"
            emissive="#5ff4ba"
            emissiveIntensity={0.55}
            roughness={0.4}
            metalness={0.05}
          />
        </mesh>
      ))}
    </group>
  );
}
