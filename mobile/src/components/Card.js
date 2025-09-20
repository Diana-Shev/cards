import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.3;
const SWIPE_OUT_DURATION = 250;

export function Card({ card, onSwipeRight, onSwipeLeft, onStarPress, isFavorite }) {
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        Animated.spring(scale, {
          toValue: 1.05,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (evt, gestureState) => {
        pan.setValue({ x: gestureState.dx, y: gestureState.dy });
        
        // Поворот карточки при свайпе
        const rotation = gestureState.dx / 10;
        rotate.setValue(rotation);
      },
      onPanResponderRelease: (evt, gestureState) => {
        pan.flattenOffset();
        
        if (gestureState.dx > SWIPE_THRESHOLD) {
          // Свайп вправо - понравилось
          Animated.parallel([
            Animated.timing(pan, {
              toValue: { x: width * 1.5, y: gestureState.dy },
              duration: SWIPE_OUT_DURATION,
              useNativeDriver: true,
            }),
            Animated.timing(rotate, {
              toValue: 1,
              duration: SWIPE_OUT_DURATION,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onSwipeRight();
            resetCard();
          });
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Свайп влево - не понравилось
          Animated.parallel([
            Animated.timing(pan, {
              toValue: { x: -width * 1.5, y: gestureState.dy },
              duration: SWIPE_OUT_DURATION,
              useNativeDriver: true,
            }),
            Animated.timing(rotate, {
              toValue: -1,
              duration: SWIPE_OUT_DURATION,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onSwipeLeft();
            resetCard();
          });
        } else {
          // Возврат карточки в исходное положение
          Animated.parallel([
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: true,
            }),
            Animated.spring(scale, {
              toValue: 1,
              useNativeDriver: true,
            }),
            Animated.spring(rotate, {
              toValue: 0,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const resetCard = () => {
    pan.setValue({ x: 0, y: 0 });
    scale.setValue(1);
    rotate.setValue(0);
  };

  const rotateInterpolate = rotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  const rightOpacity = pan.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const leftOpacity = pan.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.card,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { scale: scale },
              { rotate: rotateInterpolate },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.cardContent}>
          <Text style={styles.cardText}>{card.text}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.starButton}
          onPress={onStarPress}
        >
          <MaterialIcons
            name={isFavorite ? 'star' : 'star-border'}
            size={32}
            color={isFavorite ? theme.colors.accent : theme.colors.placeholder}
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Индикаторы свайпа */}
      <Animated.View
        style={[
          styles.swipeIndicator,
          styles.rightIndicator,
          { opacity: rightOpacity },
        ]}
      >
        <MaterialIcons name="favorite" size={40} color={theme.colors.success} />
        <Text style={styles.indicatorText}>Понравилось!</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.swipeIndicator,
          styles.leftIndicator,
          { opacity: leftOpacity },
        ]}
      >
        <MaterialIcons name="close" size={40} color={theme.colors.error} />
        <Text style={styles.indicatorText}>Не понравилось</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: width * 0.9,
    height: height * 0.6,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardText: {
    fontSize: 18,
    lineHeight: 28,
    color: theme.colors.text,
    textAlign: 'center',
    fontWeight: '400',
  },
  starButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
  },
  swipeIndicator: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -50 }],
    alignItems: 'center',
  },
  rightIndicator: {
    right: 20,
  },
  leftIndicator: {
    left: 20,
  },
  indicatorText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    color: theme.colors.text,
  },
});
