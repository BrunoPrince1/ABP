import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { FontSizes, Spacing, Radius } from '@/constants';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Atenção', 'Preencha e-mail e senha');
      return;
    }
    try {
      await login(email.trim().toLowerCase(), password);
      // AuthGuard redireciona automaticamente para /(tabs)
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoArea}>
            <View style={[styles.logoIcon, { backgroundColor: colors.primary }]}>
              <Ionicons name="medical" size={36} color="#fff" />
            </View>
            <Text style={[styles.appName, { color: colors.textPrimary }]}>MediBox</Text>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>
              Gerenciamento inteligente de medicamentos
            </Text>
          </View>

          {/* Card */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Entrar</Text>

            {/* E-mail */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>E-mail</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="seu@email.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />

            {/* Senha */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>Senha</Text>
            <View style={styles.passRow}>
              <TextInput
                style={[styles.input, styles.passInput, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPass((v) => !v)}
              >
                <Ionicons
                  name={showPass ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Botão */}
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 }]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>Entrar</Text>
              }
            </TouchableOpacity>

            {/* Demo hint */}
            <TouchableOpacity
              onPress={() => { setEmail('demo@medibox.com'); setPassword('medibox123'); }}
              style={styles.demoHint}
            >
              <Text style={[styles.demoText, { color: colors.textMuted }]}>
                Usar conta demo
              </Text>
            </TouchableOpacity>
          </View>

          {/* Link cadastro */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Não tem conta?{' '}
            </Text>
            <Link href="/auth/register" asChild>
              <TouchableOpacity>
                <Text style={[styles.footerLink, { color: colors.primary }]}>
                  Criar conta
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1 },
  kav:       { flex: 1 },
  scroll:    { flexGrow: 1, justifyContent: 'center', padding: Spacing.lg },
  logoArea:  { alignItems: 'center', marginBottom: Spacing.xl },
  logoIcon:  {
    width: 72, height: 72, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  appName:   { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  tagline:   { fontSize: FontSizes.sm, marginTop: 4, textAlign: 'center' },
  card:      {
    borderRadius: Radius.lg, borderWidth: 0.5,
    padding: Spacing.xl, marginBottom: Spacing.lg,
  },
  cardTitle: { fontSize: FontSizes.lg, fontWeight: '700', marginBottom: Spacing.lg },
  label:     { fontSize: FontSizes.xs, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  input:     {
    borderWidth: 0.5, borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    fontSize: FontSizes.md, marginBottom: Spacing.md,
  },
  passRow:   { position: 'relative' },
  passInput: { paddingRight: 44 },
  eyeBtn:    { position: 'absolute', right: 12, top: 12 },
  btn:       {
    borderRadius: Radius.sm, paddingVertical: 14,
    alignItems: 'center', marginTop: Spacing.xs,
  },
  btnText:   { color: '#fff', fontSize: FontSizes.md, fontWeight: '600' },
  demoHint:  { alignItems: 'center', marginTop: Spacing.md },
  demoText:  { fontSize: FontSizes.xs },
  footer:    { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText:{ fontSize: FontSizes.sm },
  footerLink:{ fontSize: FontSizes.sm, fontWeight: '600' },
});
