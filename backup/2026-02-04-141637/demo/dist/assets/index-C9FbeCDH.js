(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))r(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function t(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(a){if(a.ep)return;a.ep=!0;const o=t(a);fetch(a.href,o)}})();const st=3*Math.sqrt(3)/2;function lt(e){return Math.sqrt(e/st)}function ct(e,n,t){const r=t*(Math.sqrt(3)*e+Math.sqrt(3)/2*n),a=t*(1.5*n);return{x:r,y:a}}function dt(e,n=0){const t=[];for(let r=-e;r<=e;r+=1){const a=Math.max(-e,-r-e),o=Math.min(e,-r+e);for(let s=a;s<=o;s+=1)t.push({q:r,r:s,level:n,flags:0})}return t}function ut(e={}){const n=e.topAreaKm2??1e3,t=e.minAreaM2??10,r=Math.max(2,e.levels??6),a=n*1e6,o=Math.pow(a/t,1/(r-1)),s=[];for(let c=0;c<r;c+=1){const m=a/Math.pow(o,c),g=lt(m);s.push({level:c,areaM2:m,sideMeters:g,acrossFlatsMeters:g*Math.sqrt(3)})}return s}const ft={MixedForest:13},pt={Temperate:2},S={Grass:0,Dirt:1,Sand:2,Rock:3,Gravel:4,Snowpack:5,Ice:6,Mud:7,Water:11,Basalt:12},te={Tree:0,Bush:1,GrassTuft:2,Rock:4,Boulder:5,WaterRipple:6};function mt(e){let n=e>>>0;return n^=n>>>17,n=Math.imul(n,3982152891),n^=n>>>11,n=Math.imul(n,2890668881),n^=n>>>15,n=Math.imul(n,830770091),n^=n>>>14,n>>>0}function gt(e){return(mt(e)&16777215)/16777216}function _e(e,n,t){const r=e.q|0,a=e.r|0,o=e.level|0,s=(Math.imul(r,1664525)^Math.imul(a,1013904223)^Math.imul(o,747796405)^n^t)>>>0;return gt(s)}function ze(e){return Math.min(1,Math.max(0,e))}function ht(e,n,t){return e<.12?S.Water:e>.72?S.Rock:n>.72?S.Mud:n>.5?t>.2?S.Grass:S.Dirt:t>.6?S.Gravel:S.Dirt}function xt(e,n,t,r){if(e===S.Water)return te.WaterRipple;if(e===S.Rock||e===S.Gravel)return r>.7?te.Boulder:te.Rock;if(t>.45&&r>.25)return te.Tree;if(t>.4&&r>.15)return te.Bush;if(e===S.Grass&&r>.1)return te.GrassTuft;if(n>.6&&r>.8)return te.Rock}function vt(e){const n=e.seed>>>0,t=ut({topAreaKm2:e.topAreaKm2??1e3,minAreaM2:e.minAreaM2??10,levels:e.levels??6}),r=t[t.length-1],a=e.radius??6,o=dt(a,r.level),s=o.map(c=>{const m=_e(c,n,4660),g=_e(c,n,21317),F=_e(c,n,40092),L=_e(c,n,30635),T=ze(Math.pow(m,1.1)),z=ze(.45+(g-.5)*.25-T*.12),C=ze(.55+(F-.5)*.35-T*.05),_=ht(T,C,L),B=xt(_,T,C,L);return{height:T,heat:z,moisture:C,biome:ft.MixedForest,macroBiome:pt.Temperate,surface:_,feature:B}});return{levelSpec:r,cells:o,terrain:s}}function Oe(e=1337){return{seed:e,scale:.14,warpScale:.5,warpStrength:.75,iterations:64,power:2.2,detailScale:3.2,detailIterations:28,detailPower:2,ridgePower:1.25,heatBias:0,moistureBias:0,macroScale:.035,macroWarpStrength:.18,styleMixStrength:1,terraceSteps:6,terraceStrength:.35,craterStrength:.25,craterScale:.18,heightMin:-.35,heightMax:1.6}}function ee(e,n,t){return Math.min(t,Math.max(n,e))}function wt(e,n,t){const r=ee((t-e)/(n-e),0,1);return r*r*(3-2*r)}function pe(e){const n=Math.sin(e)*43758.5453123;return n-Math.floor(n)}function le(e,n,t,r){let a=0,o=0,s=0;for(;s<t;s+=1){const F=a*a+o*o;if(F>4)break;const L=Math.sqrt(F),T=Math.atan2(o,a),z=Math.pow(L,r);a=z*Math.cos(T*r)+e,o=z*Math.sin(T*r)+n}if(s>=t)return 1;const c=Math.max(Math.sqrt(a*a+o*o),1e-6),m=Math.log2(Math.log(c)),g=(s+1-m)/t;return ee(g,0,1)}function yt(e,n){const r=1/Math.max(1,Math.round(n)),a=ee(e,0,1),o=Math.floor(a/r),s=(a-o*r)/r,c=s*s*(3-2*s);return(o+c)*r}function _t(e,n,t,r){const a=e*t,o=n*t,s=Math.floor(a),c=Math.floor(o),m=a-s,g=o-c,F=s*374761393+c*668265263+r*1442695041,L=pe(F*.17),T=pe(F*.31+17.13),z=pe(F*.47+9.2),C=L,_=T,B=.22+.25*z,v=m-C,h=g-_,U=Math.hypot(v,h);return wt(B,B*.35,U)}function bt(e,n,t){const r=t.seed,a=pe(r*.137+.11)*4-2,o=pe(r*.173+.27)*4-2,s=pe(r*.91+1.1)*6-3,c=pe(r*1.07+2.2)*6-3,m=le((e+s)*t.warpScale,(n+c)*t.warpScale,Math.max(16,Math.floor(t.iterations*.6)),t.power),g=le((e-c)*t.warpScale,(n+s)*t.warpScale,Math.max(16,Math.floor(t.iterations*.6)),t.power),F=e+(m-.5)*t.warpStrength,L=n+(g-.5)*t.warpStrength,T=le(F*t.scale+a,L*t.scale+o,t.iterations,t.power),z=le(F*t.scale*2.15+a*.6,L*t.scale*2.15+o*.6,Math.max(18,Math.floor(t.iterations*.7)),t.power+.2),C=le(F*t.scale*t.detailScale+a*1.4,L*t.scale*t.detailScale+o*1.4,t.detailIterations,t.detailPower),_=1-Math.abs(2*z-1),B=Math.pow(T,.9)*Math.pow(z,1.05)*Math.pow(C,1.1),v=Math.max(12,Math.floor(t.iterations*.35)),h=le(e*t.macroScale+a*.2,n*t.macroScale+o*.2,v,t.power),U=le((e+o)*t.macroScale,(n-a)*t.macroScale,v,t.power+.35),w=(h-.5)*t.macroWarpStrength,I=(U-.5)*t.macroWarpStrength,E=le((e+w)*t.macroScale,(n+I)*t.macroScale,v,t.power),d=ee((E-.5)*t.styleMixStrength+.5,0,1),M=yt(B,t.terraceSteps),b=_t(e,n,t.craterScale,r),u=ee(Math.pow(B,.8)+Math.pow(_,1.4)*.2,0,1),l=ee(B*(1-t.terraceStrength)+M*t.terraceStrength-b*t.craterStrength+Math.pow(_,1.6)*.12,0,1),f=u*(1-d)+l*d,y=Math.pow(_,1.35)*.22,p=(f-.5)*2,A=Math.sign(p)*Math.pow(Math.abs(p),.75),G=(d-.5)*.25,x=ee(.5+A*.8+G+y,t.heightMin,t.heightMax),R=ee(x,0,1),k=ee(Math.pow(_,t.ridgePower)*.7+C*.3,0,1),H=ee(.55*z+.35*(1-R)+t.heatBias,0,1),O=ee(.55*C+.35*(1-R)-(H-.5)*.1+t.moistureBias,0,1),Z=ee(k*.6+R*.4,0,1),ie=ee((.32-R)*3+(O-.5)*.2,0,1);return{height:x,heat:H,moisture:O,roughness:k,rockiness:Z,water:ie,ridge:_,base:T,detail:C}}const St={targetFps:120,tolerance:6,sampleSize:90,minSampleFraction:.6,cooldownMs:1200,qualitySlew:.05,initialBudget:.5,auto:!0};function Mt(e,n,t){return Math.min(t,Math.max(n,e))}function Pe(e){return Mt(e,0,1)}function zt(e){if(!e.length)return 0;const n=e.slice().sort((r,a)=>r-a),t=Math.floor(n.length/2);return n.length%2===0?(n[t-1]+n[t])*.5:n[t]}function Pt(e={}){const n={...St,...e};let t=Pe(n.initialBudget),r=0;const a=[],o=z=>{!Number.isFinite(z)||z<=0||(a.push(z),a.length>n.sampleSize&&a.shift())};return{sampleFrame:z=>{!Number.isFinite(z)||z<=0||o(1/z)},sampleFps:o,update:z=>{if(!n.auto)return{budget:t,medianFps:null,miss:null,adjusted:!1,stable:!0};if(z-r<n.cooldownMs)return{budget:t,medianFps:null,miss:null,adjusted:!1,stable:!1};if(a.length<Math.floor(n.sampleSize*n.minSampleFraction))return{budget:t,medianFps:null,miss:null,adjusted:!1,stable:!1};const C=zt(a),_=n.targetFps-C,B=n.tolerance;if(Math.abs(_)<=B)return r=z,{budget:t,medianFps:C,miss:_,adjusted:!1,stable:!0};const v=Math.min(1,(Math.abs(_)-B)/B),h=_>0?-1:1,U=Pe(t+h*v*n.qualitySlew),w=U!==t;return t=U,r=z,{budget:t,medianFps:C,miss:_,adjusted:w,stable:!1}},resetSamples:()=>{a.length=0},setBudget:z=>{t=Pe(z)},getBudget:()=>t,setAuto:z=>{n.auto=z},getConfig:()=>({...n})}}function Bt(e,n,t){return Math.min(t,Math.max(n,e))}function At(e){const n=Math.hypot(e[0],e[1],e[2]);return n===0?[0,1,0]:[e[0]/n,e[1]/n,e[2]/n]}function Te(e,n,t){const r=[n[0]-e[0],n[1]-e[1],n[2]-e[2]],a=[t[0]-e[0],t[1]-e[1],t[2]-e[2]];return At([r[1]*a[2]-r[2]*a[1],r[2]*a[0]-r[0]*a[2],r[0]*a[1]-r[1]*a[0]])}function Ee(e,n){return[e[0]*n,e[1]*n,e[2]*n]}function We(e=1){const n=typeof e=="number"?{size:e}:e,t=n.size??1,r=n.includeGeomorph??!1,a=n.defaultMaterial??0,o=n.foliageMaterial??a,s=[],c=[],m=[];let g=0;const F=r?13:11,L=(v,h,U,w=0,I=a,E)=>{if(s.push(v[0],v[1],v[2],h[0],h[1],h[2],U[0],U[1],U[2],w,I),r){const d=E?.targetY??v[1],M=E?.weight??0;s.push(d,M)}},T=(v,h,U,w,I,E=0,d=E,M=E,b=a,u,l,f)=>{L(v,w,I,E,b,u),L(h,w,I,d,b,l),L(U,w,I,M,b,f)},z=(v,h,U,w,I,E,d=0,M=d,b=d,u=d,l=a,f,y,p,A)=>{T(v,h,U,I,E,d,M,b,l,f,y,p),T(U,w,v,I,E,b,u,d,l,p,A,f)},C=(v,h,U,w,I,E=0,d=0,M=a)=>{const b=[],u=[],l=v[1]+U,f=l+w,y=Math.max(w,.001),p=x=>E+d*Bt((x-l)/y,0,1);for(let x=0;x<6;x+=1){const R=Math.PI/180*(60*x-30),k=v[0]+h*Math.cos(R),H=v[2]+h*Math.sin(R);b.push([k,f,H]),u.push([k,l,H])}const A=[v[0],f,v[2]],G=p(f);for(let x=0;x<6;x+=1){const R=A,k=b[x],H=b[(x+1)%6],O=Te(R,k,H);T(R,k,H,O,I,G,G,G,M)}for(let x=0;x<6;x+=1){const R=b[x],k=b[(x+1)%6],H=u[x],O=u[(x+1)%6],Z=Te(R,H,O),ie=p(R[1]),V=p(k[1]),re=p(H[1]),ce=p(O[1]);z(R,H,O,k,Z,Ee(I,.85),ie,re,ce,V,M)}};return{vertices:s,boxMin:c,boxMax:m,vertexStride:F,includeGeomorph:r,addTriangle:T,addQuad:z,addTreeMesh:(v,h,U,w=a)=>{const I=t*(.12+U*.05),E=.5+U*.6,d=t*(.36+U*.18),M=.6+U*.4,b=[.28,.18,.1],u=[.18,.45,.2];C(v,I,h,E,b,.02,.28,w),C([v[0],h+E*.7,v[2]],d,0,M*.55,u,.12,.9,o),C([v[0],h+E+M*.1,v[2]],d*.7,0,M*.35,Ee(u,.95),.2,1.1,o),g+=1},addBounds:(v,h=0,U)=>{const w=v.map(f=>f[0]),I=v.map(f=>f[2]),E=v.map(f=>f[1]),d=Math.min(...w),M=Math.max(...w),b=Math.min(...I),u=Math.max(...I),l=typeof U=="number"?U:Math.max(...E);c.push(d,h,b,0),m.push(M,l,u,0)},get treeMeshCount(){return g}}}const se=globalThis.GPUBufferUsage,Ue=globalThis.GPUMapMode,qe=2,ge=8,we={scale:.16,strength:.85,rockBoost:.7};function De(e){return{version:qe,seed:e.seed,extent:e.extent,gridSize:e.gridSize,heightScale:e.heightScale,sampleStride:ge,samples:Array.from(e.samples)}}function Ve(e){if(!e||typeof e!="object")return null;const n=e;if(n.version!==qe||!Array.isArray(n.samples)||n.sampleStride!==ge)return null;const t=Number(n.gridSize),r=Number(n.heightScale);if(!Number.isFinite(t)||t<=0||!Number.isFinite(r))return null;const a=(t+1)*(t+1)*ge;return n.samples.length!==a?null:{seed:Number(n.seed),extent:Number(n.extent),gridSize:t,heightScale:r,samples:new Float32Array(n.samples)}}function be(e,n){if(!e||e.seed!==n.seed||e.gridSize!==n.gridSize||Math.abs(e.extent-n.extent)>.001||!Number.isFinite(e.heightScale))return!1;const t=(e.gridSize+1)*(e.gridSize+1)*ge;return e.samples.length===t}function kt(e){if(!se||!Ue)throw new Error("WebGPU globals not available. Ensure this runs in a WebGPU context.");const{device:n,wgsl:t,gridSize:r}=e,a=r+1,o=a*a,s=o*ge*4,c=n.createBuffer({size:112,usage:se.UNIFORM|se.COPY_DST}),m=n.createBuffer({size:s,usage:se.STORAGE|se.COPY_SRC}),g=n.createBuffer({size:s,usage:se.STORAGE|se.COPY_SRC}),F=n.createBuffer({size:s,usage:se.COPY_DST|se.MAP_READ}),L=n.createShaderModule({code:t}),T=n.createComputePipeline({layout:"auto",compute:{module:L,entryPoint:"main"}}),z=n.createComputePipeline({layout:"auto",compute:{module:L,entryPoint:"accent_heights"}}),C=n.createBindGroup({layout:T.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:c}},{binding:1,resource:{buffer:m}}]}),_=n.createBindGroup({layout:z.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:c}},{binding:1,resource:{buffer:g}},{binding:2,resource:{buffer:m}}]}),B=Math.ceil(a/8);return{gridSize:r,gridPoints:a,sampleCount:o,run:async h=>{const w={...Oe(h.seed),...h.fieldParams,seed:h.seed},I={...we,...h.mandel},E=h.extent*2/r,d=new Float32Array(28);d.set([a,h.extent,E,h.seed],0),d.set([w.scale,w.warpScale,w.warpStrength,w.power],4),d.set([w.detailScale,w.detailPower,w.ridgePower,w.heatBias],8),d.set([w.moistureBias,I.scale,I.strength,I.rockBoost],12),d.set([w.iterations,w.detailIterations,w.macroScale,w.macroWarpStrength],16),d.set([w.styleMixStrength,w.terraceSteps,w.terraceStrength,w.craterStrength],20),d.set([w.craterScale,w.heightMin,w.heightMax,0],24),n.queue.writeBuffer(c,0,d);const M=n.createCommandEncoder(),b=M.beginComputePass();b.setPipeline(T),b.setBindGroup(0,C),b.dispatchWorkgroups(B,B),b.setPipeline(z),b.setBindGroup(0,_),b.dispatchWorkgroups(B,B),b.end(),M.copyBufferToBuffer(g,0,F,0,s),n.queue.submit([M.finish()]),await F.mapAsync(Ue.READ);const u=F.getMappedRange(),l=new Float32Array(u.slice(0));return F.unmap(),{seed:h.seed,extent:h.extent,gridSize:r,heightScale:h.heightScale,samples:l}}}}const Gt=`const PI: f32 = 3.1415926535;

fn hash12(p: vec2<f32>) -> f32 {
  let h = dot(p, vec2<f32>(127.1, 311.7));
  return fract(sin(h) * 43758.5453123);
}

fn noise2(p: vec2<f32>) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let a = hash12(i);
  let b = hash12(i + vec2<f32>(1.0, 0.0));
  let c = hash12(i + vec2<f32>(0.0, 1.0));
  let d = hash12(i + vec2<f32>(1.0, 1.0));
  let u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

fn fbm2(p: vec2<f32>) -> f32 {
  var value = 0.0;
  var amp = 0.5;
  var freq = 1.0;
  var coord = p;
  value = value + amp * noise2(coord * freq);
  amp = amp * 0.5;
  freq = freq * 2.0;
  coord = coord + vec2<f32>(1.7, 9.2);
  value = value + amp * noise2(coord * freq);
  amp = amp * 0.5;
  freq = freq * 2.0;
  coord = coord + vec2<f32>(8.3, 2.8);
  value = value + amp * noise2(coord * freq);
  return value;
}

fn clamp01(v: f32) -> f32 {
  return clamp(v, 0.0, 1.0);
}
`,Ct=`const MATERIAL_DEFAULT: u32 = 0u;
const MATERIAL_GRASS: u32 = 1u;
const MATERIAL_WATER: u32 = 2u;
const MATERIAL_ROCK: u32 = 3u;
const MATERIAL_SAND: u32 = 4u;
const MATERIAL_MUD: u32 = 5u;
const MATERIAL_SNOW: u32 = 6u;
const MATERIAL_FOLIAGE: u32 = 7u;

struct MaterialResponse {
  albedo: vec3<f32>,
  normal: vec3<f32>,
  specular: f32,
  emission: vec3<f32>,
};

fn make_material(albedo: vec3<f32>, normal: vec3<f32>) -> MaterialResponse {
  return MaterialResponse(albedo, normal, 0.08, vec3<f32>(0.0));
}

fn apply_grass(base: vec3<f32>, normal: vec3<f32>, world_pos: vec3<f32>, wind: vec4<f32>) -> MaterialResponse {
  let wind_dir = normalize(vec3<f32>(wind.x, 0.0, wind.z));
  let time = wind.w;
  let wave = sin(dot(world_pos.xz, wind_dir.xz) * 2.2 + time * 1.3);
  let detail = fbm2(world_pos.xz * 1.6 + vec2<f32>(time * 0.08, time * 0.04));
  let bend = (wave * 0.14 + detail * 0.12);
  let perturbed = normalize(vec3<f32>(
    normal.x + bend * wind_dir.x,
    normal.y + bend * 0.4,
    normal.z + bend * wind_dir.z
  ));
  let tint = base * (0.92 + wave * 0.06);
  var out = make_material(tint, perturbed);
  out.specular = 0.12;
  return out;
}

fn apply_water(
  base: vec3<f32>,
  normal: vec3<f32>,
  world_pos: vec3<f32>,
  wind: vec4<f32>,
  view_dir: vec3<f32>,
  view_dist: f32
) -> MaterialResponse {
  let time = wind.w;
  let wind2 = normalize(vec2<f32>(wind.x, wind.z) + vec2<f32>(1e-3, 0.0));
  let dir0 = wind2;
  let dir1 = normalize(vec2<f32>(-wind2.y, wind2.x));
  let dir2 = normalize(mix(wind2, vec2<f32>(0.7, 0.7), 0.35));

  let detail = clamp01(1.0 - (view_dist - 6.0) / 25.0);
  let detail2 = detail * detail;

  let k0 = 1.6;
  let k1 = 3.2;
  let k2 = 6.4;
  let a0 = 0.12;
  let a1 = 0.05 * detail;
  let a2 = 0.02 * detail2;

  let p0 = dot(world_pos.xz, dir0) * k0 + time * 1.1;
  let p1 = dot(world_pos.xz, dir1) * k1 + time * 1.7;
  let p2 = dot(world_pos.xz, dir2) * k2 + time * 2.4;

  let h0 = a0 * sin(p0);
  let h1 = a1 * sin(p1);
  let h2 = a2 * sin(p2);

  var dHd = vec2<f32>(
    a0 * k0 * cos(p0) * dir0.x + a1 * k1 * cos(p1) * dir1.x + a2 * k2 * cos(p2) * dir2.x,
    a0 * k0 * cos(p0) * dir0.y + a1 * k1 * cos(p1) * dir1.y + a2 * k2 * cos(p2) * dir2.y
  );

  let ripple_phase = dot(world_pos.xz, vec2<f32>(12.7, 9.3)) + time * 3.5;
  let ripple_amp = 0.006 * detail2;
  let ripple = sin(ripple_phase) * ripple_amp;
  dHd = dHd + vec2<f32>(12.7, 9.3) * cos(ripple_phase) * ripple_amp;

  let wave_height = h0 + h1 + h2 + ripple;
  let wave_normal = normalize(vec3<f32>(-dHd.x, 1.0, -dHd.y));
  let water_normal = normalize(mix(normal, wave_normal, 0.85));

  let ndv = clamp(dot(water_normal, view_dir), 0.0, 1.0);
  let fresnel = 0.02 + (1.0 - 0.02) * pow(1.0 - ndv, 5.0);

  let deep = vec3<f32>(0.02, 0.08, 0.14);
  let tint = mix(base, deep, 0.55 + wave_height * 0.2);

  let sky_low = vec3<f32>(0.05, 0.1, 0.16);
  let sky_high = vec3<f32>(0.2, 0.35, 0.55);
  let sky = mix(sky_low, sky_high, clamp01(view_dir.y * 0.5 + 0.5));

  let steepness = length(dHd);
  let foam_noise = fbm2(world_pos.xz * 0.8 + vec2<f32>(time * 0.05, time * 0.04));
  let foam = smoothstep(0.35, 0.75, steepness) * (0.6 + 0.4 * foam_noise) * detail;

  var out = make_material(tint * 0.6, water_normal);
  out.albedo = mix(out.albedo, vec3<f32>(0.92, 0.94, 0.98), foam);
  out.specular = mix(0.35, 0.95, fresnel);
  out.emission = sky * fresnel * (0.35 + 0.65 * detail);
  return out;
}

fn apply_rock(base: vec3<f32>, normal: vec3<f32>, world_pos: vec3<f32>) -> MaterialResponse {
  let grain = fbm2(world_pos.xz * 2.4);
  let tint = base * (0.85 + grain * 0.25);
  var out = make_material(tint, normal);
  out.specular = 0.18;
  return out;
}

fn apply_sand(base: vec3<f32>, normal: vec3<f32>, world_pos: vec3<f32>) -> MaterialResponse {
  let grain = noise2(world_pos.xz * 3.5);
  let tint = base * (0.95 + grain * 0.12);
  var out = make_material(tint, normal);
  out.specular = 0.12;
  return out;
}

fn apply_mud(base: vec3<f32>, normal: vec3<f32>, world_pos: vec3<f32>) -> MaterialResponse {
  let ooze = fbm2(world_pos.xz * 2.0);
  let tint = base * (0.78 + ooze * 0.1);
  var out = make_material(tint, normal);
  out.specular = 0.22;
  return out;
}

fn apply_surface_material(
  material_id: u32,
  base_color: vec3<f32>,
  normal: vec3<f32>,
  world_pos: vec3<f32>,
  wind: vec4<f32>,
  weather: vec4<f32>,
  view_dir: vec3<f32>,
  view_dist: f32
) -> MaterialResponse {
  let season = clamp01(weather.x);
  let wetness = clamp01(weather.y + weather.w * 0.5);
  var snow = clamp01(weather.z + season * 0.2);

  var result = make_material(base_color, normal);
  if (material_id == MATERIAL_GRASS || material_id == MATERIAL_FOLIAGE) {
    result = apply_grass(base_color, normal, world_pos, wind);
  } else if (material_id == MATERIAL_WATER) {
    result = apply_water(base_color, normal, world_pos, wind, view_dir, view_dist);
  } else if (material_id == MATERIAL_ROCK) {
    result = apply_rock(base_color, normal, world_pos);
  } else if (material_id == MATERIAL_SAND) {
    result = apply_sand(base_color, normal, world_pos);
  } else if (material_id == MATERIAL_MUD) {
    result = apply_mud(base_color, normal, world_pos);
  }

  if (material_id == MATERIAL_SNOW) {
    snow = max(snow, 0.7);
  }

  if (material_id != MATERIAL_WATER) {
    let snow_mask = snow * smoothstep(0.35, 0.92, result.normal.y);
    result.albedo = mix(result.albedo, vec3<f32>(0.88, 0.9, 0.95), snow_mask);
    result.specular = max(result.specular, snow_mask * 0.22);
  }

  if (material_id != MATERIAL_WATER) {
    let flatness = smoothstep(0.55, 0.96, result.normal.y);
    let puddle_noise = fbm2(world_pos.xz * 0.7 + vec2<f32>(wind.w * 0.03, wind.w * 0.02));
    let puddle = wetness * flatness * smoothstep(0.45, 0.8, puddle_noise);
    result.albedo = mix(result.albedo, result.albedo * 0.78, wetness * 0.35);
    result.specular = max(result.specular, puddle * 0.65);
  }

  return result;
}
`,Rt=`struct Scene {
  viewProj: mat4x4<f32>,
  lightPos: vec4<f32>,
  cameraPos: vec4<f32>,
  boxCount: vec4<f32>,
  wind: vec4<f32>,
  weather: vec4<f32>,
  waterSim: vec4<f32>,
  debug: vec4<f32>,
};

@group(0) @binding(0) var<uniform> scene: Scene;
@group(0) @binding(1) var<storage, read> boxMin: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> boxMax: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read> waterHeight: array<f32>;

struct VertexIn {
  @location(0) position: vec3<f32>,
  @location(1) normal: vec3<f32>,
  @location(2) color: vec3<f32>,
  @location(3) sway: f32,
  @location(4) material: f32,
};

struct VertexOut {
  @builtin(position) position: vec4<f32>,
  @location(0) normal: vec3<f32>,
  @location(1) color: vec3<f32>,
  @location(2) worldPos: vec3<f32>,
  @location(3) material: f32,
};

@vertex
fn vs_main(input: VertexIn) -> VertexOut {
  var out: VertexOut;
  let windStrength = scene.boxCount.y;
  let windGust = scene.boxCount.z;
  let windDir = normalize(scene.wind.xyz);
  let time = scene.wind.w;
  var worldPos = input.position;
  if (input.sway > 0.0001) {
    let wave = sin(time * (0.8 + windGust) + input.position.x * 0.6 + input.position.z * 0.4);
    let gust = sin(time * 1.7 + input.position.x * 0.9 + input.position.z * 1.1);
    let sway = (wave + gust * 0.35) * windStrength * input.sway;
    worldPos = worldPos + windDir * sway;
  }
  out.position = scene.viewProj * vec4<f32>(worldPos, 1.0);
  out.normal = input.normal;
  out.color = input.color;
  out.worldPos = worldPos;
  out.material = input.material;
  return out;
}

fn ray_box_intersect(origin: vec3<f32>, dir: vec3<f32>, bmin: vec3<f32>, bmax: vec3<f32>) -> f32 {
  let inv = 1.0 / dir;
  let t0 = (bmin - origin) * inv;
  let t1 = (bmax - origin) * inv;
  let tmin = max(max(min(t0.x, t1.x), min(t0.y, t1.y)), min(t0.z, t1.z));
  let tmax = min(min(max(t0.x, t1.x), max(t0.y, t1.y)), max(t0.z, t1.z));
  if (tmax >= max(tmin, 0.0)) {
    return tmin;
  }
  return -1.0;
}

fn is_occluded(pos: vec3<f32>, light_pos: vec3<f32>) -> bool {
  let to_light = light_pos - pos;
  let dist = length(to_light);
  if (dist < 1e-3) {
    return false;
  }
  let dir = to_light / dist;
  let origin = pos + dir * 0.02;
  let count = u32(scene.boxCount.x);
  let maxCount = arrayLength(&boxMin);
  for (var i: u32 = 0u; i < maxCount; i = i + 1u) {
    if (i >= count) {
      break;
    }
    let t = ray_box_intersect(origin, dir, boxMin[i].xyz, boxMax[i].xyz);
    if (t > 0.0 && t < dist) {
      return true;
    }
  }
  return false;
}

fn sample_water_height(world_pos: vec3<f32>) -> f32 {
  let gridSize = i32(scene.waterSim.w);
  if (gridSize < 2) {
    return 0.0;
  }
  let origin = scene.waterSim.xy;
  let invSize = scene.waterSim.z;
  let uv = clamp((world_pos.xz - origin) * invSize, vec2<f32>(0.0), vec2<f32>(1.0));
  let gridMax = f32(gridSize - 1);
  let gx = uv.x * gridMax;
  let gy = uv.y * gridMax;
  let ix = i32(floor(gx));
  let iy = i32(floor(gy));
  let fx = fract(gx);
  let fy = fract(gy);
  let ix0 = clamp(ix, 0, gridSize - 1);
  let iy0 = clamp(iy, 0, gridSize - 1);
  let ix1 = clamp(ix + 1, 0, gridSize - 1);
  let iy1 = clamp(iy + 1, 0, gridSize - 1);
  let idx00 = iy0 * gridSize + ix0;
  let idx10 = iy0 * gridSize + ix1;
  let idx01 = iy1 * gridSize + ix0;
  let idx11 = iy1 * gridSize + ix1;
  let h00 = waterHeight[idx00];
  let h10 = waterHeight[idx10];
  let h01 = waterHeight[idx01];
  let h11 = waterHeight[idx11];
  let hx0 = mix(h00, h10, fx);
  let hx1 = mix(h01, h11, fx);
  return mix(hx0, hx1, fy);
}

fn sample_water_normal(world_pos: vec3<f32>) -> vec3<f32> {
  let gridSize = i32(scene.waterSim.w);
  if (gridSize < 2) {
    return vec3<f32>(0.0, 1.0, 0.0);
  }
  let invSize = scene.waterSim.z;
  let cellWorld = 1.0 / max(invSize * (f32(gridSize) - 1.0), 1e-3);
  let hL = sample_water_height(world_pos + vec3<f32>(-cellWorld, 0.0, 0.0));
  let hR = sample_water_height(world_pos + vec3<f32>(cellWorld, 0.0, 0.0));
  let hB = sample_water_height(world_pos + vec3<f32>(0.0, 0.0, -cellWorld));
  let hT = sample_water_height(world_pos + vec3<f32>(0.0, 0.0, cellWorld));
  let scale = 1.2 / max(cellWorld, 1e-3);
  let dx = (hR - hL) * scale;
  let dz = (hT - hB) * scale;
  return normalize(vec3<f32>(-dx, 1.0, -dz));
}

fn heatmap_color(t: f32) -> vec3<f32> {
  let low = vec3<f32>(0.08, 0.12, 0.35);
  let mid = vec3<f32>(0.18, 0.6, 0.28);
  let high = vec3<f32>(0.95, 0.85, 0.55);
  if (t < 0.5) {
    return mix(low, mid, t * 2.0);
  }
  return mix(mid, high, (t - 0.5) * 2.0);
}

@fragment
fn fs_main(input: VertexOut) -> @location(0) vec4<f32> {
  if (scene.debug.x > 0.5) {
    let minH = scene.debug.y;
    let maxH = scene.debug.z;
    let denom = max(maxH - minH, 1e-3);
    let t = clamp((input.worldPos.y - minH) / denom, 0.0, 1.0);
    return vec4<f32>(heatmap_color(t), 1.0);
  }
  var n = normalize(input.normal);
  let to_light = scene.lightPos.xyz - input.worldPos;
  let dist = length(to_light);
  let dir = to_light / max(dist, 1e-3);
  let view_vec = scene.cameraPos.xyz - input.worldPos;
  let view_dist = length(view_vec);
  let view_dir = view_vec / max(view_dist, 1e-3);
  let material_id = u32(round(input.material));
  if (material_id == MATERIAL_WATER) {
    let sim_normal = sample_water_normal(input.worldPos);
    n = normalize(mix(n, sim_normal, 0.85));
  }
  let material = apply_surface_material(
    material_id,
    input.color,
    n,
    input.worldPos,
    scene.wind,
    scene.weather,
    view_dir,
    view_dist
  );
  let diff = max(dot(material.normal, dir), 0.0);
  let dist2 = max(dist * dist, 0.4);
  let attenuation = scene.lightPos.w / dist2;
  var shadow = 1.0;
  if (is_occluded(input.worldPos + n * 0.02, scene.lightPos.xyz)) {
    shadow = 0.25;
  }
  let ambient = 0.24;
  var color = material.albedo * (ambient + diff * attenuation * shadow);
  let half_vec = normalize(view_dir + dir);
  let spec = pow(max(dot(material.normal, half_vec), 0.0), mix(8.0, 64.0, material.specular));
  color = color + spec * material.specular * attenuation * 0.6;
  color = color + material.emission;
  return vec4<f32>(color, 1.0);
}
`,Ft=`struct TreeUniforms {
  viewProj: mat4x4<f32>,
  cameraPos: vec4<f32>,
  cameraRight: vec4<f32>,
  cameraUp: vec4<f32>,
  season: vec4<f32>,
  wind: vec4<f32>,
};

struct TreeInstance {
  posHeight: vec4<f32>,
  canopySeed: vec4<f32>,
};

struct VSOut {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
  @location(1) baseColor: vec3<f32>,
  @location(2) trunkColor: vec3<f32>,
  @location(3) height: f32,
  @location(4) leafiness: f32,
  @location(5) deciduous: f32,
  @location(6) lod: f32,
  @location(7) worldPos: vec3<f32>,
  @location(8) seed: f32,
};

@group(0) @binding(0) var<uniform> scene: TreeUniforms;
@group(0) @binding(1) var<storage, read> trees: array<TreeInstance>;

fn quad_uv(vid: u32) -> vec2<f32> {
  let uv = array<vec2<f32>, 6>(
    vec2<f32>(0.0, 0.0),
    vec2<f32>(1.0, 0.0),
    vec2<f32>(1.0, 1.0),
    vec2<f32>(0.0, 0.0),
    vec2<f32>(1.0, 1.0),
    vec2<f32>(0.0, 1.0)
  );
  return uv[vid];
}

fn mandelbrot(c: vec2<f32>, iterations: u32) -> f32 {
  var z = vec2<f32>(0.0);
  var i: u32 = 0u;
  loop {
    if (i >= iterations) {
      break;
    }
    let x = z.x * z.x - z.y * z.y + c.x;
    let y = 2.0 * z.x * z.y + c.y;
    z = vec2<f32>(x, y);
    if (dot(z, z) > 4.0) {
      break;
    }
    i = i + 1u;
  }
  return f32(i) / f32(iterations);
}

@vertex
fn vs_main(@builtin(vertex_index) vid: u32, @builtin(instance_index) iid: u32) -> VSOut {
  let data = trees[iid];
  let pos = data.posHeight.xyz;
  let height = data.posHeight.w;
  let canopy = data.canopySeed.x;
  let seed = data.canopySeed.y;
  let deciduous = data.canopySeed.z;
  let leafiness = data.canopySeed.w;

  let quadIndex = vid / 6u;
  let localVid = vid % 6u;
  let uv = quad_uv(localVid);
  let right = scene.cameraRight.xyz;
  let up = scene.cameraUp.xyz;
  let forward = normalize(cross(right, up));
  let diag = normalize(right + forward);
  let anti = normalize(right - forward);
  var basis = right;
  if (quadIndex == 1u) {
    basis = forward;
  } else if (quadIndex == 2u) {
    basis = diag;
  } else if (quadIndex == 3u) {
    basis = anti;
  }

  let dist = length(scene.cameraPos.xyz - pos);
  let lod = clamp((dist - 6.0) / 20.0, 0.0, 1.0);
  let lodScale = mix(1.0, 0.6, lod);

  let partIndex = quadIndex / 4u;
  var localY = uv.y;
  if (partIndex == 0u) {
    localY = uv.y * 0.55;
  } else if (partIndex == 1u) {
    localY = 0.5 + uv.y * 0.45;
  } else {
    localY = 0.78 + uv.y * 0.35;
  }
  let canopyScale = mix(0.5, 1.0, f32(partIndex) / 2.0);

  var out: VSOut;
  let basePos = pos + basis * (uv.x - 0.5) * canopy * 1.2 * canopyScale * lodScale + up * (localY) * height * lodScale;
  let windDir = normalize(scene.wind.xyz);
  let time = scene.wind.w;
  let windStrength = scene.season.y;
  let gustiness = scene.season.z;
  let heightFactor = clamp(localY, 0.0, 1.0);
  let swayBase = smoothstep(0.15, 0.95, heightFactor);
  let sway = sin(time * (0.6 + gustiness) + seed * 6.1 + uv.y * 2.1) * windStrength * swayBase;
  let flutter = sin(time * 1.7 + seed * 3.3 + uv.x * 6.0) * windStrength * 0.2 * leafiness;
  let windOffset = windDir * (sway + flutter) * (1.0 - lod * 0.6);
  let worldPos = basePos + windOffset;
  out.position = scene.viewProj * vec4<f32>(worldPos, 1.0);
  out.uv = uv;
  out.baseColor = vec3<f32>(0.18, 0.48, 0.2);
  out.trunkColor = vec3<f32>(0.25, 0.16, 0.08);
  out.height = height;
  out.leafiness = leafiness;
  out.deciduous = deciduous;
  out.lod = lod;
  out.worldPos = worldPos;
  out.seed = seed;
  return out;
}

@fragment
fn fs_main(input: VSOut) -> @location(0) vec4<f32> {
  let uv = input.uv;
  let trunkHeight = 0.42;
  let trunkWidth = mix(0.18, 0.08, uv.y / trunkHeight);
  let centerX = abs(uv.x - 0.5);

  if (uv.y <= trunkHeight && centerX < trunkWidth) {
    return vec4<f32>(input.trunkColor, 1.0);
  }

  if (uv.y > trunkHeight && uv.y < 0.7) {
    let branchWave = sin((uv.y + input.seed * 1.7) * 12.0) * 0.5 + 0.5;
    let branchOffset = (branchWave - 0.5) * 0.35;
    let branchWidth = mix(0.12, 0.04, uv.y);
    if (abs(uv.x - (0.5 + branchOffset)) < branchWidth) {
      return vec4<f32>(input.trunkColor * 0.9, 1.0);
    }
  }

  let canopyCenter = vec2<f32>(0.5, 0.7);
  let rel = uv - canopyCenter;
  let radius = length(rel);

  let iterCount = u32(round(mix(20.0, 6.0, input.lod)));
  let c = rel * 2.2 + vec2<f32>(input.seed * 0.35, input.seed * -0.22);
  let fract = mandelbrot(c, iterCount);
  let leafMask = smoothstep(0.85, 0.35, radius + fract * 0.2);

  let season = scene.season.x;
  var leafAlpha = leafMask * input.leafiness * mix(1.0, 0.6, input.lod);
  if (input.deciduous > 0.5) {
    leafAlpha = leafAlpha * mix(1.0, 0.35, season);
  }

  if (leafAlpha < 0.02) {
    discard;
  }

  let summer = vec3<f32>(0.2, 0.55, 0.24);
  let autumn = vec3<f32>(0.72, 0.38, 0.18);
  let leafColor = mix(summer, autumn, season * input.deciduous);

  return vec4<f32>(leafColor, leafAlpha);
}
`,Tt=`struct SimParams {
  sim0: vec4<f32>, // origin.x, origin.z, invSize, gridSize
  sim1: vec4<f32>, // dt, flipRatio, particleCount, pad
  sim2: vec4<f32>, // velScale, weightScale, heightScale, densityScale
  sim3: vec4<f32>, // damping, bounce, pad, pad
};

struct GridAccum {
  velX: atomic<i32>,
  velY: atomic<i32>,
  weight: atomic<i32>,
  pad: atomic<i32>,
};

@group(0) @binding(0) var<uniform> params: SimParams;
@group(0) @binding(1) var<storage, read_write> particles: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read_write> gridAccum: array<GridAccum>;
@group(0) @binding(3) var<storage, read_write> gridVel: array<vec2<f32>>;
@group(0) @binding(4) var<storage, read_write> gridVelPrev: array<vec2<f32>>;
@group(0) @binding(5) var<storage, read_write> gridDivergence: array<f32>;
@group(0) @binding(6) var<storage, read_write> gridPressure: array<f32>;
@group(0) @binding(7) var<storage, read_write> gridPressurePrev: array<f32>;
@group(0) @binding(8) var<storage, read_write> gridHeight: array<f32>;

fn grid_size() -> i32 {
  return i32(params.sim0.w);
}

fn grid_count() -> i32 {
  let size = grid_size();
  return size * size;
}

fn grid_index(ix: i32, iy: i32, size: i32) -> i32 {
  return iy * size + ix;
}

fn clamp_cell(ix: i32, size: i32) -> i32 {
  return clamp(ix, 0, size - 1);
}

fn sample_grid_vel_current(uv: vec2<f32>) -> vec2<f32> {
  let size = grid_size();
  let grid_max = f32(size - 1);
  let gx = uv.x * grid_max;
  let gy = uv.y * grid_max;
  let ix = i32(floor(gx));
  let iy = i32(floor(gy));
  let fx = fract(gx);
  let fy = fract(gy);
  let ix0 = clamp(ix, 0, size - 1);
  let iy0 = clamp(iy, 0, size - 1);
  let ix1 = clamp(ix + 1, 0, size - 1);
  let iy1 = clamp(iy + 1, 0, size - 1);
  let idx00 = grid_index(ix0, iy0, size);
  let idx10 = grid_index(ix1, iy0, size);
  let idx01 = grid_index(ix0, iy1, size);
  let idx11 = grid_index(ix1, iy1, size);
  let v00 = gridVel[idx00];
  let v10 = gridVel[idx10];
  let v01 = gridVel[idx01];
  let v11 = gridVel[idx11];
  let vx0 = mix(v00, v10, fx);
  let vx1 = mix(v01, v11, fx);
  return mix(vx0, vx1, fy);
}

fn sample_grid_vel_prev(uv: vec2<f32>) -> vec2<f32> {
  let size = grid_size();
  let grid_max = f32(size - 1);
  let gx = uv.x * grid_max;
  let gy = uv.y * grid_max;
  let ix = i32(floor(gx));
  let iy = i32(floor(gy));
  let fx = fract(gx);
  let fy = fract(gy);
  let ix0 = clamp(ix, 0, size - 1);
  let iy0 = clamp(iy, 0, size - 1);
  let ix1 = clamp(ix + 1, 0, size - 1);
  let iy1 = clamp(iy + 1, 0, size - 1);
  let idx00 = grid_index(ix0, iy0, size);
  let idx10 = grid_index(ix1, iy0, size);
  let idx01 = grid_index(ix0, iy1, size);
  let idx11 = grid_index(ix1, iy1, size);
  let v00 = gridVelPrev[idx00];
  let v10 = gridVelPrev[idx10];
  let v01 = gridVelPrev[idx01];
  let v11 = gridVelPrev[idx11];
  let vx0 = mix(v00, v10, fx);
  let vx1 = mix(v01, v11, fx);
  return mix(vx0, vx1, fy);
}

fn particle_uv(pos: vec2<f32>) -> vec2<f32> {
  let origin = params.sim0.xy;
  let invSize = params.sim0.z;
  return clamp((pos - origin) * invSize, vec2<f32>(0.0), vec2<f32>(1.0));
}

@compute @workgroup_size(128)
fn copy_grid(@builtin(global_invocation_id) gid: vec3<u32>) {
  let idx = i32(gid.x);
  let count = grid_count();
  if (idx >= count) {
    return;
  }
  gridVelPrev[idx] = gridVel[idx];
}

@compute @workgroup_size(128)
fn clear_grid(@builtin(global_invocation_id) gid: vec3<u32>) {
  let idx = i32(gid.x);
  let count = grid_count();
  if (idx >= count) {
    return;
  }
  atomicStore(&gridAccum[idx].velX, 0);
  atomicStore(&gridAccum[idx].velY, 0);
  atomicStore(&gridAccum[idx].weight, 0);
  atomicStore(&gridAccum[idx].pad, 0);
  gridVel[idx] = vec2<f32>(0.0);
  gridDivergence[idx] = 0.0;
  gridPressure[idx] = 0.0;
  gridPressurePrev[idx] = 0.0;
  gridHeight[idx] = 0.0;
}

@compute @workgroup_size(128)
fn particles_to_grid(@builtin(global_invocation_id) gid: vec3<u32>) {
  let idx = i32(gid.x);
  let count = i32(params.sim1.z);
  if (idx >= count) {
    return;
  }
  let pos = particles[idx].xy;
  let vel = particles[idx].zw;
  let size = grid_size();
  let grid_max = f32(size - 1);
  let uv = particle_uv(pos);
  let gx = uv.x * grid_max;
  let gy = uv.y * grid_max;
  let ix = i32(floor(gx));
  let iy = i32(floor(gy));
  let fx = fract(gx);
  let fy = fract(gy);
  let ix0 = clamp(ix, 0, size - 2);
  let iy0 = clamp(iy, 0, size - 2);
  let ix1 = ix0 + 1;
  let iy1 = iy0 + 1;

  let w00 = (1.0 - fx) * (1.0 - fy);
  let w10 = fx * (1.0 - fy);
  let w01 = (1.0 - fx) * fy;
  let w11 = fx * fy;

  let velScale = params.sim2.x;
  let weightScale = params.sim2.y;

  let v00x = i32(round(vel.x * velScale * w00));
  let v00y = i32(round(vel.y * velScale * w00));
  let v10x = i32(round(vel.x * velScale * w10));
  let v10y = i32(round(vel.y * velScale * w10));
  let v01x = i32(round(vel.x * velScale * w01));
  let v01y = i32(round(vel.y * velScale * w01));
  let v11x = i32(round(vel.x * velScale * w11));
  let v11y = i32(round(vel.y * velScale * w11));

  let w00i = i32(round(weightScale * w00));
  let w10i = i32(round(weightScale * w10));
  let w01i = i32(round(weightScale * w01));
  let w11i = i32(round(weightScale * w11));

  let idx00 = grid_index(ix0, iy0, size);
  let idx10 = grid_index(ix1, iy0, size);
  let idx01 = grid_index(ix0, iy1, size);
  let idx11 = grid_index(ix1, iy1, size);

  atomicAdd(&gridAccum[idx00].velX, v00x);
  atomicAdd(&gridAccum[idx00].velY, v00y);
  atomicAdd(&gridAccum[idx00].weight, w00i);

  atomicAdd(&gridAccum[idx10].velX, v10x);
  atomicAdd(&gridAccum[idx10].velY, v10y);
  atomicAdd(&gridAccum[idx10].weight, w10i);

  atomicAdd(&gridAccum[idx01].velX, v01x);
  atomicAdd(&gridAccum[idx01].velY, v01y);
  atomicAdd(&gridAccum[idx01].weight, w01i);

  atomicAdd(&gridAccum[idx11].velX, v11x);
  atomicAdd(&gridAccum[idx11].velY, v11y);
  atomicAdd(&gridAccum[idx11].weight, w11i);
}

@compute @workgroup_size(128)
fn normalize_grid(@builtin(global_invocation_id) gid: vec3<u32>) {
  let idx = i32(gid.x);
  let count = grid_count();
  if (idx >= count) {
    return;
  }
  let weightScale = params.sim2.y;
  let velScale = params.sim2.x;
  let damping = params.sim3.x;
  let heightScale = params.sim2.z;
  let densityScale = max(params.sim2.w, 1e-3);

  let w = f32(atomicLoad(&gridAccum[idx].weight)) / weightScale;
  var vel = vec2<f32>(0.0);
  if (w > 0.0) {
    let vx = f32(atomicLoad(&gridAccum[idx].velX)) / (velScale * w);
    let vy = f32(atomicLoad(&gridAccum[idx].velY)) / (velScale * w);
    vel = vec2<f32>(vx, vy);
  }
  vel = vel * (1.0 - damping);
  gridVel[idx] = vel;
  let height = clamp(w / densityScale, 0.0, 1.0) * heightScale;
  gridHeight[idx] = height;
}

@compute @workgroup_size(128)
fn compute_divergence(@builtin(global_invocation_id) gid: vec3<u32>) {
  let idx = i32(gid.x);
  let size = grid_size();
  let count = size * size;
  if (idx >= count) {
    return;
  }
  let ix = idx % size;
  let iy = idx / size;
  let invCell = params.sim0.z * (f32(size - 1));

  var left = vec2<f32>(0.0);
  var right = vec2<f32>(0.0);
  var down = vec2<f32>(0.0);
  var up = vec2<f32>(0.0);
  if (ix > 0) {
    left = gridVel[grid_index(ix - 1, iy, size)];
  }
  if (ix < size - 1) {
    right = gridVel[grid_index(ix + 1, iy, size)];
  }
  if (iy > 0) {
    down = gridVel[grid_index(ix, iy - 1, size)];
  }
  if (iy < size - 1) {
    up = gridVel[grid_index(ix, iy + 1, size)];
  }

  let div = (right.x - left.x + up.y - down.y) * 0.5 * invCell;
  gridDivergence[idx] = div;
}

@compute @workgroup_size(128)
fn pressure_jacobi(@builtin(global_invocation_id) gid: vec3<u32>) {
  let idx = i32(gid.x);
  let size = grid_size();
  let count = size * size;
  if (idx >= count) {
    return;
  }
  let ix = idx % size;
  let iy = idx / size;

  var pL = 0.0;
  var pR = 0.0;
  var pB = 0.0;
  var pT = 0.0;
  if (ix > 0) {
    pL = gridPressurePrev[grid_index(ix - 1, iy, size)];
  }
  if (ix < size - 1) {
    pR = gridPressurePrev[grid_index(ix + 1, iy, size)];
  }
  if (iy > 0) {
    pB = gridPressurePrev[grid_index(ix, iy - 1, size)];
  }
  if (iy < size - 1) {
    pT = gridPressurePrev[grid_index(ix, iy + 1, size)];
  }
  let div = gridDivergence[idx];
  gridPressure[idx] = (pL + pR + pB + pT - div) * 0.25;
}

@compute @workgroup_size(128)
fn project_grid(@builtin(global_invocation_id) gid: vec3<u32>) {
  let idx = i32(gid.x);
  let size = grid_size();
  let count = size * size;
  if (idx >= count) {
    return;
  }
  let ix = idx % size;
  let iy = idx / size;
  let invCell = params.sim0.z * (f32(size - 1));

  var pL = 0.0;
  var pR = 0.0;
  var pB = 0.0;
  var pT = 0.0;
  if (ix > 0) {
    pL = gridPressure[grid_index(ix - 1, iy, size)];
  }
  if (ix < size - 1) {
    pR = gridPressure[grid_index(ix + 1, iy, size)];
  }
  if (iy > 0) {
    pB = gridPressure[grid_index(ix, iy - 1, size)];
  }
  if (iy < size - 1) {
    pT = gridPressure[grid_index(ix, iy + 1, size)];
  }
  var vel = gridVel[idx];
  vel.x = vel.x - (pR - pL) * 0.5 * invCell;
  vel.y = vel.y - (pT - pB) * 0.5 * invCell;
  gridVel[idx] = vel;
}

@compute @workgroup_size(128)
fn update_particles(@builtin(global_invocation_id) gid: vec3<u32>) {
  let idx = i32(gid.x);
  let count = i32(params.sim1.z);
  if (idx >= count) {
    return;
  }
  let dt = params.sim1.x;
  let flipRatio = params.sim1.y;
  let bounce = params.sim3.y;
  let origin = params.sim0.xy;
  let size = 1.0 / params.sim0.z;

  var pos = particles[idx].xy;
  var vel = particles[idx].zw;
  let uv = particle_uv(pos);

  let pic = sample_grid_vel_current(uv);
  let prev = sample_grid_vel_prev(uv);
  let flip = vel + (pic - prev);
  vel = mix(pic, flip, flipRatio);

  pos = pos + vel * dt;

  let minPos = origin;
  let maxPos = origin + vec2<f32>(size);
  if (pos.x < minPos.x) {
    pos.x = minPos.x;
    vel.x = -vel.x * bounce;
  } else if (pos.x > maxPos.x) {
    pos.x = maxPos.x;
    vel.x = -vel.x * bounce;
  }
  if (pos.y < minPos.y) {
    pos.y = minPos.y;
    vel.y = -vel.y * bounce;
  } else if (pos.y > maxPos.y) {
    pos.y = maxPos.y;
    vel.y = -vel.y * bounce;
  }

  particles[idx] = vec4<f32>(pos, vel);
}
`,Et=`struct FractalParams {
  grid: vec4<f32>,   // grid_points, extent, step, seed
  field0: vec4<f32>, // scale, warp_scale, warp_strength, power
  field1: vec4<f32>, // detail_scale, detail_power, ridge_power, heat_bias
  field2: vec4<f32>, // moisture_bias, mandel_scale, mandel_strength, mandel_rock_boost
  field3: vec4<f32>, // iterations, detail_iterations, macro_scale, macro_warp_strength
  field4: vec4<f32>, // style_mix_strength, terrace_steps, terrace_strength, crater_strength
  field5: vec4<f32>, // crater_scale, height_min, height_max, pad
};

struct Sample {
  data0: vec4<f32>, // height, heat, moisture, rockiness
  data1: vec4<f32>, // water, ridge, base, detail
};

@group(0) @binding(0) var<uniform> params: FractalParams;
@group(0) @binding(1) var<storage, read_write> samples_out: array<Sample>;
@group(0) @binding(2) var<storage, read> samples_in: array<Sample>;

fn hash32(x: u32) -> u32 {
  var v = x;
  v ^= v >> 17u;
  v *= 0xed5ad4bbu;
  v ^= v >> 11u;
  v *= 0xac4c1b51u;
  v ^= v >> 15u;
  v *= 0x31848babu;
  v ^= v >> 14u;
  return v;
}

fn hash01(x: u32) -> f32 {
  let v = hash32(x) & 0x00ffffffu;
  return f32(v) / 16777216.0;
}

fn smooth_mandelbrot(cx: f32, cy: f32, iterations: u32, power: f32) -> f32 {
  var zx = 0.0;
  var zy = 0.0;
  var i: u32 = 0u;
  loop {
    if (i >= iterations) {
      break;
    }
    let r2 = zx * zx + zy * zy;
    if (r2 > 4.0) {
      break;
    }
    let r = sqrt(r2);
    let theta = atan2(zy, zx);
    let rp = pow(r, power);
    zx = rp * cos(theta * power) + cx;
    zy = rp * sin(theta * power) + cy;
    i = i + 1u;
  }
  if (i >= iterations) {
    return 1.0;
  }
  let r = max(sqrt(zx * zx + zy * zy), 1e-6);
  let nu = log2(log(r));
  let smoothVal = (f32(i) + 1.0 - nu) / f32(iterations);
  return clamp(smoothVal, 0.0, 1.0);
}

fn terrace_height(h: f32, steps: f32) -> f32 {
  let count = max(1.0, steps);
  let step = 1.0 / count;
  let clamped = clamp(h, 0.0, 1.0);
  let band = floor(clamped / step);
  let t = fract(clamped / step);
  let blend = t * t * (3.0 - 2.0 * t);
  return (band + blend) * step;
}

fn crater_field(p: vec2<f32>, scale: f32, seed: u32) -> f32 {
  let sp = p * scale;
  let cell = floor(sp);
  let local = sp - cell;
  let cx = i32(cell.x);
  let cz = i32(cell.y);
  let hx = u32(bitcast<u32>(cx));
  let hz = u32(bitcast<u32>(cz));
  let h0 = hash01((hx * 374761393u) ^ (hz * 668265263u) ^ seed ^ 0x9e3779b9u);
  let h1 = hash01((hx * 2246822519u) ^ (hz * 3266489917u) ^ seed ^ 0x85ebca6bu);
  let h2 = hash01((hx * 1597334677u) ^ (hz * 3812015801u) ^ seed ^ 0xc2b2ae35u);
  let center = vec2<f32>(h0, h1);
  let radius = 0.22 + 0.25 * h2;
  let dist = distance(local, center);
  return smoothstep(radius, radius * 0.35, dist);
}

fn macro_map(p: vec2<f32>, iterations: u32, power: f32, scale: f32, warp_strength: f32, mix_strength: f32) -> f32 {
  let macro_iter = max(12u, iterations / 3u);
  let macroA = smooth_mandelbrot(p.x * scale, p.y * scale, macro_iter, power);
  let macroB = smooth_mandelbrot((p.x + 13.7) * scale, (p.y - 9.2) * scale, macro_iter, power + 0.35);
  let warp = vec2<f32>(macroA - 0.5, macroB - 0.5) * warp_strength;
  let macroC = smooth_mandelbrot((p.x + warp.x) * scale, (p.y + warp.y) * scale, macro_iter, power);
  return clamp((macroC - 0.5) * mix_strength + 0.5, 0.0, 1.0);
}

fn sample_field(p: vec2<f32>) -> Sample {
  let seed = u32(params.grid.w);
  let iterations = u32(params.field3.x);
  let detail_iterations = u32(params.field3.y);
  let macro_scale = params.field3.z;
  let macro_warp_strength = params.field3.w;
  let style_mix_strength = params.field4.x;
  let terrace_steps = params.field4.y;
  let terrace_strength = params.field4.z;
  let crater_strength = params.field4.w;
  let crater_scale = params.field5.x;
  let height_min = params.field5.y;
  let height_max = params.field5.z;
  let scale = params.field0.x;
  let warp_scale = params.field0.y;
  let warp_strength = params.field0.z;
  let power = params.field0.w;
  let detail_scale = params.field1.x;
  let detail_power = params.field1.y;
  let ridge_power = params.field1.z;
  let heat_bias = params.field1.w;
  let moisture_bias = params.field2.x;

  let offX = hash01(seed ^ 0x7f4a7c15u) * 4.0 - 2.0;
  let offZ = hash01(seed ^ 0xa9d84d2bu) * 4.0 - 2.0;
  let warpOffX = hash01(seed ^ 0x8c2f1d3bu) * 6.0 - 3.0;
  let warpOffZ = hash01(seed ^ 0x5d2c79e9u) * 6.0 - 3.0;

  let warpIter = max(16u, iterations * 6u / 10u);
  let warpA = smooth_mandelbrot(
    (p.x + warpOffX) * warp_scale,
    (p.y + warpOffZ) * warp_scale,
    warpIter,
    power
  );
  let warpB = smooth_mandelbrot(
    (p.x - warpOffZ) * warp_scale,
    (p.y + warpOffX) * warp_scale,
    warpIter,
    power
  );

  let warped = vec2<f32>(
    p.x + (warpA - 0.5) * warp_strength,
    p.y + (warpB - 0.5) * warp_strength
  );

  let base = smooth_mandelbrot(
    warped.x * scale + offX,
    warped.y * scale + offZ,
    iterations,
    power
  );
  let mid = smooth_mandelbrot(
    warped.x * scale * 2.15 + offX * 0.6,
    warped.y * scale * 2.15 + offZ * 0.6,
    max(18u, iterations * 7u / 10u),
    power + 0.2
  );
  let detail = smooth_mandelbrot(
    warped.x * scale * detail_scale + offX * 1.4,
    warped.y * scale * detail_scale + offZ * 1.4,
    detail_iterations,
    detail_power
  );

  let ridge = 1.0 - abs(2.0 * mid - 1.0);
  let baseHeight = pow(base, 0.9) * pow(mid, 1.05) * pow(detail, 1.1);

  let styleMask = macro_map(warped, iterations, power, macro_scale, macro_warp_strength, style_mix_strength);
  let terrace = terrace_height(baseHeight, terrace_steps);
  let crater = crater_field(warped, crater_scale, seed);

  let styleA = clamp(pow(baseHeight, 0.8) + pow(ridge, 1.4) * 0.2, 0.0, 1.0);
  let styleB = clamp(
    baseHeight * (1.0 - terrace_strength) +
      terrace * terrace_strength -
      crater * crater_strength +
      pow(ridge, 1.6) * 0.12,
    0.0,
    1.0
  );
  let mixed = mix(styleA, styleB, styleMask);
  let ridgeBoost = pow(ridge, 1.35) * 0.22;
  let centered = (mixed - 0.5) * 2.0;
  let shaped = sign(centered) * pow(abs(centered), 0.75);
  let macroOffset = (styleMask - 0.5) * 0.25;
  let rawHeight = clamp(0.5 + shaped * 0.8 + macroOffset + ridgeBoost, height_min, height_max);
  let height01 = clamp(rawHeight, 0.0, 1.0);

  let roughness = clamp(pow(ridge, ridge_power) * 0.7 + detail * 0.3, 0.0, 1.0);
  let heat = clamp(0.55 * mid + 0.35 * (1.0 - height01) + heat_bias, 0.0, 1.0);
  let moisture = clamp(
    0.55 * detail + 0.35 * (1.0 - height01) - (heat - 0.5) * 0.1 + moisture_bias,
    0.0,
    1.0
  );
  let rockiness = clamp(roughness * 0.6 + height01 * 0.4, 0.0, 1.0);
  let water = clamp((0.32 - height01) * 3.0 + (moisture - 0.5) * 0.2, 0.0, 1.0);

  return Sample(
    vec4<f32>(rawHeight, heat, moisture, rockiness),
    vec4<f32>(water, ridge, base, detail)
  );
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let grid_points = u32(params.grid.x);
  if (gid.x >= grid_points || gid.y >= grid_points) {
    return;
  }
  let extent = params.grid.y;
  let step = params.grid.z;
  let x = -extent + f32(gid.x) * step;
  let z = -extent + f32(gid.y) * step;

  var sample = sample_field(vec2<f32>(x, z));

  let mandel_scale = params.field2.y;
  let mandel_strength = params.field2.z;
  let mandel_rock = params.field2.w;
  let height_min = params.field5.y;
  let height_max = params.field5.z;
  let mandel = smooth_mandelbrot(x * mandel_scale, z * mandel_scale, 24u, 2.0);
  let mandel_bias = (mandel - 0.5) * mandel_strength;
  let rawHeight = clamp(sample.data0.x + mandel_bias, height_min, height_max);
  let height01 = clamp(rawHeight, 0.0, 1.0);
  let rockiness = clamp(sample.data0.w + max(0.0, mandel - 0.55) * mandel_rock, 0.0, 1.0);
  let water = clamp((0.32 - height01) * 3.0 + (sample.data0.z - 0.5) * 0.2, 0.0, 1.0);

  sample.data0.x = rawHeight;
  sample.data0.w = rockiness;
  sample.data1.x = water;

  let index = gid.y * grid_points + gid.x;
  samples_out[index] = sample;
}

fn height_at(ix: i32, iy: i32, size: i32) -> f32 {
  let x = clamp(ix, 0, size - 1);
  let y = clamp(iy, 0, size - 1);
  let idx = y * size + x;
  return samples_in[idx].data0.x;
}

@compute @workgroup_size(8, 8)
fn accent_heights(@builtin(global_invocation_id) gid: vec3<u32>) {
  let grid_points = i32(params.grid.x);
  let ix = i32(gid.x);
  let iy = i32(gid.y);
  if (ix >= grid_points || iy >= grid_points) {
    return;
  }
  let idx = iy * grid_points + ix;
  let center = samples_in[idx];
  var sum = 0.0;
  var count = 0.0;
  for (var dx = -1; dx <= 1; dx = dx + 1) {
    for (var dy = -1; dy <= 1; dy = dy + 1) {
      if (dx == 0 && dy == 0) {
        continue;
      }
      sum = sum + height_at(ix + dx, iy + dy, grid_points);
      count = count + 1.0;
    }
  }
  let avg = select(center.data0.x, sum / count, count > 0.0);
  let delta = center.data0.x - avg;
  let signed = sign(delta) * pow(abs(delta), 0.8);
  let ridge = max(0.0, delta);
  let accentStrength = 1.6;
  let ridgeStrength = 0.35;
  let macroStrength = 0.25;
  let minHeight = params.field5.y;
  let maxHeight = params.field5.z;
  let macroOffset = (avg - 0.5) * macroStrength;
  let rawHeight = clamp(
    avg + signed * accentStrength + ridge * ridgeStrength + macroOffset,
    minHeight,
    maxHeight
  );
  let clampedHeight = clamp(rawHeight, 0.0, 1.0);

  var out = center;
  out.data0.x = rawHeight;
  out.data0.w = clamp(out.data0.w + max(0.0, clampedHeight - 0.65) * 0.5, 0.0, 1.0);
  out.data1.x = clamp((0.32 - clampedHeight) * 3.0 + (out.data0.z - 0.5) * 0.2, 0.0, 1.0);
  samples_out[idx] = out;
}
`,Ut=[Gt,Ct,Rt].join(`
`),oe=[{name:"Ultra",simRate:90,gridSize:96,particleCount:9e3,pressureIterations:16},{name:"High",simRate:75,gridSize:88,particleCount:7500,pressureIterations:13},{name:"Balanced",simRate:60,gridSize:80,particleCount:6e3,pressureIterations:11},{name:"Performance",simRate:45,gridSize:72,particleCount:4500,pressureIterations:9},{name:"Low",simRate:30,gridSize:64,particleCount:3200,pressureIterations:7}],Ht=[],Ne="plasius-fractal-asset",ne=document.getElementById("view"),Ge=document.getElementById("status"),Ce=document.getElementById("mode"),Ye=document.getElementById("seed"),ye=document.getElementById("radius"),Se=document.getElementById("radiusValue"),He=document.getElementById("regen"),Me=document.getElementById("bakeFractal"),Ie=document.getElementById("fps"),ve=document.getElementById("heatmapToggle"),i={device:null,context:null,contextFormat:null,pipeline:null,treePipeline:null,waterSim:null,fractalPrepass:null,fractalAsset:null,uniformBuffer:null,treeUniformBuffer:null,bindGroup:null,treeBindGroup:null,depthTexture:null,vertexBuffer:null,vertexCount:0,boxMinBuffer:null,boxMaxBuffer:null,boxCount:0,treeInstanceBuffer:null,treeCount:0,yaw:Math.PI/4,pitch:Math.atan(1/Math.sqrt(2)),radius:20,orthoScale:10,dragging:!1,lastX:0,lastY:0,fpsFrames:0,fpsLast:performance.now(),lastSimTime:performance.now()*.001,waterSimRate:60,waterSimMaxSteps:2,waterSimAccumulator:0,waterQualityLevel:2,performance:Pt({targetFps:120,tolerance:6,sampleSize:90,minSampleFraction:.6,cooldownMs:1200,qualitySlew:.05,initialBudget:.5,auto:!0}),time:0,windDir:[.85,0,.52],windStrength:.35,windGust:.25,season:.2,wetness:.18,snow:0,rain:0,heatmapEnabled:!1,heightMin:-1,heightMax:1};function J(e){Ge&&(Ge.textContent=e)}function X(e,n,t){return Math.min(t,Math.max(n,e))}const N={Default:0,Grass:1,Water:2,Rock:3,Sand:4,Mud:5,Snow:6,Foliage:7};function It(e,n,t,r,a,o){const s=1/(e-n),c=1/(t-r),m=1/(a-o);return new Float32Array([-2*s,0,0,0,0,-2*c,0,0,0,0,2*m,0,(e+n)*s,(r+t)*c,(o+a)*m,1])}function Lt(e,n,t){const r=e[0]-n[0],a=e[1]-n[1],o=e[2]-n[2];let s=Math.hypot(r,a,o);const c=s>0?r/s:0,m=s>0?a/s:0,g=s>0?o/s:1,F=t[1]*g-t[2]*m,L=t[2]*c-t[0]*g,T=t[0]*m-t[1]*c;s=Math.hypot(F,L,T);const z=s>0?F/s:1,C=s>0?L/s:0,_=s>0?T/s:0,B=m*_-g*C,v=g*z-c*_,h=c*C-m*z;return new Float32Array([z,B,c,0,C,v,m,0,_,h,g,0,-(z*e[0]+C*e[1]+_*e[2]),-(B*e[0]+v*e[1]+h*e[2]),-(c*e[0]+m*e[1]+g*e[2]),1])}function Ot(e,n){const t=new Float32Array(16);for(let r=0;r<4;r+=1)for(let a=0;a<4;a+=1)t[r*4+a]=e[0+a]*n[r*4+0]+e[4+a]*n[r*4+1]+e[8+a]*n[r*4+2]+e[12+a]*n[r*4+3];return t}function Fe(e){const n=Math.hypot(e[0],e[1],e[2]);return n===0?[0,1,0]:[e[0]/n,e[1]/n,e[2]/n]}function me(e,n,t){const r=[n[0]-e[0],n[1]-e[1],n[2]-e[2]],a=[t[0]-e[0],t[1]-e[1],t[2]-e[2]];return Fe([r[1]*a[2]-r[2]*a[1],r[2]*a[0]-r[0]*a[2],r[0]*a[1]-r[1]*a[0]])}function Be(e,n){return[e[0]*n,e[1]*n,e[2]*n]}function Xe(e){switch(e){case S.Grass:return[.24,.55,.26];case S.Dirt:return[.45,.32,.2];case S.Mud:return[.3,.22,.16];case S.Sand:return[.74,.66,.42];case S.Water:return[.12,.32,.62];case S.Rock:return[.5,.5,.52];case S.Gravel:return[.6,.56,.5];case S.Basalt:return[.32,.32,.35];default:return[.38,.48,.32]}}function je(e){switch(e){case S.Grass:return N.Grass;case S.Water:return N.Water;case S.Rock:case S.Gravel:case S.Basalt:return N.Rock;case S.Sand:return N.Sand;case S.Mud:case S.Dirt:return N.Mud;case S.Snowpack:case S.Ice:return N.Snow;default:return N.Default}}function Re(e){const n=Math.sin(e)*43758.5453123;return n-Math.floor(n)}function Wt(e,n,t,r=.17,a=18){const o=e*r+t*37e-5,s=n*r-t*21e-5;let c=0,m=0,g=0;for(let F=0;F<a;F+=1){const L=c*c-m*m+o,T=2*c*m+s;if(c=L,m=T,c*c+m*m>4)break;g=F+1}return g/a}function qt(){try{const e=window.localStorage.getItem(Ne);return e?Ve(JSON.parse(e)):null}catch(e){return console.warn("Failed to load baked fractal asset.",e),null}}function Dt(e){try{const n=De(e);window.localStorage.setItem(Ne,JSON.stringify(n))}catch(n){console.warn("Failed to store fractal asset.",n)}}function Vt(e){const n=De(e),t=new Blob([JSON.stringify(n)],{type:"application/json"}),r=URL.createObjectURL(t),a=document.createElement("a");a.href=r,a.download=`fractal-asset-${e.seed}-${e.gridSize}.json`,document.body.appendChild(a),a.click(),a.remove(),URL.revokeObjectURL(r)}async function Nt(){try{const e=await fetch("./assets/fractal-height.json",{cache:"no-store"});if(!e.ok)return null;const n=await e.json();return Ve(n)}catch{return null}}async function $e({seed:e,extent:n,steps:t,heightScale:r}){if(!i.device)throw new Error("GPU device not ready for fractal prepass.");const a=Math.max(8,t);return(!i.fractalPrepass||i.fractalPrepass.gridSize!==a)&&(i.fractalPrepass=kt({device:i.device,wgsl:Et,gridSize:a})),i.fractalPrepass.run({seed:e,extent:n,heightScale:r,mandel:we})}async function Yt(){const e=Number(Ye?.value??1337),n=Number(ye?.value??6),t=n*2.6,r=Math.round(X(n*16,36,180));J("Baking fractal asset...");const a=i.fractalAsset&&be(i.fractalAsset,{seed:e,extent:t,gridSize:r})?i.fractalAsset:await $e({seed:e,extent:t,steps:r,heightScale:2.6});i.fractalAsset=a,Dt(a),Vt(a),J("Fractal asset baked and downloaded.")}function Ze(){!i.device||!i.pipeline||!i.uniformBuffer||!i.boxMinBuffer||!i.boxMaxBuffer||(i.bindGroup=i.device.createBindGroup({layout:i.pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:i.uniformBuffer}},{binding:1,resource:{buffer:i.boxMinBuffer}},{binding:2,resource:{buffer:i.boxMaxBuffer}},{binding:3,resource:{buffer:i.waterSim?.gridHeightBuffer??i.boxMinBuffer}}]}))}function Xt(e){return oe.length<=1?1:1-e/(oe.length-1)}function jt(e){if(oe.length<=1)return 0;const n=X(e,0,1);return Math.round((1-n)*(oe.length-1))}function Qe(){const e=i.performance;if(!e)return;const n=e.getBudget(),t=oe[oe.length-1]?.simRate??35,r=oe[0]?.simRate??90,a=oe.map(c=>c.pressureIterations),o=Math.min(...a,7),s=Math.max(...a,16);i.waterSimRate=Math.round(t+(r-t)*n),i.waterSimMaxSteps=i.waterSimRate>=75?2:3,i.waterSim&&(i.waterSim.config.pressureIterations=Math.round(o+(s-o)*n))}function Ke(e,n="",t={}){const{syncBudget:r=!0}=t,a=X(e,0,oe.length-1),o=oe[a];i.waterQualityLevel=a,i.device&&(i.waterSim=Zt(i.device,o),i.waterSimAccumulator=0,Ze()),i.performance&&(r&&i.performance.setBudget(Xt(a)),i.performance.resetSamples()),n&&Ge&&J(`Water: ${o.name} (${n})`),Qe(),i.performance&&Je({budget:i.performance.getBudget(),reason:n})}function Je(e){for(const n of Ht)n(e)}function $t(e){const n=i.performance;if(!n)return;const t=n.update(e);if(!t.adjusted||t.medianFps==null||t.miss==null)return;Qe(),Je({budget:t.budget,median:t.medianFps,miss:t.miss});const r=jt(t.budget);r!==i.waterQualityLevel&&Ke(r,`auto ${Math.round(t.medianFps)}fps`,{syncBudget:!1})}function Zt(e,n={}){const t={size:16,gridSize:80,particleCount:6e3,flipRatio:.92,velScale:1e3,weightScale:1024,heightScale:.08,densityScale:3.2,damping:.02,bounce:.35,pressureIterations:11,...n},r=[-t.size*.5,-t.size*.5],a=1/t.size,o=t.gridSize*t.gridSize,s=e.createBuffer({size:64,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),c=e.createBuffer({size:t.particleCount*4*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),m=e.createBuffer({size:o*16,usage:GPUBufferUsage.STORAGE}),g=e.createBuffer({size:o*2*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),F=e.createBuffer({size:o*2*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),L=e.createBuffer({size:o*4,usage:GPUBufferUsage.STORAGE}),T=e.createBuffer({size:o*4,usage:GPUBufferUsage.STORAGE}),z=e.createBuffer({size:o*4,usage:GPUBufferUsage.STORAGE}),C=e.createBuffer({size:o*4,usage:GPUBufferUsage.STORAGE}),_=new Float32Array(o*2);e.queue.writeBuffer(g,0,_),e.queue.writeBuffer(F,0,_);const B=e.createShaderModule({code:Tt}),v=e.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,buffer:{type:"uniform"}},{binding:1,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:2,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:3,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:4,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:5,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:6,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:7,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:8,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}}]}),h=e.createPipelineLayout({bindGroupLayouts:[v]}),U={copyGrid:e.createComputePipeline({layout:h,compute:{module:B,entryPoint:"copy_grid"}}),clearGrid:e.createComputePipeline({layout:h,compute:{module:B,entryPoint:"clear_grid"}}),particlesToGrid:e.createComputePipeline({layout:h,compute:{module:B,entryPoint:"particles_to_grid"}}),normalizeGrid:e.createComputePipeline({layout:h,compute:{module:B,entryPoint:"normalize_grid"}}),divergence:e.createComputePipeline({layout:h,compute:{module:B,entryPoint:"compute_divergence"}}),pressure:e.createComputePipeline({layout:h,compute:{module:B,entryPoint:"pressure_jacobi"}}),project:e.createComputePipeline({layout:h,compute:{module:B,entryPoint:"project_grid"}}),updateParticles:e.createComputePipeline({layout:h,compute:{module:B,entryPoint:"update_particles"}})},w=(f,y)=>[{binding:0,resource:{buffer:s}},{binding:1,resource:{buffer:c}},{binding:2,resource:{buffer:m}},{binding:3,resource:{buffer:g}},{binding:4,resource:{buffer:F}},{binding:5,resource:{buffer:L}},{binding:6,resource:{buffer:f}},{binding:7,resource:{buffer:y}},{binding:8,resource:{buffer:C}}],I=e.createBindGroup({layout:v,entries:w(T,z)}),E=e.createBindGroup({layout:v,entries:w(z,T)}),d=new Float32Array(t.particleCount*4),M=[r[0]+t.size*.5,r[1]+t.size*.5],b=t.size*.45;for(let f=0;f<t.particleCount;f+=1){const y=Math.random()*Math.PI*2,p=Math.sqrt(Math.random())*b,A=M[0]+Math.cos(y)*p,G=M[1]+Math.sin(y)*p,x=(Math.random()-.5)*.15,R=(Math.random()-.5)*.15,k=f*4;d[k]=A,d[k+1]=G,d[k+2]=x,d[k+3]=R}e.queue.writeBuffer(c,0,d);const u=new Float32Array(16),l=f=>{u[0]=r[0],u[1]=r[1],u[2]=a,u[3]=t.gridSize,u[4]=f,u[5]=t.flipRatio,u[6]=t.particleCount,u[7]=0,u[8]=t.velScale,u[9]=t.weightScale,u[10]=t.heightScale,u[11]=t.densityScale,u[12]=t.damping,u[13]=t.bounce,u[14]=0,u[15]=0,e.queue.writeBuffer(s,0,u)};return l(.016),{config:t,origin:r,invSize:a,gridHeightBuffer:C,bindGroupA:I,bindGroupB:E,pipelines:U,updateParams:l,gridWorkgroups:Math.ceil(o/128),particleWorkgroups:Math.ceil(t.particleCount/128)}}function fe(e){return e===S.Water}function Ae(e){return e===S.Rock||e===S.Gravel||e===S.Basalt}function Le(e){return e===S.Grass||e===S.Dirt||e===S.Mud||e===S.Sand}function Qt(e){switch(e){case te.Tree:return{height:.9,width:.18,color:[.16,.4,.18],material:N.Foliage};case te.Bush:return{height:.4,width:.2,color:[.2,.5,.22],material:N.Foliage};case te.GrassTuft:return{height:.15,width:.12,color:[.3,.62,.28],material:N.Foliage};case te.Boulder:return{height:.25,width:.2,color:[.45,.45,.48],material:N.Rock};case te.Rock:return{height:.18,width:.16,color:[.52,.52,.55],material:N.Rock};default:return null}}function Kt(e,n=1,t=1.2,r=1337){const a=new Map,o=new Map,s=new Map,c=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]],m=.52*t,g=(l,f)=>`${l},${f}`;e.cells.forEach((l,f)=>{const y=e.terrain[f].height*t;a.set(g(l.q,l.r),y),s.set(g(l.q,l.r),e.terrain[f].surface??S.Grass)}),e.cells.forEach(l=>{const f=g(l.q,l.r),y=a.get(f)??0,p=s.get(f)??S.Grass;let A=y;if(fe(p)){let G=1/0,x=!1;c.forEach(R=>{const k=a.get(g(l.q+R[0],l.r+R[1]));typeof k=="number"&&(G=Math.min(G,k),x=!0)}),x&&(A=Math.min(y,G-.08*t),A=Math.max(0,A))}else Ae(p)&&(A=y+.06*t);o.set(f,A)});const F=l=>{const f=new Map;return e.cells.forEach(y=>{const p=g(y.q,y.r);let G=(l.get(p)??0)*1.6,x=1.6;c.forEach(R=>{const k=l.get(g(y.q+R[0],y.r+R[1]));typeof k=="number"&&(G+=k,x+=1)}),f.set(p,G/x)}),f},L=F(o),T=F(L),C=(l=>{const f=new Map,y=1/Math.max(t,.001);return e.cells.forEach(p=>{const A=g(p.q,p.r),x=(l.get(A)??0)*y;let R=0,k=0;c.forEach(V=>{const re=l.get(g(p.q+V[0],p.r+V[1]));typeof re=="number"&&(R+=re*y,k+=1)});const H=k>0?R/k:x,O=x-H,Z=Math.max(0,O),ie=X(x+O*1.25+Z*.2,-.2,1.4);f.set(A,ie*t)}),f})(T);let _=1/0,B=-1/0;for(const l of C.values())_=Math.min(_,l),B=Math.max(B,l);for(const l of o.values())_=Math.min(_,l),B=Math.max(B,l);const v=We({size:n,defaultMaterial:N.Default,foliageMaterial:N.Foliage}),{vertices:h,boxMin:U,boxMax:w,addTriangle:I,addQuad:E,addTreeMesh:d,addBounds:M}=v,b=(l,f,y,p,A)=>{const G=[],x=[],R=[],k=[],H=[],O=[],Z=[],ie=g(l.q,l.r),V=s.get(ie)??S.Grass,re=fe(V),ce=re?0:(Re(l.q*19.13+l.r*27.91+r*.13)-.5)*t*.04;for(let P=0;P<6;P+=1){const q=c[P],Y=l.q+q[0],j=l.r+q[1],D=g(Y,j),W=s.get(D)??V,Q=(fe(W)?o.get(D):C.get(D))??null,$=fe(V)||fe(W),K=Ae(V)||Ae(W),ae=Le(V)||Le(W);if(Q==null)H[P]=y;else{let xe=V===W?.55:.7;$?xe=K?.4:ae?.78:.6:K?xe=.45:ae&&(xe=.8),H[P]=y*(1-xe)+Q*xe}let ue=m;K?ue=m*.6:$&&ae?ue=m*1.6:$?ue=m*1.4:ae&&(ue=m*1.3),Z[P]=ue;const nt=Math.min(l.q,Y),it=Math.min(l.r,j),rt=Math.max(l.q,Y),at=Math.max(l.r,j),ot=nt*127.1+it*311.7+rt*74.7+at*19.19+V*17.17+W*37.31+r*.71+P*11.3;O[P]=Re(ot)*2-1}for(let P=0;P<6;P+=1){const q=Math.PI/180*(60*P-30),Y=f[0]+n*Math.cos(q),j=f[2]+n*Math.sin(q),D=(H[P]+H[(P+5)%6])*.5,W=(O[P]+O[(P+5)%6])*.5,Q=re?y:y*.3+D*.7+W*t*.04,$=n*(.62+W*.04),K=re?y:y*.4+D*.6+W*t*.08,ae=f[0]+$*Math.cos(q),ue=f[2]+$*Math.sin(q);G.push([Y,Q,j]),x.push([ae,K,ue]),R.push(Q),k.push(K)}const de=[f[0],y+ce,f[2]];for(let P=0;P<6;P+=1){const q=de,Y=x[P],j=x[(P+1)%6],D=me(q,Y,j);I(q,Y,j,D,p,0,0,0,A)}for(let P=0;P<6;P+=1){const q=G[P],Y=G[(P+1)%6],j=x[P],D=x[(P+1)%6],W=me(q,j,D);E(q,j,D,Y,W,Be(p,.92),0,0,0,0,A)}for(let P=0;P<6;P+=1){const q=c[P],Y=g(l.q+q[0],l.r+q[1]),j=s.get(Y)??V,D=(fe(j)?o.get(Y):C.get(Y))??null,W=G[P],Q=G[(P+1)%6];if(D==null){const $=[W[0],0,W[2]],K=[Q[0],0,Q[2]],ae=me(W,$,K);E(W,$,K,Q,ae,Be(p,.7),0,0,0,0,A);continue}if(y>D+Z[P]){const $=[W[0],D,W[2]],K=[Q[0],D,Q[2]],ae=me(W,$,K);E(W,$,K,Q,ae,Be(p,.65),0,0,0,0,A)}}const he=Math.max(...R,...k,y+ce);M(G.concat(x),0,he)},u=(l,f,y)=>{const p=Qt(y);if(!p)return;const A=f,G=f+p.height,x=p.width,R=p.color,k=p.material??N.Default,H=[[l[0]-x,A,l[2]],[l[0]+x,A,l[2]],[l[0]+x,G,l[2]],[l[0]-x,G,l[2]]],O=[[l[0],A,l[2]-x],[l[0],A,l[2]+x],[l[0],G,l[2]+x],[l[0],G,l[2]-x]];E(H[0],H[1],H[2],H[3],[0,0,1],R,0,0,0,0,k),E(O[0],O[1],O[2],O[3],[1,0,0],R,0,0,0,0,k)};return e.cells.forEach((l,f)=>{const y=e.terrain[f],p=ct(l.q,l.r,n),A=g(l.q,l.r),G=y.surface??S.Grass,x=C.get(A)??y.height*t,R=fe(G)?o.get(A)??x:x,k=Xe(G),H=je(G);if(b(l,[p.x,0,p.y],R,k,H),y.feature===te.Tree){const O=Math.sin(l.q*12.989+l.r*78.233)*43758.5453%1;d([p.x,0,p.y],R,Math.abs(O))}else y.feature!==void 0&&u([p.x,0,p.y],R,y.feature)}),{vertices:new Float32Array(h),boxMin:new Float32Array(U),boxMax:new Float32Array(w),treeCount:v.treeMeshCount,minHeight:Number.isFinite(_)?_:0,maxHeight:Number.isFinite(B)?B:0}}function Jt(e,n){return e.water>.55||e.height<.18?S.Water:n>.65||e.rockiness>.7?S.Rock:e.heat>.7&&e.moisture<.35?S.Sand:e.moisture>.7&&e.height<.35?S.Mud:S.Grass}function en(e){const{seed:n,extent:t,steps:r,heightScale:a,prepass:o}=e,s=Oe(n),c=We({size:1,defaultMaterial:N.Default,foliageMaterial:N.Foliage}),{vertices:m,boxMin:g,boxMax:F,addTriangle:L,addTreeMesh:T,addBounds:z}=c,C={scale:we.scale,iterations:18,strength:we.strength,rockBoost:we.rockBoost},_=o?.gridSize??Math.max(8,r),B=o&&Number.isFinite(o.heightScale)?o.heightScale:a,v=t*2/_,h=Array.from({length:_+1},()=>new Array(_+1)),U=Array.from({length:_+1},()=>new Array(_+1)),w=Array.from({length:_+1},()=>new Array(_+1));if(o&&o.samples){const d=_+1;for(let M=0;M<=_;M+=1)for(let b=0;b<=_;b+=1){const u=(b*d+M)*ge,l=o.samples[u],f=o.samples[u+1],y=o.samples[u+2],p=o.samples[u+3],A=o.samples[u+4];w[M][b]={height:l,heat:f,moisture:y,rockiness:p,water:A,roughness:p,ridge:o.samples[u+5],base:o.samples[u+6],detail:o.samples[u+7]},U[M][b]=l,h[M][b]=l*B}}else for(let d=0;d<=_;d+=1){const M=-t+d*v;for(let b=0;b<=_;b+=1){const u=-t+b*v,l=bt(M,u,s),f=Wt(M,u,n,C.scale,C.iterations),y=(f-.5)*C.strength,p=X(l.height+y,s.heightMin,s.heightMax),A=X(p,0,1),G=X(l.rockiness+Math.max(0,f-.55)*C.rockBoost,0,1),x=X((.32-A)*3+(l.moisture-.5)*.2,0,1);w[d][b]={...l,height:p,rockiness:G,water:x},U[d][b]=p,h[d][b]=p*B}}let I=1/0,E=-1/0;for(let d=0;d<=_;d+=1)for(let M=0;M<=_;M+=1){const b=h[d][M];I=Math.min(I,b),E=Math.max(E,b)}for(let d=0;d<_;d+=1){const M=-t+d*v,b=M+v;for(let u=0;u<_;u+=1){const l=-t+u*v,f=l+v,y=h[d][u],p=h[d+1][u],A=h[d][u+1],G=h[d+1][u+1],x=Math.max(Math.abs(p-y),Math.abs(A-y),Math.abs(G-p),Math.abs(G-A)),R=X(x/Math.max(v,.001),0,1),k=w[d][u],H=w[d+1][u],O=w[d][u+1],Z=w[d+1][u+1],ie={height:(k.height+H.height+O.height+Z.height)*.25,heat:(k.heat+H.heat+O.heat+Z.heat)*.25,moisture:(k.moisture+H.moisture+O.moisture+Z.moisture)*.25,rockiness:(k.rockiness+H.rockiness+O.rockiness+Z.rockiness)*.25,water:(k.water+H.water+O.water+Z.water)*.25},V=Jt(ie,R),re=Xe(V),ce=je(V),de=[M,y,l],he=[b,p,l],P=[b,G,f],q=[M,A,f],Y=me(de,he,P),j=me(P,q,de);L(de,he,P,Y,re,0,0,0,ce),L(P,q,de,j,re,0,0,0,ce);const D=Math.max(y,p,A,G);if(z([de,he,P,q],0,D),V===S.Grass&&ie.moisture>.55&&R<.35){const W=(M+b)*.5,Q=(l+f)*.5,$=Re((d+1)*37.9+(u+1)*71.3+n*.17);if($>.72&&ie.water<.2){const K=(y+p+A+G)*.25;T([W,0,Q],K,$)}}}}return{vertices:new Float32Array(m),boxMin:new Float32Array(g),boxMax:new Float32Array(F),treeCount:c.treeMeshCount,minHeight:Number.isFinite(I)?I:0,maxHeight:Number.isFinite(E)?E:0}}function tn(e,n){const t=e.createShaderModule({code:Ut});return e.createRenderPipeline({layout:"auto",vertex:{module:t,entryPoint:"vs_main",buffers:[{arrayStride:44,attributes:[{shaderLocation:0,offset:0,format:"float32x3"},{shaderLocation:1,offset:12,format:"float32x3"},{shaderLocation:2,offset:24,format:"float32x3"},{shaderLocation:3,offset:36,format:"float32"},{shaderLocation:4,offset:40,format:"float32"}]}]},fragment:{module:t,entryPoint:"fs_main",targets:[{format:n}]},primitive:{topology:"triangle-list",cullMode:"none"},depthStencil:{depthWriteEnabled:!0,depthCompare:"less",format:"depth24plus"}})}function nn(e,n){const t=e.createShaderModule({code:Ft});return e.createRenderPipeline({layout:"auto",vertex:{module:t,entryPoint:"vs_main"},fragment:{module:t,entryPoint:"fs_main",targets:[{format:n}]},primitive:{topology:"triangle-list",cullMode:"none"},depthStencil:{depthWriteEnabled:!0,depthCompare:"less",format:"depth24plus"}})}function et(){const e=ne.clientWidth/ne.clientHeight,n=i.orthoScale??10,t=It(-n*e,n*e,-n,n,-80,80),r=[i.radius*Math.cos(i.pitch)*Math.sin(i.yaw),i.radius*Math.sin(i.pitch),i.radius*Math.cos(i.pitch)*Math.cos(i.yaw)],a=Lt(r,[0,.2,0],[0,1,0]),o=Ot(t,a),s=new Float32Array(44);s.set(o,0);const c=[n*.4,n*1.4,n*.6,1.95];s.set(c,16),s.set([r[0],r[1],r[2],1],20),s.set([i.boxCount,i.windStrength,i.windGust,0],24);const m=Fe(i.windDir);s.set([m[0],m[1],m[2],i.time],28),s.set([i.season,i.wetness,i.snow,i.rain],32),i.waterSim?s.set([i.waterSim.origin[0],i.waterSim.origin[1],i.waterSim.invSize,i.waterSim.config.gridSize],36):s.set([0,0,1,1],36),s.set([i.heatmapEnabled?1:0,i.heightMin,i.heightMax,0],40),i.device.queue.writeBuffer(i.uniformBuffer,0,s),i.treeUniformBuffer&&rn(a,o)}function rn(e,n){const t=new Float32Array(36);t.set(n,0);const r=[i.radius*Math.cos(i.pitch)*Math.sin(i.yaw),i.radius*Math.sin(i.pitch),i.radius*Math.cos(i.pitch)*Math.cos(i.yaw)];t.set([r[0],r[1],r[2],1],16),t.set([e[0],e[1],e[2],0],20),t.set([e[4],e[5],e[6],0],24),t.set([i.season,i.windStrength,i.windGust,0],28);const a=Fe(i.windDir);t.set([a[0],a[1],a[2],i.time],32),i.device.queue.writeBuffer(i.treeUniformBuffer,0,t)}function an(){const e=window.devicePixelRatio||1,n=Math.floor(ne.clientWidth*e),t=Math.floor(ne.clientHeight*e);ne.width===n&&ne.height===t||(ne.width=n,ne.height=t,i.context.configure({device:i.device,format:i.contextFormat,alphaMode:"opaque"}),i.depthTexture=i.device.createTexture({size:[n,t],format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT}))}function on(e){i.fpsFrames+=1;const n=e-i.fpsLast;if(n>=500){const t=Math.round(i.fpsFrames*1e3/n);Ie&&(Ie.textContent=`FPS: ${t}`),i.fpsFrames=0,i.fpsLast=e}}function sn(e,n){const t=i.waterSim;if(!t)return;t.updateParams(n);const r=e.beginComputePass();r.setPipeline(t.pipelines.copyGrid),r.setBindGroup(0,t.bindGroupA),r.dispatchWorkgroups(t.gridWorkgroups),r.setPipeline(t.pipelines.clearGrid),r.setBindGroup(0,t.bindGroupA),r.dispatchWorkgroups(t.gridWorkgroups),r.setPipeline(t.pipelines.particlesToGrid),r.setBindGroup(0,t.bindGroupA),r.dispatchWorkgroups(t.particleWorkgroups),r.setPipeline(t.pipelines.normalizeGrid),r.setBindGroup(0,t.bindGroupA),r.dispatchWorkgroups(t.gridWorkgroups),r.setPipeline(t.pipelines.divergence),r.setBindGroup(0,t.bindGroupA),r.dispatchWorkgroups(t.gridWorkgroups),r.setPipeline(t.pipelines.pressure);for(let s=0;s<t.config.pressureIterations;s+=1){const c=s%2===0?t.bindGroupA:t.bindGroupB;r.setBindGroup(0,c),r.dispatchWorkgroups(t.gridWorkgroups)}const o=t.config.pressureIterations%2===1?t.bindGroupA:t.bindGroupB;r.setPipeline(t.pipelines.project),r.setBindGroup(0,o),r.dispatchWorkgroups(t.gridWorkgroups),r.setPipeline(t.pipelines.updateParticles),r.setBindGroup(0,o),r.dispatchWorkgroups(t.particleWorkgroups),r.end()}function tt(e=performance.now()){if(!i.device||!i.pipeline||!i.bindGroup||!i.vertexBuffer)return;i.time=e*.001;const n=Math.min(Math.max(i.time-i.lastSimTime,0),.2),t=i.performance;n>0&&t&&t.sampleFrame(n),on(e),$t(e),an(),et();const r=i.device.createCommandEncoder(),a=Math.min(Math.max(i.time-i.lastSimTime,0),.05);i.lastSimTime=i.time;const o=1/Math.max(i.waterSimRate,1);if(i.waterSim){i.waterSimAccumulator=Math.min(i.waterSimAccumulator+a,o*i.waterSimMaxSteps);let c=0;for(;i.waterSimAccumulator>=o&&c<i.waterSimMaxSteps;)sn(r,o),i.waterSimAccumulator-=o,c+=1}const s=r.beginRenderPass({colorAttachments:[{view:i.context.getCurrentTexture().createView(),clearValue:{r:.05,g:.06,b:.08,a:1},loadOp:"clear",storeOp:"store"}],depthStencilAttachment:{view:i.depthTexture.createView(),depthClearValue:1,depthLoadOp:"clear",depthStoreOp:"store"}});s.setPipeline(i.pipeline),s.setBindGroup(0,i.bindGroup),s.setVertexBuffer(0,i.vertexBuffer),s.draw(i.vertexCount),i.treePipeline&&i.treeBindGroup&&i.treeCount>0&&(s.setPipeline(i.treePipeline),s.setBindGroup(0,i.treeBindGroup),s.draw(60,i.treeCount,0,0)),s.end(),i.device.queue.submit([r.finish()]),requestAnimationFrame(tt)}async function ke(){const e=Number(Ye?.value??1337),n=Number(ye?.value??6);Se&&(Se.textContent=String(n));const t=Ce?.value??"fractal";Me&&(Me.disabled=t!=="fractal");let r,a="";if(t==="fractal"){const c=n*2.6,m=Math.round(X(n*16,36,180));let g=i.fractalAsset;if(be(g,{seed:e,extent:c,gridSize:m})||(g=qt()),be(g,{seed:e,extent:c,gridSize:m})||(g=await Nt()),be(g,{seed:e,extent:c,gridSize:m}))i.fractalAsset=g;else try{g=await $e({seed:e,extent:c,steps:m,heightScale:2.6}),i.fractalAsset=g}catch(F){console.warn("Fractal GPU prepass failed, falling back to CPU.",F),g=null}r=en({seed:e,extent:c,steps:m,heightScale:2.6,prepass:g}),i.orthoScale=X(c*.95,6,40),i.radius=X(c*1.7,12,60),a=`Fractal ${m}x${m}`}else{const c=vt({seed:e,radius:n});r=Kt(c,1,1.2,e),i.orthoScale=X(n*1.8,6,30),i.radius=X(n*2.4,10,40),a=`Hex Cells: ${c.cells.length}`}const o=r.vertices;i.vertexCount=o.length/11,i.boxCount=r.boxMin.length/4,i.heightMin=r.minHeight??0,i.heightMax=r.maxHeight??0,i.treeCount=0,i.treeBindGroup=null,i.treeInstanceBuffer=null,i.vertexBuffer=i.device.createBuffer({size:o.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST}),i.device.queue.writeBuffer(i.vertexBuffer,0,o),i.boxMinBuffer=i.device.createBuffer({size:r.boxMin.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),i.boxMaxBuffer=i.device.createBuffer({size:r.boxMax.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),i.device.queue.writeBuffer(i.boxMinBuffer,0,r.boxMin),i.device.queue.writeBuffer(i.boxMaxBuffer,0,r.boxMax),Ze();const s=Number.isFinite(i.heightMin)&&Number.isFinite(i.heightMax)?`${i.heightMin.toFixed(2)}..${i.heightMax.toFixed(2)}`:"n/a";J(`${a} | Vertices: ${i.vertexCount} | Tree meshes: ${r.treeCount} | Height: ${s}`)}async function ln(){try{if(!ne){J("Canvas element not found.");return}if(!navigator.gpu){J("WebGPU not available in this browser.");return}const e=await navigator.gpu.requestAdapter();if(!e){J("No compatible GPU adapter found.");return}if(i.device=await e.requestDevice(),i.context=ne.getContext("webgpu"),!i.context){J("WebGPU context unavailable on this canvas.");return}i.contextFormat=navigator.gpu.getPreferredCanvasFormat(),i.pipeline=tn(i.device,i.contextFormat),i.treePipeline=nn(i.device,i.contextFormat),i.uniformBuffer=i.device.createBuffer({size:176,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),i.treeUniformBuffer=i.device.createBuffer({size:144,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),Ke(i.waterQualityLevel),ke().catch(n=>{console.error(n),J(`Rebuild failed: ${n?.message??n}`)}),requestAnimationFrame(tt),ne.addEventListener("mousedown",n=>{i.dragging=!0,i.lastX=n.clientX,i.lastY=n.clientY}),window.addEventListener("mouseup",()=>{i.dragging=!1}),window.addEventListener("mousemove",n=>{if(!i.dragging)return;const t=n.clientX-i.lastX,r=n.clientY-i.lastY;i.lastX=n.clientX,i.lastY=n.clientY,i.yaw+=t*.005,i.pitch=X(i.pitch+r*.005,-.1,1.3)}),ne.addEventListener("wheel",n=>{i.orthoScale=X(i.orthoScale+n.deltaY*.01,6,40)}),ye&&ye.addEventListener("input",()=>{Se&&(Se.textContent=ye.value)}),Ce&&Ce.addEventListener("change",()=>{ke().catch(n=>{console.error(n),J(`Rebuild failed: ${n?.message??n}`)})}),He&&He.addEventListener("click",()=>{ke().catch(n=>{console.error(n),J(`Rebuild failed: ${n?.message??n}`)})}),ve&&ve.addEventListener("change",()=>{i.heatmapEnabled=ve.checked,et()}),Me&&Me.addEventListener("click",()=>{Yt().catch(n=>{console.error(n),J(`Bake failed: ${n?.message??n}`)})}),ve&&(ve.checked=i.heatmapEnabled),J("Ready.")}catch(e){console.error(e),J(`Init failed: ${e?.message??e}`)}}ln();
