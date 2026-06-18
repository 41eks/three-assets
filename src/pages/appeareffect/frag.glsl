
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vMappedPos;

uniform float uNoiseScale;
uniform float uNoiseRoughness;
uniform float uNoiseDetail;
uniform float uNoiseEdge;// 噪波扰动边缘的幅度，默认 0.08

uniform float uTime;// ← 新增：接收时间

uniform vec3 uColor1;
uniform float uGradPos1;// 过渡区间起点，默认 0.0
uniform float uGradPos2;// 过渡区间终点，默认 0.05，越小边缘越锐利

uniform float uRoughness;
uniform float uIOR;
uniform float uAlpha;
uniform float uEmitStrength;
uniform vec3 uEmitColor;

uniform float uTransparencyMix;

// --- 3D 噪波 (fBM) ---
float hash(vec3 p){
  p=fract(p*vec3(443.8975,397.2973,491.1871));
  p+=dot(p.zxy,p.yxz+19.19);
  return fract(p.x*p.y*p.z);
}

float noise3(vec3 p){
  vec3 i=floor(p),f=fract(p);
  vec3 u=f*f*(3.-2.*f);
  return mix(
    mix(mix(hash(i),hash(i+vec3(1,0,0)),u.x),
    mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),u.x),u.y),
    mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),u.x),
    mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),u.x),u.y),
  u.z);
}

float fbm(vec3 p,int octaves,float roughness){
  float val=0.,amp=.5,freq=1.;
  for(int i=0;i<8;i++){
    if(i>=octaves)break;
    val+=amp*noise3(p*freq);
    amp*=roughness;
    freq*=2.;
  }
  return val;
}

// 标量版 colorRamp（用于 alpha）
float rampFloat(float t,float v1,float p1,float v2,float p2){
  float f=clamp((t-p1)/max(p2-p1,.001),0.,1.);
  return mix(v1,v2,f);
}

// 向量版 colorRamp（用于颜色）
vec3 rampVec(float t,vec3 c1,float p1,vec3 c2,float p2){
  float f=clamp((t-p1)/max(p2-p1,.001),0.,1.);
  return mix(c1,c2,f);
}

void main(){
  float t=vMappedPos.x;
  float edgeJitter=0.;
  
  float maxJitter=uNoiseEdge*1.5;
  
  if(t>uGradPos1-maxJitter&&t<uGradPos2+maxJitter+.1){
    vec3 coord=vMappedPos*uNoiseScale;
    
    // ← 核心修改：在 Y 和 Z 轴加上时间偏移，让噪波自己翻滚起来
    // 乘的数字代表流动速度，你可以自己调节
    vec3 animatedCoord=coord+vec3(0.,uTime*1.5,uTime*.8);
    
    float noise=fbm(animatedCoord,int(uNoiseDetail)+1,uNoiseRoughness);
    edgeJitter=(noise-.5)*uNoiseEdge;
  }
  
  t+=edgeJitter;
  
  // 3. Alpha：过渡区间内从 0 → uAlpha
  float alpha=rampFloat(t,0.,uGradPos1,uAlpha,uGradPos2);
  
  // 完全透明时直接丢弃，极大提升性能
  if(alpha<=.001)discard;
  
  // 4. 边缘发光色（过渡区间内混入 emitColor）
  float edgeMask=rampFloat(t,0.,uGradPos1,1.,uGradPos2)
  *rampFloat(t,1.,uGradPos2,0.,uGradPos2+.1);
  vec3 edgeEmit=uEmitColor*uEmitStrength*.04*edgeMask;
  
  // 5. 基础色（过渡区间完全显示后显示 uColor1）
  vec3 baseColor=rampVec(t,uEmitColor,uGradPos1,uColor1,uGradPos2);
  
  // 6. 原理化 BSDF 近似
  vec3 N=normalize(vNormal);
  vec3 V=normalize(cameraPosition-vPosition);
  float NdotV=max(dot(N,V),0.);
  
  float F0=pow((uIOR-1.)/(uIOR+1.),2.);
  float fresnel=F0+(1.-F0)*pow(1.-NdotV,5.);
  float roughSq=uRoughness*uRoughness;
  float specular=fresnel/max(roughSq,.04);
  
  vec3 diffuse=baseColor*(1.-fresnel)*NdotV;
  vec3 spec=vec3(specular)*.15;
  
  // [修复Bug]：删除了你原来的全局 emission 变量，防止整个物体都发光
  // 现在的发光只由 edgeEmit（边缘发光）提供
  vec3 finalColor=diffuse+spec+edgeEmit;
  
  gl_FragColor=vec4(finalColor,alpha);
}

// void main() {
  //   // 1. 噪波：只做边缘毛边扰动，不主导显隐
  //   vec3  coord = vMappedPos * uNoiseScale;
  //   float noise = fbm(coord, int(uNoiseDetail) + 1, uNoiseRoughness);
  //   // noise 范围约 [0,1]，中心化后乘以幅度系数
  //   float edgeJitter = (noise - 0.5) * uNoiseEdge;
  
  //   // 2. 主驱动：X 轴位置 + 轻微噪波扰动
  //   // t < uGradPos1 → 完全隐藏；t > uGradPos2 → 完全显示
  //   float t = vMappedPos.x + edgeJitter;
  
  //   // 3. Alpha：过渡区间内从 0 → uAlpha
  //   float alpha = rampFloat(t, 0.0, uGradPos1, uAlpha, uGradPos2);
  
  //   // 完全透明时直接丢弃，提升性能
  //   if (alpha <= 0.001) discard;
  
  //   // 4. 边缘发光色（过渡区间内混入 emitColor）
  //   float edgeMask = rampFloat(t, 0.0, uGradPos1, 1.0, uGradPos2)
  //                  * rampFloat(t, 1.0, uGradPos2, 0.0, uGradPos2 + 0.1);
  //   vec3 edgeEmit = uEmitColor * uEmitStrength * 0.04 * edgeMask;
  
  //   // 5. 基础色（过渡区间完全显示后显示 uColor1）
  //   vec3 baseColor = rampVec(t, uEmitColor, uGradPos1, uColor1, uGradPos2);
  
  //   // 6. 原理化 BSDF 近似
  //   vec3  N     = normalize(vNormal);
  //   vec3  V     = normalize(cameraPosition - vPosition);
  //   float NdotV = max(dot(N, V), 0.0);
  
  //   float F0      = pow((uIOR - 1.0) / (uIOR + 1.0), 2.0);
  //   float fresnel = F0 + (1.0 - F0) * pow(1.0 - NdotV, 5.0);
  //   float roughSq = uRoughness * uRoughness;
  //   float specular = fresnel / max(roughSq, 0.04);
  
  //   vec3 diffuse  = baseColor * (1.0 - fresnel) * NdotV;
  //   vec3 spec     = vec3(specular) * 0.15;
  //   vec3 emission = uEmitColor * uEmitStrength * 0.04;
  
  //   vec3 finalColor = diffuse + spec + emission + edgeEmit;
  
  //   gl_FragColor = vec4(finalColor, alpha);
// }