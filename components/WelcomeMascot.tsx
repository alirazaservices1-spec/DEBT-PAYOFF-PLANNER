import React from "react";
import { View, StyleSheet } from "react-native";

/**
 * Programmatically drawn mascot matching the welcome mock.
 * Uses layered Views (no image assets).
 */
export function WelcomeMascot({ size = 160 }: { size?: number }) {
  const S = size;
  const head = S;
  const ear = Math.round(S * 0.34);
  const cheek = Math.round(S * 0.18);
  const armW = Math.round(S * 0.26);
  const armH = Math.round(S * 0.36);
  const eyeW = Math.round(S * 0.28);
  const eyeH = Math.round(S * 0.34);
  const pupil = Math.round(S * 0.16);
  const highlight = Math.round(S * 0.06);
  // Feet dimensions based on SVG rounded-rect spec (width=52, height=38, rx=18 at base size)
  const base = 210; // approximate SVG viewBox height to scale from
  const scale = S / base;
  const footW = Math.round(52 * scale);
  const footH = Math.round(38 * scale);
  const footR = Math.round(18 * scale);

  return (
    <View style={{ width: S * 1.2, height: S * 1.32, alignItems: "center" }}>
      {/* arms */}
      <View
        style={[
          s.arm,
          {
            width: armW,
            height: armH,
            borderRadius: Math.round(armW * 0.55),
            left: 0,
            top: Math.round(S * 0.44),
          },
        ]}
      />
      <View
        style={[
          s.arm,
          {
            width: armW,
            height: armH,
            borderRadius: Math.round(armW * 0.55),
            right: 0,
            top: Math.round(S * 0.44),
          },
        ]}
      />

      {/* head group */}
      <View style={{ width: head, height: head, alignItems: "center", justifyContent: "center" }}>
        {/* ears */}
        <View style={[s.ear, { width: ear, height: ear, borderRadius: ear / 2, left: -Math.round(ear * 0.2), top: -Math.round(ear * 0.05) }]} />
        <View style={[s.ear, { width: ear, height: ear, borderRadius: ear / 2, right: -Math.round(ear * 0.2), top: -Math.round(ear * 0.05) }]} />

        {/* face */}
        <View style={[s.face, { width: head, height: head, borderRadius: head / 2 }]} />

        {/* cheeks */}
        <View style={[s.cheek, { width: cheek, height: cheek, borderRadius: cheek / 2, left: Math.round(S * 0.22), top: Math.round(S * 0.54) }]} />
        <View style={[s.cheek, { width: cheek, height: cheek, borderRadius: cheek / 2, right: Math.round(S * 0.22), top: Math.round(S * 0.54) }]} />

        {/* eyes */}
        <View style={[s.eyeWhite, { width: eyeW, height: eyeH, borderRadius: Math.round(eyeW * 0.55), left: Math.round(S * 0.22), top: Math.round(S * 0.26) }]}>
          <View style={[s.pupil, { width: pupil, height: pupil, borderRadius: pupil / 2, right: Math.round(pupil * 0.15), top: Math.round(pupil * 0.25) }]}>
            <View style={[s.highlight, { width: highlight, height: highlight, borderRadius: highlight / 2, left: Math.round(highlight * 0.25), top: Math.round(highlight * 0.2) }]} />
          </View>
        </View>
        <View style={[s.eyeWhite, { width: eyeW, height: eyeH, borderRadius: Math.round(eyeW * 0.55), right: Math.round(S * 0.22), top: Math.round(S * 0.26) }]}>
          <View style={[s.pupil, { width: pupil, height: pupil, borderRadius: pupil / 2, left: Math.round(pupil * 0.15), top: Math.round(pupil * 0.25) }]}>
            <View style={[s.highlight, { width: highlight, height: highlight, borderRadius: highlight / 2, left: Math.round(highlight * 0.25), top: Math.round(highlight * 0.2) }]} />
          </View>
        </View>

        {/* smile */}
        <View
          style={{
            position: "absolute",
            width: Math.round(S * 0.26),
            height: Math.round(S * 0.16),
            borderBottomWidth: Math.round(S * 0.03),
            borderBottomColor: "#7A4A20",
            borderLeftWidth: Math.round(S * 0.03),
            borderLeftColor: "transparent",
            borderRightWidth: Math.round(S * 0.03),
            borderRightColor: "transparent",
            borderBottomLeftRadius: 999,
            borderBottomRightRadius: 999,
            top: Math.round(S * 0.62),
          }}
        />
      </View>

      {/* feet (two dark brown rounded rectangles, drawn "before" body so body overlaps tops) */}
      <View
        style={{
          marginTop: -Math.round(S * 0.02), // slight lift so head/body cover upper part
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={[
            s.foot,
            {
              width: footW,
              height: footH,
              borderRadius: footR,
              marginRight: Math.round(S * 0.02),
            },
          ]}
        />
        <View
          style={[
            s.foot,
            {
              width: footW,
              height: footH,
              borderRadius: footR,
            },
          ]}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  face: { position: "absolute", backgroundColor: "#E3A12B" },
  ear: { position: "absolute", backgroundColor: "#C99022" },
  arm: { position: "absolute", backgroundColor: "#C99022" },
  cheek: { position: "absolute", backgroundColor: "rgba(255, 192, 203, 0.35)" },
  eyeWhite: { position: "absolute", backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  pupil: { position: "absolute", backgroundColor: "#231F20", alignItems: "center", justifyContent: "center" },
  highlight: { position: "absolute", backgroundColor: "#FFFFFF" },
  foot: { backgroundColor: "#5B2E10" },
});

