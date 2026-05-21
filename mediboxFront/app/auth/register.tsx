import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { FontSizes, Spacing, Radius } from '@/constants';

export default function RegisterScreen() {
  const { colors } = useTheme();
  const { register, isLoading } = useAuthStore();

  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [showPass, setShowPass]     = useState(false);

  async function handleRegister() {
    if (!name.trim())         return Alert.alert('Atenção', 'Informe seu nome');
    if (!email.trim())        return Alert.alert('Atenção', 'Informe seu e-mail');
    if (password.length < 6)  return Alert.alert('Atenção', 'Senha deve ter ao menos 6 caracteres');
    if (password !== confirm)  return Alert.alert('Atenção', 'As senhas não coincidem');

    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
      // AuthGuard redireciona automaticamente
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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Logo compacta */}
          <View style={styles.logoArea}>
            <View style={[styles.logoIcon, { backgroundColor: colors.primary }]}>
              <Ionicons name="medical" size={28} color="#fff" />
            </View>
            <Text style={[styles.appName, { color: colors.textPrimary }]}>Criar conta</Text>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>
              Preencha os dados para começar
            </Text>
          </View>

          {/* Card */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>

            <Field label="Nome completo" colors={colors}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="Seu nome"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </Field>

            <Field label="E-mail" colors={colors}>
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
            </Field>

            <Field label="Senha" colors={colors}>
              <View style={styles.passRow}>
                <TextInput
                  style={[styles.input, styles.passInput, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.textPrimary }]}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  returnKeyType="next"
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass((v) => !v)}>
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </Field>

            <Field label="Confirmar senha" colors={colors}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="Repita a senha"
                placeholderTextColor={colors.textMuted}
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={!showPass}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
            </Field>

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 }]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>Criar conta</Text>
              }
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Já tem conta?{' '}
            </Text>
            <Link href="/auth/login" asChild>
              <TouchableOpacity>
                <Text style={[styles.footerLink, { color: colors.primary }]}>Entrar</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, children, colors }: { label: string; children: React.ReactNode; colors: any }) {
  return (
    <View style={{ marginBottom: Spacing.sm }}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1 },
  kav:       { flex: 1 },
  scroll:    { flexGrow: 1, padding: Spacing.lg },
  header:    { marginBottom: Spacing.md },
  logoArea:  { alignItems: 'center', marginBottom: Spacing.lg },
  logoIcon:  { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  appName:   { fontSize: FontSizes.xl, fontWeight: '700' },
  tagline:   { fontSize: FontSizes.sm, marginTop: 2, color: '#888' },
  card:      { borderRadius: Radius.lg, borderWidth: 0.5, padding: Spacing.xl, marginBottom: Spacing.lg },
  label:     { fontSize: FontSizes.xs, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  input:     { borderWidth: 0.5, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: 12, fontSize: FontSizes.md },
  passRow:   { position: 'relative' },
  passInput: { paddingRight: 44 },
  eyeBtn:    { position: 'absolute', right: 12, top: 12 },
  btn:       { borderRadius: Radius.sm, paddingVertical: 14, alignItems: 'center', marginTop: Spacing.sm },
  btnText:   { color: '#fff', fontSize: FontSizes.md, fontWeight: '600' },
  footer:    { flexDirection: 'row', justifyContent: 'center' },
  footerText:{ fontSize: FontSizes.sm },
  footerLink:{ fontSize: FontSizes.sm, fontWeight: '600' },
});
