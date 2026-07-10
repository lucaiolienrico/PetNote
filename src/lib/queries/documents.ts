import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

export type Document       = Database['public']['Tables']['documents']['Row']
export type DocumentInsert = Database['public']['Tables']['documents']['Insert']

const KEYS = { list: (petId: string) => ['documents', petId] as const }

export function useDocuments(petId: string | undefined) {
  return useQuery({
    queryKey: KEYS.list(petId ?? ''),
    enabled:  !!petId,
    queryFn:  async (): Promise<Document[]> => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('pet_id', petId!)
        .order('uploaded_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

// Bucket privato → path canonico {user_id}/{uuid}.{ext}, richiesto dalle RLS storage
// (vedi uploadPetPhoto in pets.ts per lo stesso pattern).
export async function uploadDocumentFile(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autenticato')

  const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'pdf'
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from('pet-documents')
    .upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw error
  return path
}

export function useDocumentUrl(path: string | null) {
  return useQuery({
    queryKey:  ['document-url', path],
    enabled:   !!path,
    staleTime: 1000 * 60 * 50, // signed URL 1h → refresh a 50min
    queryFn:   async (): Promise<string> => {
      const { data, error } = await supabase.storage
        .from('pet-documents')
        .createSignedUrl(path!, 3600)
      if (error) throw error
      return data.signedUrl
    },
  })
}

// input.file_url deve essere il path già caricato via uploadDocumentFile.
export function useCreateDocument(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Omit<DocumentInsert, 'pet_id'>) => {
      const { data, error } = await supabase
        .from('documents')
        .insert({ ...input, pet_id: petId })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list(petId) }),
  })
}

// Rimuove sia la riga DB sia il file dal bucket. Se lo storage.remove fallisce
// (es. file già assente) non blocca comunque la delete della riga: un record
// orfano nel bucket è meno grave di un record fantasma nella UI.
export function useDeleteDocument(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, file_url }: { id: string; file_url: string }) => {
      const { error } = await supabase.from('documents').delete().eq('id', id)
      if (error) throw error
      await supabase.storage.from('pet-documents').remove([file_url])
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list(petId) }),
  })
}
