import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, Trash2, FileText, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import {
  useDocuments, useCreateDocument, useDeleteDocument, uploadDocumentFile,
  type Document,
} from '@/lib/queries/documents'
import { formatIt } from '@/lib/health'
import { useConfirmTap } from '@/hooks/useConfirmTap'
import { useAuthStore, selectHasFullAccess } from '@/stores/auth.store'
import { LockedFeature } from '@/components/shared/LockedFeature'

const MAX_FILE_BYTES = 20 * 1024 * 1024 // 20MB, allineato al bucket pet-documents
const ACCEPTED_MIME = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']

const DOC_TYPES = [
  { value: 'passaporto',       label: 'Passaporto' },
  { value: 'cartella_clinica', label: 'Cartella clinica' },
  { value: 'ricetta',          label: 'Ricetta' },
  { value: 'esame',            label: 'Esame' },
  { value: 'altro',            label: 'Altro' },
] as const

const DOC_TYPE_LABEL: Record<string, string> =
  Object.fromEntries(DOC_TYPES.map(t => [t.value, t.label]))

const schema = z.object({
  title:         z.string().trim().min(1, 'Titolo obbligatorio').max(120),
  document_type: z.enum(['passaporto', 'cartella_clinica', 'ricetta', 'esame', 'altro']),
})
type FormData = z.infer<typeof schema>

const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

function formatBytes(bytes: number | null): string {
  if (bytes === null) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Pro-only totale — vedi VaccinationsPage.tsx per il razionale.
export function DocumentsPage() {
  const { id: petId } = useParams<{ id: string }>()
  const hasFullAccess = useAuthStore(selectHasFullAccess)
  if (!hasFullAccess) {
    return <LockedFeature title="Documenti" icon={FileText} backTo={`/app/pets/${petId}`} />
  }
  return <DocumentsPageContent />
}

function DocumentsPageContent() {
  const { id: petId } = useParams<{ id: string }>()
  const { data: documents, isLoading } = useDocuments(petId)
  const createD = useCreateDocument(petId!)
  const deleteD = useDeleteDocument(petId!)

  const [showForm, setShowForm]   = useState(false)
  const [file, setFile]           = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [openingId, setOpeningId] = useState<string | null>(null)
  const { tap, isArmed } = useConfirmTap()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { document_type: 'altro' },
  })

  const openNew = () => {
    reset({ title: '', document_type: 'altro' })
    setFile(null)
    setFileError(null)
    setShowForm(true)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setFileError(null)
    if (!f) { setFile(null); return }
    if (!ACCEPTED_MIME.includes(f.type)) {
      setFileError('Formato non supportato: solo PDF, JPEG, PNG o WEBP')
      setFile(null)
      return
    }
    if (f.size > MAX_FILE_BYTES) {
      setFileError('File troppo grande: massimo 20MB')
      setFile(null)
      return
    }
    setFile(f)
  }

  const onSubmit = async (data: FormData) => {
    if (!file) {
      setFileError('Seleziona un file')
      return
    }
    setUploading(true)
    try {
      const path = await uploadDocumentFile(file)
      await createD.mutateAsync({
        title:         data.title,
        document_type: data.document_type,
        file_url:      path,
        file_size:     file.size,
      })
      toast.success('Documento caricato')
      setShowForm(false)
      setFile(null)
    } catch {
      toast.error('Caricamento non riuscito')
    } finally {
      setUploading(false)
    }
  }

  // Fetch one-shot della signed URL al tap, non tramite hook ambient per riga
  // (stesso principio di ExportPdfButton: azione puntuale, niente cache dedicata).
  const onOpen = async (doc: Document) => {
    setOpeningId(doc.id)
    try {
      const { data, error } = await supabase.storage
        .from('pet-documents')
        .createSignedUrl(doc.file_url, 60)
      if (error) throw error
      window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
    } catch {
      toast.error('Apertura non riuscita')
    } finally {
      setOpeningId(null)
    }
  }

  const onDelete = (doc: Document) => tap(doc.id, async () => {
    try {
      await deleteD.mutateAsync({ id: doc.id, file_url: doc.file_url })
      toast.success('Rimosso')
    } catch {
      toast.error('Rimozione non riuscita')
    }
  })

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <Link to={`/app/pets/${petId}`} className="p-1 text-slate-600"><ArrowLeft size={22} /></Link>
          <h1 className="text-xl font-bold text-slate-900">Documenti</h1>
        </div>
        {!showForm && (
          <button onClick={openNew} className="flex items-center gap-1.5 bg-brand-600 text-white rounded-xl px-3.5 py-2 text-sm font-semibold hover:bg-brand-700">
            <Plus size={16} strokeWidth={2.5} /> Aggiungi
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
          <div>
            <label className={labelCls}>Titolo *</label>
            <input {...register('title')} placeholder="Es. Passaporto europeo" className={inputCls} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Tipo *</label>
            <select {...register('document_type')} className={inputCls}>
              {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>File *</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={onFileChange}
              className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-brand-50 file:text-brand-700 file:text-sm file:font-semibold"
            />
            <p className="text-xs text-slate-500 mt-1">PDF, JPEG, PNG o WEBP · max 20MB</p>
            {fileError && <p className="text-red-500 text-xs mt-1">{fileError}</p>}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm font-semibold">
              Annulla
            </button>
            <button type="submit" disabled={isSubmitting || uploading} className="flex-1 bg-brand-600 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50">
              {uploading ? 'Caricamento…' : 'Carica'}
            </button>
          </div>
        </form>
      )}

      {isLoading && <div className="h-16 bg-slate-100 rounded-2xl animate-pulse" />}

      {!isLoading && documents?.length === 0 && !showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center space-y-2">
          <Upload size={26} className="text-brand-600 mx-auto" />
          <p className="text-sm text-slate-600">Nessun documento caricato</p>
        </div>
      )}

      <div className="space-y-2.5">
        {documents?.map(d => (
          <div key={d.id} className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-start justify-between gap-2">
              <button
                onClick={() => onOpen(d)}
                disabled={openingId === d.id}
                className="flex-1 min-w-0 text-left flex items-start gap-3 disabled:opacity-50"
              >
                <span className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText size={18} className="text-brand-600" />
                </span>
                <span className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{d.title}</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {DOC_TYPE_LABEL[d.document_type] ?? d.document_type}
                    {d.file_size !== null && ` · ${formatBytes(d.file_size)}`}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{formatIt(d.uploaded_at)}</p>
                </span>
              </button>
              <button
                onClick={() => onDelete(d)}
                className={`p-1 flex-shrink-0 ${isArmed(d.id) ? 'text-red-600' : 'text-slate-300'}`}
                aria-label="Elimina"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
