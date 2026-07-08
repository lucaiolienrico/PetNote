import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Pet } from '@/lib/queries/pets'
import { SPECIES, petAge } from '@/lib/species'
import { formatIt } from '@/lib/health'
import type { PetPdfData } from './petPdfData'

// jspdf-autotable non augmenta i tipi di jsPDF (jsPDFDocument = any nel suo .d.ts) —
// un solo cast qui invece di spargere `as any` in ogni chiamata a doc.lastAutoTable.
type PdfDoc = jsPDF & { lastAutoTable?: { finalY: number } }

const BRAND = '#2563eb' // brand-600 — stesso hex già usato in WeightPage.tsx, coerenza col grafico Recharts
const MARGIN_X = 14
const PAGE_BOTTOM_LIMIT = 15

const euro = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function sectionTitle(doc: PdfDoc, title: string, y: number): number {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(BRAND)
  doc.text(title, MARGIN_X, y)
  return y + 6
}

function emptyNote(doc: PdfDoc, y: number): number {
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(9)
  doc.setTextColor(150)
  doc.text('Nessun dato registrato.', MARGIN_X, y)
  return y + 10
}

// Se il prossimo blocco non entra nello spazio rimasto in pagina, apre una nuova pagina
// invece di lasciare che autoTable la spezzi a metà titolo+tabella.
function ensureSpace(doc: PdfDoc, y: number, needed = 30): number {
  const pageHeight = doc.internal.pageSize.getHeight()
  if (y + needed > pageHeight - PAGE_BOTTOM_LIMIT) {
    doc.addPage()
    return 20
  }
  return y
}

export function generatePetPdf(pet: Pet, data: PetPdfData): void {
  const doc = new jsPDF() as PdfDoc
  const pageWidth = doc.internal.pageSize.getWidth()

  // ── Intestazione ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(BRAND)
  doc.text('PetNote', MARGIN_X, 18)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(100)
  doc.text('Scheda sanitaria', MARGIN_X, 25)

  doc.setFontSize(9)
  doc.setTextColor(150)
  doc.text(`Generata il ${formatIt(new Date().toISOString())}`, pageWidth - MARGIN_X, 18, { align: 'right' })

  doc.setDrawColor(BRAND)
  doc.setLineWidth(0.5)
  doc.line(MARGIN_X, 30, pageWidth - MARGIN_X, 30)

  // ── Anagrafica ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(20)
  doc.text(pet.name, MARGIN_X, 40)

  const infoRows: [string, string][] = [
    ['Specie', SPECIES[pet.species].label],
    ['Razza', pet.breed ?? '—'],
    ['Sesso', pet.sex === 'non_specificato' ? '—' : cap(pet.sex)],
    ['Età', petAge(pet.birth_date) ?? '—'],
    ['Microchip', pet.microchip ?? '—'],
  ]

  autoTable(doc, {
    startY: 45,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 1.5 },
    columnStyles: { 0: { fontStyle: 'bold', textColor: 90, cellWidth: 35 } },
    body: infoRows,
  })

  let y = ensureSpace(doc, (doc.lastAutoTable?.finalY ?? 45) + 12)

  // ── Vaccinazioni ──
  y = sectionTitle(doc, 'Vaccinazioni', y)
  if (data.vaccinations.length === 0) {
    y = emptyNote(doc, y)
  } else {
    autoTable(doc, {
      startY: y,
      head: [['Vaccino', 'Somministrato il', 'Prossima scadenza', 'Veterinario', 'Lotto']],
      body: data.vaccinations.map(v => [
        v.vaccine_name,
        formatIt(v.administered_at),
        v.next_due_at ? formatIt(v.next_due_at) : '—',
        v.veterinarian ?? '—',
        v.batch_number ?? '—',
      ]),
      headStyles: { fillColor: BRAND },
      styles: { fontSize: 9 },
    })
    y = (doc.lastAutoTable?.finalY ?? y) + 10
  }
  y = ensureSpace(doc, y)

  // ── Visite veterinarie ──
  y = sectionTitle(doc, 'Visite veterinarie', y)
  if (data.vetVisits.length === 0) {
    y = emptyNote(doc, y)
  } else {
    autoTable(doc, {
      startY: y,
      head: [['Data', 'Clinica', 'Veterinario', 'Motivo', 'Diagnosi', 'Costo']],
      body: data.vetVisits.map(v => [
        formatIt(v.visited_at),
        v.clinic ?? '—',
        v.veterinarian ?? '—',
        v.reason,
        v.diagnosis ?? '—',
        v.cost != null ? euro.format(v.cost) : '—',
      ]),
      headStyles: { fillColor: BRAND },
      styles: { fontSize: 9 },
    })
    y = (doc.lastAutoTable?.finalY ?? y) + 10
  }
  y = ensureSpace(doc, y)

  // ── Antiparassitari ──
  y = sectionTitle(doc, 'Antiparassitari', y)
  if (data.antiparasitics.length === 0) {
    y = emptyNote(doc, y)
  } else {
    autoTable(doc, {
      startY: y,
      head: [['Prodotto', 'Tipo', 'Somministrato il', 'Prossima scadenza']],
      body: data.antiparasitics.map(a => [
        a.product_name,
        cap(a.type),
        formatIt(a.administered_at),
        a.next_due_at ? formatIt(a.next_due_at) : '—',
      ]),
      headStyles: { fillColor: BRAND },
      styles: { fontSize: 9 },
    })
    y = (doc.lastAutoTable?.finalY ?? y) + 10
  }
  y = ensureSpace(doc, y)

  // ── Peso ──
  y = sectionTitle(doc, 'Peso', y)
  if (data.weightLogs.length === 0) {
    y = emptyNote(doc, y)
  } else {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.setTextColor(120)
    doc.text("Andamento completo e grafico disponibili nell'app.", MARGIN_X, y)
    y += 5
    autoTable(doc, {
      startY: y,
      head: [['Data', 'Peso']],
      body: data.weightLogs.map(w => [formatIt(w.measured_at), `${w.weight_kg.toString().replace('.', ',')} kg`]),
      headStyles: { fillColor: BRAND },
      styles: { fontSize: 9 },
      tableWidth: 80,
    })
    y = (doc.lastAutoTable?.finalY ?? y) + 10
  }
  y = ensureSpace(doc, y)

  // ── Allergie ──
  y = sectionTitle(doc, 'Allergie', y)
  if (data.allergies.length === 0) {
    y = emptyNote(doc, y)
  } else {
    autoTable(doc, {
      startY: y,
      head: [['Allergene', 'Gravità', 'Diagnosticata il', 'Reazione']],
      body: data.allergies.map(a => [
        a.allergen,
        cap(a.severity),
        a.diagnosed_at ? formatIt(a.diagnosed_at) : '—',
        a.reaction ?? '—',
      ]),
      headStyles: { fillColor: BRAND },
      styles: { fontSize: 9 },
    })
    y = (doc.lastAutoTable?.finalY ?? y) + 10
  }
  y = ensureSpace(doc, y)

  // ── Assicurazioni ──
  y = sectionTitle(doc, 'Assicurazioni', y)
  if (data.insurancePolicies.length === 0) {
    emptyNote(doc, y)
  } else {
    autoTable(doc, {
      startY: y,
      head: [['Compagnia', 'Frequenza', 'Premio', 'Inizio', 'Fine', 'N. Polizza']],
      body: data.insurancePolicies.map(p => [
        p.provider,
        p.billing_frequency === 'mensile' ? 'Mensile' : 'Annuale',
        `${euro.format(p.premium_amount)}${p.billing_frequency === 'mensile' ? '/mese' : '/anno'}`,
        formatIt(p.start_date),
        p.end_date ? formatIt(p.end_date) : 'In corso',
        p.policy_number ?? '—',
      ]),
      headStyles: { fillColor: BRAND },
      styles: { fontSize: 9 },
    })
  }

  // ── Footer: numero pagina su ogni pagina, incluse quelle aggiunte da ensureSpace ──
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(160)
    doc.text(`PetNote — ${pet.name}`, MARGIN_X, doc.internal.pageSize.getHeight() - 10)
    doc.text(`Pagina ${i} di ${pageCount}`, pageWidth - MARGIN_X, doc.internal.pageSize.getHeight() - 10, {
      align: 'right',
    })
  }

  // Nome file sanitizzato: accenti rimossi, solo alfanumerico, per evitare problemi
  // di encoding nel download su iOS/Android PWA
  const safeName = pet.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
  const dateStr = new Date().toISOString().slice(0, 10)
  doc.save(`PetNote_${safeName}_${dateStr}.pdf`)
}
