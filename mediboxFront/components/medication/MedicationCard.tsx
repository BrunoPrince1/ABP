import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MedicationColors, FontSizes, Spacing, Radius } from '@/constants';
import type { AdministrationRecord } from '@/types';
import type { Medication } from '@/types';

interface MedicationCardProps {
  record: AdministrationRecord;
  medication: Medication;
  onPress?: () => void;
}

export function MedicationCard({ record, medication, onPress }: MedicationCardProps) {
  const { colors } = useTheme();
  const mc = MedicationColors[medication.color];

  const time = new Date(record.scheduledTime).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Ícone */}
      <View style={[styles.icon, { backgroundColor: mc.bg }]}>
        <Ionicons name="medical" size={18} color={mc.text} />
      </View>

      {/* Infos */}
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.textPrimary }]}>
          {medication.name} {medication.dosage}
        </Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {time} · Compartimento {record.compartment}
        </Text>
      </View>

      {/* Status */}
      <StatusBadge status={record.status} time={time} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  meta: {
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
});
