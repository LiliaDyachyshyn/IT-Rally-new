"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ScheduleItem {
  time: string;
  title: string;
  description?: string | null;
  speaker?: string | null;
  room?: string | null;
  order: number;
}

interface Speaker {
  name: string;
  title?: string | null;
  company?: string | null;
  bio?: string | null;
  talkTitle?: string | null;
  linkedinUrl?: string | null;
  order: number;
}

interface EventData {
  id?: string;
  title: string;
  description: string;
  shortDesc?: string | null;
  location: string;
  address?: string | null;
  startDate: string | Date;
  endDate: string | Date;
  coverImage?: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isFeatured: boolean;
  scheduleItems?: ScheduleItem[];
  speakers?: Speaker[];
}

interface EventFormProps {
  event?: EventData;
}

const emptyScheduleItem = (): ScheduleItem => ({
  time: "",
  title: "",
  description: "",
  speaker: "",
  room: "",
  order: 0,
});

const emptySpeaker = (): Speaker => ({
  name: "",
  title: "",
  company: "",
  bio: "",
  talkTitle: "",
  linkedinUrl: "",
  order: 0,
});

function toInputDate(dateStr: string | Date) {
  return dateStr ? new Date(dateStr).toISOString().slice(0, 16) : "";
}

export default function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const isEdit = !!event?.id;

  const [formData, setFormData] = useState({
    title: event?.title ?? "",
    description: event?.description ?? "",
    shortDesc: event?.shortDesc ?? "",
    location: event?.location ?? "",
    address: event?.address ?? "",
    startDate: toInputDate(event?.startDate ?? ""),
    endDate: toInputDate(event?.endDate ?? ""),
    coverImage: event?.coverImage ?? "",
    status: event?.status ?? "DRAFT",
    isFeatured: event?.isFeatured ?? false,
  });

  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>(
    event?.scheduleItems?.length ? event.scheduleItems : [emptyScheduleItem()]
  );
  const [speakers, setSpeakers] = useState<Speaker[]>(
    event?.speakers?.length ? event.speakers : [emptySpeaker()]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const cleanSchedule = scheduleItems.filter((s) => s.time || s.title);
    const cleanSpeakers = speakers.filter((s) => s.name);

    const payload = {
      ...formData,
      scheduleItems: cleanSchedule.map((s, i) => ({ ...s, order: i })),
      speakers: cleanSpeakers.map((s, i) => ({ ...s, order: i })),
    };

    const url = isEdit ? `/api/admin/events/${event.id}` : "/api/admin/events";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Щось пішло не так");
      setLoading(false);
      return;
    }

    router.push("/admin/events");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {error && (
        <div className="p-3 rounded-lg bg-red-900/40 border border-red-700 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-white font-semibold text-lg">Основна інформація</h2>

        <Field label="Назва події *">
          <input name="title" value={formData.title} onChange={handleChange} required className={input} placeholder="IT Rally 2025" />
        </Field>

        <Field label="Короткий опис">
          <input name="shortDesc" value={formData.shortDesc} onChange={handleChange} className={input} placeholder="Одне речення про подію" />
        </Field>

        <Field label="Повний опис *">
          <textarea name="description" value={formData.description} onChange={handleChange} required rows={4} className={input} placeholder="Детальний опис події..." />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Місто / Майданчик *">
            <input name="location" value={formData.location} onChange={handleChange} required className={input} placeholder="Львів" />
          </Field>
          <Field label="Адреса">
            <input name="address" value={formData.address} onChange={handleChange} className={input} placeholder="вул. Городоцька 1" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Початок *">
            <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange} required className={input} />
          </Field>
          <Field label="Кінець *">
            <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange} required className={input} />
          </Field>
        </div>

        <Field label="Зображення (URL)">
          <input name="coverImage" value={formData.coverImage} onChange={handleChange} className={input} placeholder="https://..." />
        </Field>

        <div className="flex items-center gap-6">
          <Field label="Статус">
            <select name="status" value={formData.status} onChange={handleChange} className={input}>
              <option value="DRAFT">Чернетка</option>
              <option value="PUBLISHED">Опубліковано</option>
              <option value="ARCHIVED">Архів</option>
            </select>
          </Field>
          <label className="flex items-center gap-2 text-gray-300 text-sm mt-5 cursor-pointer">
            <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-4 h-4 rounded" />
            Виділити на головній
          </label>
        </div>
      </section>

      {/* Schedule */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">Розклад</h2>
          <button type="button" onClick={() => setScheduleItems((p) => [...p, emptyScheduleItem()])} className="text-blue-400 hover:text-blue-300 text-sm">
            + Додати слот
          </button>
        </div>

        {scheduleItems.map((item, i) => (
          <div key={i} className="bg-gray-800/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm font-medium">Слот {i + 1}</span>
              <button type="button" onClick={() => setScheduleItems((p) => p.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 text-xs">
                Видалити
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Час">
                <input value={item.time} onChange={(e) => setScheduleItems((p) => p.map((s, j) => j === i ? { ...s, time: e.target.value } : s))} className={inputSm} placeholder="09:00" />
              </Field>
              <Field label="Назва">
                <input value={item.title} onChange={(e) => setScheduleItems((p) => p.map((s, j) => j === i ? { ...s, title: e.target.value } : s))} className={inputSm} placeholder="Реєстрація" />
              </Field>
              <Field label="Спікер">
                <input value={item.speaker ?? ""} onChange={(e) => setScheduleItems((p) => p.map((s, j) => j === i ? { ...s, speaker: e.target.value } : s))} className={inputSm} placeholder="Ім'я спікера" />
              </Field>
              <Field label="Кімната/Зал">
                <input value={item.room ?? ""} onChange={(e) => setScheduleItems((p) => p.map((s, j) => j === i ? { ...s, room: e.target.value } : s))} className={inputSm} placeholder="Зал A" />
              </Field>
            </div>
            <Field label="Опис">
              <input value={item.description ?? ""} onChange={(e) => setScheduleItems((p) => p.map((s, j) => j === i ? { ...s, description: e.target.value } : s))} className={inputSm} placeholder="Короткий опис" />
            </Field>
          </div>
        ))}
      </section>

      {/* Speakers */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">Спікери</h2>
          <button type="button" onClick={() => setSpeakers((p) => [...p, emptySpeaker()])} className="text-blue-400 hover:text-blue-300 text-sm">
            + Додати спікера
          </button>
        </div>

        {speakers.map((sp, i) => (
          <div key={i} className="bg-gray-800/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm font-medium">Спікер {i + 1}</span>
              <button type="button" onClick={() => setSpeakers((p) => p.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 text-xs">
                Видалити
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ім'я *">
                <input value={sp.name} onChange={(e) => setSpeakers((p) => p.map((s, j) => j === i ? { ...s, name: e.target.value } : s))} className={inputSm} placeholder="Іван Іваненко" />
              </Field>
              <Field label="Посада">
                <input value={sp.title ?? ""} onChange={(e) => setSpeakers((p) => p.map((s, j) => j === i ? { ...s, title: e.target.value } : s))} className={inputSm} placeholder="Senior Developer" />
              </Field>
              <Field label="Компанія">
                <input value={sp.company ?? ""} onChange={(e) => setSpeakers((p) => p.map((s, j) => j === i ? { ...s, company: e.target.value } : s))} className={inputSm} placeholder="Google" />
              </Field>
              <Field label="Тема доповіді">
                <input value={sp.talkTitle ?? ""} onChange={(e) => setSpeakers((p) => p.map((s, j) => j === i ? { ...s, talkTitle: e.target.value } : s))} className={inputSm} placeholder="Тема" />
              </Field>
            </div>
            <Field label="LinkedIn">
              <input value={sp.linkedinUrl ?? ""} onChange={(e) => setSpeakers((p) => p.map((s, j) => j === i ? { ...s, linkedinUrl: e.target.value } : s))} className={inputSm} placeholder="https://linkedin.com/in/..." />
            </Field>
          </div>
        ))}
      </section>

      <div className="flex gap-3 pb-8">
        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors">
          {loading ? "Збереження..." : isEdit ? "Зберегти зміни" : "Створити подію"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors">
          Скасувати
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const input =
  "w-full px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500";
const inputSm =
  "w-full px-3 py-2 rounded-lg bg-gray-800/80 border border-gray-700 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500";
