import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  FlatList, 
  Animated,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Zap, Timer, TrendingUp, ChevronRight, Play } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

const { width, height } = Dimensions.get('window');

const ONBOARDING_STEPS = [
  {
    id: '1',
    headline: 'Conquiste\nSeu Território',
    subtitle: 'Transforme suas corridas em conquistas reais no mapa',
    visual: 'hero',
  },
  {
    id: '2',
    headline: 'Como Funciona',
    subtitle: 'Simples. Rápido. Viciante.',
    visual: 'howItWorks',
  },
  {
    id: '3',
    headline: 'Por Que Funciona',
    subtitle: 'Resultados comprovados por milhares de corredores',
    visual: 'benefits',
  },
  {
    id: '4',
    headline: 'Pronto Para\nDominar?',
    subtitle: 'Sua primeira conquista está a uma corrida de distância',
    visual: 'cta',
  },
];

const AnimatedWave = ({ delay = 0, color = Colors.primary }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue, delay]);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.7, 0.3],
  });

  return (
    <Animated.View
      style={[
        styles.wave,
        {
          backgroundColor: color,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    />
  );
};

const PulsingCircle = ({ size = 200, delay = 0 }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.6,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [scaleAnim, opacityAnim, delay]);

  return (
    <Animated.View
      style={[
        styles.pulsingCircle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    />
  );
};

const HeroVisual = () => {
  const runnerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(runnerAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(runnerAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [runnerAnim]);

  const bounceY = runnerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <View style={styles.heroVisual}>
      <PulsingCircle size={280} delay={0} />
      <PulsingCircle size={220} delay={300} />
      <PulsingCircle size={160} delay={600} />
      
      <View style={styles.heroIconContainer}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.heroIconGradient}
        >
          <Animated.View style={{ transform: [{ translateY: bounceY }] }}>
            <Play size={48} color={Colors.background} fill={Colors.background} />
          </Animated.View>
        </LinearGradient>
      </View>
      
      <View style={styles.heroLines}>
        {[...Array(5)].map((_, i) => (
          <AnimatedWave key={i} delay={i * 200} color={Colors.primary} />
        ))}
      </View>
    </View>
  );
};

const HowItWorksVisual = () => {
  const step1Anim = useRef(new Animated.Value(0)).current;
  const step2Anim = useRef(new Animated.Value(0)).current;
  const step3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const runAnimation = () => {
      Animated.sequence([
        Animated.timing(step1Anim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.delay(400),
        Animated.timing(step2Anim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.delay(400),
        Animated.timing(step3Anim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.delay(1000),
        Animated.parallel([
          Animated.timing(step1Anim, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(step2Anim, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(step3Anim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
        Animated.delay(500),
      ]).start(() => runAnimation());
    };
    runAnimation();
  }, [step1Anim, step2Anim, step3Anim]);

  const steps = [
    { anim: step1Anim, icon: Play, label: 'Correr', color: Colors.primary },
    { anim: step2Anim, icon: Timer, label: 'Fechar Loop', color: Colors.secondary },
    { anim: step3Anim, icon: Zap, label: 'Conquistar', color: Colors.warning },
  ];

  return (
    <View style={styles.howItWorksVisual}>
      {steps.map((step, index) => {
        const IconComponent = step.icon;
        return (
          <Animated.View
            key={index}
            style={[
              styles.stepItem,
              {
                opacity: step.anim,
                transform: [
                  {
                    scale: step.anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={[styles.stepIcon, { backgroundColor: step.color + '20' }]}>
              <IconComponent size={28} color={step.color} />
            </View>
            <Text style={[styles.stepLabel, { color: step.color }]}>{step.label}</Text>
            {index < steps.length - 1 && (
              <View style={styles.stepConnector}>
                <ChevronRight size={20} color={Colors.textTertiary} />
              </View>
            )}
          </Animated.View>
        );
      })}
    </View>
  );
};

const BenefitsVisual = () => {
  const benefits = [
    { icon: TrendingUp, text: 'Mais performance', value: '+40%' },
    { icon: Timer, text: 'Motivação diária', value: '100%' },
    { icon: Zap, text: 'Resultados rápidos', value: '2x' },
  ];

  const anims = useRef(benefits.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(
      200,
      anims.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        })
      )
    ).start();
  }, [anims]);

  return (
    <View style={styles.benefitsVisual}>
      {benefits.map((benefit, index) => {
        const IconComponent = benefit.icon;
        return (
          <Animated.View
            key={index}
            style={[
              styles.benefitItem,
              {
                opacity: anims[index],
                transform: [
                  {
                    translateX: anims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [-50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.benefitIconWrapper}>
              <LinearGradient
                colors={[Colors.primary + '30', Colors.primary + '10']}
                style={styles.benefitIconBg}
              >
                <IconComponent size={24} color={Colors.primary} />
              </LinearGradient>
            </View>
            <View style={styles.benefitTextContainer}>
              <Text style={styles.benefitValue}>{benefit.value}</Text>
              <Text style={styles.benefitText}>{benefit.text}</Text>
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
};

const CTAVisual = () => {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowAnim]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  return (
    <View style={styles.ctaVisual}>
      <Animated.View
        style={[
          styles.ctaGlow,
          {
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          },
        ]}
      />
      <View style={styles.ctaIconContainer}>
        <Zap size={64} color={Colors.primary} fill={Colors.primary} />
      </View>
    </View>
  );
};

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = async () => {
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      await completeOnboarding();
      router.replace('/(tabs)');
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  const renderVisual = (visualType: string) => {
    switch (visualType) {
      case 'hero':
        return <HeroVisual />;
      case 'howItWorks':
        return <HowItWorksVisual />;
      case 'benefits':
        return <BenefitsVisual />;
      case 'cta':
        return <CTAVisual />;
      default:
        return null;
    }
  };

  const renderItem = ({ item, index }: { item: typeof ONBOARDING_STEPS[0]; index: number }) => {
    const isLastSlide = index === ONBOARDING_STEPS.length - 1;

    return (
      <View style={[styles.slide, { width }]}>
        <View style={styles.visualContainer}>
          {renderVisual(item.visual)}
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.headline}>{item.headline}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>

        {isLastSlide && (
          <View style={styles.ctaButtonsContainer}>
            <TouchableOpacity
              style={styles.mainCTAButton}
              onPress={handleNext}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.mainCTAGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.mainCTAText}>Começar Agora</Text>
                <View style={styles.mainCTAIconWrapper}>
                  <ChevronRight size={22} color={Colors.background} strokeWidth={3} />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryCTA}
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryCTAText}>Explorar depois</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const isLastSlide = currentIndex === ONBOARDING_STEPS.length - 1;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.backgroundSecondary, Colors.background]}
        style={StyleSheet.absoluteFill}
        locations={[0, 0.5, 1]}
      />

      <View style={styles.bgPattern}>
        <View style={[styles.bgLine, { top: '20%', left: -100 }]} />
        <View style={[styles.bgLine, { top: '40%', right: -100 }]} />
        <View style={[styles.bgLine, { top: '70%', left: -50 }]} />
      </View>

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        {!isLastSlide && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Pular</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_STEPS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.pagination}>
          {ONBOARDING_STEPS.map((_, index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 32, 8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.25, 1, 0.25],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity,
                  },
                ]}
              />
            );
          })}
        </View>

        {!isLastSlide && (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.nextButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.nextButtonText}>Continuar</Text>
              <ChevronRight size={20} color={Colors.background} strokeWidth={2.5} />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  bgPattern: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bgLine: {
    position: 'absolute',
    width: width * 1.5,
    height: 1,
    backgroundColor: Colors.primary,
    opacity: 0.06,
    transform: [{ rotate: '-15deg' }],
  },
  header: {
    paddingHorizontal: 20,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    zIndex: 10,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  slide: {
    flex: 1,
    paddingHorizontal: 24,
  },
  visualContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: height * 0.42,
  },
  textContainer: {
    paddingVertical: 24,
  },
  headline: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: Colors.text,
    lineHeight: 44,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  dot: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  nextButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.background,
    letterSpacing: 0.3,
  },
  heroVisual: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulsingCircle: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
  },
  heroIconContainer: {
    zIndex: 10,
  },
  heroIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  heroLines: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    gap: 8,
  },
  wave: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  howItWorksVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  stepItem: {
    alignItems: 'center',
    position: 'relative',
  },
  stepIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
  stepConnector: {
    position: 'absolute',
    right: -20,
    top: 20,
  },
  benefitsVisual: {
    width: '100%',
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  benefitIconWrapper: {
    marginRight: 16,
  },
  benefitIconBg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.primary,
    marginBottom: 2,
  },
  benefitText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  ctaVisual: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.primary,
    opacity: 0.15,
  },
  ctaIconContainer: {
    zIndex: 10,
  },
  ctaButtonsContainer: {
    paddingTop: 8,
    gap: 12,
  },
  mainCTAButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  mainCTAGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  mainCTAText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.background,
    letterSpacing: 0.5,
  },
  mainCTAIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryCTA: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  secondaryCTAText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
});
