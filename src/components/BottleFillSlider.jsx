/**
 * Vertical fill level for a bottle (0–100%). User drags the line up/down smoothly.
 * Light blue → dark blue gradient fill below the line; line has circular handles.
 */
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  PanResponder,
  TouchableOpacity,
  Animated,
} from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { Icon, Icons } from "../assets/icons";
import { getBottleImage } from "../assets/images/bottleImages";
import { colors, spacing } from "../theme/colors";

const FILL_GRADIENT = {
  lightBlue: "#ffffff",
  darkBlue: "#00009c",
};

const DEFAULT_BOTTLE_HEIGHT = 240;
const BOTTLE_WIDTH = Math.min(Dimensions.get("window").width * 0.5, 180);
const BOTTLE_VERTICAL_PADDING = 24;
const LINE_HIT_HEIGHT = 40;
const LINE_THICKNESS = 3;
const HANDLE_RADIUS = 6;
const MIN_BOTTLE_HEIGHT = 160;
const MAX_BOTTLE_HEIGHT = 320;

function BottleFillSlider({
  image,
  name,
  fillLevel,
  onFillLevelChange,
  onPrev,
  onNext,
}) {
  const initialFill = Math.min(100, Math.max(0, Number(fillLevel) ?? 100));
  const [, setFill] = useState(initialFill);
  const [bottleHeight, setBottleHeight] = useState(DEFAULT_BOTTLE_HEIGHT);
  const bottleHeightRef = useRef(DEFAULT_BOTTLE_HEIGHT);
  bottleHeightRef.current = bottleHeight;
  const bottleWrapRef = useRef(null);
  const bottleLayoutRef = useRef({ top: -1, height: DEFAULT_BOTTLE_HEIGHT });
  const dragStartRef = useRef(null);
  const lastFillRef = useRef(initialFill);
  const fillAnim = useRef(new Animated.Value(initialFill)).current;
  const onFillRef = useRef(onFillLevelChange);
  onFillRef.current = onFillLevelChange;

  useEffect(() => {
    const next = Math.min(100, Math.max(0, Number(fillLevel) ?? 100));
    setFill(next);
    lastFillRef.current = next;
    fillAnim.setValue(next);
  }, [fillLevel, fillAnim]);

  const handleBottleLayout = () => {
    bottleWrapRef.current?.measureInWindow((x, y, w, h) => {
      if (h > 0) bottleLayoutRef.current = { top: y, height: h };
    });
  };

  const handleImageLoad = (e) => {
    const { width, height } = e?.nativeEvent?.source || {};
    if (width && height && height > 0) {
      const aspect = height / width;
      const h = Math.round(
        Math.min(
          MAX_BOTTLE_HEIGHT,
          Math.max(MIN_BOTTLE_HEIGHT, BOTTLE_WIDTH * aspect),
        ),
      );
      setBottleHeight(h);
    }
  };

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (_, g) => {
          dragStartRef.current = { y: g.moveY, fill: lastFillRef.current };
          bottleWrapRef.current?.measureInWindow((x, y, w, h) => {
            if (h > 0) bottleLayoutRef.current = { top: y, height: h };
          });
        },
        onPanResponderMove: (_, g) => {
          const { top, height } = bottleLayoutRef.current;
          const touchY = g.moveY;
          let clamped;
          if (top >= 0 && height > 0) {
            const relativeY = touchY - top;
            const fillPct = (1 - relativeY / height) * 100;
            clamped = Math.min(100, Math.max(0, fillPct));
          } else {
            const start = dragStartRef.current;
            const h = bottleHeightRef.current;
            if (start == null || !h) return;
            const dy = touchY - start.y;
            const pctChange = (dy / h) * 100;
            clamped = Math.min(100, Math.max(0, start.fill - pctChange));
          }
          lastFillRef.current = clamped;
          fillAnim.setValue(clamped);
        },
        onPanResponderRelease: () => {
          const final = lastFillRef.current;
          dragStartRef.current = null;
          setFill(final);
          onFillRef.current?.(final);
        },
      }),
    [fillAnim],
  );

  // Full bottle height for gradient (no top/bottom insets so fill covers cap to base)
  const overlayBottomInset = 0;
  const overlaySideInset = Math.max(4, Math.round(BOTTLE_WIDTH * 0.04));
  const overlayMaxHeight = bottleHeight;
  const overlayHeight = fillAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, overlayMaxHeight],
  });
  const lineTop = fillAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [
      bottleHeight - overlayBottomInset,
      bottleHeight - overlayBottomInset - overlayMaxHeight,
    ],
  });

  const imageSource = useMemo(() => {
    const resolved = getBottleImage({ name, image });
    return (
      resolved ||
      (image &&
        (image.startsWith("http") || image.startsWith("file")
          ? { uri: image }
          : null))
    );
  }, [name, image]);

  useEffect(() => {
    if (!imageSource) setBottleHeight(DEFAULT_BOTTLE_HEIGHT);
  }, [imageSource]);

  const showNav = onPrev != null || onNext != null;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {showNav ? (
          <TouchableOpacity
            style={[styles.chevronSide, { height: bottleHeight + BOTTLE_VERTICAL_PADDING }]}
            onPress={onPrev}
            activeOpacity={0.7}
          >
            <Icon
              name={Icons.chevronLeft}
              size={36}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        ) : (
          <View style={[styles.chevronSide, { height: bottleHeight + BOTTLE_VERTICAL_PADDING }]} />
        )}

        <View
          style={[styles.bottleWrap, { height: bottleHeight + BOTTLE_VERTICAL_PADDING }]}
        >
          <View
            ref={bottleWrapRef}
            onLayout={handleBottleLayout}
            style={[styles.bottleInner, { height: bottleHeight, width: BOTTLE_WIDTH }]}
          >
          {imageSource ? (
            <>
              <Image
                source={imageSource}
                style={styles.bottleImage}
                resizeMode="contain"
                onLoad={handleImageLoad}
              />

              <MaskedView
                style={StyleSheet.absoluteFill}
                maskElement={
                  <Image
                    source={imageSource}
                    style={styles.bottleImage}
                    resizeMode="contain"
                  />
                }
              >
                <View style={styles.maskContent}>
                  <Animated.View
                    style={[
                      styles.fillOverlay,
                      {
                        left: overlaySideInset,
                        right: overlaySideInset,
                        bottom: overlayBottomInset,
                        height: overlayHeight,
                      },
                    ]}
                    pointerEvents="none"
                  >
                    <Svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      style={StyleSheet.absoluteFill}
                    >
                      <Defs>
                        <LinearGradient
                          id="bottleFillGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <Stop
                            offset="0"
                            stopColor={FILL_GRADIENT.lightBlue}
                            stopOpacity={0.85}
                          />
                          <Stop
                            offset="1"
                            stopColor={FILL_GRADIENT.darkBlue}
                            stopOpacity={0.9}
                          />
                        </LinearGradient>
                      </Defs>
                      <Rect
                        x={0}
                        y={0}
                        width={100}
                        height={100}
                        fill="url(#bottleFillGrad)"
                      />
                    </Svg>
                  </Animated.View>
                </View>
              </MaskedView>
            </>
          ) : (
            <View style={styles.placeholderBottle}>
              <Icon
                name={Icons.localBar}
                size={48}
                color={colors.textSecondary}
                style={styles.placeholderIcon}
              />
            </View>
          )}
          <Animated.View
            {...pan.panHandlers}
            style={[styles.lineIndicator, { top: lineTop }]}
          >
            <View style={styles.lineRow}>
              <View style={styles.lineHandle} />
              <View style={[styles.line, styles.lineMiddle]} />
              <View style={styles.lineHandle} />
            </View>
          </Animated.View>
          </View>
        </View>

        {showNav ? (
          <TouchableOpacity
            style={[styles.chevronSide, { height: bottleHeight + BOTTLE_VERTICAL_PADDING }]}
            onPress={onNext}
            activeOpacity={0.7}
          >
            <Icon
              name={Icons.chevronRight}
              size={36}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        ) : (
          <View style={[styles.chevronSide, { height: bottleHeight + BOTTLE_VERTICAL_PADDING }]} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  chevronSide: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  bottleWrap: {
    width: BOTTLE_WIDTH,
    position: "relative",
    overflow: "visible",
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  bottleInner: {
    position: "relative",
    overflow: "visible",
  },
  bottleImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
    // opacity: 0.19,
  },
  placeholderBottle: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIcon: {
    opacity: 0.5,
  },
  maskContent: {
    flex: 1,
    backgroundColor: "transparent",
  },
  fillOverlay: {
    position: "absolute",
    overflow: "hidden",
    opacity: 0.6,
  },
  lineIndicator: {
    position: "absolute",
    left: -4,
    right: -4,
    height: LINE_HIT_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: spacing.xxl + 9,
  },
  lineRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
  },
  lineHandle: {
    width: HANDLE_RADIUS * 2,
    height: HANDLE_RADIUS * 2,
    borderRadius: HANDLE_RADIUS,
    backgroundColor: colors.primaryBlue,
  },
  line: {
    flex: 1,
    height: LINE_THICKNESS,
    backgroundColor: colors.primaryBlue,
    borderRadius: 2,
  },
  lineMiddle: {
    marginHorizontal: 2,
  },
});

export default BottleFillSlider;
