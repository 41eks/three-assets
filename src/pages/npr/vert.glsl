
        varying vec3 vNormal;

        void main() {
            // 将法线转换到世界空间
            vNormal = normalize(mat3(modelMatrix) * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }