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
import {
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
  PersonStanding,
} from 'lucide-react-native';
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

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  const passwordRequirements = [
    { label: 'Mínimo 8 caracteres', valid: password.length >= 8 },
    { label: 'Uma letra maiúscula', valid: /[A-Z]/.test(password) },
    { label: 'Um número', valid: /[0-9]/.test(password) },
  ];

  const isPasswordValid = passwordRequirements.every(req => req.valid);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Preencha todos os campos');
      return;
    }
    if (!isPasswordValid) {
      setError('A senha não atende aos requisitos');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email inválido');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await login({ name: name.trim(), email: email.trim() });
      router.replace('/onboarding');
    } catch {
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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

  const handleAppleSignup = async () => {
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
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={20} color={TEXT_PRIMARY} />
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoRow}>
            <View style={styles.logoIconWrap}>
              <PersonStanding size={26} color={LIME} strokeWidth={2} />
            </View>
            <Text style={styles.logoText}>useSprinta</Text>
          </View>

          <Text style={styles.tagline}>Comece sua jornada de conquista.</Text>

          <View style={styles.formCard}>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Name field */}
            <View style={[styles.fieldBox, nameFocused && styles.fieldBoxActive]}>
              <Text style={styles.fieldLabel}>NOME COMPLETO</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="Seu nome"
                placeholderTextColor={TEXT_MUTED}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
              />
            </View>

            {/* Email field */}
            <View style={[styles.fieldBox, emailFocused && styles.fieldBoxActive]}>
              <Text style={styles.fieldLabel}>EMAIL</Text>
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
              <Text style={styles.fieldLabel}>SENHA</Text>
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

            {/* Password requirements */}
            {password.length > 0 && (
              <View style={styles.requirementsBox}>
                {passwordRequirements.map((req, index) => (
                  <View key={index} style={styles.requirementRow}>
                    <View style={[styles.requirementCheck, req.valid && styles.requirementCheckValid]}>
                      {req.valid && <Check size={10} color={LIME_TEXT} strokeWidth={3} />}
                    </View>
                    <Text style={[styles.requirementText, req.valid && styles.requirementTextValid]}>
                      {req.label}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Confirm password field */}
            <View style={[styles.fieldBox, confirmFocused && styles.fieldBoxActive]}>
              <Text style={styles.fieldLabel}>CONFIRMAR SENHA</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.fieldInput, styles.passwordInput]}
                  placeholder="••••••••"
                  placeholderTextColor={TEXT_MUTED}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  onFocus={() => setConfirmFocused(true)}
                  onBlur={() => setConfirmFocused(false)}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} color={TEXT_SECONDARY} />
                  ) : (
                    <Eye size={18} color={TEXT_SECONDARY} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Register button */}
            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={LIME_TEXT} />
              ) : (
                <>
                  <Text style={styles.registerButtonText}>Criar conta</Text>
                  <ArrowRight size={20} color={LIME_TEXT} strokeWidth={2.5} />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OU CADASTRE COM</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google */}
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogleSignup}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Text style={styles.googleG}>G</Text>
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>

            {/* Apple */}
            <TouchableOpacity
              style={[styles.socialButton, styles.appleBt]}
              onPress={handleAppleSignup}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Text style={styles.appleIcon}></Text>
              <Text style={styles.socialText}>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Login link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Já tem uma conta? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>Entrar</Text>
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

  // Back button
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER_DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
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
    marginBottom: 32,
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

  // Password requirements
  requirementsBox: {
    backgroundColor: SURFACE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER_DEFAULT,
    padding: 14,
    gap: 8,
    marginBottom: 14,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  requirementCheck: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: BORDER_DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requirementCheckValid: {
    backgroundColor: LIME,
  },
  requirementText: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
  requirementTextValid: {
    color: LIME,
  },

  // Register button
  registerButton: {
    backgroundColor: LIME,
    borderRadius: 8,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 28,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
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

  // Login link
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    flexWrap: 'wrap',
  },
  loginText: {
    fontSize: 15,
    color: TEXT_SECONDARY,
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: LIME,
  },
});
