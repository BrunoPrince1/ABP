import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';
import { useMedicationStore } from '@/store/medicationStore';
import { MedicationColors, FontSizes, Spacing, Radius, MAX_COMPARTMENTS } from '@/constants';
import type { MedicationColor, Schedule } from '@/types';

const COLORS: MedicationColor[] = ['blue', 'green', 'amber', 'coral', 'teal'];

export default function NewMedicationScreen() {
  const { colors } = useTheme();
  const { addMedication, isLoading } = useMedicationStore();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [compartment, setCompartment] = useState(1);
  const [schedules, setSchedules] = useState<Schedule[]>([{ id: '1', time: '08:00' }]);
  const [alertDelay, setAlertDelay] = useState('30');
  const [color, setColor] = useState<MedicationColor>('blue');

  function addSchedule() {
    setSchedules((prev) => [...prev, { id: String(Date.now()), time: '08:00' }]);
  }

  function removeSchedule(id: string) {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  }

  function updateScheduleTime(id: string, time: string) {
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, time } : s)));
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Atenção', 'Informe o nome do medicamento');
      return;
    }
    if (!dosage.trim()) {
      Alert.alert('Atenção', 'Informe a dosagem');
      return;
    }
    if (schedules.length === 0) {
      Alert.alert('Atenção', 'Adicione ao menos um horário');
      return;
    }

    try {
      await addMedication({
        name: name.trim(),
        dosage: dosage.trim(),
        compartment,
        schedules,
        alertDelayMinutes: parseInt(alertDelay, 10) || 30,
        color,
        active: true,
      });
      router.back();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o medicamento');
    }
  }

  const inputStyle = [
    styles.input,
    { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Novo medicamento</Text>
        <TouchableOpacity onPress={handleSave} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={[styles.saveBtn, { color: colors.primary }]}>Salvar</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Nome */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Nome do medicamento</Text>
        <TextInput
          style={inputStyle}
          placeholder="Ex: Losartana"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />

        {/* Dosagem */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Dosagem</Text>
        <TextInput
          style={inputStyle}
          placeholder="Ex: 50mg"
          placeholderTextColor={colors.textMuted}
          value={dosage}
          onChangeText={setDosage}
        />

        {/* Cor */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Cor</Text>
        <View style={styles.colorRow}>
          {COLORS.map((c) => {
            const mc = MedicationColors[c];
            return (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorDot,
                  { backgroundColor: mc.dot },
                  color === c && styles.colorDotSelected,
                ]}
                onPress={() => setColor(c)}
              />
            );
          })}
        </View>

        {/* Compartimento */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Compartimento</Text>
        <View style={styles.compRow}>
          {Array.from({ length: MAX_COMPARTMENTS }, (_, i) => i + 1).map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.compBtn,
                {
                  backgroundColor: compartment === num ? colors.primary : colors.surface,
                  borderColor: compartment === num ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setCompartment(num)}
            >
              <Text
                style={{
                  fontSize: FontSizes.sm,
                  fontWeight: '600',
                  color: compartment === num ? '#fff' : colors.textPrimary,
                }}
              >
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Horários */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Horários</Text>
        <View style={[styles.schedulesCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {schedules.map((s) => (
            <View
              key={s.id}
              style={[styles.scheduleRow, { borderBottomColor: colors.borderLight }]}
            >
              <Ionicons name="time-outline" size={16} color={colors.textMuted} />
              <TextInput
                style={[styles.timeInput, { color: colors.textPrimary }]}
                value={s.time}
                onChangeText={(v) => updateScheduleTime(s.id, v)}
                placeholder="HH:MM"
                placeholderTextColor={colors.textMuted}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
              />
              {schedules.length > 1 && (
                <TouchableOpacity onPress={() => removeSchedule(s.id)}>
                  <Ionicons name="close-circle" size={18} color={colors.danger} />
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addSchedule} onPress={addSchedule}>
            <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
            <Text style={[styles.addScheduleText, { color: colors.primary }]}>
              Adicionar horário
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tempo limite */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Tempo limite para retirada (minutos)
        </Text>
        <TextInput
          style={inputStyle}
          placeholder="30"
          placeholderTextColor={colors.textMuted}
          value={alertDelay}
          onChangeText={setAlertDelay}
          keyboardType="number-pad"
          maxLength={3}
        />
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          Se o medicamento não for retirado nesse tempo, o responsável será notificado.
        </Text>
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
    paddingVertical: Spacing.md,
  },
  title: { fontSize: FontSizes.md, fontWeight: '600' },
  saveBtn: { fontSize: FontSizes.md, fontWeight: '600' },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: Spacing.md,
  },
  input: {
    borderWidth: 0.5,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: FontSizes.sm,
  },
  colorRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  compRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  compBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  schedulesCard: {
    borderRadius: Radius.md,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  timeInput: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  addSchedule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  addScheduleText: { fontSize: FontSizes.sm, fontWeight: '500' },
  hint: { fontSize: FontSizes.xs, marginTop: 6, lineHeight: 16 },
});
