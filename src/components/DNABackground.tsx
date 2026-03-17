import { Canvas } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { DNAModel } from "./DNAModel";

export function DNABackground() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0.25, 7.4], fov: 40 }} dpr={[1, 2]}>
        <color attach="background" args={["#000000"]} />
        <fog attach="fog" args={["#04140f", 5, 16]} />

        <ambientLight intensity={0.42} />
        <directionalLight position={[4, 6, 3]} intensity={1.2} color="#96ffd6" />
        <pointLight position={[-4, -3, 5]} intensity={0.95} color="#23ff9f" />

        <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.35}>
          <DNAModel />
        </Float>
      </Canvas>
    </div>
  );
}
