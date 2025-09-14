import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const NetworkBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 120;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(width, height);
    if (mountRef.current) mountRef.current.appendChild(renderer.domElement);

    const nodes: THREE.Mesh[] = [];
    const nodeGeometry = new THREE.SphereGeometry(2, 16, 16);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff99 });
    for (let i = 0; i < 36; i++) {
      const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
      mesh.position.x = Math.random() * 120 - 60;
      mesh.position.y = Math.random() * 60 - 30;
      mesh.position.z = Math.random() * 60 - 30;
      (mesh as any).userData = {
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        vz: (Math.random() - 0.5) * 0.2,
      };
      nodes.push(mesh);
      scene.add(mesh);
    }

    let lines: THREE.Line[] = [];
    function updateLines() {
      lines.forEach(line => scene.remove(line));
      lines = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dist = nodes[i].position.distanceTo(nodes[j].position);
            if (dist < 40) {
              const geometry = new THREE.BufferGeometry().setFromPoints([
                nodes[i].position,
                nodes[j].position
              ]);
              const material = new THREE.LineBasicMaterial({ color: 0x00ff99, opacity: 0.3, transparent: true });
              const line = new THREE.Line(geometry, material);
              lines.push(line);
              scene.add(line);
            }
        }
      }
    }

    function animate() {
      requestAnimationFrame(animate);
      nodes.forEach(node => {
        const data = (node as any).userData;
        node.position.x += data.vx;
        node.position.y += data.vy;
        node.position.z += data.vz;
        if (node.position.x < -60 || node.position.x > 60) data.vx *= -1;
        if (node.position.y < -30 || node.position.y > 30) data.vy *= -1;
        if (node.position.z < -30 || node.position.z > 30) data.vz *= -1;
      });
      updateLines();
      renderer.render(scene, camera);
    }
    animate();

    const mountNode = mountRef.current;
    return () => {
      if (mountNode && renderer.domElement) {
        mountNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={mountRef} className="network-bg full-screen-bg" />
  );
};

export default NetworkBackground;
