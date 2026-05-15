import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';
import { useMedicationStore } from '@/store/medicationStore';
import { MedicationColors, FontSizes, Spacing, Radius } from '@/constants';

export default function MedicationDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { medications, deleteMedication, isLoading } = useMedicationStore();

  const medication = medications.find((m) => m.id === id);

  useEffect(() => {
    if (!medication) router.back();
  }, [medication]);

  if (!medication) return null;

  const mc = MedicationColors[medication.color];

  function handleDelete() {
    Alert.alert(
      'Remover medicamento',
      `Deseja remover ${medication!.name} ${medication!.dosage}? Todos os registros serão mantidos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            await deleteMedication(medication!.id);
            router.back();
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Detalhes</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: mc.bg }]}>
          <View style={[styles.heroIcon, { backgroundColor: mc.dot }]}>
            <Ionicons name="medical" size={28} color="#fff" />
          </View>
          <Text style={[styles.heroName, { color: mc.text }]}>
            {medication.name}
          </Text>
          <Text style={[styles.heroDosage, { color: mc.text }]}>{medication.dosage}</Text>
        </View>

        {/* Info */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <InfoRow label="Compartimento" value={`Compartimento ${medication.compartment}`} colors={colors} />
          <InfoRow
            label="Horários"
            value={medication.schedules.map((s) => s.time).join(' · ')}
            colors={colors}
          />
          <InfoRow
            label="Tempo limite"
            value={`${medication.alertDelayMinutes} minutos`}
            colors={colors}
          />
          <InfoRow
            label="Status"
            value={medication.active ? 'Ativo' : 'Inativo'}
            colors={colors}
            valueColor={medication.active ? colors.success : colors.danger}
          />
        </View>

        {/* Nota */}
        <View style={[styles.note, { backgroundColor: colors.infoBg }]}>
          <Ionicons name="information-circle-outline" size={16} color={colors.info} />
          <Text style={[styles.noteText, { color: colors.info }]}>
            Se o medicamento não for retirado em até {medication.alertDelayMinutes} min após o
            alerta, o responsável será notificado automaticamente.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
  colors,
  valueColor,
}: {
  label: string;
  value: string;
  colors: any;
  valueColor?: string;
}) {
  return (
    <View style={[infoStyles.row, { borderBottomColor: colors.borderLight }]}>
      <Text style={[infoStyles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[infoStyles.value, { color: valueColor ?? colors.textPrimary }]}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  label: { fontSize: FontSizes.sm },
  value: { fontSize: FontSizes.sm, fontWeight: '500' },
});

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: { fontSize: FontSizes.md, fontWeight: '600' },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  hero: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  heroName: { fontSize: FontSizes.xl, fontWeight: '700' },
  heroDosage: { fontSize: FontSizes.md },
  card: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    marginBottom: Spacing.md,
  },
  note: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'flex-start',
  },
  noteText: { fontSize: FontSizes.xs, flex: 1, lineHeight: 16 },
});
