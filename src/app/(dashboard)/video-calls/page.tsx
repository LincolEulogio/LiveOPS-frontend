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
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '@/shared/store/app.store';
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
      scheduled: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
      active: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      ended: 'bg-muted/10 border-muted/20 text-muted-foreground',
    }[status] || 'bg-muted/10 border-muted/20 text-muted-foreground';

  const dots =
    {
      scheduled: 'bg-amber-500',
      active: 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]',
      ended: 'bg-muted-foreground/30',
    }[status] || 'bg-muted-foreground/30';

  return (
    <span
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${styles}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dots}`} />
      {status === 'scheduled' ? 'Programada' : status === 'active' ? 'En Vivo' : 'Finalizada'}
    </span>
  );
}

function CopyLink({ roomId }: { roomId: string }) {
  const [copied, setCopied] = useState(false);
  const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/call/${roomId}`;
  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Enlace de invitación copiado');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      title="Copiar enlace de invitación"
      className="p-2 rounded-xl bg-indigo-500/5 hover:bg-indigo-500/15 border border-indigo-500/10 hover:border-indigo-500/30 text-indigo-500/60 hover:text-indigo-600 dark:text-indigo-400/50 dark:hover:text-indigo-300 transition-all duration-300 active:scale-90"
    >
      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
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
        toast.success('Videollamada actualizada correctamente');
      } else {
        await apiClient.post('/video-call/rooms', body);
        toast.success('Videollamada creada correctamente');
      }
      onSave();
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Error al procesar la solicitud');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-card-bg/95 backdrop-blur-2xl border border-card-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Modal Decorative Background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[80px] -z-10" />

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Plus size={18} className="text-indigo-500" />
            </div>
            <h2 className="text-[12px] font-black text-foreground uppercase tracking-[0.2em]">
              {call ? 'Editar Sesión' : 'Nueva Videollamada'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-muted/10 border border-card-border text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all duration-300"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
              Título de la Sesión
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Sincronización de Producción"
              className="w-full bg-background/50 border border-card-border rounded-2xl px-5 py-3.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
              Descripción (Opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles sobre los temas a tratar..."
              rows={3}
              className="w-full bg-background/50 border border-card-border rounded-2xl px-5 py-3.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
              Programar para (GMT-5)
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full bg-background/50 border border-card-border rounded-2xl px-5 py-3.5 text-sm text-foreground focus:outline-none focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-10">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-muted/5 hover:bg-muted/10 border border-card-border rounded-2xl text-muted-foreground text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-4 bg-linear-to-br from-indigo-700 to-indigo-500 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 hover:translate-y-[-2px]"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {saving ? 'Procesando...' : 'Confirmar'}
          </button>
        </div>
      </motion.div>
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
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative bg-card-bg/60 backdrop-blur-xl border rounded-[2rem] p-6 flex flex-col gap-6 transition-all duration-500 hover:shadow-2xl hover:translate-y-[-4px] active:scale-[0.98] ${
        call.status === 'active'
          ? 'border-emerald-500/30 shadow-lg shadow-emerald-500/5'
          : 'border-card-border hover:border-indigo-500/30 shadow-sm'
      }`}
    >
      {/* Dynamic Background Sparkle */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-500 ${
              call.status === 'active'
                ? 'bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                : 'bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.05)]'
            }`}
          >
            <Video
              size={20}
              className={
                call.status === 'active'
                  ? 'text-emerald-500'
                  : 'text-indigo-500 transition-all duration-300'
              }
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-[15px] font-black text-foreground truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {call.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-widest border-r border-card-border pr-2">
                Operador
              </span>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground/80 font-bold truncate">
                {call.host.name || call.host.email}
              </p>
            </div>
          </div>
        </div>

        <div className="flex sm:block self-start sm:self-auto">
          {call.status === 'active' ? (
            <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-tighter">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                En Vivo
              </span>
            </div>
          ) : (
            <StatusBadge status={call.status} />
          )}
        </div>
      </div>

      {/* Description Panel */}
      {call.description ? (
        <p className="text-[12px] sm:text-[13px] text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-3 bg-muted/5 p-3 sm:p-4 rounded-2xl border border-card-border group-hover:border-indigo-500/10 transition-colors">
          {call.description}
        </p>
      ) : (
        <div className="h-px bg-card-border/30 w-full" />
      )}

      {/* Time and Metadata */}
      {scheduled && (
        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-black tracking-tight ${
              isPast
                ? 'bg-red-500/5 border-red-500/10 text-red-500/70'
                : 'bg-indigo-500/5 border-indigo-500/10 text-indigo-500/80 dark:text-indigo-300/80'
            }`}
          >
            <Calendar size={12} />
            {scheduled.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
            <span className="text-muted-foreground/30 font-thin">|</span>
            <Clock size={12} />
            {scheduled.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {isPast && (
              <span className="text-[8px] uppercase ml-1 opacity-50 font-black">Finalizado</span>
            )}
          </div>
        </div>
      )}

      {/* Actions Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-auto pt-4 border-t border-card-border">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <CopyLink roomId={call.roomId} />
          {isOwn && (
            <div className="flex items-center gap-1 bg-muted/5 p-1 rounded-2xl border border-card-border">
              <button
                onClick={onEdit}
                title="Configuración"
                className="p-2 rounded-xl text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-white dark:hover:bg-indigo-500/10 transition-all duration-300 active:scale-90"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={onDelete}
                title="Eliminar"
                className="p-2 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-white dark:hover:bg-red-500/10 transition-all duration-300 active:scale-90"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onJoin}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 shadow-lg active:scale-95 ${
            call.status === 'active'
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/25'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25 hover:translate-y-[-2px]'
          }`}
        >
          <Play size={14} className={call.status === 'active' ? 'animate-pulse' : ''} />
          {call.status === 'active' ? 'Conectar' : 'Iniciar Nodo'}
        </button>
      </div>
    </motion.div>
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
      <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
        <AnimatePresence>
          {modal.open && (
            <CallModal
              call={modal.call}
              onClose={() => setModal({ open: false })}
              onSave={loadCalls}
            />
          )}
        </AnimatePresence>

        {/* Tactical Page Header */}
        <div className="relative overflow-hidden pt-10 pb-16">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-32 bg-indigo-600/5 blur-[100px] pointer-events-none" />

          <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                    Operational Module
                  </span>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-foreground uppercase tracking-tight leading-none mb-3 italic">
                Video <span className="text-indigo-600">Protocol</span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-lg">
                Gestiona y coordina sesiones de comunicación en tiempo real para tu red de
                producción. Actualmente hay{' '}
                <span className="text-indigo-600 dark:text-indigo-400 font-black">
                  {active.length}
                </span>{' '}
                activas y{' '}
                <span className="text-indigo-600 dark:text-indigo-400 font-black">
                  {scheduled.length}
                </span>{' '}
                programadas.
              </p>
            </div>

            <button
              onClick={() => setModal({ open: true, call: null })}
              className="group relative flex items-center gap-3 px-8 py-4 bg-linear-to-br from-indigo-700 to-indigo-500 rounded-[1.5rem] text-white text-[11px] font-black uppercase tracking-[0.15em] shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all duration-300 active:scale-95 hover:translate-y-[-2px]"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem]" />
              <Plus size={16} className="group-hover:rotate-90 transition-transform duration-500" />
              Nueva Videollamada
            </button>
          </div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 pb-20">
          {/* Dashboard Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              {
                label: 'Señales Activas',
                value: active.length,
                color: 'emerald',
                desc: 'Llamadas en curso actualmente',
                icon: <Video size={20} />,
                filter: 'active',
              },
              {
                label: 'Agenda de Hoy',
                value: scheduled.length,
                color: 'amber',
                desc: 'Sesiones pendientes de inicio',
                icon: <Calendar size={20} />,
                filter: 'scheduled',
              },
              {
                label: 'Registro Histórico',
                value: calls.length,
                color: 'indigo',
                desc: 'Total de sesiones creadas',
                icon: <Users size={20} />,
                filter: 'all',
              },
            ].map((stat) => (
              <button
                key={stat.label}
                onClick={() => setFilter(stat.filter as any)}
                className={`group relative border rounded-[2.2rem] p-7 flex flex-col text-left transition-all duration-500 hover:translate-y-[-4px] ${
                  filter === stat.filter
                    ? 'bg-card-bg border-indigo-500/40 shadow-xl shadow-indigo-500/5'
                    : 'bg-card-bg/40 border-card-border hover:border-indigo-500/30'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-500 ${
                    filter === stat.filter
                      ? 'bg-indigo-600 text-white'
                      : 'bg-muted/10 text-muted-foreground group-hover:bg-indigo-500/10 group-hover:text-indigo-500'
                  }`}
                >
                  {stat.icon}
                </div>
                <div className="relative z-10">
                  <p className="text-4xl font-black text-foreground mb-1 group-hover:scale-105 transition-transform origin-left duration-500">
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-foreground font-black uppercase tracking-[0.2em] mb-2 px-0.5">
                    {stat.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium tracking-tight">
                    {stat.desc}
                  </p>
                </div>
                {filter === stat.filter && (
                  <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                )}
              </button>
            ))}
          </div>

          {/* Search + Control Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 mb-10 bg-card-bg/30 backdrop-blur-md p-4 rounded-[2rem] border border-card-border/50">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={16}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/60"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Identificador o título de sesión..."
                className="w-full pl-14 pr-6 py-4 bg-background border border-card-border rounded-2xl text-[13px] text-foreground placeholder:text-muted focus:outline-none focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
              />
            </div>

            <div className="flex p-1.5 bg-background border border-card-border rounded-2xl w-full lg:w-auto overflow-x-auto no-scrollbar">
              {(['all', 'active', 'scheduled'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 lg:flex-none px-3 sm:px-6 py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                    filter === f
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/5'
                  }`}
                >
                  {f === 'all' ? 'Ver Todos' : f === 'active' ? 'Solo Activos' : 'Programados'}
                </button>
              ))}
            </div>
          </div>

          {/* Results Area */}
          <div className="relative min-h-[400px]">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest animate-pulse">
                  Sincronizando Datos
                </span>
              </div>
            ) : filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 gap-6 bg-card-bg/20 border border-dashed border-card-border rounded-[3rem]"
              >
                <div className="w-20 h-20 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center">
                  <Search size={32} className="text-muted-foreground/20" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-foreground font-black text-lg uppercase tracking-tight">
                    {search ? 'Sin coincidencias operativas' : 'Nodos inactivos'}
                  </p>
                  <p className="text-xs text-muted-foreground/60 max-w-xs mx-auto">
                    {search
                      ? 'Asegúrate de haber escrito correctamente el nombre o ID de la sala.'
                      : 'No se han detectado sesiones activas ni programadas en el sistema.'}
                  </p>
                </div>
                {!search && (
                  <button
                    onClick={() => setModal({ open: true })}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-2xl text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300"
                  >
                    <Plus size={14} />
                    Iniciar Primera Sesión
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
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
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </Guard>
  );
}
