import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { responsibleService } from '@/services/responsibleService';
import { FontSizes, Spacing, Radius } from '@/constants';
import type { Responsible } from '@/types';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, logout } = useAuthStore();
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);

  useEffect(() => { loadResponsibles(); }, []);

  async function loadResponsibles() {
    try {
      const data = await responsibleService.getAll();
      setResponsibles(data);
    } catch {}
  }

  async function handleToggle(id: string, current: boolean) {
    try {
      await responsibleService.toggleActive(id, !current);
      setResponsibles((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isActive: !current } : r)),
      );
    } catch {}
  }

  async function handleDelete(r: Responsible) {
    Alert.alert('Remover responsável', `Remover ${r.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover', style: 'destructive',
        onPress: async () => {
          await responsibleService.remove(r.id);
          setResponsibles((prev) => prev.filter((x) => x.id !== r.id));
        },
      },
    ]);
  }

  function handleLogout() {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar + nome */}
        <View style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </Text>
          </View>
          <View>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.name}</Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
          </View>
        </View>

        {/* Seção responsáveis */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Responsáveis</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/responsible/new')}
          >
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {responsibles.length === 0 ? (
          <TouchableOpacity
            style={[styles.emptyCard, { borderColor: colors.border }]}
            onPress={() => router.push('/responsible/new')}
          >
            <Ionicons name="person-add-outline" size={28} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Nenhum responsável cadastrado
            </Text>
            <Text style={[styles.emptyAction, { color: colors.primary }]}>
              + Adicionar responsável
            </Text>
          </TouchableOpacity>
        ) : (
          responsibles.map((r) => (
            <View
              key={r.id}
              style={[styles.responsibleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={[styles.rAvatar, { backgroundColor: colors.surfaceAlt }]}>
                <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
              </View>
              <View style={styles.rInfo}>
                <Text style={[styles.rName, { color: colors.textPrimary }]}>{r.name}</Text>
                <Text style={[styles.rEmail, { color: colors.textSecondary }]}>{r.email}</Text>
                {r.phone ? (
                  <Text style={[styles.rPhone, { color: colors.textMuted }]}>{r.phone}</Text>
                ) : null}
              </View>
              <View style={styles.rActions}>
                <Switch
                  value={r.isActive}
                  onValueChange={() => handleToggle(r.id, r.isActive)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#fff"
                />
                <TouchableOpacity onPress={() => handleDelete(r)} style={{ marginTop: 4 }}>
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: colors.danger }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  title:  { fontSize: FontSizes.xl, fontWeight: '700' },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },

  userCard:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg, borderRadius: Radius.lg, borderWidth: 0.5, marginBottom: Spacing.xl },
  avatar:    { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  avatarText:{ fontSize: FontSizes.xl, color: '#fff', fontWeight: '700' },
  userName:  { fontSize: FontSizes.md, fontWeight: '600' },
  userEmail: { fontSize: FontSizes.sm, marginTop: 2 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle:  { fontSize: FontSizes.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  addBtn:        { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },

  emptyCard:   { alignItems: 'center', padding: Spacing.xl, borderRadius: Radius.md, borderWidth: 1, borderStyle: 'dashed', gap: Spacing.sm, marginBottom: Spacing.xl },
  emptyText:   { fontSize: FontSizes.sm },
  emptyAction: { fontSize: FontSizes.sm, fontWeight: '600' },

  responsibleCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 0.5, marginBottom: Spacing.sm },
  rAvatar:  { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  rInfo:    { flex: 1 },
  rName:    { fontSize: FontSizes.sm, fontWeight: '600' },
  rEmail:   { fontSize: FontSizes.xs, marginTop: 1 },
  rPhone:   { fontSize: FontSizes.xs, marginTop: 1 },
  rActions: { alignItems: 'center', gap: 4 },

  logoutBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, marginTop: Spacing.xl, paddingVertical: 14, borderRadius: Radius.sm, borderWidth: 1 },
  logoutText: { fontSize: FontSizes.md, fontWeight: '600' },
});
