/**
 * DexDayComplete – eight inline Dex SVG states for the day-complete screen.
 * Each state uses the same Svg from react-native-svg and wraps it in an
 * Animated.View that plays the correct looping motion (pulse / float /
 * bounce / nod / vibrate).
 */
import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, {
  G, Circle, Ellipse, Path, Rect, Line,
  Defs, RadialGradient, Stop, Text as SvgText,
} from "react-native-svg";

export type DexDCState =
  | "congratulating" | "letsGo"    | "crushingIt" | "highFive"
  | "believeInYou"  | "keepGoing"  | "youveGotThis"| "imWithYou";

type AnimType = "pulse" | "float" | "bounce" | "nod" | "vibrate";

const ANIM_FOR_STATE: Record<DexDCState, AnimType> = {
  congratulating: "pulse",
  letsGo:         "vibrate",
  crushingIt:     "pulse",
  highFive:       "bounce",
  believeInYou:   "float",
  keepGoing:      "nod",
  youveGotThis:   "float",
  imWithYou:      "float",
};

// ─── Individual SVG bodies ────────────────────────────────────────────────────

function Congratulating() {
  return (
    <View style={{ overflow: "visible" }}>
        <Svg viewBox="0 0 120 145" width={170} height={190}>
      <Defs>
        <RadialGradient id="db6" cx="38%" cy="32%" r="65%">
          <Stop offset="0%"   stopColor="#FFF0A0" /><Stop offset="50%" stopColor="#F2C040" /><Stop offset="100%" stopColor="#C07808" />
        </RadialGradient>
        <RadialGradient id="de6" cx="40%" cy="38%" r="60%">
          <Stop offset="0%"   stopColor="#C07010" /><Stop offset="100%" stopColor="#7A4800" />
        </RadialGradient>
        <RadialGradient id="dc6" cx="38%" cy="35%" r="62%">
          <Stop offset="0%"   stopColor="#FFDF60" /><Stop offset="100%" stopColor="#C89010" />
        </RadialGradient>
      </Defs>
      <G>
        <Ellipse cx="60" cy="135" rx="26" ry="5" fill="rgba(0,0,0,0.07)" />
        <Circle cx="26" cy="36" r="13" fill="url(#de6)" /><Circle cx="94" cy="36" r="13" fill="url(#de6)" />
        <Circle cx="26" cy="36" r="7"  fill="#5A3400" opacity={0.5} /><Circle cx="94" cy="36" r="7" fill="#5A3400" opacity={0.5} />
        <Circle cx="60" cy="72" r="47" fill="#8A5800" opacity={0.15} />
        <Circle cx="60" cy="70" r="47" fill="url(#db6)" />
        <Path d="M17 65 Q6 46 12 30"   stroke="#A06008" strokeWidth={10} strokeLinecap="round" fill="none" />
        <Circle cx="12" cy="29" r="9"  fill="url(#db6)" stroke="#A06008" strokeWidth={1.5} />
        <Path d="M103 65 Q114 46 108 30" stroke="#A06008" strokeWidth={10} strokeLinecap="round" fill="none" />
        <Circle cx="108" cy="29" r="9" fill="url(#db6)" stroke="#A06008" strokeWidth={1.5} />
        <Ellipse cx="40" cy="64" rx="19" ry="20" fill="white" />
        <Ellipse cx="80" cy="64" rx="19" ry="20" fill="white" />
        <Circle cx="40" cy="66" r="13" fill="#1A1A2E" />
        <Circle cx="80" cy="66" r="13" fill="#1A1A2E" />
        <Circle cx="46" cy="60" r="5"  fill="white" opacity={0.9} />
        <Circle cx="86" cy="60" r="5"  fill="white" opacity={0.9} />
        <Ellipse cx="26" cy="76" rx="9" ry="6" fill="#E87070" opacity={0.25} />
        <Ellipse cx="94" cy="76" rx="9" ry="6" fill="#E87070" opacity={0.25} />
        <Path d="M36 88 Q60 108 84 88" fill="#8A5000" />
        <Ellipse cx="60" cy="96" rx="16" ry="8" fill="#C04040" opacity={0.75} />
        <Path d="M36 88 Q60 108 84 88" fill="none" stroke="#6A3800" strokeWidth={2} />
        <Rect x="29" y="113" width="22" height="12" rx={6} fill="#C4A878" />
        <Rect x="69" y="113" width="22" height="12" rx={6} fill="#C4A878" />
        <Circle cx="14" cy="88" r="13" fill="url(#dc6)" stroke="#A07010" strokeWidth={1.8} />
        <SvgText x="14" y="93" textAnchor="middle" fontWeight="600" fontSize={13} fill="#7A5000">$</SvgText>
        {/* confetti pieces (static; parent View animates float) */}
        <Rect x="14" y="20" width="6" height="6" rx={1.5} fill="#2D5BE3" transform="rotate(25,17,23)" />
        <Rect x="96" y="14" width="5" height="5" rx={1.5} fill="#1D9E6A" transform="rotate(-15,98,16)" />
        <Circle cx="20" cy="44" r="3.5" fill="#F2C040" />
        <Circle cx="100" cy="40" r="3"   fill="#2D5BE3" />
        <Rect x="54" y="8"  width="5"    height="7"    rx={1.5} fill="#E07060" transform="rotate(12,56,11)" />
      </G>
    </Svg>
    </View>
  );
}

function LetsGo() {
  return (
    <View style={{ overflow: "visible" }}>
        <Svg viewBox="0 0 120 145" width={170} height={190}>
      <Defs>
        <RadialGradient id="db11" cx="38%" cy="32%" r="65%">
          <Stop offset="0%"   stopColor="#FFFACC" /><Stop offset="45%" stopColor="#F0B000" /><Stop offset="100%" stopColor="#9A5800" />
        </RadialGradient>
        <RadialGradient id="de11" cx="40%" cy="38%" r="60%">
          <Stop offset="0%"   stopColor="#B06010" /><Stop offset="100%" stopColor="#6A3800" />
        </RadialGradient>
        <RadialGradient id="dc11" cx="38%" cy="35%" r="62%">
          <Stop offset="0%"   stopColor="#FFDF60" /><Stop offset="100%" stopColor="#C89010" />
        </RadialGradient>
      </Defs>
      <G>
        <Line x1="60" y1="5"   x2="60"  y2="18"  stroke="#FFB800" strokeWidth={2.5} opacity={0.6}  strokeLinecap="round" />
        <Line x1="100" y1="14" x2="93"  y2="25"  stroke="#FF7060" strokeWidth={2.5} opacity={0.5}  strokeLinecap="round" />
        <Line x1="20"  y1="14" x2="27"  y2="25"  stroke="#2D5BE3" strokeWidth={2.5} opacity={0.5}  strokeLinecap="round" />
        <Line x1="114" y1="40" x2="104" y2="46"  stroke="#FFB800" strokeWidth={2}   opacity={0.5}  strokeLinecap="round" />
        <Line x1="6"   y1="40" x2="16"  y2="46"  stroke="#1D9E6A" strokeWidth={2}   opacity={0.5}  strokeLinecap="round" />
        <Ellipse cx="60" cy="135" rx="26" ry="5" fill="rgba(0,0,0,0.07)" />
        <Circle cx="26" cy="36" r="13" fill="url(#de11)" /><Circle cx="94" cy="36" r="13" fill="url(#de11)" />
        <Circle cx="26" cy="36" r="7"  fill="#4A2800" opacity={0.5} /><Circle cx="94" cy="36" r="7" fill="#4A2800" opacity={0.5} />
        <Circle cx="60" cy="72" r="47" fill="#803800" opacity={0.2} />
        <Circle cx="60" cy="70" r="47" fill="url(#db11)" />
        <Path d="M15 60 Q2 38 8 20"   stroke="#8A5000" strokeWidth={11} strokeLinecap="round" fill="none" />
        <Circle cx="8"   cy="19" r="10" fill="url(#db11)" stroke="#8A5000" strokeWidth={1.5} />
        <Path d="M105 60 Q118 38 112 20" stroke="#8A5000" strokeWidth={11} strokeLinecap="round" fill="none" />
        <Circle cx="112" cy="19" r="10" fill="url(#db11)" stroke="#8A5000" strokeWidth={1.5} />
        <Ellipse cx="40" cy="63" rx="20" ry="22" fill="white" />
        <Ellipse cx="80" cy="63" rx="20" ry="22" fill="white" />
        <Circle cx="40" cy="65" r="14" fill="#1A1A2E" />
        <Circle cx="80" cy="65" r="14" fill="#1A1A2E" />
        <Circle cx="47" cy="58" r="5.5" fill="white" opacity={0.9} />
        <Circle cx="87" cy="58" r="5.5" fill="white" opacity={0.9} />
        <Ellipse cx="24" cy="78" rx="10" ry="6.5" fill="#E87070" opacity={0.3} />
        <Ellipse cx="96" cy="78" rx="10" ry="6.5" fill="#E87070" opacity={0.3} />
        <Ellipse cx="60" cy="93" rx="18" ry="13"  fill="#7A3800" />
        <Ellipse cx="60" cy="96" rx="14" ry="10"  fill="#C03030" opacity={0.85} />
        <Rect x="50" y="89" width="7" height="5" rx={1.5} fill="white" />
        <Rect x="59" y="89" width="7" height="5" rx={1.5} fill="white" />
        <Rect x="29" y="113" width="22" height="12" rx={6} fill="#C4A878" />
        <Rect x="69" y="113" width="22" height="12" rx={6} fill="#C4A878" />
        <Circle cx="14" cy="88" r="13" fill="url(#dc11)" stroke="#A07010" strokeWidth={1.8} />
        <SvgText x="14" y="93" textAnchor="middle" fontWeight="600" fontSize={13} fill="#7A5000">$</SvgText>
      </G>
    </Svg>
    </View>
  );
}

function CrushingIt() {
  return (
    <View style={{ overflow: "visible" }}>
        <Svg viewBox="0 0 120 145" width={170} height={190}>
      <Defs>
        <RadialGradient id="db12" cx="38%" cy="32%" r="65%">
          <Stop offset="0%"   stopColor="#F2C040" /><Stop offset="55%" stopColor="#D08A10" /><Stop offset="100%" stopColor="#A06008" />
        </RadialGradient>
        <RadialGradient id="de12" cx="40%" cy="38%" r="60%">
          <Stop offset="0%"   stopColor="#C07010" /><Stop offset="100%" stopColor="#7A4800" />
        </RadialGradient>
        <RadialGradient id="dc12" cx="38%" cy="35%" r="62%">
          <Stop offset="0%"   stopColor="#FFDF60" /><Stop offset="100%" stopColor="#C89010" />
        </RadialGradient>
      </Defs>
      <G>
        <Ellipse cx="60" cy="135" rx="26" ry="5" fill="rgba(0,0,0,0.07)" />
        <Circle cx="26" cy="36" r="13" fill="url(#de12)" /><Circle cx="94" cy="36" r="13" fill="url(#de12)" />
        <Circle cx="26" cy="36" r="7"  fill="#5A3400" opacity={0.5} /><Circle cx="94" cy="36" r="7" fill="#5A3400" opacity={0.5} />
        <Circle cx="60" cy="72" r="47" fill="#8A5800" opacity={0.2} />
        <Circle cx="60" cy="70" r="47" fill="url(#db12)" />
        <Path d="M15 68 Q4 56 10 42 Q14 34 22 36"   stroke="#9A6200" strokeWidth={11} strokeLinecap="round" fill="none" />
        <Circle cx="12" cy="42" r="10" fill="url(#db12)" stroke="#9A6200" strokeWidth={1.5} />
        <Path d="M105 68 Q116 56 110 42 Q106 34 98 36" stroke="#9A6200" strokeWidth={11} strokeLinecap="round" fill="none" />
        <Circle cx="108" cy="42" r="10" fill="url(#db12)" stroke="#9A6200" strokeWidth={1.5} />
        <Ellipse cx="40" cy="64" rx="19" ry="20" fill="white" />
        <Ellipse cx="80" cy="64" rx="19" ry="20" fill="white" />
        <Circle cx="40" cy="66" r="13" fill="#1A1A2E" />
        <Circle cx="80" cy="66" r="13" fill="#1A1A2E" />
        <Circle cx="46" cy="60" r="5"  fill="white" opacity={0.9} />
        <Circle cx="86" cy="60" r="5"  fill="white" opacity={0.9} />
        <Path d="M24 46 L42 50" stroke="#6A3800" strokeWidth={3.5} strokeLinecap="round" />
        <Path d="M78 50 L96 46" stroke="#6A3800" strokeWidth={3.5} strokeLinecap="round" />
        <Ellipse cx="26" cy="76" rx="8" ry="5" fill="#E87070" opacity={0.22} />
        <Ellipse cx="94" cy="76" rx="8" ry="5" fill="#E87070" opacity={0.22} />
        <Path d="M44 88 Q64 100 80 88" fill="none" stroke="#7A4800" strokeWidth={3.5} strokeLinecap="round" />
        <Rect x="29" y="113" width="22" height="12" rx={6} fill="#C4A878" />
        <Rect x="69" y="113" width="22" height="12" rx={6} fill="#C4A878" />
        <Circle cx="14" cy="88" r="13" fill="url(#dc12)" stroke="#A07010" strokeWidth={1.8} />
        <SvgText x="14" y="93" textAnchor="middle" fontWeight="600" fontSize={13} fill="#7A5000">$</SvgText>
      </G>
    </Svg>
    </View>
  );
}

function HighFive() {
  return (
    <View style={{ overflow: "visible" }}>
        <Svg viewBox="0 0 120 145" width={170} height={190}>
      <Defs>
        <RadialGradient id="db15" cx="38%" cy="32%" r="65%">
          <Stop offset="0%"   stopColor="#F2C040" /><Stop offset="55%" stopColor="#D08A10" /><Stop offset="100%" stopColor="#A06008" />
        </RadialGradient>
        <RadialGradient id="de15" cx="40%" cy="38%" r="60%">
          <Stop offset="0%"   stopColor="#C07010" /><Stop offset="100%" stopColor="#7A4800" />
        </RadialGradient>
        <RadialGradient id="dc15" cx="38%" cy="35%" r="62%">
          <Stop offset="0%"   stopColor="#FFDF60" /><Stop offset="100%" stopColor="#C89010" />
        </RadialGradient>
      </Defs>
      <G>
        <Ellipse cx="60" cy="135" rx="26" ry="5" fill="rgba(0,0,0,0.07)" />
        <Circle cx="26" cy="36" r="13" fill="url(#de15)" /><Circle cx="94" cy="36" r="13" fill="url(#de15)" />
        <Circle cx="26" cy="36" r="7"  fill="#5A3400" opacity={0.5} /><Circle cx="94" cy="36" r="7" fill="#5A3400" opacity={0.5} />
        <Circle cx="60" cy="72" r="47" fill="#8A5800" opacity={0.2} />
        <Circle cx="60" cy="70" r="47" fill="url(#db15)" />
        <Path d="M103 65 Q112 44 106 26" stroke="#9A6200" strokeWidth={10} strokeLinecap="round" fill="none" />
        <Ellipse cx="104" cy="22" rx="12" ry="10" fill="url(#db15)" stroke="#9A6200" strokeWidth={1.2} />
        <Line x1="98"  y1="14" x2="96"  y2="9" stroke="#9A6200" strokeWidth={1.5} strokeLinecap="round" />
        <Line x1="104" y1="12" x2="103" y2="7" stroke="#9A6200" strokeWidth={1.5} strokeLinecap="round" />
        <Line x1="110" y1="14" x2="110" y2="9" stroke="#9A6200" strokeWidth={1.5} strokeLinecap="round" />
        <Ellipse cx="13" cy="76" rx="11" ry="7" fill="url(#db15)" stroke="#9A6200" strokeWidth={1.2} transform="rotate(-12,13,76)" />
        <Line x1="106" y1="12" x2="114" y2="6"  stroke="#FFD030" strokeWidth={1.5} opacity={0.7} strokeLinecap="round" />
        <Line x1="112" y1="16" x2="118" y2="12" stroke="#FFD030" strokeWidth={1.5} opacity={0.6} strokeLinecap="round" />
        <Ellipse cx="40" cy="65" rx="19" ry="20" fill="white" />
        <Ellipse cx="80" cy="65" rx="19" ry="20" fill="white" />
        <Circle cx="40" cy="67" r="13" fill="#1A1A2E" />
        <Circle cx="80" cy="67" r="13" fill="#1A1A2E" />
        <Circle cx="46" cy="61" r="5"  fill="white" opacity={0.9} />
        <Circle cx="86" cy="61" r="5"  fill="white" opacity={0.9} />
        <Ellipse cx="26" cy="77" rx="8" ry="5" fill="#E87070" opacity={0.24} />
        <Ellipse cx="94" cy="77" rx="8" ry="5" fill="#E87070" opacity={0.24} />
        <Path d="M38 89 Q60 105 82 89" fill="none" stroke="#7A4800" strokeWidth={3.5} strokeLinecap="round" />
        <Rect x="29" y="113" width="22" height="12" rx={6} fill="#C4A878" />
        <Rect x="69" y="113" width="22" height="12" rx={6} fill="#C4A878" />
        <Circle cx="14" cy="88" r="13" fill="url(#dc15)" stroke="#A07010" strokeWidth={1.8} />
        <SvgText x="14" y="93" textAnchor="middle" fontWeight="600" fontSize={13} fill="#7A5000">$</SvgText>
      </G>
    </Svg>
    </View>
  );
}

function BelieveInYou() {
  return (
    <View style={{ overflow: "visible" }}>
        <Svg viewBox="0 0 120 145" width={170} height={190}>
      <Defs>
        <RadialGradient id="db16" cx="38%" cy="32%" r="65%">
          <Stop offset="0%"   stopColor="#F2C040" /><Stop offset="55%" stopColor="#D08A10" /><Stop offset="100%" stopColor="#A06008" />
        </RadialGradient>
        <RadialGradient id="de16" cx="40%" cy="38%" r="60%">
          <Stop offset="0%"   stopColor="#C07010" /><Stop offset="100%" stopColor="#7A4800" />
        </RadialGradient>
        <RadialGradient id="dc16" cx="38%" cy="35%" r="62%">
          <Stop offset="0%"   stopColor="#FFDF60" /><Stop offset="100%" stopColor="#C89010" />
        </RadialGradient>
      </Defs>
      <G>
        <SvgText x="6"  y="26" fontSize={11} opacity={0.5} fill="#E8304A">♥</SvgText>
        <SvgText x="98" y="22" fontSize={9}  opacity={0.4} fill="#E8304A">♥</SvgText>
        <SvgText x="54" y="10" fontSize={8}  opacity={0.4} fill="#E8304A">♥</SvgText>
        <Ellipse cx="60" cy="135" rx="26" ry="5" fill="rgba(0,0,0,0.07)" />
        <Circle cx="26" cy="36" r="13" fill="url(#de16)" /><Circle cx="94" cy="36" r="13" fill="url(#de16)" />
        <Circle cx="26" cy="36" r="7"  fill="#5A3400" opacity={0.5} /><Circle cx="94" cy="36" r="7" fill="#5A3400" opacity={0.5} />
        <Circle cx="60" cy="72" r="47" fill="#8A5800" opacity={0.2} />
        <Circle cx="60" cy="70" r="47" fill="url(#db16)" />
        <Ellipse cx="13"  cy="75" rx="11" ry="7" fill="url(#db16)" stroke="#9A6200" strokeWidth={1.2} transform="rotate(-10,13,75)" />
        <Ellipse cx="107" cy="75" rx="11" ry="7" fill="url(#db16)" stroke="#9A6200" strokeWidth={1.2} transform="rotate(10,107,75)" />
        <Ellipse cx="40" cy="64" rx="19" ry="20" fill="white" />
        <Ellipse cx="80" cy="64" rx="19" ry="20" fill="white" />
        <SvgText x="28" y="72" fontSize={22} fill="#E8304A">♥</SvgText>
        <SvgText x="68" y="72" fontSize={22} fill="#E8304A">♥</SvgText>
        <Circle cx="35" cy="60" r="3.5" fill="white" opacity={0.6} />
        <Circle cx="75" cy="60" r="3.5" fill="white" opacity={0.6} />
        <Ellipse cx="26" cy="78" rx="9" ry="6" fill="#E87070" opacity={0.3} />
        <Ellipse cx="94" cy="78" rx="9" ry="6" fill="#E87070" opacity={0.3} />
        <Path d="M38 90 Q60 106 82 90" fill="none" stroke="#7A4800" strokeWidth={3.5} strokeLinecap="round" />
        <Rect x="29" y="113" width="22" height="12" rx={6} fill="#C4A878" />
        <Rect x="69" y="113" width="22" height="12" rx={6} fill="#C4A878" />
        <Circle cx="14" cy="88" r="13" fill="url(#dc16)" stroke="#A07010" strokeWidth={1.8} />
        <SvgText x="14" y="93" textAnchor="middle" fontWeight="600" fontSize={13} fill="#7A5000">$</SvgText>
      </G>
    </Svg>
    </View>
  );
}

function KeepGoing() {
  return (
    <View style={{ overflow: "visible" }}>
        <Svg viewBox="0 0 120 145" width={170} height={190}>
      <Defs>
        <RadialGradient id="db18" cx="38%" cy="32%" r="65%">
          <Stop offset="0%"   stopColor="#F2C040" /><Stop offset="55%" stopColor="#D08A10" /><Stop offset="100%" stopColor="#A06008" />
        </RadialGradient>
        <RadialGradient id="de18" cx="40%" cy="38%" r="60%">
          <Stop offset="0%"   stopColor="#C07010" /><Stop offset="100%" stopColor="#7A4800" />
        </RadialGradient>
        <RadialGradient id="dc18" cx="38%" cy="35%" r="62%">
          <Stop offset="0%"   stopColor="#FFDF60" /><Stop offset="100%" stopColor="#C89010" />
        </RadialGradient>
      </Defs>
      <G>
        <Ellipse cx="60" cy="135" rx="26" ry="5" fill="rgba(0,0,0,0.07)" />
        <Circle cx="26" cy="36" r="13" fill="url(#de18)" /><Circle cx="94" cy="36" r="13" fill="url(#de18)" />
        <Circle cx="26" cy="36" r="7"  fill="#5A3400" opacity={0.5} /><Circle cx="94" cy="36" r="7" fill="#5A3400" opacity={0.5} />
        <Circle cx="60" cy="72" r="47" fill="#8A5800" opacity={0.2} />
        <Circle cx="60" cy="70" r="47" fill="url(#db18)" />
        <Path d="M18 72 Q6 62 8 50"   stroke="#9A6200" strokeWidth={9} strokeLinecap="round" fill="none" />
        <Circle cx="8"   cy="49" r="8" fill="url(#db18)" stroke="#9A6200" strokeWidth={1.2} />
        <Path d="M102 72 Q114 80 112 92" stroke="#9A6200" strokeWidth={9} strokeLinecap="round" fill="none" />
        <Circle cx="112" cy="93" r="8" fill="url(#db18)" stroke="#9A6200" strokeWidth={1.2} />
        <Line x1="2"  y1="54" x2="14" y2="54" stroke="#D08A10" strokeWidth={1.8} opacity={0.4} strokeLinecap="round" />
        <Line x1="2"  y1="60" x2="12" y2="60" stroke="#D08A10" strokeWidth={1.4} opacity={0.3} strokeLinecap="round" />
        <Line x1="2"  y1="66" x2="14" y2="66" stroke="#D08A10" strokeWidth={1.8} opacity={0.4} strokeLinecap="round" />
        <Ellipse cx="40" cy="63" rx="18" ry="19" fill="white" />
        <Ellipse cx="80" cy="63" rx="18" ry="19" fill="white" />
        <Circle cx="42" cy="65" r="12" fill="#1A1A2E" />
        <Circle cx="82" cy="65" r="12" fill="#1A1A2E" />
        <Circle cx="47" cy="60" r="4.5" fill="white" opacity={0.9} />
        <Circle cx="87" cy="60" r="4.5" fill="white" opacity={0.9} />
        <Path d="M24 44 L42 48" stroke="#6A3800" strokeWidth={3} strokeLinecap="round" />
        <Path d="M78 48 L96 44" stroke="#6A3800" strokeWidth={3} strokeLinecap="round" />
        <Path d="M40 87 Q60 98 78 87" fill="none" stroke="#7A4800" strokeWidth={3} strokeLinecap="round" />
        <Ellipse cx="38" cy="112" rx="13" ry="8" fill="url(#db18)" stroke="#9A6200" strokeWidth={1.2} transform="rotate(-18,38,112)" />
        <Ellipse cx="76" cy="116" rx="13" ry="8" fill="url(#db18)" stroke="#9A6200" strokeWidth={1.2} transform="rotate(14,76,116)" />
        <Circle cx="14" cy="88" r="13" fill="url(#dc18)" stroke="#A07010" strokeWidth={1.8} />
        <SvgText x="14" y="93" textAnchor="middle" fontWeight="600" fontSize={13} fill="#7A5000">$</SvgText>
      </G>
    </Svg>
    </View>
  );
}

function YouveGotThis() {
  return (
    <View style={{ overflow: "visible" }}>
        <Svg viewBox="0 0 120 145" width={170} height={190}>
      <Defs>
        <RadialGradient id="db19" cx="38%" cy="32%" r="65%">
          <Stop offset="0%"   stopColor="#F2C040" /><Stop offset="55%" stopColor="#D08A10" /><Stop offset="100%" stopColor="#A06008" />
        </RadialGradient>
        <RadialGradient id="de19" cx="40%" cy="38%" r="60%">
          <Stop offset="0%"   stopColor="#C07010" /><Stop offset="100%" stopColor="#7A4800" />
        </RadialGradient>
        <RadialGradient id="dc19" cx="38%" cy="35%" r="62%">
          <Stop offset="0%"   stopColor="#FFDF60" /><Stop offset="100%" stopColor="#C89010" />
        </RadialGradient>
      </Defs>
      <G>
        <Ellipse cx="60" cy="135" rx="26" ry="5" fill="rgba(0,0,0,0.07)" />
        <Circle cx="26" cy="36" r="13" fill="url(#de19)" /><Circle cx="94" cy="36" r="13" fill="url(#de19)" />
        <Circle cx="26" cy="36" r="7"  fill="#5A3400" opacity={0.5} /><Circle cx="94" cy="36" r="7" fill="#5A3400" opacity={0.5} />
        <Circle cx="60" cy="72" r="47" fill="#8A5800" opacity={0.2} />
        <Circle cx="60" cy="70" r="47" fill="url(#db19)" />
        <Path d="M100 74 Q112 64 108 52" stroke="#9A6200" strokeWidth={10} strokeLinecap="round" fill="none" />
        <Ellipse cx="104" cy="50" rx="11" ry="8"  fill="url(#db19)" stroke="#9A6200" strokeWidth={1.2} />
        <Rect x="100" y="38" width="9" height="14" rx={4.5} fill="url(#db19)" stroke="#9A6200" strokeWidth={1.2} />
        <Ellipse cx="13" cy="74" rx="11" ry="7" fill="url(#db19)" stroke="#9A6200" strokeWidth={1.2} transform="rotate(-10,13,74)" />
        <Ellipse cx="40" cy="65" rx="19" ry="20" fill="white" />
        <Ellipse cx="80" cy="65" rx="19" ry="20" fill="white" />
        <Circle cx="40" cy="67" r="13" fill="#1A1A2E" />
        <Circle cx="80" cy="67" r="13" fill="#1A1A2E" />
        <Circle cx="46" cy="61" r="5"  fill="white" opacity={0.9} />
        <Circle cx="86" cy="61" r="5"  fill="white" opacity={0.9} />
        <Ellipse cx="26" cy="77" rx="8" ry="5" fill="#E87070" opacity={0.24} />
        <Ellipse cx="94" cy="77" rx="8" ry="5" fill="#E87070" opacity={0.24} />
        <Path d="M38 89 Q60 103 82 89" fill="none" stroke="#7A4800" strokeWidth={3.5} strokeLinecap="round" />
        <Rect x="29" y="113" width="22" height="12" rx={6} fill="#C4A878" />
        <Rect x="69" y="113" width="22" height="12" rx={6} fill="#C4A878" />
        <Circle cx="14" cy="88" r="13" fill="url(#dc19)" stroke="#A07010" strokeWidth={1.8} />
        <SvgText x="14" y="93" textAnchor="middle" fontWeight="600" fontSize={13} fill="#7A5000">$</SvgText>
      </G>
    </Svg>
    </View>
  );
}

function ImWithYou() {
  return (
    <View style={{ overflow: "visible" }}>
        <Svg viewBox="0 0 120 145" width={170} height={190}>
      <Defs>
        <RadialGradient id="db20" cx="38%" cy="32%" r="65%">
          <Stop offset="0%"   stopColor="#F8D868" /><Stop offset="55%" stopColor="#C88008" /><Stop offset="100%" stopColor="#946000" />
        </RadialGradient>
        <RadialGradient id="de20" cx="40%" cy="38%" r="60%">
          <Stop offset="0%"   stopColor="#B86010" /><Stop offset="100%" stopColor="#724000" />
        </RadialGradient>
        <RadialGradient id="dc20" cx="38%" cy="35%" r="62%">
          <Stop offset="0%"   stopColor="#FFDF60" /><Stop offset="100%" stopColor="#C89010" />
        </RadialGradient>
      </Defs>
      <G>
        <Ellipse cx="60" cy="135" rx="26" ry="5" fill="rgba(0,0,0,0.07)" />
        <Circle cx="26" cy="36" r="13" fill="url(#de20)" /><Circle cx="94" cy="36" r="13" fill="url(#de20)" />
        <Circle cx="26" cy="36" r="7"  fill="#5A3400" opacity={0.5} /><Circle cx="94" cy="36" r="7" fill="#5A3400" opacity={0.5} />
        <Circle cx="60" cy="72" r="47" fill="#7A4800" opacity={0.18} />
        <Circle cx="60" cy="70" r="47" fill="url(#db20)" />
        <Path d="M16 72 Q4 66 6 56"    stroke="#8A5000" strokeWidth={9} strokeLinecap="round" fill="none" />
        <Circle cx="6"   cy="55" r="8" fill="url(#db20)" stroke="#8A5000" strokeWidth={1.2} />
        <Path d="M104 72 Q116 66 114 56" stroke="#8A5000" strokeWidth={9} strokeLinecap="round" fill="none" />
        <Circle cx="114" cy="55" r="8" fill="url(#db20)" stroke="#8A5000" strokeWidth={1.2} />
        <Ellipse cx="40" cy="65" rx="19" ry="19" fill="white" />
        <Ellipse cx="80" cy="65" rx="19" ry="19" fill="white" />
        <Circle cx="40" cy="67" r="13" fill="#1A1A2E" />
        <Circle cx="80" cy="67" r="13" fill="#1A1A2E" />
        <Circle cx="45" cy="61" r="5"  fill="white" opacity={0.9} />
        <Circle cx="85" cy="61" r="5"  fill="white" opacity={0.9} />
        <Path d="M22 60 Q40 54 58 60" fill="url(#db20)" opacity={0.5} />
        <Path d="M62 60 Q80 54 98 60" fill="url(#db20)" opacity={0.5} />
        <Ellipse cx="26" cy="77" rx="10" ry="6.5" fill="#E87070" opacity={0.28} />
        <Ellipse cx="94" cy="77" rx="10" ry="6.5" fill="#E87070" opacity={0.28} />
        <Path d="M40 88 Q60 102 80 88" fill="none" stroke="#7A4800" strokeWidth={3.5} strokeLinecap="round" />
        <Rect x="29" y="113" width="22" height="12" rx={6} fill="#C4A878" />
        <Rect x="69" y="113" width="22" height="12" rx={6} fill="#C4A878" />
        <Circle cx="14" cy="88" r="13" fill="url(#dc20)" stroke="#A07010" strokeWidth={1.8} />
        <SvgText x="14" y="93" textAnchor="middle" fontWeight="600" fontSize={13} fill="#7A5000">$</SvgText>
      </G>
    </Svg>
    </View>
  );
}

// ─── SVG map ──────────────────────────────────────────────────────────────────
const DEX_RENDER: Record<DexDCState, () => React.JSX.Element> = {
  congratulating: () => <Congratulating />,
  letsGo:         () => <LetsGo />,
  crushingIt:     () => <CrushingIt />,
  highFive:       () => <HighFive />,
  believeInYou:   () => <BelieveInYou />,
  keepGoing:      () => <KeepGoing />,
  youveGotThis:   () => <YouveGotThis />,
  imWithYou:      () => <ImWithYou />,
};

// ─── Animated wrapper ─────────────────────────────────────────────────────────
interface Props {
  state: DexDCState;
  visible?: boolean;
}

export function DexDayComplete({ state, visible = true }: Props) {
  const anim    = useRef(new Animated.Value(0)).current;
  const entryOp = useRef(new Animated.Value(0)).current;
  const entryY  = useRef(new Animated.Value(10)).current;
  const entryS  = useRef(new Animated.Value(0.88)).current;

  // Entry pop (dexSwap equiv)
  useEffect(() => {
    entryOp.setValue(0);
    entryY.setValue(10);
    entryS.setValue(0.88);
    Animated.parallel([
      Animated.timing(entryOp, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(entryY,  { toValue: 0, damping: 13, stiffness: 220, useNativeDriver: true }),
      Animated.spring(entryS,  { toValue: 1, damping: 13, stiffness: 220, useNativeDriver: true }),
    ]).start();
  }, [state]);

  // Looping motion
  useEffect(() => {
    const animType = ANIM_FOR_STATE[state];
    let loop: Animated.CompositeAnimation;

    if (animType === "pulse") {
      anim.setValue(0);
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1,  duration: 1000, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0,  duration: 1000, useNativeDriver: true }),
        ])
      );
    } else if (animType === "float") {
      anim.setValue(0);
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 1400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 1400, useNativeDriver: true }),
        ])
      );
    } else if (animType === "bounce") {
      anim.setValue(0);
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 675, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
          Animated.timing(anim, { toValue: 0, duration: 675, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
        ])
      );
    } else if (animType === "nod") {
      anim.setValue(0);
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 1100, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 1100, useNativeDriver: true }),
        ])
      );
    } else {
      // vibrate
      anim.setValue(0);
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1,  duration: 112, useNativeDriver: true }),
          Animated.timing(anim, { toValue: -1, duration: 112, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0,  duration: 112, useNativeDriver: true }),
        ])
      );
    }
    loop.start();
    return () => loop.stop();
  }, [state]);

  const animType = ANIM_FOR_STATE[state];

  const motionStyle =
    animType === "pulse" ? {
      transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) }],
    }
    : animType === "float" ? {
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }],
    }
    : animType === "bounce" ? {
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }) }],
    }
    : animType === "nod" ? {
      transform: [{ rotate: anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-3deg"] }) }],
    }
    : /* vibrate */ {
      transform: [{ translateX: anim.interpolate({ inputRange: [-1, 0, 1], outputRange: [-3, 0, 3] }) }],
    };

  if (!visible) return null;

  const combinedStyle = [
    motionStyle,
    {
      opacity: entryOp,
      transform: [
        ...(motionStyle as { transform?: object[] }).transform ?? [],
        { translateY: entryY },
        { scale: entryS },
      ],
    },
  ] as const;

  return (
    <Animated.View style={combinedStyle as unknown as typeof motionStyle}>
      {DEX_RENDER[state]()}
    </Animated.View>
  );
}
