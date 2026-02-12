(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))i(a);new MutationObserver(a=>{for(const l of a)if(l.type==="childList")for(const s of l.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&i(s)}).observe(document,{childList:!0,subtree:!0});function n(a){const l={};return a.integrity&&(l.integrity=a.integrity),a.referrerPolicy&&(l.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?l.credentials="include":a.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function i(a){if(a.ep)return;a.ep=!0;const l=n(a);fetch(a.href,l)}})();const Bt=3*Math.sqrt(3)/2;function At(e){return Math.sqrt(e/Bt)}function it(e,t,n){const i=n*(Math.sqrt(3)*e+Math.sqrt(3)/2*t),a=n*(1.5*t);return{x:i,y:a}}function kt(e,t=0){const n=[];for(let i=-e;i<=e;i+=1){const a=Math.max(-e,-i-e),l=Math.min(e,-i+e);for(let s=a;s<=l;s+=1)n.push({q:i,r:s,level:t,flags:0})}return n}function Gt(e={}){const t=e.topAreaKm2??1e3,n=e.minAreaM2??10,i=Math.max(2,e.levels??6),a=t*1e6,l=Math.pow(a/n,1/(i-1)),s=[];for(let c=0;c<i;c+=1){const h=a/Math.pow(l,c),_=At(h);s.push({level:c,areaM2:h,sideMeters:_,acrossFlatsMeters:_*Math.sqrt(3)})}return s}const ge={Plains:0,Tundra:1,Savanna:2,River:3,Ice:6,Mountainous:8,Volcanic:9,MixedForest:13},ke={ColdTemperate:1,Temperate:2,Arid:3,Alpine:5,Freshwater:7},f={Grass:0,Dirt:1,Sand:2,Rock:3,Gravel:4,Ice:6,Mud:7,Water:11,Basalt:12},te={Tree:0,Bush:1,GrassTuft:2,Reed:3,Rock:4,Boulder:5,WaterRipple:6,IceSpike:7,Ruin:13,Flower:24},me={Downward:0,Flat:1,Upward:2},at=.2,ot=.8;function Ft(e){return e<at?me.Downward:e>=ot?me.Upward:me.Flat}function $e(e=1337){return{seed:e,scale:.14,warpScale:.5,warpStrength:.75,iterations:64,power:2.2,detailScale:3.2,detailIterations:28,detailPower:2,ridgePower:1.25,heatBias:0,moistureBias:0,macroScale:.035,macroWarpStrength:.18,styleMixStrength:1,terraceSteps:6,terraceStrength:.35,craterStrength:.25,craterScale:.18,heightMin:-.35,heightMax:1.6}}function se(e,t,n){return Math.min(n,Math.max(t,e))}function Ye(e,t,n){const i=se((n-e)/(t-e),0,1);return i*i*(3-2*i)}function _e(e){const t=Math.sin(e)*43758.5453123;return t-Math.floor(t)}function fe(e,t,n,i){let a=0,l=0,s=0;for(;s<n;s+=1){const x=a*a+l*l;if(x>4)break;const v=Math.sqrt(x),z=Math.atan2(l,a),S=Math.pow(v,i);a=S*Math.cos(z*i)+e,l=S*Math.sin(z*i)+t}if(s>=n)return 1;const c=Math.max(Math.sqrt(a*a+l*l),1e-6),h=Math.log2(Math.log(c)),_=(s+1-h)/n;return se(_,0,1)}function Ct(e,t){const i=1/Math.max(1,Math.round(t)),a=se(e,0,1),l=Math.floor(a/i),s=(a-l*i)/i,c=s*s*(3-2*s);return(l+c)*i}function Rt(e,t,n,i){const a=e*n,l=t*n,s=Math.floor(a),c=Math.floor(l),h=a-s,_=l-c,x=s*374761393+c*668265263+i*1442695041,v=_e(x*.17),z=_e(x*.31+17.13),S=_e(x*.47+9.2),N=v,Z=z,U=.22+.25*S,u=h-N,m=_-Z,T=Math.hypot(u,m);return Ye(U,U*.35,T)}function Te(e,t,n){const i=n.seed,a=_e(i*.137+.11)*4-2,l=_e(i*.173+.27)*4-2,s=_e(i*.91+1.1)*6-3,c=_e(i*1.07+2.2)*6-3,h=fe((e+s)*n.warpScale,(t+c)*n.warpScale,Math.max(16,Math.floor(n.iterations*.6)),n.power),_=fe((e-c)*n.warpScale,(t+s)*n.warpScale,Math.max(16,Math.floor(n.iterations*.6)),n.power),x=e+(h-.5)*n.warpStrength,v=t+(_-.5)*n.warpStrength,z=fe(x*n.scale+a,v*n.scale+l,n.iterations,n.power),S=fe(x*n.scale*2.15+a*.6,v*n.scale*2.15+l*.6,Math.max(18,Math.floor(n.iterations*.7)),n.power+.2),N=fe(x*n.scale*n.detailScale+a*1.4,v*n.scale*n.detailScale+l*1.4,n.detailIterations,n.detailPower),Z=1-Math.abs(2*S-1),U=Math.pow(z,.9)*Math.pow(S,1.05)*Math.pow(N,1.1),u=Math.max(12,Math.floor(n.iterations*.35)),m=fe(e*n.macroScale+a*.2,t*n.macroScale+l*.2,u,n.power),T=fe((e+l)*n.macroScale,(t-a)*n.macroScale,u,n.power+.35),w=(m-.5)*n.macroWarpStrength,O=(T-.5)*n.macroWarpStrength,E=fe((e+w)*n.macroScale,(t+O)*n.macroScale,u,n.power),p=se((E-.5)*n.styleMixStrength+.5,0,1),q=Ct(U,n.terraceSteps),F=Rt(e,t,n.craterScale,i),b=se(Math.pow(U,.8)+Math.pow(Z,1.4)*.2,0,1),$=se(U*(1-n.terraceStrength)+q*n.terraceStrength-F*n.craterStrength+Math.pow(Z,1.6)*.12,0,1),V=b*(1-p)+$*p,d=se(z*.38+S*.33+N*.21+p*.08,0,1),A=Ft(d),k=1-Ye(0,at,d),R=Ye(ot,1,d),P=se(1-Math.max(k,R),0,1),I=Math.pow(Z,1.35)*.22,M=(V-.5)*2,W=Math.sign(M)*Math.pow(Math.abs(M),.75),K=(p-.5)*.25,o=se(.5+W*.8+K+I+R*.22-k*.22,n.heightMin,n.heightMax),y=se(o,0,1),B=se(Math.pow(Z,n.ridgePower)*.7+N*.3,0,1),C=se(.55*S+.35*(1-y)+n.heatBias,0,1),G=se(.55*N+.35*(1-y)-(C-.5)*.1+n.moistureBias,0,1),D=se(B*.6+y*.4,0,1),ee=se((.32-y)*3+(G-.5)*.2,0,1),H=fe(x*n.scale*(n.detailScale+1.25)-a*.85,v*n.scale*(n.detailScale+1.25)-l*.85,Math.max(14,Math.floor(n.detailIterations*.9)),n.detailPower+.15),Q=se(H*.58+B*.25+R*.25-G*.16-ee*.2,0,1),g=fe(x*n.scale*(n.detailScale*1.85+.35)+a*1.9,v*n.scale*(n.detailScale*1.85+.35)+l*1.9,Math.max(16,Math.floor(n.detailIterations*1.1)),Math.max(1.6,n.detailPower-.2)),L=se(g*G*(1-ee)*(.35+P*.65)*(1-Q*.82),0,1);return{height:o,cumulativeHeight:d,slopeBand:A,heat:C,moisture:G,roughness:B,rockiness:D,water:ee,featureMask:H,obstacleMask:Q,foliageMask:L,ridge:Z,base:z,detail:N}}function Tt(e){let t=e>>>0;return t^=t>>>17,t=Math.imul(t,3982152891),t^=t>>>11,t=Math.imul(t,2890668881),t^=t>>>15,t=Math.imul(t,830770091),t^=t>>>14,t>>>0}function It(e){return(Tt(e)&16777215)/16777216}function Le(e,t,n){const i=e.q|0,a=e.r|0,l=e.level|0,s=(Math.imul(i,1664525)^Math.imul(a,1013904223)^Math.imul(l,747796405)^t^n)>>>0;return It(s)}function Se(e){return Math.min(1,Math.max(0,e))}function Oe(e){const t=$e(e);return t.heatBias=-.02,t.moistureBias=.08,t}function Et(e){return e.water>.58||e.cumulativeHeight<.14?f.Water:e.heat<.18&&e.water>.36?f.Ice:e.heat<.3&&(e.slopeBand===me.Upward||e.cumulativeHeight>.52)?e.obstacleMask>.58?f.Rock:f.Gravel:e.slopeBand===me.Downward&&e.moisture>.52?f.Mud:e.obstacleMask>.72||e.slopeBand===me.Upward?e.heat>.72?f.Basalt:f.Rock:e.heat>.74&&e.moisture<.32?f.Sand:e.heat>=.32&&e.heat<=.82&&e.moisture>=.34&&e.moisture<=.88&&e.slopeBand===me.Flat&&e.foliageMask>.4?f.Grass:e.moisture>.6?f.Dirt:e.obstacleMask>.5?f.Gravel:f.Dirt}function st(e){return e===f.Grass||e===f.Dirt||e===f.Mud}function Ut(e){return e===f.Rock||e===f.Gravel||e===f.Basalt}function Ze(e,t){const n=e.q-t.q,i=e.r-t.r;return(Math.abs(n)+Math.abs(i)+Math.abs(n+i))*.5}function Ht(e,t,n,i,a,l,s){if(s)return te.Tree;if(e===f.Water)return n>.88&&t.moisture>.64?te.Reed:te.WaterRipple;if(e===f.Ice&&n>.45)return te.IceSpike;if(e===f.Rock||e===f.Gravel||e===f.Basalt)return t.obstacleMask>.85?te.Boulder:te.Rock;if(e===f.Mud&&n>.78)return te.Reed;const c=i<=2,h=i<=1.2;if(c&&t.foliageMask>.48&&t.moisture>.42&&n>.36)return e===f.Mud||n>.7||h?te.Bush:te.GrassTuft;if(i>=3&&a>=2.2&&(e===f.Grass||e===f.Dirt)&&t.moisture>.32&&t.moisture<.76&&t.heat>.28&&t.heat<.82&&n>.9)return te.Flower;const x=Number.isFinite(a)?Se((3.5-a)/3.5):0,v=Se(x*.7+l*.3);if(st(e)&&t.heat>=.3&&t.heat<=.84&&t.moisture>=.28&&t.moisture<=.9&&t.water<.24&&n<.96){const z=Se(.44-v*.24-t.foliageMask*.08+Math.max(0,t.moisture-.75)*.1);if(n>z)return te.GrassTuft}if(t.slopeBand===me.Upward&&t.obstacleMask>.6&&n>.94)return te.Ruin}function Lt(e,t){return e===f.Water?t.heat<.25?ge.Ice:ge.River:e===f.Ice?ge.Ice:t.slopeBand===me.Upward&&t.obstacleMask>.68?t.heat>.72?ge.Volcanic:ge.Mountainous:t.heat<.3?ge.Tundra:t.heat>.74&&t.moisture<.33?ge.Savanna:t.foliageMask>.55&&t.moisture>.45?ge.MixedForest:ge.Plains}function Ot(e){return e.water>.62?ke.Freshwater:e.slopeBand===me.Upward&&e.obstacleMask>.68?ke.Alpine:e.heat>.74&&e.moisture<.33?ke.Arid:e.heat<.3?ke.ColdTemperate:ke.Temperate}function qt(e){const t=(e.terrainSeed??e.seed??1337)>>>0,n=(e.featureSeed??t^2654435769)>>>0,i=(e.foliageSeed??t^2246822507)>>>0,a=Gt({topAreaKm2:e.topAreaKm2??1e3,minAreaM2:e.minAreaM2??10,levels:e.levels??6}),l=a[a.length-1],s=e.radius??6,c=kt(s,l.level),h=Oe(t),_=Oe(n),x=Oe(i),v=c.map(u=>{const m=it(u.q,u.r,1),T=Te(m.x,m.y,h),w=Te(m.x,m.y,_),O=Te(m.x,m.y,x),E={...T,featureMask:w.featureMask,obstacleMask:w.obstacleMask,foliageMask:O.foliageMask},p=Le(u,n,30635),q=Le(u,i,20908),F=Se(p*.65+q*.35),b=Et(E),$=Lt(b,E);return{cell:u,sample:E,variation:F,surface:b,biome:$,macroBiome:Ot(E)}}),z=[];for(let u=0;u<v.length;u+=1){const m=v[u];if(!st(m.surface))continue;const T=Se(.008+m.sample.foliageMask*.03+Math.max(0,m.sample.moisture-.45)*.04-m.sample.obstacleMask*.02),w=Le(m.cell,i,41244);m.sample.heat>.24&&m.sample.heat<.82&&m.sample.moisture>.42&&m.sample.water<.2&&w<T&&z.push(u)}const S=new Set(z),N=[];for(let u=0;u<v.length;u+=1){const m=v[u];(Ut(m.surface)||m.sample.obstacleMask>.72)&&N.push(u)}const Z=4,U=v.map((u,m)=>{const T=S.has(m);let w=Number.POSITIVE_INFINITY;if(T)w=0;else for(const b of z){const $=Ze(u.cell,v[b].cell);$<w&&(w=$)}let O=Number.POSITIVE_INFINITY,E=0;for(const b of N){const $=Ze(u.cell,v[b].cell);$<O&&(O=$),$<=Z&&(E+=1)}const p=Se(E/12),q=Ht(u.surface,u.sample,u.variation,w,O,p,T);return{height:Se(u.sample.height),heat:u.sample.heat,moisture:u.sample.moisture,biome:u.biome,macroBiome:u.macroBiome,surface:u.surface,feature:q,obstacle:u.sample.obstacleMask,foliage:u.sample.foliageMask,slopeBand:u.sample.slopeBand}});return{levelSpec:l,cells:c,terrain:U}}const Wt={targetFps:120,tolerance:6,sampleSize:90,minSampleFraction:.6,cooldownMs:1200,qualitySlew:.05,initialBudget:.5,auto:!0};function Dt(e,t,n){return Math.min(n,Math.max(t,e))}function qe(e){return Dt(e,0,1)}function Nt(e){if(!e.length)return 0;const t=e.slice().sort((i,a)=>i-a),n=Math.floor(t.length/2);return t.length%2===0?(t[n-1]+t[n])*.5:t[n]}function Vt(e={}){const t={...Wt,...e};let n=qe(t.initialBudget),i=0;const a=[],l=S=>{!Number.isFinite(S)||S<=0||(a.push(S),a.length>t.sampleSize&&a.shift())};return{sampleFrame:S=>{!Number.isFinite(S)||S<=0||l(1/S)},sampleFps:l,update:S=>{if(!t.auto)return{budget:n,medianFps:null,miss:null,adjusted:!1,stable:!0};if(S-i<t.cooldownMs)return{budget:n,medianFps:null,miss:null,adjusted:!1,stable:!1};if(a.length<Math.floor(t.sampleSize*t.minSampleFraction))return{budget:n,medianFps:null,miss:null,adjusted:!1,stable:!1};const N=Nt(a),Z=t.targetFps-N,U=t.tolerance;if(Math.abs(Z)<=U)return i=S,{budget:n,medianFps:N,miss:Z,adjusted:!1,stable:!0};const u=Math.min(1,(Math.abs(Z)-U)/U),m=Z>0?-1:1,T=qe(n+m*u*t.qualitySlew),w=T!==n;return n=T,i=S,{budget:n,medianFps:N,miss:Z,adjusted:w,stable:!1}},resetSamples:()=>{a.length=0},setBudget:S=>{n=qe(S)},getBudget:()=>n,setAuto:S=>{t.auto=S},getConfig:()=>({...t})}}function Yt(e,t,n){return Math.min(n,Math.max(t,e))}function jt(e){const t=Math.hypot(e[0],e[1],e[2]);return t===0?[0,1,0]:[e[0]/t,e[1]/t,e[2]/t]}function Qe(e,t,n){const i=[t[0]-e[0],t[1]-e[1],t[2]-e[2]],a=[n[0]-e[0],n[1]-e[1],n[2]-e[2]];return jt([i[1]*a[2]-i[2]*a[1],i[2]*a[0]-i[0]*a[2],i[0]*a[1]-i[1]*a[0]])}function Ke(e,t){return[e[0]*t,e[1]*t,e[2]*t]}function lt(e=1){const t=typeof e=="number"?{size:e}:e,n=t.size??1,i=t.includeGeomorph??!1,a=t.defaultMaterial??0,l=t.foliageMaterial??a,s=[],c=[],h=[];let _=0;const x=i?13:11,v=(u,m,T,w=0,O=a,E)=>{if(s.push(u[0],u[1],u[2],m[0],m[1],m[2],T[0],T[1],T[2],w,O),i){const p=E?.targetY??u[1],q=E?.weight??0;s.push(p,q)}},z=(u,m,T,w,O,E=0,p=E,q=E,F=a,b,$,V)=>{v(u,w,O,E,F,b),v(m,w,O,p,F,$),v(T,w,O,q,F,V)},S=(u,m,T,w,O,E,p=0,q=p,F=p,b=p,$=a,V,d,A,k)=>{z(u,m,T,O,E,p,q,F,$,V,d,A),z(T,w,u,O,E,F,b,p,$,A,k,V)},N=(u,m,T,w,O,E=0,p=0,q=a)=>{const F=[],b=[],$=u[1]+T,V=$+w,d=Math.max(w,.001),A=P=>E+p*Yt((P-$)/d,0,1);for(let P=0;P<6;P+=1){const I=Math.PI/180*(60*P-30),M=u[0]+m*Math.cos(I),W=u[2]+m*Math.sin(I);F.push([M,V,W]),b.push([M,$,W])}const k=[u[0],V,u[2]],R=A(V);for(let P=0;P<6;P+=1){const I=k,M=F[P],W=F[(P+1)%6],K=Qe(I,M,W);z(I,M,W,K,O,R,R,R,q)}for(let P=0;P<6;P+=1){const I=F[P],M=F[(P+1)%6],W=b[P],K=b[(P+1)%6],o=Qe(I,W,K),y=A(I[1]),B=A(M[1]),C=A(W[1]),G=A(K[1]);S(I,W,K,M,o,Ke(O,.85),y,C,G,B,q)}};return{vertices:s,boxMin:c,boxMax:h,vertexStride:x,includeGeomorph:i,addTriangle:z,addQuad:S,addTreeMesh:(u,m,T,w=a)=>{const O=n*(.12+T*.05),E=.5+T*.6,p=n*(.36+T*.18),q=.6+T*.4,F=[.28,.18,.1],b=[.18,.45,.2];N(u,O,m,E,F,.02,.28,w),N([u[0],m+E*.7,u[2]],p,0,q*.55,b,.12,.9,l),N([u[0],m+E+q*.1,u[2]],p*.7,0,q*.35,Ke(b,.95),.2,1.1,l),_+=1},addBounds:(u,m=0,T)=>{const w=u.map(V=>V[0]),O=u.map(V=>V[2]),E=u.map(V=>V[1]),p=Math.min(...w),q=Math.max(...w),F=Math.min(...O),b=Math.max(...O),$=typeof T=="number"?T:Math.max(...E);c.push(p,m,F,0),h.push(q,$,b,0)},get treeMeshCount(){return _}}}const he=globalThis.GPUBufferUsage,Je=globalThis.GPUMapMode,ct=2,Pe=8,Ce={scale:.16,strength:.85,rockBoost:.7};function ut(e){return{version:ct,seed:e.seed,extent:e.extent,gridSize:e.gridSize,heightScale:e.heightScale,sampleStride:Pe,samples:Array.from(e.samples)}}function dt(e){if(!e||typeof e!="object")return null;const t=e;if(t.version!==ct||!Array.isArray(t.samples)||t.sampleStride!==Pe)return null;const n=Number(t.gridSize),i=Number(t.heightScale);if(!Number.isFinite(n)||n<=0||!Number.isFinite(i))return null;const a=(n+1)*(n+1)*Pe;return t.samples.length!==a?null:{seed:Number(t.seed),extent:Number(t.extent),gridSize:n,heightScale:i,samples:new Float32Array(t.samples)}}function Ie(e,t){if(!e||e.seed!==t.seed||e.gridSize!==t.gridSize||Math.abs(e.extent-t.extent)>.001||!Number.isFinite(e.heightScale))return!1;const n=(e.gridSize+1)*(e.gridSize+1)*Pe;return e.samples.length===n}function Xt(e){if(!he||!Je)throw new Error("WebGPU globals not available. Ensure this runs in a WebGPU context.");const{device:t,wgsl:n,gridSize:i}=e,a=i+1,l=a*a,s=l*Pe*4,c=t.createBuffer({size:112,usage:he.UNIFORM|he.COPY_DST}),h=t.createBuffer({size:s,usage:he.STORAGE|he.COPY_SRC}),_=t.createBuffer({size:s,usage:he.STORAGE|he.COPY_SRC}),x=t.createBuffer({size:s,usage:he.COPY_DST|he.MAP_READ}),v=t.createShaderModule({code:n}),z=t.createComputePipeline({layout:"auto",compute:{module:v,entryPoint:"main"}}),S=t.createComputePipeline({layout:"auto",compute:{module:v,entryPoint:"accent_heights"}}),N=t.createBindGroup({layout:z.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:c}},{binding:1,resource:{buffer:h}}]}),Z=t.createBindGroup({layout:S.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:c}},{binding:1,resource:{buffer:_}},{binding:2,resource:{buffer:h}}]}),U=Math.ceil(a/8);return{gridSize:i,gridPoints:a,sampleCount:l,run:async m=>{const w={...$e(m.seed),...m.fieldParams,seed:m.seed},O={...Ce,...m.mandel},E=m.extent*2/i,p=new Float32Array(28);p.set([a,m.extent,E,m.seed],0),p.set([w.scale,w.warpScale,w.warpStrength,w.power],4),p.set([w.detailScale,w.detailPower,w.ridgePower,w.heatBias],8),p.set([w.moistureBias,O.scale,O.strength,O.rockBoost],12),p.set([w.iterations,w.detailIterations,w.macroScale,w.macroWarpStrength],16),p.set([w.styleMixStrength,w.terraceSteps,w.terraceStrength,w.craterStrength],20),p.set([w.craterScale,w.heightMin,w.heightMax,0],24),t.queue.writeBuffer(c,0,p);const q=t.createCommandEncoder(),F=q.beginComputePass();F.setPipeline(z),F.setBindGroup(0,N),F.dispatchWorkgroups(U,U),F.setPipeline(S),F.setBindGroup(0,Z),F.dispatchWorkgroups(U,U),F.end(),q.copyBufferToBuffer(_,0,x,0,s),t.queue.submit([q.finish()]),await x.mapAsync(Je.READ);const b=x.getMappedRange(),$=new Float32Array(b.slice(0));return x.unmap(),{seed:m.seed,extent:m.extent,gridSize:i,heightScale:m.heightScale,samples:$}}}}const $t=`const PI: f32 = 3.1415926535;

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
`,Zt=`const MATERIAL_DEFAULT: u32 = 0u;
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
`,Qt=`struct Scene {
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
`,Kt=`struct TreeUniforms {
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
`,Jt=`struct SimParams {
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
`,en=`struct FractalParams {
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
`,tn=[$t,Zt,Qt].join(`
`),pe=[{name:"Ultra",simRate:90,gridSize:96,particleCount:9e3,pressureIterations:16},{name:"High",simRate:75,gridSize:88,particleCount:7500,pressureIterations:13},{name:"Balanced",simRate:60,gridSize:80,particleCount:6e3,pressureIterations:11},{name:"Performance",simRate:45,gridSize:72,particleCount:4500,pressureIterations:9},{name:"Low",simRate:30,gridSize:64,particleCount:3200,pressureIterations:7}],nn=[],ft="plasius-fractal-asset",ce=document.getElementById("view"),je=document.getElementById("status"),Xe=document.getElementById("mode"),rn=document.getElementById("terrainSeed"),an=document.getElementById("featureSeed"),on=document.getElementById("foliageSeed"),Re=document.getElementById("radius"),Ee=document.getElementById("radiusValue"),et=document.getElementById("regen"),Ue=document.getElementById("bakeFractal"),tt=document.getElementById("fps"),Ge=document.getElementById("heatmapToggle"),r={device:null,context:null,contextFormat:null,pipeline:null,treePipeline:null,waterSim:null,fractalPrepass:null,fractalAsset:null,uniformBuffer:null,treeUniformBuffer:null,bindGroup:null,treeBindGroup:null,depthTexture:null,vertexBuffer:null,vertexCount:0,boxMinBuffer:null,boxMaxBuffer:null,boxCount:0,treeInstanceBuffer:null,treeCount:0,yaw:Math.PI/4,pitch:Math.atan(1/Math.sqrt(2)),radius:20,orthoScale:10,target:[0,.2,0],dragging:!1,dragMode:"orbit",lastX:0,lastY:0,fpsFrames:0,fpsLast:performance.now(),lastSimTime:performance.now()*.001,waterSimRate:60,waterSimMaxSteps:2,waterSimAccumulator:0,waterQualityLevel:2,performance:Vt({targetFps:120,tolerance:6,sampleSize:90,minSampleFraction:.6,cooldownMs:1200,qualitySlew:.05,initialBudget:.5,auto:!0}),time:0,windDir:[.85,0,.52],windStrength:.35,windGust:.25,season:.2,wetness:.18,snow:0,rain:0,heatmapEnabled:!1,heightMin:-1,heightMax:1};function le(e){je&&(je.textContent=e)}function re(e,t,n){return Math.min(n,Math.max(t,e))}function We(e,t){const n=Number(e);return Number.isFinite(n)?Math.max(1,Math.floor(Math.abs(n)))>>>0:t>>>0}function mt(){const e=We(rn?.value,1337),t=We(an?.value,e^2654435769),n=We(on?.value,e^2246822507);return{terrainSeed:e,featureSeed:t,foliageSeed:n}}const ae={Default:0,Grass:1,Water:2,Rock:3,Sand:4,Mud:5,Snow:6,Foliage:7};function sn(e,t,n,i,a,l){const s=1/(e-t),c=1/(n-i),h=1/(a-l);return new Float32Array([-2*s,0,0,0,0,-2*c,0,0,0,0,2*h,0,(e+t)*s,(i+n)*c,(l+a)*h,1])}function ln(e,t,n){const i=e[0]-t[0],a=e[1]-t[1],l=e[2]-t[2];let s=Math.hypot(i,a,l);const c=s>0?i/s:0,h=s>0?a/s:0,_=s>0?l/s:1,x=n[1]*_-n[2]*h,v=n[2]*c-n[0]*_,z=n[0]*h-n[1]*c;s=Math.hypot(x,v,z);const S=s>0?x/s:1,N=s>0?v/s:0,Z=s>0?z/s:0,U=h*Z-_*N,u=_*S-c*Z,m=c*N-h*S;return new Float32Array([S,U,c,0,N,u,h,0,Z,m,_,0,-(S*e[0]+N*e[1]+Z*e[2]),-(U*e[0]+u*e[1]+m*e[2]),-(c*e[0]+h*e[1]+_*e[2]),1])}function cn(e,t){const n=new Float32Array(16);for(let i=0;i<4;i+=1)for(let a=0;a<4;a+=1)n[i*4+a]=e[0+a]*t[i*4+0]+e[4+a]*t[i*4+1]+e[8+a]*t[i*4+2]+e[12+a]*t[i*4+3];return n}function ze(e){const t=Math.hypot(e[0],e[1],e[2]);return t===0?[0,1,0]:[e[0]/t,e[1]/t,e[2]/t]}function nt(e,t){return[e[1]*t[2]-e[2]*t[1],e[2]*t[0]-e[0]*t[2],e[0]*t[1]-e[1]*t[0]]}function Me(e,t,n){const i=[t[0]-e[0],t[1]-e[1],t[2]-e[2]],a=[n[0]-e[0],n[1]-e[1],n[2]-e[2]];return ze([i[1]*a[2]-i[2]*a[1],i[2]*a[0]-i[0]*a[2],i[0]*a[1]-i[1]*a[0]])}function De(e,t){return[e[0]*t,e[1]*t,e[2]*t]}function pt(e){switch(e){case f.Grass:return[.24,.55,.26];case f.Dirt:return[.45,.32,.2];case f.Mud:return[.3,.22,.16];case f.Sand:return[.74,.66,.42];case f.Water:return[.12,.32,.62];case f.Ice:return[.66,.78,.86];case f.Rock:return[.5,.5,.52];case f.Gravel:return[.6,.56,.5];case f.Basalt:return[.32,.32,.35];default:return[.38,.48,.32]}}function gt(e){switch(e){case f.Grass:return ae.Grass;case f.Water:return ae.Water;case f.Rock:case f.Gravel:case f.Basalt:return ae.Rock;case f.Sand:return ae.Sand;case f.Mud:case f.Dirt:return ae.Mud;case f.Ice:return ae.Snow;default:return ae.Default}}function be(e){const t=Math.sin(e)*43758.5453123;return t-Math.floor(t)}function Fe(e,t,n,i=.17,a=18){const l=e*i+n*37e-5,s=t*i-n*21e-5;let c=0,h=0,_=0;for(let x=0;x<a;x+=1){const v=c*c-h*h+l,z=2*c*h+s;if(c=v,h=z,c*c+h*h>4)break;_=x+1}return _/a}function un(){try{const e=window.localStorage.getItem(ft);return e?dt(JSON.parse(e)):null}catch(e){return console.warn("Failed to load baked fractal asset.",e),null}}function dn(e){try{const t=ut(e);window.localStorage.setItem(ft,JSON.stringify(t))}catch(t){console.warn("Failed to store fractal asset.",t)}}function fn(e){const t=ut(e),n=new Blob([JSON.stringify(t)],{type:"application/json"}),i=URL.createObjectURL(n),a=document.createElement("a");a.href=i,a.download=`fractal-asset-${e.seed}-${e.gridSize}.json`,document.body.appendChild(a),a.click(),a.remove(),URL.revokeObjectURL(i)}async function mn(){try{const e=await fetch("./assets/fractal-height.json",{cache:"no-store"});if(!e.ok)return null;const t=await e.json();return dt(t)}catch{return null}}async function ht({seed:e,extent:t,steps:n,heightScale:i}){if(!r.device)throw new Error("GPU device not ready for fractal prepass.");const a=Math.max(8,n);return(!r.fractalPrepass||r.fractalPrepass.gridSize!==a)&&(r.fractalPrepass=Xt({device:r.device,wgsl:en,gridSize:a})),r.fractalPrepass.run({seed:e,extent:t,heightScale:i,mandel:Ce})}async function pn(){const{terrainSeed:e}=mt(),t=Number(Re?.value??6),n=t*2.6,i=Math.round(re(t*16,36,180));le(`Baking fractal asset (terrain ${e})...`);const a=r.fractalAsset&&Ie(r.fractalAsset,{seed:e,extent:n,gridSize:i})?r.fractalAsset:await ht({seed:e,extent:n,steps:i,heightScale:2.6});r.fractalAsset=a,dn(a),fn(a),le(`Fractal asset baked and downloaded (terrain ${e}).`)}function xt(){!r.device||!r.pipeline||!r.uniformBuffer||!r.boxMinBuffer||!r.boxMaxBuffer||(r.bindGroup=r.device.createBindGroup({layout:r.pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:r.uniformBuffer}},{binding:1,resource:{buffer:r.boxMinBuffer}},{binding:2,resource:{buffer:r.boxMaxBuffer}},{binding:3,resource:{buffer:r.waterSim?.gridHeightBuffer??r.boxMinBuffer}}]}))}function gn(e){return pe.length<=1?1:1-e/(pe.length-1)}function hn(e){if(pe.length<=1)return 0;const t=re(e,0,1);return Math.round((1-t)*(pe.length-1))}function vt(){const e=r.performance;if(!e)return;const t=e.getBudget(),n=pe[pe.length-1]?.simRate??35,i=pe[0]?.simRate??90,a=pe.map(c=>c.pressureIterations),l=Math.min(...a,7),s=Math.max(...a,16);r.waterSimRate=Math.round(n+(i-n)*t),r.waterSimMaxSteps=r.waterSimRate>=75?2:3,r.waterSim&&(r.waterSim.config.pressureIterations=Math.round(l+(s-l)*t))}function wt(e,t="",n={}){const{syncBudget:i=!0}=n,a=re(e,0,pe.length-1),l=pe[a];r.waterQualityLevel=a,r.device&&(r.waterSim=vn(r.device,l),r.waterSimAccumulator=0,xt()),r.performance&&(i&&r.performance.setBudget(gn(a)),r.performance.resetSamples()),t&&je&&le(`Water: ${l.name} (${t})`),vt(),r.performance&&yt({budget:r.performance.getBudget(),reason:t})}function yt(e){for(const t of nn)t(e)}function xn(e){const t=r.performance;if(!t)return;const n=t.update(e);if(!n.adjusted||n.medianFps==null||n.miss==null)return;vt(),yt({budget:n.budget,median:n.medianFps,miss:n.miss});const i=hn(n.budget);i!==r.waterQualityLevel&&wt(i,`auto ${Math.round(n.medianFps)}fps`,{syncBudget:!1})}function vn(e,t={}){const n={size:16,gridSize:80,particleCount:6e3,flipRatio:.92,velScale:1e3,weightScale:1024,heightScale:.08,densityScale:3.2,damping:.02,bounce:.35,pressureIterations:11,...t},i=[-n.size*.5,-n.size*.5],a=1/n.size,l=n.gridSize*n.gridSize,s=e.createBuffer({size:64,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),c=e.createBuffer({size:n.particleCount*4*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),h=e.createBuffer({size:l*16,usage:GPUBufferUsage.STORAGE}),_=e.createBuffer({size:l*2*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),x=e.createBuffer({size:l*2*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),v=e.createBuffer({size:l*4,usage:GPUBufferUsage.STORAGE}),z=e.createBuffer({size:l*4,usage:GPUBufferUsage.STORAGE}),S=e.createBuffer({size:l*4,usage:GPUBufferUsage.STORAGE}),N=e.createBuffer({size:l*4,usage:GPUBufferUsage.STORAGE}),Z=new Float32Array(l*2);e.queue.writeBuffer(_,0,Z),e.queue.writeBuffer(x,0,Z);const U=e.createShaderModule({code:Jt}),u=e.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,buffer:{type:"uniform"}},{binding:1,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:2,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:3,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:4,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:5,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:6,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:7,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:8,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}}]}),m=e.createPipelineLayout({bindGroupLayouts:[u]}),T={copyGrid:e.createComputePipeline({layout:m,compute:{module:U,entryPoint:"copy_grid"}}),clearGrid:e.createComputePipeline({layout:m,compute:{module:U,entryPoint:"clear_grid"}}),particlesToGrid:e.createComputePipeline({layout:m,compute:{module:U,entryPoint:"particles_to_grid"}}),normalizeGrid:e.createComputePipeline({layout:m,compute:{module:U,entryPoint:"normalize_grid"}}),divergence:e.createComputePipeline({layout:m,compute:{module:U,entryPoint:"compute_divergence"}}),pressure:e.createComputePipeline({layout:m,compute:{module:U,entryPoint:"pressure_jacobi"}}),project:e.createComputePipeline({layout:m,compute:{module:U,entryPoint:"project_grid"}}),updateParticles:e.createComputePipeline({layout:m,compute:{module:U,entryPoint:"update_particles"}})},w=(V,d)=>[{binding:0,resource:{buffer:s}},{binding:1,resource:{buffer:c}},{binding:2,resource:{buffer:h}},{binding:3,resource:{buffer:_}},{binding:4,resource:{buffer:x}},{binding:5,resource:{buffer:v}},{binding:6,resource:{buffer:V}},{binding:7,resource:{buffer:d}},{binding:8,resource:{buffer:N}}],O=e.createBindGroup({layout:u,entries:w(z,S)}),E=e.createBindGroup({layout:u,entries:w(S,z)}),p=new Float32Array(n.particleCount*4),q=[i[0]+n.size*.5,i[1]+n.size*.5],F=n.size*.45;for(let V=0;V<n.particleCount;V+=1){const d=Math.random()*Math.PI*2,A=Math.sqrt(Math.random())*F,k=q[0]+Math.cos(d)*A,R=q[1]+Math.sin(d)*A,P=(Math.random()-.5)*.15,I=(Math.random()-.5)*.15,M=V*4;p[M]=k,p[M+1]=R,p[M+2]=P,p[M+3]=I}e.queue.writeBuffer(c,0,p);const b=new Float32Array(16),$=V=>{b[0]=i[0],b[1]=i[1],b[2]=a,b[3]=n.gridSize,b[4]=V,b[5]=n.flipRatio,b[6]=n.particleCount,b[7]=0,b[8]=n.velScale,b[9]=n.weightScale,b[10]=n.heightScale,b[11]=n.densityScale,b[12]=n.damping,b[13]=n.bounce,b[14]=0,b[15]=0,e.queue.writeBuffer(s,0,b)};return $(.016),{config:n,origin:i,invSize:a,gridHeightBuffer:N,bindGroupA:O,bindGroupB:E,pipelines:T,updateParams:$,gridWorkgroups:Math.ceil(l/128),particleWorkgroups:Math.ceil(n.particleCount/128)}}function ye(e){return e===f.Water}function Ne(e){return e===f.Rock||e===f.Gravel||e===f.Basalt}function rt(e){return e===f.Grass||e===f.Dirt||e===f.Mud||e===f.Sand}function bt(e){switch(e){case te.Tree:return{height:.9,width:.18,color:[.16,.4,.18],material:ae.Foliage};case te.Bush:return{height:.4,width:.2,color:[.2,.5,.22],material:ae.Foliage};case te.GrassTuft:return{height:.15,width:.12,color:[.3,.62,.28],material:ae.Foliage};case te.Boulder:return{height:.25,width:.2,color:[.45,.45,.48],material:ae.Rock};case te.Rock:return{height:.18,width:.16,color:[.52,.52,.55],material:ae.Rock};case te.Flower:return{height:.16,width:.1,color:[.86,.46,.62],material:ae.Foliage};default:return null}}function wn(e,t=1,n=1.2,i={terrainSeed:1337,featureSeed:4242,foliageSeed:7331}){const a=i?.terrainSeed??1337,l=i?.foliageSeed??7331,s=new Map,c=new Map,h=new Map,_=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]],x=.52*n,v=(d,A)=>`${d},${A}`;e.cells.forEach((d,A)=>{const k=e.terrain[A].height*n;s.set(v(d.q,d.r),k),h.set(v(d.q,d.r),e.terrain[A].surface??f.Grass)}),e.cells.forEach(d=>{const A=v(d.q,d.r),k=s.get(A)??0,R=h.get(A)??f.Grass;let P=k;if(ye(R)){let I=1/0,M=!1;_.forEach(W=>{const K=s.get(v(d.q+W[0],d.r+W[1]));typeof K=="number"&&(I=Math.min(I,K),M=!0)}),M&&(P=Math.min(k,I-.08*n),P=Math.max(0,P))}else Ne(R)&&(P=k+.06*n);c.set(A,P)});const z=d=>{const A=new Map;return e.cells.forEach(k=>{const R=v(k.q,k.r);let I=(d.get(R)??0)*1.6,M=1.6;_.forEach(W=>{const K=d.get(v(k.q+W[0],k.r+W[1]));typeof K=="number"&&(I+=K,M+=1)}),A.set(R,I/M)}),A},S=z(c),N=z(S),U=(d=>{const A=new Map,k=1/Math.max(n,.001);return e.cells.forEach(R=>{const P=v(R.q,R.r),M=(d.get(P)??0)*k;let W=0,K=0;_.forEach(G=>{const D=d.get(v(R.q+G[0],R.r+G[1]));typeof D=="number"&&(W+=D*k,K+=1)});const o=K>0?W/K:M,y=M-o,B=Math.max(0,y),C=re(M+y*1.25+B*.2,-.2,1.4);A.set(P,C*n)}),A})(N);let u=1/0,m=-1/0;for(const d of U.values())u=Math.min(u,d),m=Math.max(m,d);for(const d of c.values())u=Math.min(u,d),m=Math.max(m,d);const T=lt({size:t,defaultMaterial:ae.Default,foliageMaterial:ae.Foliage}),{vertices:w,boxMin:O,boxMax:E,addTriangle:p,addQuad:q,addTreeMesh:F,addBounds:b}=T,$=(d,A,k,R,P)=>{const I=[],M=[],W=[],K=[],o=[],y=[],B=[],C=v(d.q,d.r),G=h.get(C)??f.Grass,D=ye(G),ee=D?0:(be(d.q*19.13+d.r*27.91+a*.13)-.5)*n*.04;for(let g=0;g<6;g+=1){const L=_[g],Y=d.q+L[0],j=d.r+L[1],J=v(Y,j),X=h.get(J)??G,ne=(ye(X)?c.get(J):U.get(J))??null,ie=ye(G)||ye(X),oe=Ne(G)||Ne(X),ue=rt(G)||rt(X);if(ne==null)o[g]=k;else{let we=G===X?.55:.7;ie?we=oe?.4:ue?.78:.6:oe?we=.45:ue&&(we=.8),o[g]=k*(1-we)+ne*we}let de=x;oe?de=x*.6:ie&&ue?de=x*1.6:ie?de=x*1.4:ue&&(de=x*1.3),B[g]=de;const xe=Math.min(d.q,Y),Be=Math.min(d.r,j),ve=Math.max(d.q,Y),Ae=Math.max(d.r,j),He=xe*127.1+Be*311.7+ve*74.7+Ae*19.19+G*17.17+X*37.31+a*.71+g*11.3;y[g]=be(He)*2-1}for(let g=0;g<6;g+=1){const L=Math.PI/180*(60*g-30),Y=A[0]+t*Math.cos(L),j=A[2]+t*Math.sin(L),J=(o[g]+o[(g+5)%6])*.5,X=(y[g]+y[(g+5)%6])*.5,ne=D?k:k*.3+J*.7+X*n*.04,ie=t*(.62+X*.04),oe=D?k:k*.4+J*.6+X*n*.08,ue=A[0]+ie*Math.cos(L),de=A[2]+ie*Math.sin(L);I.push([Y,ne,j]),M.push([ue,oe,de]),W.push(ne),K.push(oe)}const H=[A[0],k+ee,A[2]];for(let g=0;g<6;g+=1){const L=H,Y=M[g],j=M[(g+1)%6],J=Me(L,Y,j);p(L,Y,j,J,R,0,0,0,P)}for(let g=0;g<6;g+=1){const L=I[g],Y=I[(g+1)%6],j=M[g],J=M[(g+1)%6],X=Me(L,j,J);q(L,j,J,Y,X,De(R,.92),0,0,0,0,P)}for(let g=0;g<6;g+=1){const L=_[g],Y=v(d.q+L[0],d.r+L[1]),j=h.get(Y)??G,J=(ye(j)?c.get(Y):U.get(Y))??null,X=I[g],ne=I[(g+1)%6];if(J==null){const ie=[X[0],0,X[2]],oe=[ne[0],0,ne[2]],ue=Me(X,ie,oe);q(X,ie,oe,ne,ue,De(R,.7),0,0,0,0,P);continue}if(k>J+B[g]){const ie=[X[0],J,X[2]],oe=[ne[0],J,ne[2]],ue=Me(X,ie,oe);q(X,ie,oe,ne,ue,De(R,.65),0,0,0,0,P)}}const Q=Math.max(...W,...K,k+ee);b(I.concat(M),0,Q)},V=(d,A,k)=>{const R=bt(k);if(!R)return;const P=A,I=A+R.height,M=R.width,W=R.color,K=R.material??ae.Default,o=[[d[0]-M,P,d[2]],[d[0]+M,P,d[2]],[d[0]+M,I,d[2]],[d[0]-M,I,d[2]]],y=[[d[0],P,d[2]-M],[d[0],P,d[2]+M],[d[0],I,d[2]+M],[d[0],I,d[2]-M]];q(o[0],o[1],o[2],o[3],[0,0,1],W,0,0,0,0,K),q(y[0],y[1],y[2],y[3],[1,0,0],W,0,0,0,0,K)};return e.cells.forEach((d,A)=>{const k=e.terrain[A],R=it(d.q,d.r,t),P=v(d.q,d.r),I=k.surface??f.Grass,M=U.get(P)??k.height*n,W=ye(I)?c.get(P)??M:M,K=pt(I),o=gt(I);if($(d,[R.x,0,R.y],W,K,o),k.feature===te.Tree){const y=Math.sin(d.q*12.989+d.r*78.233+l*.173)*43758.5453%1;F([R.x,0,R.y],W,Math.abs(y))}else k.feature!==void 0&&V([R.x,0,R.y],W,k.feature)}),{vertices:new Float32Array(w),boxMin:new Float32Array(O),boxMax:new Float32Array(E),treeCount:T.treeMeshCount,minHeight:Number.isFinite(u)?u:0,maxHeight:Number.isFinite(m)?m:0}}function yn(e,t,n,i){if(e.water>.58||e.height<.16)return f.Water;if(e.heat<.18&&e.water>.34)return f.Ice;const a=e.rockiness*.8+t*.45+n*.35;return e.heat<.3&&(e.height>.52||t>.42)?a>.58?f.Rock:f.Gravel:a>.72?f.Rock:e.heat>.7&&e.moisture<.35?n>.6?f.Gravel:f.Sand:e.moisture>.7&&e.height<.35?f.Mud:i>.58&&e.moisture>.42&&e.heat>=.34&&e.heat<=.82&&t<.5?f.Grass:e.moisture>.58?f.Dirt:f.Gravel}function bn(e){const{terrainSeed:t,featureSeed:n,foliageSeed:i,extent:a,steps:l,heightScale:s,prepass:c}=e,h=$e(t),_=lt({size:1,defaultMaterial:ae.Default,foliageMaterial:ae.Foliage}),{vertices:x,boxMin:v,boxMax:z,addTriangle:S,addQuad:N,addTreeMesh:Z,addBounds:U}=_,u=[],m=o=>o===f.Grass||o===f.Dirt||o===f.Mud,T=o=>o===f.Grass||o===f.Dirt,w=o=>o===f.Rock||o===f.Gravel||o===f.Basalt,O=(o,y,B,C=.5)=>{const G=bt(B);if(!G)return;const D=.18+C*.2,ee=G.height*(.8+C*.4),H=G.width*(.7+C*.45),Q=y,g=y+ee,L=G.material??ae.Foliage,Y=[[o[0]-H,Q,o[2]],[o[0]+H,Q,o[2]],[o[0]+H,g,o[2]],[o[0]-H,g,o[2]]],j=[[o[0],Q,o[2]-H],[o[0],Q,o[2]+H],[o[0],g,o[2]+H],[o[0],g,o[2]-H]];if(N(Y[0],Y[1],Y[2],Y[3],[0,0,1],G.color,D*.2,D*.2,D,D,L),N(j[0],j[1],j[2],j[3],[1,0,0],G.color,D*.2,D*.2,D,D,L),B===te.Flower){const J=g-ee*.35,X=g,ne=H*.9,ie=[.78+.2*be(C*19.3+.12),.42+.38*be(C*11.1+.37),.5+.4*be(C*7.7+.61)].map(oe=>re(oe,0,1));N([o[0]-ne,J,o[2]],[o[0]+ne,J,o[2]],[o[0]+ne,X,o[2]],[o[0]-ne,X,o[2]],[0,0,1],ie,D,D,D,D,L)}},E={scale:Ce.scale,iterations:18,strength:Ce.strength,rockBoost:Ce.rockBoost},p=c?.gridSize??Math.max(8,l),q=c&&Number.isFinite(c.heightScale)?c.heightScale:s,F=a*2/p,b=Array.from({length:p+1},()=>new Array(p+1)),$=Array.from({length:p+1},()=>new Array(p+1)),V=Array.from({length:p+1},()=>new Array(p+1));if(c&&c.samples){const o=p+1;for(let y=0;y<=p;y+=1)for(let B=0;B<=p;B+=1){const C=-a+y*F,G=-a+B*F,D=Fe(C+17.3,G-11.6,n,.14,14),ee=Fe(C-9.4,G+15.2,i,.12,16),H=(B*o+y)*Pe,Q=c.samples[H],g=c.samples[H+1],L=c.samples[H+2],Y=c.samples[H+3],j=c.samples[H+4];V[y][B]={height:Q,heat:g,moisture:L,rockiness:Y,water:j,roughness:Y,ridge:c.samples[H+5],base:c.samples[H+6],detail:c.samples[H+7],featureSignal:D,foliageSignal:ee},$[y][B]=Q,b[y][B]=Q*q}}else for(let o=0;o<=p;o+=1){const y=-a+o*F;for(let B=0;B<=p;B+=1){const C=-a+B*F,G=Te(y,C,h),D=Fe(y,C,t,E.scale,E.iterations),ee=Fe(y+17.3,C-11.6,n,.14,14),H=Fe(y-9.4,C+15.2,i,.12,16),Q=(D-.5)*E.strength,g=re(G.height+Q,h.heightMin,h.heightMax),L=re(g,0,1),Y=re(G.rockiness+Math.max(0,D-.55)*E.rockBoost,0,1),j=re((.32-L)*3+(G.moisture-.5)*.2,0,1);V[o][B]={...G,height:g,rockiness:Y,water:j,featureSignal:ee,foliageSignal:H},$[o][B]=g,b[o][B]=g*q}}let d=1/0,A=-1/0;for(let o=0;o<=p;o+=1)for(let y=0;y<=p;y+=1){const B=b[o][y];d=Math.min(d,B),A=Math.max(A,B)}for(let o=0;o<p;o+=1){const y=-a+o*F,B=y+F;for(let C=0;C<p;C+=1){const G=-a+C*F,D=G+F,ee=b[o][C],H=b[o+1][C],Q=b[o][C+1],g=b[o+1][C+1],L=Math.max(Math.abs(H-ee),Math.abs(Q-ee),Math.abs(g-H),Math.abs(g-Q)),Y=re(L/Math.max(F,.001),0,1),j=V[o][C],J=V[o+1][C],X=V[o][C+1],ne=V[o+1][C+1],ie={height:(j.height+J.height+X.height+ne.height)*.25,heat:(j.heat+J.heat+X.heat+ne.heat)*.25,moisture:(j.moisture+J.moisture+X.moisture+ne.moisture)*.25,rockiness:(j.rockiness+J.rockiness+X.rockiness+ne.rockiness)*.25,water:(j.water+J.water+X.water+ne.water)*.25,featureSignal:(j.featureSignal+J.featureSignal+X.featureSignal+ne.featureSignal)*.25,foliageSignal:(j.foliageSignal+J.foliageSignal+X.foliageSignal+ne.foliageSignal)*.25},oe=yn(ie,Y,ie.featureSignal,ie.foliageSignal),ue=pt(oe),de=gt(oe),xe=[y,ee,G],Be=[B,H,G],ve=[B,g,D],Ae=[y,Q,D],He=Me(xe,Be,ve),we=Me(ve,Ae,xe);S(xe,Be,ve,He,ue,0,0,0,de),S(ve,Ae,xe,we,ue,0,0,0,de);const Mt=Math.max(ee,H,Q,g);U([xe,Be,ve,Ae],0,Mt);const zt=(y+B)*.5,Pt=(G+D)*.5;u.push({i:o,j:C,centerX:zt,centerZ:Pt,baseHeight:(ee+H+Q+g)*.25,slope:Y,surface:oe,sample:ie})}}const k=Array.from({length:p},()=>Array.from({length:p},()=>!1)),R=[],P=Math.max(24,Math.floor(p*p*.02));for(const o of u){if(R.length>=P)break;if(!m(o.surface)||o.sample.water>.2||o.slope>.55||o.sample.heat<.28||o.sample.heat>.82||o.sample.moisture<.4)continue;const y=re(.008+o.sample.foliageSignal*.028+Math.max(0,o.sample.moisture-.45)*.035-o.slope*.02,.004,.055),B=be((o.i+1)*37.9+(o.j+1)*71.3+i*.17+t*.031);B<y&&(k[o.i][o.j]=!0,R.push(o),Z([o.centerX,0,o.centerZ],o.baseHeight,B))}const I=Array.from({length:p},()=>Array.from({length:p},()=>!1));for(const o of u)(w(o.surface)||o.sample.rockiness>.58||o.sample.featureSignal>.66)&&(I[o.i][o.j]=!0);const M=(o,y,B,C=4)=>{let G=Number.POSITIVE_INFINITY,D=0;for(let ee=-C;ee<=C;ee+=1){const H=y+ee;if(!(H<0||H>=p))for(let Q=-C;Q<=C;Q+=1){const g=B+Q;if(g<0||g>=p||!o[H][g])continue;const L=Math.hypot(ee,Q);G=Math.min(G,L),D+=1}}return{nearest:G,count:D}};let W=0;const K=Math.floor(p*p*.2);for(const o of u){if(W>=K)break;if(k[o.i][o.j]||!m(o.surface))continue;const y=M(k,o.i,o.j),B=M(I,o.i,o.j,5),C=y.nearest<=2,G=y.nearest<=1.2,D=!Number.isFinite(y.nearest)||y.nearest>=3,ee=B.nearest<=2.5,H=Number.isFinite(B.nearest)?re((3.5-B.nearest)/3.5,0,1):0,Q=re(B.count/18,0,1),g=H*.68+Q*.32,L=be((o.i+1)*29.7+(o.j+1)*53.1+n*.13+i*.07+o.sample.featureSignal*17.3-o.sample.foliageSignal*9.1);if(C&&o.sample.moisture>.38&&o.sample.foliageSignal>.4&&o.sample.heat>.3&&o.sample.heat<.82){const Y=re(.08+o.sample.foliageSignal*.2-o.slope*.1,.03,.34);if(L<Y){const j=o.surface===f.Mud||G?te.Bush:te.GrassTuft;O([o.centerX,0,o.centerZ],o.baseHeight,j,L),W+=1;continue}}if(D&&B.nearest>2.2&&T(o.surface)&&o.sample.moisture>.3&&o.sample.moisture<.78&&o.sample.heat>.32&&o.sample.heat<.84&&o.sample.water<.12){const Y=re(.012+(1-o.sample.featureSignal)*.03+o.sample.foliageSignal*.02,.008,.06);if(L<Y){O([o.centerX,0,o.centerZ],o.baseHeight,te.Flower,L),W+=1;continue}}if(m(o.surface)&&o.sample.heat>.3&&o.sample.heat<.86&&o.sample.moisture>.28&&o.sample.moisture<.9&&o.sample.water<.24&&(o.surface!==f.Mud||o.sample.moisture<.82)){const Y=re(.01+o.sample.foliageSignal*.03+g*.18+(ee?.04:0)-o.slope*.035,.008,.3);L<Y&&(O([o.centerX,0,o.centerZ],o.baseHeight,te.GrassTuft,L),W+=1)}}return{vertices:new Float32Array(x),boxMin:new Float32Array(v),boxMax:new Float32Array(z),treeCount:_.treeMeshCount,minHeight:Number.isFinite(d)?d:0,maxHeight:Number.isFinite(A)?A:0}}function _n(e,t){const n=e.createShaderModule({code:tn});return e.createRenderPipeline({layout:"auto",vertex:{module:n,entryPoint:"vs_main",buffers:[{arrayStride:44,attributes:[{shaderLocation:0,offset:0,format:"float32x3"},{shaderLocation:1,offset:12,format:"float32x3"},{shaderLocation:2,offset:24,format:"float32x3"},{shaderLocation:3,offset:36,format:"float32"},{shaderLocation:4,offset:40,format:"float32"}]}]},fragment:{module:n,entryPoint:"fs_main",targets:[{format:t}]},primitive:{topology:"triangle-list",cullMode:"none"},depthStencil:{depthWriteEnabled:!0,depthCompare:"less",format:"depth24plus"}})}function Sn(e,t){const n=e.createShaderModule({code:Kt});return e.createRenderPipeline({layout:"auto",vertex:{module:n,entryPoint:"vs_main"},fragment:{module:n,entryPoint:"fs_main",targets:[{format:t}]},primitive:{topology:"triangle-list",cullMode:"none"},depthStencil:{depthWriteEnabled:!0,depthCompare:"less",format:"depth24plus"}})}function _t(){const e=ce.clientWidth/ce.clientHeight,t=r.orthoScale??10,n=sn(-t*e,t*e,-t,t,-80,80),i=r.target??[0,.2,0],a=[i[0]+r.radius*Math.cos(r.pitch)*Math.sin(r.yaw),i[1]+r.radius*Math.sin(r.pitch),i[2]+r.radius*Math.cos(r.pitch)*Math.cos(r.yaw)],l=ln(a,i,[0,1,0]),s=cn(n,l),c=new Float32Array(44);c.set(s,0);const h=[t*.4,t*1.4,t*.6,1.95];c.set(h,16),c.set([a[0],a[1],a[2],1],20),c.set([r.boxCount,r.windStrength,r.windGust,0],24);const _=ze(r.windDir);c.set([_[0],_[1],_[2],r.time],28),c.set([r.season,r.wetness,r.snow,r.rain],32),r.waterSim?c.set([r.waterSim.origin[0],r.waterSim.origin[1],r.waterSim.invSize,r.waterSim.config.gridSize],36):c.set([0,0,1,1],36),c.set([r.heatmapEnabled?1:0,r.heightMin,r.heightMax,0],40),r.device.queue.writeBuffer(r.uniformBuffer,0,c),r.treeUniformBuffer&&Mn(l,s,a)}function Mn(e,t,n){const i=new Float32Array(36);i.set(t,0),i.set([n[0],n[1],n[2],1],16),i.set([e[0],e[1],e[2],0],20),i.set([e[4],e[5],e[6],0],24),i.set([r.season,r.windStrength,r.windGust,0],28);const a=ze(r.windDir);i.set([a[0],a[1],a[2],r.time],32),r.device.queue.writeBuffer(r.treeUniformBuffer,0,i)}function zn(){const e=window.devicePixelRatio||1,t=Math.floor(ce.clientWidth*e),n=Math.floor(ce.clientHeight*e);ce.width===t&&ce.height===n||(ce.width=t,ce.height=n,r.context.configure({device:r.device,format:r.contextFormat,alphaMode:"opaque"}),r.depthTexture=r.device.createTexture({size:[t,n],format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT}))}function Pn(e){r.fpsFrames+=1;const t=e-r.fpsLast;if(t>=500){const n=Math.round(r.fpsFrames*1e3/t);tt&&(tt.textContent=`FPS: ${n}`),r.fpsFrames=0,r.fpsLast=e}}function Bn(e,t){const n=r.waterSim;if(!n)return;n.updateParams(t);const i=e.beginComputePass();i.setPipeline(n.pipelines.copyGrid),i.setBindGroup(0,n.bindGroupA),i.dispatchWorkgroups(n.gridWorkgroups),i.setPipeline(n.pipelines.clearGrid),i.setBindGroup(0,n.bindGroupA),i.dispatchWorkgroups(n.gridWorkgroups),i.setPipeline(n.pipelines.particlesToGrid),i.setBindGroup(0,n.bindGroupA),i.dispatchWorkgroups(n.particleWorkgroups),i.setPipeline(n.pipelines.normalizeGrid),i.setBindGroup(0,n.bindGroupA),i.dispatchWorkgroups(n.gridWorkgroups),i.setPipeline(n.pipelines.divergence),i.setBindGroup(0,n.bindGroupA),i.dispatchWorkgroups(n.gridWorkgroups),i.setPipeline(n.pipelines.pressure);for(let s=0;s<n.config.pressureIterations;s+=1){const c=s%2===0?n.bindGroupA:n.bindGroupB;i.setBindGroup(0,c),i.dispatchWorkgroups(n.gridWorkgroups)}const l=n.config.pressureIterations%2===1?n.bindGroupA:n.bindGroupB;i.setPipeline(n.pipelines.project),i.setBindGroup(0,l),i.dispatchWorkgroups(n.gridWorkgroups),i.setPipeline(n.pipelines.updateParticles),i.setBindGroup(0,l),i.dispatchWorkgroups(n.particleWorkgroups),i.end()}function St(e=performance.now()){if(!r.device||!r.pipeline||!r.bindGroup||!r.vertexBuffer)return;r.time=e*.001;const t=Math.min(Math.max(r.time-r.lastSimTime,0),.2),n=r.performance;t>0&&n&&n.sampleFrame(t),Pn(e),xn(e),zn(),_t();const i=r.device.createCommandEncoder(),a=Math.min(Math.max(r.time-r.lastSimTime,0),.05);r.lastSimTime=r.time;const l=1/Math.max(r.waterSimRate,1);if(r.waterSim){r.waterSimAccumulator=Math.min(r.waterSimAccumulator+a,l*r.waterSimMaxSteps);let c=0;for(;r.waterSimAccumulator>=l&&c<r.waterSimMaxSteps;)Bn(i,l),r.waterSimAccumulator-=l,c+=1}const s=i.beginRenderPass({colorAttachments:[{view:r.context.getCurrentTexture().createView(),clearValue:{r:.05,g:.06,b:.08,a:1},loadOp:"clear",storeOp:"store"}],depthStencilAttachment:{view:r.depthTexture.createView(),depthClearValue:1,depthLoadOp:"clear",depthStoreOp:"store"}});s.setPipeline(r.pipeline),s.setBindGroup(0,r.bindGroup),s.setVertexBuffer(0,r.vertexBuffer),s.draw(r.vertexCount),r.treePipeline&&r.treeBindGroup&&r.treeCount>0&&(s.setPipeline(r.treePipeline),s.setBindGroup(0,r.treeBindGroup),s.draw(60,r.treeCount,0,0)),s.end(),r.device.queue.submit([i.finish()]),requestAnimationFrame(St)}function An(e,t){const n=r.target??[0,.2,0],i=[n[0]+r.radius*Math.cos(r.pitch)*Math.sin(r.yaw),n[1]+r.radius*Math.sin(r.pitch),n[2]+r.radius*Math.cos(r.pitch)*Math.cos(r.yaw)],a=ze([n[0]-i[0],n[1]-i[1],n[2]-i[2]]),l=ze(nt(a,[0,1,0])),s=ze(nt(l,a)),c=Math.max(1,ce.clientHeight),h=r.orthoScale*2/c,_=-e*h,x=t*h;n[0]+=l[0]*_+s[0]*x,n[1]+=l[1]*_+s[1]*x,n[2]+=l[2]*_+s[2]*x,r.target=n}async function Ve(){const e=mt(),{terrainSeed:t,featureSeed:n,foliageSeed:i}=e,a=Number(Re?.value??6);Ee&&(Ee.textContent=String(a));const l=Xe?.value??"fractal";Ue&&(Ue.disabled=l!=="fractal");let s,c="";if(l==="fractal"){const x=a*2.6,v=Math.round(re(a*16,36,180));let z=r.fractalAsset;if(Ie(z,{seed:t,extent:x,gridSize:v})||(z=un()),Ie(z,{seed:t,extent:x,gridSize:v})||(z=await mn()),Ie(z,{seed:t,extent:x,gridSize:v}))r.fractalAsset=z;else try{z=await ht({seed:t,extent:x,steps:v,heightScale:2.6}),r.fractalAsset=z}catch(S){console.warn("Fractal GPU prepass failed, falling back to CPU.",S),z=null}s=bn({terrainSeed:t,featureSeed:n,foliageSeed:i,extent:x,steps:v,heightScale:2.6,prepass:z}),r.orthoScale=re(x*.95,6,40),r.radius=re(x*1.7,12,60),c=`Fractal ${v}x${v} (T:${t} F:${n} G:${i})`}else{const x=qt({terrainSeed:t,featureSeed:n,foliageSeed:i,radius:a});s=wn(x,1,1.2,e),r.orthoScale=re(a*1.8,6,30),r.radius=re(a*2.4,10,40),c=`Hex Cells: ${x.cells.length} (T:${t} F:${n} G:${i})`}const h=s.vertices;r.vertexCount=h.length/11,r.boxCount=s.boxMin.length/4,r.heightMin=s.minHeight??0,r.heightMax=s.maxHeight??0,r.treeCount=0,r.treeBindGroup=null,r.treeInstanceBuffer=null,r.vertexBuffer=r.device.createBuffer({size:h.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST}),r.device.queue.writeBuffer(r.vertexBuffer,0,h),r.boxMinBuffer=r.device.createBuffer({size:s.boxMin.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),r.boxMaxBuffer=r.device.createBuffer({size:s.boxMax.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),r.device.queue.writeBuffer(r.boxMinBuffer,0,s.boxMin),r.device.queue.writeBuffer(r.boxMaxBuffer,0,s.boxMax),xt();const _=Number.isFinite(r.heightMin)&&Number.isFinite(r.heightMax)?`${r.heightMin.toFixed(2)}..${r.heightMax.toFixed(2)}`:"n/a";le(`${c} | Vertices: ${r.vertexCount} | Tree meshes: ${s.treeCount} | Height: ${_}`)}async function kn(){try{if(!ce){le("Canvas element not found.");return}if(!navigator.gpu){le("WebGPU not available in this browser.");return}const e=await navigator.gpu.requestAdapter();if(!e){le("No compatible GPU adapter found.");return}if(r.device=await e.requestDevice(),r.context=ce.getContext("webgpu"),!r.context){le("WebGPU context unavailable on this canvas.");return}r.contextFormat=navigator.gpu.getPreferredCanvasFormat(),r.pipeline=_n(r.device,r.contextFormat),r.treePipeline=Sn(r.device,r.contextFormat),r.uniformBuffer=r.device.createBuffer({size:176,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),r.treeUniformBuffer=r.device.createBuffer({size:144,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),wt(r.waterQualityLevel),Ve().catch(t=>{console.error(t),le(`Rebuild failed: ${t?.message??t}`)}),requestAnimationFrame(St),ce.addEventListener("contextmenu",t=>{t.preventDefault()}),ce.addEventListener("mousedown",t=>{t.preventDefault(),r.dragging=!0,r.lastX=t.clientX,r.lastY=t.clientY,r.dragMode=t.shiftKey||t.button===1||t.button===2?"truck":"orbit"}),window.addEventListener("mouseup",()=>{r.dragging=!1}),window.addEventListener("mousemove",t=>{if(!r.dragging)return;const n=t.clientX-r.lastX,i=t.clientY-r.lastY;r.lastX=t.clientX,r.lastY=t.clientY,r.dragMode==="truck"?An(n,i):(r.yaw+=n*.005,r.pitch=re(r.pitch+i*.005,-.1,1.3))}),ce.addEventListener("wheel",t=>{t.preventDefault();const n=Math.pow(1.0015,t.deltaY);r.orthoScale=re(r.orthoScale*n,6,40)},{passive:!1}),Re&&Re.addEventListener("input",()=>{Ee&&(Ee.textContent=Re.value)}),Xe&&Xe.addEventListener("change",()=>{Ve().catch(t=>{console.error(t),le(`Rebuild failed: ${t?.message??t}`)})}),et&&et.addEventListener("click",()=>{Ve().catch(t=>{console.error(t),le(`Rebuild failed: ${t?.message??t}`)})}),Ge&&Ge.addEventListener("change",()=>{r.heatmapEnabled=Ge.checked,_t()}),Ue&&Ue.addEventListener("click",()=>{pn().catch(t=>{console.error(t),le(`Bake failed: ${t?.message??t}`)})}),Ge&&(Ge.checked=r.heatmapEnabled),le("Ready.")}catch(e){console.error(e),le(`Init failed: ${e?.message??e}`)}}kn();
