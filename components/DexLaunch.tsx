import React from "react";
import Svg, { Circle, Ellipse, Path, Text as SvgText } from "react-native-svg";

interface Props {
  size?: number;
}

export function DexLaunch({ size = 120 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 90 90">
      <Ellipse cx={28} cy={82} rx={14} ry={7} fill="#7A3A0C" />
      <Ellipse cx={62} cy={82} rx={14} ry={7} fill="#7A3A0C" />
      <Ellipse cx={16} cy={44} rx={9} ry={18} fill="#EAA835" transform="rotate(22,16,44)" />
      <Ellipse cx={74} cy={44} rx={9} ry={18} fill="#EAA835" transform="rotate(-22,74,44)" />
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
      <Path d="M27 60 Q45 78 63 60" stroke="#A86010" strokeWidth={3} fill="none" strokeLinecap="round" />
      <SvgText x={5}  y={18} fontSize={14} fill="#E8A020">{"✨"}</SvgText>
      <SvgText x={63} y={14} fontSize={12} fill="#E8A020">{"✨"}</SvgText>
      <SvgText x={57} y={26} fontSize={10} fill="#F5C842">{"★"}</SvgText>
      <SvgText x={10} y={12} fontSize={10} fill="#F5C842">{"★"}</SvgText>
    </Svg>
  );
}
