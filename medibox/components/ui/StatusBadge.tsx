import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { RecordStatus } from '@/types';
import { FontSizes, Radius } from '@/constants';

interface StatusBadgeProps {
  status: RecordStatus;
  time?: string;
}

const config: Record<RecordStatus, { label: string; bg: string; text: string }> = {
  taken:    { label: 'Tomado',    bg: '#EAF3DE', text: '#3B6D11' },
  missed:   { label: 'Não tomado', bg: '#FCEBEB', text: '#A32D2D' },
  pending:  { label: 'Pendente',  bg: '#FAEEDA', text: '#854F0B' },
  upcoming: { label: '',          bg: '#E6F1FB', text: '#185FA5' },
};

export function StatusBadge({ status, time }: StatusBadgeProps) {
  const c = config[status];
  const label = status === 'upcoming' && time ? time : c.label;

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  text: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
});
