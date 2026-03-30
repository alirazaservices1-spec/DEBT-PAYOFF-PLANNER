import React from "react";
import Svg, { Circle, Ellipse, Path } from "react-native-svg";

interface Props {
  size?: number;
}

export function DexWelcome({ size = 88 }: Props) {
  const scale = size / 188;
  const h = Math.round(200 * scale);
  return (
    <Svg width={size} height={h} viewBox="0 0 200 212">
      <Ellipse cx={73}  cy={199} rx={31} ry={14} fill="#7A3A0C" />
      <Ellipse cx={127} cy={199} rx={31} ry={14} fill="#7A3A0C" />
      <Ellipse cx={16}  cy={134} rx={17} ry={26} fill="#C88A20" transform="rotate(9,16,134)" />
      <Ellipse cx={184} cy={134} rx={17} ry={26} fill="#C88A20" transform="rotate(-9,184,134)" />
      <Circle cx={100} cy={112} r={75} fill="#EAA835" />
      <Ellipse cx={100} cy={155} rx={56} ry={32} fill="#C07820" opacity={0.27} />
      <Circle cx={37}  cy={67}  r={22} fill="#D09828" />
      <Circle cx={163} cy={67}  r={22} fill="#D09828" />
      <Ellipse cx={77}  cy={100} rx={22} ry={25} fill="white" />
      <Ellipse cx={123} cy={100} rx={22} ry={25} fill="white" />
      <Circle cx={80}  cy={102} r={14} fill="#1A0800" />
      <Circle cx={126} cy={102} r={14} fill="#1A0800" />
      <Circle cx={74}  cy={96}  r={5.5} fill="white" />
      <Circle cx={120} cy={96}  r={5.5} fill="white" />
      <Circle cx={100} cy={123} r={3.5} fill="#A86010" />
      <Path d="M85 134 Q100 151 115 134" stroke="#A86010" strokeWidth={3.2} fill="none" strokeLinecap="round" />
      <Ellipse cx={61}  cy={115} rx={11} ry={7} fill="#E87040" opacity={0.22} />
      <Ellipse cx={139} cy={115} rx={11} ry={7} fill="#E87040" opacity={0.22} />
    </Svg>
  );
}
