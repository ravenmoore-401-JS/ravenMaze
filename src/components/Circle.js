import React from "react";
import { View,  Dimensions } from "react-native";

const {height, width} = Dimensions.get('window');

const BODY_DIA = Math.trunc(Math.max(width,height)*0.02);

const BORDER_WIDTH = Math.trunc(BODY_DIA * 0.1);

const Circle = ({ body, bgColor, borderColor }) => {
  const { position } = body;
  const radius = BODY_DIA / 2;
  
  const x = position.x - radius;
  const y = position.y - radius;
  return <View style={[styles.head, { left: x, top: y, backgroundColor: bgColor, borderColor  }]} />;
}

export default Circle;

const styles = {
  head: {
    borderWidth: BORDER_WIDTH,
    width: BODY_DIA,
    height: BODY_DIA,
    position: "absolute",
    borderRadius: BODY_DIA * 2
  }
}