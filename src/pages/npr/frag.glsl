
        uniform vec3 uLightDir;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform float uThreshold;
        uniform float uSoftness;

        varying vec3 vNormal;

        void main() {
            // 计算法线和光照方向的点积（就是 Blender 里着色器转RGB做的事）
            float diff = dot(vNormal, uLightDir);

            // smoothstep = Blender 里"大于+阈值"的平滑版本
            float mask = smoothstep(uThreshold - uSoftness, uThreshold + uSoftness, diff);

            // mix = Blender 里的混合节点
            vec3 color = mix(uColorA, uColorB, mask);

            gl_FragColor = vec4(color, 1.0);
        }