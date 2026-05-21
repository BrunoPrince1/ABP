import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';
import { useMedicationStore } from '@/store/medicationStore';
import { MedicationColors, FontSizes, Spacing, Radius } from '@/constants';
import type { Medication } from '@/types';

export default function MedicationsScreen() {
  const { colors } = useTheme();
  const { medications, fetchMedications, deleteMedication, isLoading } = useMedicationStore();

  useEffect(() => {
    fetchMedications();
  }, []);

  function handleDelete(med: Medication) {
    Alert.alert(
      'Remover medicamento',
      `Deseja remover ${med.name} ${med.dosage}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => deleteMedication(med.id),
        },
      ],
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Medicamentos</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/medication/new')}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {medications.length === 0 ? (
          <View style={[styles.empty, { borderColor: colors.border }]}>
            <Ionicons name="medical-outline" size={40} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              Nenhum medicamento cadastrado
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Toque no + para cadastrar o primeiro medicamento
            </Text>
          </View>
        ) : (
          medications.map((med) => {
            const mc = MedicationColors[med.color];
            const scheduleText = med.schedules.map((s) => s.time).join(' · ');

            return (
              <TouchableOpacity
                key={med.id}
                style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push(`/medication/${med.id}`)}
                activeOpacity={0.75}
              >
                <View style={[styles.icon, { backgroundColor: mc.bg }]}>
                  <Ionicons name="medical" size={20} color={mc.text} />
                </View>

                <View style={styles.info}>
                  <Text style={[styles.name, { color: colors.textPrimary }]}>
                    {med.name} {med.dosage}
                  </Text>
                  <Text style={[styles.meta, { color: colors.textSecondary }]}>
                    Compartimento {med.compartment} · {scheduleText}
                  </Text>
                  <Text style={[styles.delay, { color: colors.textMuted }]}>
                    Alerta após {med.alertDelayMinutes} min sem retirada
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleDelete(med)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: { fontSize: FontSizes.xl, fontWeight: '700' },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    marginBottom: Spacing.sm,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  name: { fontSize: FontSizes.sm, fontWeight: '600' },
  meta: { fontSize: FontSizes.xs, marginTop: 2 },
  delay: { fontSize: FontSizes.xs, marginTop: 1 },
  empty: {
    alignItems: 'center',
    padding: Spacing.xxl,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  emptyTitle: { fontSize: FontSizes.md, fontWeight: '600' },
  emptyText: { fontSize: FontSizes.sm, textAlign: 'center' },
});
