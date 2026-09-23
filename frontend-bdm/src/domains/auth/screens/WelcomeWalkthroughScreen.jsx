import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { colors, spacing, typography } from '../../../shared/theme/index.js';
import { FluentButton } from '../../../shared/components/index.js';
import { setOnboardingCompleted } from '../../../shared/store/slices/authSlice.js';
import { ROUTES } from '../../../shared/navigation/routes.js';

const SLIDES = [
  {
    title: '1. My Assigned Leads',
    desc: 'All leads allocated to you appear here in real-time. Follow up on schedule and never miss an overdue notification.',
    icon: '📋',
  },
  {
    title: '2. Daily Attendance Punch',
    desc: 'Punch in every morning before calling. Check out at end of shift with a single tap.',
    icon: '⏰',
  },
  {
    title: '3. Real-Time Broadcasts',
    desc: 'Instant live alerts when new leads are assigned or follow-up milestones are due.',
    icon: '🔔',
  },
];

export const WelcomeWalkthroughScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    dispatch(setOnboardingCompleted());
    navigation.replace(ROUTES.MAIN_TABS);
  };

  const slide = SLIDES[currentSlide];

  return (
    <View style={styles.container}>
      <Text style={styles.topIndicator}>
        NEW HIRE ONBOARDING · SLIDE {currentSlide + 1} OF {SLIDES.length}
      </Text>

      <View style={styles.centerContent}>
        <Text style={styles.icon}>{slide.icon}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.desc}</Text>

        {/* Dots indicator */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentSlide ? styles.activeDot : null,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.footerRow}>
        <FluentButton
          variant="secondary"
          title="Skip Walkthrough"
          onPress={handleFinish}
          style={styles.halfBtn}
        />
        <FluentButton
          variant="primary"
          title={currentSlide === SLIDES.length - 1 ? 'Finish & Launch' : 'Next ›'}
          onPress={handleNext}
          style={styles.halfBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    padding: spacing.xl,
    paddingTop: 48,
    paddingBottom: 36,
  },
  topIndicator: {
    ...typography.captionBold,
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  centerContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.primary,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfBtn: {
    flex: 1,
    height: 44,
  },
});

export default WelcomeWalkthroughScreen;
