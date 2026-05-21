import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { responsibleService } from '@/services/responsibleService';
import { FontSizes, Spacing, Radius } from '@/constants';

export default function NewResponsibleScreen() {
  const { colors } = useTheme();
  const [name, setName]       = useState('');
  const [phone, setPhone]     = useState('');
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!name.trim())  return Alert.alert('Atenção', 'Informe o nome');
    if (!email.trim()) return Alert.alert('Atenção', 'Informe o e-mail');

    setLoading(true);
    try {
      await responsibleService.create({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        isActive: true,
      });
      router.back();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o responsável');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Novo responsável</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading
            ? <ActivityIndicator color={colors.primary} />
            : <Text style={[styles.saveBtn, { color: colors.primary }]}>Salvar</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Info box */}
        <View style={[styles.infoBox, { backgroundColor: colors.infoBg }]}>
          <Ionicons name="information-circle-outline" size={16} color={colors.info} />
          <Text style={[styles.infoText, { color: colors.info }]}>
            O responsável receberá notificações quando um medicamento não for retirado no prazo.
          </Text>
        </View>

        <Field label="Nome completo *" colors={colors}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="Ex: Maria Silva"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </Field>

        <Field label="E-mail *" colors={colors}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="responsavel@email.com"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </Field>

        <Field label="Telefone (opcional)" colors={colors}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="(12) 99999-0000"
            placeholderTextColor={colors.textMuted}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </Field>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, children, colors }: { label: string; children: React.ReactNode; colors: any }) {
  return (
    <View style={{ marginBottom: Spacing.md }}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe:     { flex: 1 },
  header:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  title:    { fontSize: FontSizes.md, fontWeight: '600' },
  saveBtn:  { fontSize: FontSizes.md, fontWeight: '600' },
  scroll:   { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  infoBox:  { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, marginBottom: Spacing.lg, alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: FontSizes.xs, lineHeight: 16 },
  label:    { fontSize: FontSizes.xs, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  input:    { borderWidth: 0.5, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: 12, fontSize: FontSizes.md },
});
