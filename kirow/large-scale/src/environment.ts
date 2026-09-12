import * as T from 'three';

// Scenery and lighting are display aids. They are not included in the parts inventory.
export function createEnvironment(scene: T.Scene, renderer: T.WebGLRenderer, mobile: boolean) {
  const sunPosition = new T.Vector3(-186, 24, -114), sunDirection = sunPosition.clone().normalize();
  function sky(evening: boolean) {
    const width = 768, height = 384, pixels = new Float32Array(width * height * 4);
    const zenith = new T.Color('#6bb0dc'), horizon = new T.Color('#b8d9e9');
    const white = new T.Color('#ffffff'), ground = new T.Color('#665542');
    const glow = new T.Color('#ffd39a'), disc = new T.Color('#fff1c4');
    const bands = [
      { height: 0, color: new T.Color('#ffc986') }, { height: .035, color: new T.Color('#f69b85') },
      { height: .075, color: new T.Color('#dab0bc') }, { height: .14, color: new T.Color('#91abc8') },
      { height: 1, color: new T.Color('#5c8eb8') }
    ];
    const color = new T.Color();
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const u = x / width, v = 1 - y / height, altitude = Math.cos(v * Math.PI);
      color.copy(horizon).lerp(zenith, Math.pow(Math.max(0, altitude), .42));
      if (evening) {
        const h = Math.max(0, altitude), index = Math.max(1, bands.findIndex(stop => stop.height >= h));
        color.copy(bands[index - 1].color).lerp(bands[index].color, T.MathUtils.smoothstep(h, bands[index - 1].height, bands[index].height));
        if (altitude < 0) color.lerp(ground, Math.pow(T.MathUtils.smoothstep(-altitude, .1, 1), .7));
        const azimuth = (u - .5) * Math.PI * 2, horizontal = Math.sqrt(Math.max(0, 1 - altitude * altitude));
        const angle = Math.acos(T.MathUtils.clamp(horizontal * Math.cos(azimuth) * sunDirection.x + altitude * sunDirection.y + horizontal * Math.sin(azimuth) * sunDirection.z, -1, 1));
        color.lerp(glow, .55 * Math.exp(-((angle / .18) ** 2)));
        color.lerp(disc, 1 - T.MathUtils.smoothstep(angle, .009, .018));
      }
      let cloud = 0;
      const cloudBands = evening ? [[.1, .46, .14, .0035], [.42, .475, .2, .002], [.72, .455, .12, .004], [.91, .47, .16, .0025]] : [[.1, .35, .09, .025], [.32, .41, .11, .018], [.63, .32, .12, .028], [.86, .4, .1, .019]];
      for (const [cx, cy, sx, sy] of cloudBands) {
        const dx = Math.min(Math.abs(u - cx), 1 - Math.abs(u - cx));
        cloud += Math.exp(-((dx / sx) ** 2 + ((v - cy) / sy) ** 2) * 2) * (.67 + .33 * Math.sin(u * 103 + Math.sin(v * 157) * 1.8));
      }
      color.lerp(evening ? glow : white, Math.min(evening ? .42 : .72, cloud * (evening ? .4 : .65)));
      const i = (y * width + x) * 4;
      pixels[i] = color.r; pixels[i + 1] = color.g; pixels[i + 2] = color.b; pixels[i + 3] = 1;
    }
    const floatLinear = renderer.extensions.has('OES_texture_float_linear');
    let texture: T.DataTexture;
    if (floatLinear) {
      texture = new T.DataTexture(pixels, width, height, T.RGBAFormat, T.FloatType);
      texture.colorSpace = T.LinearSRGBColorSpace;
    } else {
      // The bounded panorama fits sRGB bytes. Linear byte filtering avoids a pixelated sky
      // on devices that cannot filter float textures, without requiring an extension.
      const bytes = new Uint8Array(pixels.length);
      for (let i = 0; i < pixels.length; i += 4) {
        color.setRGB(pixels[i], pixels[i + 1], pixels[i + 2]).convertLinearToSRGB();
        bytes[i] = Math.round(color.r * 255); bytes[i + 1] = Math.round(color.g * 255); bytes[i + 2] = Math.round(color.b * 255); bytes[i + 3] = 255;
      }
      texture = new T.DataTexture(bytes, width, height, T.RGBAFormat, T.UnsignedByteType);
      texture.colorSpace = T.SRGBColorSpace;
    }
    texture.magFilter = texture.minFilter = T.LinearFilter;
    texture.mapping = T.EquirectangularReflectionMapping;
    texture.needsUpdate = true;
    return texture;
  }
  const daySky = sky(false), eveningSky = sky(true);
  const key = new T.DirectionalLight('#fff4df', 3.2);
  key.castShadow = true;
  key.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -180, right: 180, top: 180, bottom: -180, near: 1, far: 850 });
  key.shadow.normalBias = .05; key.shadow.bias = -.00008;
  const fill = new T.DirectionalLight('#d7e6ff', .9);
  const rim = new T.DirectionalLight('#e0ecff', 1);
  rim.position.set(-105, 54, -120);
  const ambient = new T.HemisphereLight('#dceeff', '#657247', .65);
  scene.add(key, key.target, fill, rim, ambient);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#71835a'; context.fillRect(0, 0, 256, 256);
    let seed = 173;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    for (let i = 0; i < 12000; i++) {
      const shade = Math.floor(65 + random() * 65);
      context.fillStyle = `rgba(${shade},${shade + 18},${shade - 24},.32)`;
      context.fillRect(random() * 256, random() * 256, .6, 1 + random() * 3);
    }
  }
  const grass = new T.CanvasTexture(canvas);
  grass.colorSpace = T.SRGBColorSpace;
  grass.wrapS = grass.wrapT = T.RepeatWrapping;
  grass.repeat.set(180, 180);
  grass.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const groundMaterial = new T.MeshStandardMaterial({ color: '#e2e7d7', map: grass, roughness: 1 });
  const floor = new T.Mesh(new T.PlaneGeometry(3000, 3000), groundMaterial);
  floor.rotation.x = -Math.PI / 2; floor.position.y = -.015; floor.receiveShadow = true;
  scene.add(floor);
  function apply(evening: boolean) {
    scene.background = scene.environment = evening ? eveningSky : daySky;
    scene.backgroundIntensity = 1; scene.environmentIntensity = evening ? .65 : .75;
    scene.fog = new T.Fog(evening ? '#ffc986' : '#b8d9e9', 550, 2000);
    groundMaterial.color.set(evening ? '#d8caad' : '#e2e7d7');
    key.intensity = evening ? 3.4 : 3.2;
    key.color.set(evening ? '#ffc578' : '#fff4df');
    key.position.copy(evening ? sunPosition : new T.Vector3(-75, 210, 105));
    fill.intensity = evening ? 1.45 : .9;
    fill.color.set(evening ? '#e3ecff' : '#d7e6ff');
    fill.position.set(105, evening ? 96 : 105, evening ? 144 : -135);
    rim.intensity = evening ? 1.15 : 1; rim.color.set(evening ? '#ffd5a0' : '#e0ecff');
    ambient.intensity = evening ? .48 : .65;
    ambient.color.set(evening ? '#f6dac2' : '#dceeff');
    ambient.groundColor.set(evening ? '#716343' : '#657247');
    renderer.toneMappingExposure = evening ? 1.02 : 1;
    renderer.shadowMap.needsUpdate = true;
  }
  apply(false);
  return {
    apply,
    dispose() {
      scene.remove(key, key.target, fill, rim, ambient, floor);
      key.shadow.map?.dispose();
      floor.geometry.dispose(); groundMaterial.dispose(); grass.dispose(); daySky.dispose(); eveningSky.dispose();
    }
  };
}
