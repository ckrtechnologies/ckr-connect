import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { radius } from '../../../shared/theme/radius.js';
import { FluentButton } from '../../../shared/components/FluentButton.jsx';
import { setOnboarded } from '../slice.js';
import { storage } from '../../../shared/utils/storage.js';

const SLIDES = [
  {
    icon: '📋',
    title: '1. My Assigned Leads',
    desc: 'All leads allocated to you appear here in real-time. Follow up on schedule and never miss an overdue notification.',
  },
  {
    icon: '⏰',
    title: '2. Daily Attendance Punch',
    desc: 'Punch in every morning before calling. Check out at the end of your shift with a single thumb tap.',
  },
  {
    icon: '🔔',
    title: '3. Real-Time Broadcasts',
    desc: 'Instant live alerts when new leads are allocated to your queue or follow-up milestones are due.',
  },
];

export const WelcomeWalkthroughScreen = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const dispatch = useDispatch();

  const handleFinish = async () => {
    await storage.setOnboarded(true);
    dispatch(setOnboarded(true));
  };

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topIndicator}>
        <Text style={styles.topIndicatorText}>
          NEW HIRE ONBOARDING · SLIDE {currentSlide + 1} OF 3
        </Text>
      </View>

      <View style={styles.slideContent}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>{slide.icon}</Text>
        </View>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.desc}>{slide.desc}</Text>

        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, idx) => (
            <View
              key={idx}
              style={[styles.dot, idx === currentSlide && styles.dotActive]}
            />
          ))}
        </View>
      </View>

      <View style={styles.footerActions}>
        <FluentButton
          title="Skip Walkthrough"
          onPress={handleFinish}
          variant="secondary"
          size="large"
          style={styles.actionBtn}
        />
        <FluentButton
          title={currentSlide === SLIDES.length - 1 ? 'Finish & Launch' : 'Next ›'}
          onPress={handleNext}
          variant="primary"
          size="large"
          style={styles.actionBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  topIndicator: {
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  topIndicatorText: {
    ...typography.overline,
    color: colors.textSecondary,
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: '#C7E0F4',
  },
  icon: {
    fontSize: 50,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  desc: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  dotsRow: {
    flexDirection: 'row',
    marginTop: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderStrong,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  footerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
  },
});
