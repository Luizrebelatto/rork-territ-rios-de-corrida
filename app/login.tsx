import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eye, EyeOff, ArrowRight, PersonStanding } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

const BG = '#0B1A0B';
const SURFACE = '#0F220F';
const BORDER_DEFAULT = '#1E361E';
const BORDER_ACTIVE = '#00F5A0';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#7A9A7A';
const TEXT_MUTED = '#4A6A4A';
const LIME = '#B8E030';
const LIME_TEXT = '#0B1A0B';
const DARK_BTN = '#111E11';
const DARK_BTN_BORDER = '#1E361E';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Preencha todos os campos');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await login({ name: email.split('@')[0], email: email.trim() });
      router.replace('/onboarding');
    } catch {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await login({
        name: 'Runner Pro',
        email: 'runner@example.com',
        avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150&h=150&fit=crop',
      });
      router.replace('/onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    try {
      await login({ name: 'Apple User', email: 'apple@example.com' });
      router.replace('/onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 32 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoRow}>
            <View style={styles.logoIconWrap}>
              <PersonStanding size={26} color={LIME} strokeWidth={2} />
            </View>
            <Text style={styles.logoText}>useSprinta</Text>
          </View>

          <Text style={styles.tagline}>Conquer territory. Compete globally.</Text>

          <View style={styles.formCard}>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Email field */}
            <View style={[styles.fieldBox, emailFocused && styles.fieldBoxActive]}>
              <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="runner@intvl.app"
                placeholderTextColor={TEXT_MUTED}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>

            {/* Password field */}
            <View style={[styles.fieldBox, passwordFocused && styles.fieldBoxActive]}>
              <Text style={styles.fieldLabel}>PASSWORD</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.fieldInput, styles.passwordInput]}
                  placeholder="••••••••"
                  placeholderTextColor={TEXT_MUTED}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={TEXT_SECONDARY} />
                  ) : (
                    <Eye size={18} color={TEXT_SECONDARY} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot */}
            <TouchableOpacity style={styles.forgotRow}>
              <Text style={styles.forgotText}>Forgot?</Text>
            </TouchableOpacity>

            {/* Log In button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleEmailLogin}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={LIME_TEXT} />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Log In</Text>
                  <ArrowRight size={20} color={LIME_TEXT} strokeWidth={2.5} />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google */}
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogleLogin}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Text style={styles.googleG}>G</Text>
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>

            {/* Apple */}
            <TouchableOpacity
              style={[styles.socialButton, styles.appleBt]}
              onPress={handleAppleLogin}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Text style={styles.appleIcon}></Text>
              <Text style={styles.socialText}>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Sign up */}
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.signupLink}>Sign up for free</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },

  // Logo
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  logoIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 6,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER_DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 36,
  },

  // Form card
  formCard: {
    gap: 0,
  },
  errorBox: {
    backgroundColor: '#2A0D0D',
    borderWidth: 1,
    borderColor: '#FF453A',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF453A',
    fontSize: 14,
    textAlign: 'center',
  },

  // Fields
  fieldBox: {
    backgroundColor: SURFACE,
    borderWidth: 1.5,
    borderColor: BORDER_DEFAULT,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
    marginBottom: 14,
  },
  fieldBoxActive: {
    borderColor: BORDER_ACTIVE,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: TEXT_SECONDARY,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  fieldInput: {
    fontSize: 16,
    color: TEXT_PRIMARY,
    padding: 0,
    margin: 0,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  eyeButton: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: '#1A2E1A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Forgot
  forgotRow: {
    alignSelf: 'flex-end',
    marginBottom: 22,
    marginTop: 2,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: LIME,
  },

  // Login button
  loginButton: {
    backgroundColor: LIME,
    borderRadius: 8,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 28,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: LIME_TEXT,
    letterSpacing: 0.2,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER_DEFAULT,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: TEXT_MUTED,
    letterSpacing: 1.2,
  },

  // Social buttons
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DARK_BTN,
    borderWidth: 1,
    borderColor: DARK_BTN_BORDER,
    borderRadius: 8,
    paddingVertical: 16,
    gap: 10,
    marginBottom: 12,
  },
  appleBt: {
    marginBottom: 0,
  },
  googleG: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#4285F4',
  },
  appleIcon: {
    fontSize: 20,
    color: TEXT_PRIMARY,
  },
  socialText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: TEXT_PRIMARY,
  },

  // Sign up
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    flexWrap: 'wrap',
  },
  signupText: {
    fontSize: 15,
    color: TEXT_SECONDARY,
  },
  signupLink: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: LIME,
  },
});
