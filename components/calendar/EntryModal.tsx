'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Input from '@/components/ui/Input';
import Select, { type SelectOption } from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { createEntry, updateEntry, type Show, type Entry, type EntryPayload } from '@/lib/api';
import { addShow } from '@/lib/actions';

const schema = z.object({
  showId: z.string().min(1, 'Odaberite emisiju'),
  newShowTitle: z.string().optional(),
  time: z.string().min(1, 'Unesite vrijeme'),
  duration: z.string().optional(),
  type: z.enum(['uzivo', 'snimanje']),
  host: z.string().optional(),
  guests: z.array(z.object({ name: z.string() })),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  date: string;
  entry?: Entry | null;
  shows: Show[];
  onClose: () => void;
  onSaved: () => void;
};

export default function EntryModal({ date, entry, shows, onClose, onSaved }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [showCreate, setShowCreate] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: entry
      ? {
          showId: entry.show_id,
          time: entry.time,
          duration: entry.duration != null ? String(entry.duration) : '',
          type: entry.type,
          host: entry.host ?? '',
          guests: entry.guests.map((g) => ({ name: g.name })),
        }
      : { type: 'uzivo', guests: [], duration: '' },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'guests' });

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !e.composedPath().includes(ref.current)) onClose();
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [onClose]);

  async function onSubmit(data: FormValues) {
    let showId = data.showId;

    if (showId === '__new__') {
      if (!data.newShowTitle?.trim()) {
        toast.error('Unesite naziv nove emisije.');
        return;
      }
      try {
        const show = await addShow(data.newShowTitle.trim());
        showId = show.id;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Greška pri kreiranju emisije.');
        return;
      }
    }

    const payload: EntryPayload = {
      showId,
      date,
      time: data.time,
      duration: data.duration ? parseInt(data.duration, 10) || null : null,
      type: data.type,
      host: data.host || null,
      guests: data.guests.filter((g) => g.name.trim()),
    };

    try {
      if (entry) {
        await updateEntry(entry.id, payload);
        toast.success('Termin je ažuriran.');
      } else {
        await createEntry(payload);
        toast.success('Termin je dodan.');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Greška pri čuvanju.');
    }
  }

  const selectedShowId = watch('showId');

  const showOptions: SelectOption[] = [
    ...shows.map((s) => ({ value: s.id, label: s.title })),
    { value: '__new__', label: '+ Nova emisija...' },
  ];

  const typeOptions: SelectOption[] = [
    { value: 'uzivo', label: 'Uživo' },
    { value: 'snimanje', label: 'Snimanje' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div ref={ref} className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900">
            {entry ? 'Uredi termin' : 'Novi termin'}{' '}
            <span className="font-normal text-gray-500 text-sm">— {date}</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            control={control}
            name="showId"
            render={({ field }) => (
              <Select
                label="Emisija"
                required
                options={showOptions}
                value={field.value ?? ''}
                onChange={(val) => {
                  field.onChange(val);
                  setShowCreate(val === '__new__');
                }}
                error={errors.showId?.message}
              />
            )}
          />

          {(showCreate || selectedShowId === '__new__') && (
            <Input
              label="Naziv nove emisije"
              placeholder="npr. Dnevnik 1"
              {...register('newShowTitle')}
            />
          )}

          <Input
            label="Vrijeme"
            type="time"
            required
            error={errors.time?.message}
            {...register('time')}
          />

          <Input
            label="Trajanje (min)"
            type="number"
            min={1}
            placeholder="npr. 30"
            {...register('duration')}
          />

          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select
                label="Tip"
                required
                options={typeOptions}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Input
            label="Voditelj"
            placeholder="Ime i prezime"
            {...register('host')}
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">Gosti</p>
              <Button type="button" variant="ghost" size="sm" onClick={() => append({ name: '' })}>
                + Dodaj gosta
              </Button>
            </div>
            {fields.length === 0 && <p className="text-sm text-gray-400 italic">Nema gostiju.</p>}
            <div className="space-y-2">
              {fields.map((field, i) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <Input
                    placeholder={`Gost ${i + 1}`}
                    {...register(`guests.${i}.name`)}
                  />
                  <button type="button" onClick={() => remove(i)} className="text-gray-400 hover:text-danger-500 shrink-0 px-1">✕</button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isSubmitting} className="flex-1">
              {isSubmitting ? 'Čuvanje...' : entry ? 'Sačuvaj' : 'Dodaj termin'}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Otkaži
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
