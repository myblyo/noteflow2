import React from "react";
import { View, StyleProp, ViewStyle } from "react-native";

interface IdeaColorDotProps {
  color: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function IdeaColorDot({ color, size = 24, style }: IdeaColorDotProps) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}
