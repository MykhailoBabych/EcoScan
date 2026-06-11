import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import Svg, { Circle, Path, Defs, RadialGradient, Stop, Ellipse, ClipPath, G } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const OCEAN_DIRTY = '#44403c';
const OCEAN_CLEAN = '#0891b2';
const LAND_DIRTY = '#78350f';
const LAND_CLEAN = '#16a34a';

// Recognizable continent shapes (viewBox 0 0 200 200, planet center 100,100 r=98)
const CONTINENTS = [
  // Africa
  'M96 50 C84 47 70 56 64 70 C57 85 59 103 65 117 C71 132 82 142 96 140 C110 138 122 124 124 108 C127 90 122 67 111 57 C106 52 101 51 96 50 Z',
  // Europe
  'M80 42 C86 38 96 38 100 44 C104 50 98 58 90 58 C82 58 76 54 76 48 C76 45 78 43 80 42 Z',
  // Asia
  'M104 38 C120 35 145 42 160 55 C170 65 172 80 162 90 C150 100 130 98 118 90 C108 84 106 72 112 60 C108 50 105 42 104 38 Z',
  // North America
  'M32 45 C40 37 54 36 62 46 C70 56 70 72 62 82 C54 92 40 96 30 88 C20 79 20 60 28 50 Z',
  // South America
  'M42 98 C50 92 62 94 68 106 C74 118 72 136 64 148 C56 160 42 162 32 152 C22 142 22 122 30 108 C34 102 38 99 42 98 Z',
  // Australia
  'M150 118 C161 113 172 118 174 130 C176 143 166 154 153 153 C140 152 134 142 136 130 C137 123 144 120 150 118 Z',
];

// Semi-transparent cloud shapes
const CLOUDS = [
  'M35 68 C38 63 46 63 49 68 C53 63 62 63 63 70 C64 76 55 80 48 78 C44 82 36 82 34 77 C31 74 31 70 35 68 Z',
  'M128 48 C131 44 138 44 141 48 C144 44 151 43 152 50 C153 56 145 59 139 58 C136 61 129 61 128 56 C126 53 126 50 128 48 Z',
  'M58 140 C62 135 72 135 74 143 C78 138 88 137 89 146 C90 153 79 157 72 155 C68 159 60 159 58 153 C55 149 55 143 58 140 Z',
  'M148 82 C151 78 158 78 160 83 C163 78 170 78 171 85 C172 91 164 94 158 92 C155 96 148 96 147 90 C145 87 145 84 148 82 Z',
];

type PlanetSvgProps = {
  score: number;
  size?: number;
};

export function PlanetSvg({ score, size = 220 }: PlanetSvgProps) {
  const anim = useRef(new Animated.Value(score)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: score,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [score, anim]);

  const oceanColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [OCEAN_DIRTY, OCEAN_CLEAN],
  });
  const landColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [LAND_DIRTY, LAND_CLEAN],
  });
  const pollutionOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });

  return (
    <Svg width={size} height={size} viewBox="-8 -8 216 216">
      <Defs>
        {/* Clip everything to the planet sphere */}
        <ClipPath id="planetClip">
          <Circle cx={100} cy={100} r={98} />
        </ClipPath>

        {/* 3D sphere effect: highlight top-left, shadow bottom-right */}
        <RadialGradient id="highlight3d" cx="38%" cy="32%" r="65%">
          <Stop offset="0%" stopColor="#ffffff" stopOpacity={0.45} />
          <Stop offset="45%" stopColor="#ffffff" stopOpacity={0.05} />
          <Stop offset="100%" stopColor="#000000" stopOpacity={0.28} />
        </RadialGradient>

        {/* Atmosphere glow ring around the planet */}
        <RadialGradient id="atmosphere" cx="50%" cy="50%" r="50%">
          <Stop offset="82%" stopColor="#38bdf8" stopOpacity={0} />
          <Stop offset="100%" stopColor="#38bdf8" stopOpacity={0.75} />
        </RadialGradient>
      </Defs>

      {/* Atmosphere glow (extends 7px beyond the planet) */}
      <Circle cx={100} cy={100} r={105} fill="url(#atmosphere)" />

      {/* Ocean base */}
      <AnimatedCircle cx={100} cy={100} r={98} fill={oceanColor} />

      {/* Continents */}
      {CONTINENTS.map((d, i) => (
        <AnimatedPath key={i} d={d} fill={landColor} clipPath="url(#planetClip)" />
      ))}

      {/* Polar ice caps */}
      <G clipPath="url(#planetClip)">
        <Ellipse cx={100} cy={12} rx={30} ry={14} fill="white" opacity={0.88} />
        <Ellipse cx={100} cy={188} rx={24} ry={10} fill="white" opacity={0.88} />
      </G>

      {/* Cloud layer */}
      <G clipPath="url(#planetClip)">
        {CLOUDS.map((d, i) => (
          <Path key={i} d={d} fill="white" opacity={0.6} />
        ))}
      </G>

      {/* 3D sphere highlight/shadow overlay */}
      <Circle cx={100} cy={100} r={98} fill="url(#highlight3d)" />

      {/* Pollution overlay (fades out as score improves) */}
      <AnimatedCircle cx={100} cy={100} r={98} fill="#27272a" opacity={pollutionOpacity} />
    </Svg>
  );
}