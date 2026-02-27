'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Video,
  Plus,
  Play,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  Copy,
  Check,
  Users,
  ExternalLink,
  X,
  Save,
  AlertCircle,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { showConfirm, showAlert } from '@/shared/utils/swal';
import { apiClient } from '@/shared/api/api.client';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Guard } from '@/shared/components/Guard';

interface VideoCallItem {
  id: string;
  roomId: string;
  title: string;
  description?: string;
  status: 'scheduled' | 'active' | 'ended';
  scheduledAt?: string;
  createdAt: string;
  host: { id: string; name?: string; email: string };
}

/* ─── Helpers ──────────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const styles =
    {
      scheduled: 'bg-amber-500/10 border-amber-500/25 text-amber-300',
      active: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300',
      ended: 'bg-white/5 border-white/10 text-white/30',
    }[status] || 'bg-white/5 border-white/10 text-white/30';

  const dots =
    { scheduled: 'bg-amber-500', active: 'bg-emerald-500 animate-pulse', ended: 'bg-white/20' }[
      status
    ] || 'bg-white/20';

  return (
    <span
      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${styles}`}
    >
      <span className={`w-1 h-1 rounded-full ${dots}`} />
      {status}
    </span>
  );
}

function CopyLink({ roomId }: { roomId: string }) {
  const [copied, setCopied] = useState(false);
  const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/call/${roomId}`;
  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link copiado');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      title="Copiar link de invitación"
      className="p-1.5 rounded-lg bg-white/4 hover:bg-violet-500/15 border border-white/8 hover:border-violet-500/30 text-white/30 hover:text-violet-300 transition-colors"
    >
      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
    </button>
  );
}

/* ─── Modal: Create / Edit ──────────────────────────────────────────────── */
function CallModal({
  call,
  onClose,
  onSave,
}: {
  call?: VideoCallItem | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [title, setTitle] = useState(call?.title || '');
  const [description, setDescription] = useState(call?.description || '');
  const [scheduledAt, setScheduledAt] = useState(
    call?.scheduledAt ? new Date(call.scheduledAt).toISOString().slice(0, 16) : ''
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('El título es requerido');
      return;
    }
    setSaving(true);
    try {
      const body = {
        title: title.trim(),
        description: description.trim() || undefined,
        scheduledAt: scheduledAt || undefined,
      };
      if (call) {
        await apiClient.patch(`/video-call/rooms/${call.id}`, body);
        toast.success('Videollamada actualizada');
      } else {
        await apiClient.post('/video-call/rooms', body);
        toast.success('Videollamada creada');
      }
      onSave();
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0d0e1c] border border-violet-500/15 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-black text-white uppercase tracking-widest">
            {call ? 'Editar Videollamada' : 'Nueva Videollamada'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 border border-white/8 text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[9px] font-black text-white/40 uppercase tracking-wider mb-1.5">
              Título *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Reunión semanal de equipo"
              className="w-full bg-white/5 border border-violet-500/15 rounded-xl px-4 py-2.5 text-[13px] text-white/85 placeholder:text-white/20 focus:outline-none focus:border-violet-500/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[9px] font-black text-white/40 uppercase tracking-wider mb-1.5">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Agenda, temas a tratar..."
              rows={3}
              className="w-full bg-white/5 border border-violet-500/15 rounded-xl px-4 py-2.5 text-[13px] text-white/85 placeholder:text-white/20 focus:outline-none focus:border-violet-500/40 transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-[9px] font-black text-white/40 uppercase tracking-wider mb-1.5">
              Fecha y hora programada
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full bg-white/5 border border-violet-500/15 rounded-xl px-4 py-2.5 text-[13px] text-white/85 focus:outline-none focus:border-violet-500/40 transition-colors scheme-dark"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl text-white/60 text-[10px] font-black uppercase tracking-widest transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 bg-linear-to-r from-violet-700 to-violet-500 rounded-xl text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
          >
            <Save size={12} />
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── CallCard ──────────────────────────────────────────────────────────── */
function CallCard({
  call,
  onEdit,
  onDelete,
  onJoin,
  isOwn,
}: {
  call: VideoCallItem;
  onEdit: () => void;
  onDelete: () => void;
  onJoin: () => void;
  isOwn: boolean;
}) {
  const scheduled = call.scheduledAt ? new Date(call.scheduledAt) : null;
  const isPast = scheduled && scheduled < new Date();

  return (
    <div
      className={`relative bg-[#0d0e1c] border rounded-2xl p-5 flex flex-col gap-4 transition-all hover:border-violet-500/25 hover:shadow-lg hover:shadow-violet-500/5 ${
        call.status === 'active'
          ? 'border-emerald-500/25 shadow-emerald-500/5 shadow-lg'
          : 'border-violet-500/10'
      }`}
    >
      {/* Active indicator */}
      {call.status === 'active' && (
        <div className="absolute top-4 right-4">
          <span className="flex items-center gap-1 text-[9px] font-black text-emerald-400 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </span>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            call.status === 'active'
              ? 'bg-emerald-500/15 border border-emerald-500/25'
              : 'bg-violet-500/10 border border-violet-500/15'
          }`}
        >
          <Video
            size={16}
            className={call.status === 'active' ? 'text-emerald-400' : 'text-violet-400'}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-black text-white truncate">{call.title}</h3>
          <p className="text-[10px] text-white/40 mt-0.5">{call.host.name || call.host.email}</p>
        </div>
      </div>

      {call.description && (
        <p className="text-[12px] text-white/50 leading-relaxed border-t border-white/5 pt-3">
          {call.description}
        </p>
      )}

      {scheduled && (
        <div
          className={`flex items-center gap-2 text-[11px] font-bold ${isPast ? 'text-red-400/70' : 'text-amber-300/70'}`}
        >
          <Calendar size={11} />
          {scheduled.toLocaleDateString()} · <Clock size={11} />
          {scheduled.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {isPast && <span className="text-red-400/50 ml-1">(vencida)</span>}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1 border-t border-white/5">
        <StatusBadge status={call.status} />
        <div className="ml-auto flex items-center gap-1.5">
          <CopyLink roomId={call.roomId} />
          {isOwn && (
            <>
              <button
                onClick={onEdit}
                title="Editar"
                className="p-1.5 rounded-lg bg-white/4 hover:bg-violet-500/15 border border-white/8 hover:border-violet-500/30 text-white/30 hover:text-violet-300 transition-colors"
              >
                <Edit2 size={13} />
              </button>
              <button
                onClick={onDelete}
                title="Eliminar"
                className="p-1.5 rounded-lg bg-white/4 hover:bg-red-500/15 border border-white/8 hover:border-red-500/30 text-white/30 hover:text-red-400 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </>
          )}
          <button
            onClick={onJoin}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${
              call.status === 'active'
                ? 'bg-emerald-600/90 hover:bg-emerald-500 border border-emerald-500/50 text-white'
                : 'bg-violet-600/80 hover:bg-violet-500 border border-violet-500/40 text-white'
            }`}
          >
            <Play size={11} />
            {call.status === 'active' ? 'Unirse' : 'Iniciar'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */
export default function VideoCallsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [calls, setCalls] = useState<VideoCallItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'active'>('all');
  const [modal, setModal] = useState<{ open: boolean; call?: VideoCallItem | null }>({
    open: false,
  });

  const loadCalls = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<VideoCallItem[]>('/video-call/rooms');
      setCalls(data);
    } catch (e: any) {
      toast.error('Error al cargar videollamadas');
    } finally {
      setLoading(false);
    }
  };

  const searchParams = useSearchParams();

  useEffect(() => {
    loadCalls();
  }, []);

  useEffect(() => {
    const handleOpenNewCall = () => setModal({ open: true, call: null });
    window.addEventListener('open-new-call-modal', handleOpenNewCall);

    if (searchParams.get('new') === '1') {
      setModal({ open: true, call: null });
      // Cleanup url to prevent reopening on reload
      router.replace('/video-calls');
    }

    return () => window.removeEventListener('open-new-call-modal', handleOpenNewCall);
  }, [searchParams, router]);

  const handleDelete = async (id: string) => {
    const result = await showConfirm(
      '¿Eliminar videollamada?',
      'Esta acción eliminará la sala permanentemente.',
      'Sí, eliminar'
    );
    if (!result.isConfirmed) return;
    try {
      await apiClient.delete(`/video-call/rooms/${id}`);
      showAlert('Eliminada', 'La videollamada fue eliminada correctamente.', 'success');
      loadCalls();
    } catch (e: any) {
      showAlert('Error', e.message || 'Error al eliminar', 'error');
    }
  };

  const handleJoin = async (call: VideoCallItem) => {
    try {
      const isId = call.id.length > 20; // Check if it's the db uuid
      const data = await apiClient.post<{ token: string; url: string; roomId: string }>(
        `/video-call/rooms/${isId ? call.id : 'by-room/' + call.roomId}/join`,
        {
          name: user?.name || 'Participant',
        }
      );
      // Store token for the VideoCallRoom component
      sessionStorage.setItem(`vc_token_${call.roomId}`, data.token);
      sessionStorage.setItem(`vc_url_${call.roomId}`, data.url);
      router.push(`/call/${call.roomId}`);
    } catch (e: any) {
      toast.error(e.message || 'Error al unirse');
    }
  };

  const filtered = calls.filter((c) => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const active = calls.filter((c) => c.status === 'active');
  const scheduled = calls.filter((c) => c.status === 'scheduled');

  return (
    <Guard requiredPermissions={['streaming:manage']}>
      <div className="min-h-screen bg-[#07080f] text-white">
        {modal.open && (
          <CallModal
            call={modal.call}
            onClose={() => setModal({ open: false })}
            onSave={loadCalls}
          />
        )}

        {/* Header */}
        <div className="border-b border-violet-500/10 bg-[#07080f]/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-600/15 border border-violet-500/25 flex items-center justify-center">
                <Video size={16} className="text-violet-400" />
              </div>
              <div>
                <h1 className="text-[11px] font-black text-white uppercase tracking-widest">
                  Video Calls
                </h1>
                <p className="text-[9px] text-violet-400/50 uppercase tracking-wider">
                  {active.length} activa{active.length !== 1 ? 's' : ''} · {scheduled.length}{' '}
                  programada{scheduled.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={() => setModal({ open: true, call: null })}
              className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-violet-700 to-violet-500 rounded-xl text-white text-[10px] font-black uppercase tracking-wider shadow-lg shadow-violet-500/20 hover:shadow-violet-500/35 transition-shadow"
            >
              <Plus size={13} />
              Nueva Videollamada
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {[
              {
                label: 'En Vivo',
                value: active.length,
                color: 'emerald',
                icon: '🟢',
                filter: 'active',
              },
              {
                label: 'Programadas',
                value: scheduled.length,
                color: 'amber',
                icon: '📅',
                filter: 'scheduled',
              },
              { label: 'Total', value: calls.length, color: 'violet', icon: '📹', filter: 'all' },
            ].map((stat) => (
              <button
                key={stat.label}
                onClick={() => setFilter(stat.filter as any)}
                className={`border rounded-2xl p-4 flex items-center gap-3 text-left transition-all hover:scale-[1.02] ${
                  filter === stat.filter
                    ? 'bg-white/10 border-white/20'
                    : 'bg-[#0d0e1c] border-violet-500/10 hover:border-violet-500/30'
                }`}
              >
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <p className="text-xl font-black text-white">{stat.value}</p>
                  <p className="text-[9px] text-white/40 font-black uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Filters + Search */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-xs">
              <Search
                size={13}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar videollamadas..."
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-violet-500/15 rounded-xl text-[13px] text-white/85 placeholder:text-white/20 focus:outline-none focus:border-violet-500/40 transition-colors"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'active', 'scheduled'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${
                    filter === f
                      ? 'bg-violet-600/90 border border-violet-500/50 text-white'
                      : 'bg-white/5 border border-white/8 text-white/50 hover:text-white/70'
                  }`}
                >
                  {f === 'all' ? 'Todas' : f === 'active' ? 'Activas' : 'Programadas'}
                </button>
              ))}
            </div>
          </div>

          {/* Call Cards */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 rounded-full border-t-2 border-violet-500 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/15 flex items-center justify-center">
                <Video size={24} className="text-violet-400/50" />
              </div>
              <p className="text-white/30 text-sm text-center">
                {search ? 'No se encontraron resultados' : 'No hay videollamadas aún'}
                <br />
                <span className="text-[11px]">Crea una nueva para empezar</span>
              </p>
              <button
                onClick={() => setModal({ open: true })}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/25 rounded-xl text-violet-300 text-[10px] font-black uppercase tracking-wider transition-colors"
              >
                <Plus size={12} />
                Nueva Videollamada
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((call) => (
                <CallCard
                  key={call.id}
                  call={call}
                  isOwn={call.host.id === user?.id}
                  onEdit={() => setModal({ open: true, call })}
                  onDelete={() => handleDelete(call.id)}
                  onJoin={() => handleJoin(call)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Guard>
  );
}
