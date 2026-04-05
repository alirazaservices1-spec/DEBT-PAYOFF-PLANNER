import React from "react";
import Svg, { Circle, Ellipse, Path, Text as SvgText } from "react-native-svg";

interface Props {
  size?: number;
}

export function DexLoving({ size = 118 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 90 90">
      <Ellipse cx={28} cy={82} rx={14} ry={7} fill="#7A3A0C" />
      <Ellipse cx={62} cy={82} rx={14} ry={7} fill="#7A3A0C" />
      <Ellipse cx={16} cy={46} rx={9} ry={16} fill="#EAA835" transform="rotate(18,16,46)" />
      <Ellipse cx={74} cy={46} rx={9} ry={16} fill="#EAA835" transform="rotate(-18,74,46)" />
      <Circle cx={45} cy={44} r={33} fill="#EAA835" />
      <Ellipse cx={45} cy={64} rx={26} ry={15} fill="#C07820" opacity={0.22} />
      <Circle cx={20} cy={22} r={10} fill="#D09828" />
      <Circle cx={70} cy={22} r={10} fill="#D09828" />
      <Ellipse cx={33} cy={37} rx={13} ry={14} fill="white" />
      <Ellipse cx={57} cy={37} rx={13} ry={14} fill="white" />
      <Circle cx={35} cy={39} r={9} fill="#1A0800" />
      <Circle cx={59} cy={39} r={9} fill="#1A0800" />
      <Circle cx={31} cy={35} r={3.5} fill="white" />
      <Circle cx={55} cy={35} r={3.5} fill="white" />
      <Path d="M27 32 Q33 28 39 32" stroke="#1A0800" strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <Path d="M51 32 Q57 28 63 32" stroke="#1A0800" strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <Ellipse cx={24} cy={48} rx={10} ry={6} fill="#E87040" opacity={0.2} />
      <Ellipse cx={66} cy={48} rx={10} ry={6} fill="#E87040" opacity={0.2} />
      <Path d="M27 58 Q45 76 63 58" stroke="#A86010" strokeWidth={3} fill="none" strokeLinecap="round" />
      <SvgText x={5}  y={20} fontSize={12} fill="#E87080">{"❤"}</SvgText>
      <SvgText x={66} y={18} fontSize={11} fill="#E87080">{"❤"}</SvgText>
      <SvgText x={60} y={29} fontSize={8}  fill="#E87080">{"❤"}</SvgText>
    </Svg>
  );
}
