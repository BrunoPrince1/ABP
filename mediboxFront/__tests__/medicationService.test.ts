import { medicationService } from '../services/medicationService';

describe('medicationService (mock)', () => {
  it('getAll retorna lista de medicamentos', async () => {
    const meds = await medicationService.getAll();
    expect(Array.isArray(meds)).toBe(true);
    expect(meds.length).toBeGreaterThan(0);
  });

  it('create adiciona novo medicamento', async () => {
    const before = await medicationService.getAll();
    await medicationService.create({
      name: 'Teste',
      dosage: '10mg',
      compartment: 4,
      schedules: [{ id: 'x', time: '10:00' }],
      alertDelayMinutes: 30,
      color: 'teal',
      active: true,
    });
    const after = await medicationService.getAll();
    expect(after.length).toBe(before.length + 1);
  });

  it('getById retorna medicamento correto', async () => {
    const all = await medicationService.getAll();
    const first = all[0];
    const found = await medicationService.getById(first.id);
    expect(found.id).toBe(first.id);
    expect(found.name).toBe(first.name);
  });

  it('update altera campos do medicamento', async () => {
    const all = await medicationService.getAll();
    const id = all[0].id;
    const updated = await medicationService.update(id, { dosage: '999mg' });
    expect(updated.dosage).toBe('999mg');
  });

  it('remove deleta medicamento', async () => {
    const before = await medicationService.getAll();
    const id = before[before.length - 1].id;
    await medicationService.remove(id);
    const after = await medicationService.getAll();
    expect(after.find((m) => m.id === id)).toBeUndefined();
  });

  it('getTodayRecords retorna registros', async () => {
    const records = await medicationService.getTodayRecords();
    expect(Array.isArray(records)).toBe(true);
  });
});
