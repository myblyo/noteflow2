import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  PanResponder,
  StyleSheet,
  type LayoutChangeEvent,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from "react-native";

import type { ImageBlock } from "../types/noteDocument";
import { RemoteImage } from "./RemoteImage";
import { useThemeColors } from "../hooks/useTheme";
import { spacing, radius } from "../constants/theme";

const CANVAS_PADDING = spacing.sm;
const GRID_GAP = spacing.sm;
const DEFAULT_SIZE = 140;
const MIN_SIZE = 96;

export type NativeImageLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function resolveNativeImageLayout(
  image: ImageBlock,
  index: number,
  containerWidth: number,
): NativeImageLayout {
  const maxWidth = Math.max(MIN_SIZE, containerWidth - CANVAS_PADDING * 2);
  const width = Math.min(Math.max(image.width || DEFAULT_SIZE, MIN_SIZE), maxWidth);
  const aspect =
    image.height && image.width ? image.height / image.width : 0.75;
  const height = Math.max(MIN_SIZE, Math.round(width * aspect));

  if (
    image.wrap === "free" &&
    typeof image.x === "number" &&
    typeof image.y === "number"
  ) {
    return {
      x: image.x,
      y: image.y,
      width,
      height: image.height ?? height,
    };
  }

  const cols = containerWidth >= 520 ? 3 : 2;
  const col = index % cols;
  const row = Math.floor(index / cols);
  const cellWidth =
    (containerWidth - CANVAS_PADDING * 2 - GRID_GAP * (cols - 1)) / cols;
  const displayWidth = Math.min(width, cellWidth);
  const displayHeight = Math.max(MIN_SIZE, Math.round(displayWidth * aspect));

  return {
    x: CANVAS_PADDING + col * (cellWidth + GRID_GAP),
    y: CANVAS_PADDING + row * (displayHeight + GRID_GAP),
    width: displayWidth,
    height: displayHeight,
  };
}

function clampPosition(
  x: number,
  y: number,
  width: number,
  height: number,
  containerWidth: number,
  containerHeight: number,
) {
  const maxX = Math.max(CANVAS_PADDING, containerWidth - width - CANVAS_PADDING);
  const maxY = Math.max(CANVAS_PADDING, containerHeight - height - CANVAS_PADDING);
  return {
    x: Math.min(maxX, Math.max(CANVAS_PADDING, x)),
    y: Math.min(maxY, Math.max(CANVAS_PADDING, y)),
  };
}

type DraggableNoteImageProps = {
  image: ImageBlock;
  layout: NativeImageLayout;
  containerWidth: number;
  containerHeight: number;
  isActive: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onMove: (x: number, y: number) => void;
};

function DraggableNoteImage({
  image,
  layout,
  containerWidth,
  containerHeight,
  isActive,
  onDragStart,
  onDragEnd,
  onMove,
}: DraggableNoteImageProps) {
  const colors = useThemeColors();
  const origin = useRef({ x: layout.x, y: layout.y });
  const positionRef = useRef({ x: layout.x, y: layout.y });
  const [renderTick, setRenderTick] = useState(0);

  React.useEffect(() => {
    const next = { x: layout.x, y: layout.y };
    origin.current = next;
    positionRef.current = next;
    setRenderTick((tick) => tick + 1);
  }, [layout.x, layout.y, image.id]);

  const position = positionRef.current;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 2 || Math.abs(gesture.dy) > 2,
        onPanResponderGrant: () => {
          origin.current = { ...positionRef.current };
          onDragStart();
        },
        onPanResponderMove: (_: GestureResponderEvent, gesture: PanResponderGestureState) => {
          const next = clampPosition(
            origin.current.x + gesture.dx,
            origin.current.y + gesture.dy,
            layout.width,
            layout.height,
            containerWidth,
            containerHeight,
          );
          positionRef.current = next;
          setRenderTick((tick) => tick + 1);
        },
        onPanResponderRelease: (_: GestureResponderEvent, gesture: PanResponderGestureState) => {
          const next = clampPosition(
            origin.current.x + gesture.dx,
            origin.current.y + gesture.dy,
            layout.width,
            layout.height,
            containerWidth,
            containerHeight,
          );
          positionRef.current = next;
          setRenderTick((tick) => tick + 1);
          onMove(next.x, next.y);
          onDragEnd();
        },
        onPanResponderTerminate: () => {
          onDragEnd();
        },
      }),
    [
      containerHeight,
      containerWidth,
      layout.height,
      layout.width,
      onDragEnd,
      onDragStart,
      onMove,
    ],
  );

  void renderTick;

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.imageWrap,
        {
          left: position.x,
          top: position.y,
          width: layout.width,
          height: layout.height,
          borderColor: isActive ? colors.accent : colors.border,
          zIndex: isActive ? 20 : 1,
          elevation: isActive ? 8 : 0,
        },
      ]}
    >
      <RemoteImage
        uri={image.url}
        style={styles.image}
        contentFit="cover"
      />
    </View>
  );
}

type NativeNoteImageCanvasProps = {
  images: ImageBlock[];
  onImageMove: (imageId: string, x: number, y: number) => void;
};

export function NativeNoteImageCanvas({
  images,
  onImageMove,
}: NativeNoteImageCanvasProps) {
  const colors = useThemeColors();
  const [containerWidth, setContainerWidth] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  const layouts = useMemo(() => {
    if (containerWidth <= 0) return [];
    return images.map((image, index) =>
      resolveNativeImageLayout(image, index, containerWidth),
    );
  }, [containerWidth, images]);

  const canvasHeight = useMemo(() => {
    if (layouts.length === 0) return 0;
    const bottom = Math.max(...layouts.map((layout) => layout.y + layout.height));
    return bottom + CANVAS_PADDING;
  }, [layouts]);

  if (images.length === 0) return null;

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.canvas,
        {
          minHeight: canvasHeight || 160,
          backgroundColor: colors.surfaceTranslucent,
          borderColor: colors.border,
        },
      ]}
    >
      {containerWidth > 0
        ? images.map((image, index) => (
            <DraggableNoteImage
              key={image.id}
              image={image}
              layout={layouts[index]}
              containerWidth={containerWidth}
              containerHeight={canvasHeight}
              isActive={activeId === image.id}
              onDragStart={() => setActiveId(image.id)}
              onDragEnd={() => setActiveId(null)}
              onMove={(x, y) => onImageMove(image.id, x, y)}
            />
          ))
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: "100%",
    marginTop: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    position: "relative",
    overflow: "hidden",
  },
  imageWrap: {
    position: "absolute",
    borderWidth: 2,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
