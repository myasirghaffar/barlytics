/**
 * Vertical fill level for a bottle (0–100%). User drags the line up/down smoothly.
 * Layout: [left arrow] [centered bottle + line] [right arrow].
 * During drag only Animated value is updated (no setState) for 60fps.
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  PanResponder,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Icon, Icons } from '../assets/icons';
import { getBottleImage } from '../assets/images/bottleImages';
import { colors } from '../theme/colors';

const DEFAULT_BOTTLE_HEIGHT = 240;
const BOTTLE_WIDTH = Math.min(Dimensions.get('window').width * 0.5, 180);
const LINE_HIT_HEIGHT = 32;
const MIN_BOTTLE_HEIGHT = 160;
const MAX_BOTTLE_HEIGHT = 320;

function BottleFillSlider({ image, name, fillLevel, onFillLevelChange, onPrev, onNext }) {
  const initialFill = Math.min(100, Math.max(0, Number(fillLevel) ?? 100));
  const [fill, setFill] = useState(initialFill);
  const [bottleHeight, setBottleHeight] = useState(DEFAULT_BOTTLE_HEIGHT);
  const bottleHeightRef = useRef(DEFAULT_BOTTLE_HEIGHT);
  bottleHeightRef.current = bottleHeight;
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

  const handleImageLoad = (e) => {
    const { width, height } = e?.nativeEvent?.source || {};
    if (width && height && height > 0) {
      const aspect = height / width;
      const h = Math.round(Math.min(MAX_BOTTLE_HEIGHT, Math.max(MIN_BOTTLE_HEIGHT, BOTTLE_WIDTH * aspect)));
      setBottleHeight(h);
    }
  };

  const rafIdRef = useRef(null);
  const latestMoveYRef = useRef(null);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (_, g) => {
          dragStartRef.current = { y: g.moveY, fill: lastFillRef.current };
        },
        onPanResponderMove: (_, g) => {
          latestMoveYRef.current = g.moveY;
          if (rafIdRef.current != null) return;
          rafIdRef.current = requestAnimationFrame(() => {
            rafIdRef.current = null;
            const start = dragStartRef.current;
            const moveY = latestMoveYRef.current;
            const h = bottleHeightRef.current;
            if (start == null || moveY == null || !h) return;
            const dy = moveY - start.y;
            const pctChange = (dy / h) * 100;
            const clamped = Math.min(100, Math.max(0, start.fill - pctChange));
            lastFillRef.current = clamped;
            fillAnim.setValue(clamped);
          });
        },
        onPanResponderRelease: () => {
          if (rafIdRef.current != null) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
          }
          const final = lastFillRef.current;
          dragStartRef.current = null;
          latestMoveYRef.current = null;
          setFill(final);
          onFillRef.current?.(final);
        },
      }),
    [fillAnim]
  );

  const lineTop = fillAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [bottleHeight - 8 - LINE_HIT_HEIGHT, 0],
  });
  const overlayHeight = fillAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, bottleHeight - 8],
  });

  const resolved = getBottleImage({ name, image });
  const imageSource = resolved || (image && (image.startsWith('http') || image.startsWith('file') ? { uri: image } : null));

  useEffect(() => {
    if (!imageSource) setBottleHeight(DEFAULT_BOTTLE_HEIGHT);
  }, [imageSource]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity style={[styles.chevronSide, { height: bottleHeight }]} onPress={onPrev} activeOpacity={0.7}>
          <Icon name={Icons.chevronLeft} size={36} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={[styles.bottleWrap, { height: bottleHeight }]}>
          {imageSource ? (
            <Image
              source={imageSource}
              style={styles.bottleImage}
              resizeMode="contain"
              onLoad={handleImageLoad}
            />
          ) : (
            <View style={styles.placeholderBottle}>
              <Icon name={Icons.localBar} size={48} color={colors.textSecondary} style={{ opacity: 0.5 }} />
            </View>
          )}
          <Animated.View
            style={[
              styles.fillOverlay,
              { height: overlayHeight },
            ]}
            pointerEvents="none"
          />
          <Animated.View
            {...pan.panHandlers}
            style={[styles.lineIndicator, { top: lineTop }]}
          >
            <View style={[styles.line, styles.lineHit]} />
          </Animated.View>
        </View>

        <TouchableOpacity style={[styles.chevronSide, { height: bottleHeight }]} onPress={onNext} activeOpacity={0.7}>
          <Icon name={Icons.chevronRight} size={36} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronSide: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottleWrap: {
    width: BOTTLE_WIDTH,
    position: 'relative',
    overflow: 'visible',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  bottleImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  placeholderBottle: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fillOverlay: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 6,
    backgroundColor: 'rgba(46, 204, 113, 0.5)',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  lineIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: LINE_HIT_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    width: '100%',
    height: 3,
    backgroundColor: '#0D7377',
    borderRadius: 2,
  },
  lineHit: {
    marginVertical: (LINE_HIT_HEIGHT - 3) / 2,
  },
});

export default BottleFillSlider;
