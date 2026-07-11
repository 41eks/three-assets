varying vec2 vUv;

uniform float time;
uniform float level;
uniform float waveScale;
uniform float waveSpeed;
uniform float waveTense;

void main(){
    
    // 圆内的UV
    vec2 uv=vUv;
    
    // 波浪高度
    float wave=
    sin(
        (uv.x+time*waveSpeed)
        *waveTense
    )*waveScale
    +level;
    
    // 液体颜色
    vec3 waterColor=vec3(
        .1,
        .5,
        1.
    );
    
    // 圆背景颜色
    vec3 bgColor=vec3(
        .95
    );
    
    vec3 color=
    uv.y<wave
    ?waterColor
    :bgColor;
    
    gl_FragColor=vec4(color,1.);
}