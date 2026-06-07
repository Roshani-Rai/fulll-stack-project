import express from 'express'
import PDFDocument from 'pdfkit'
import appointmentModel from '../models/appointmentsch.js'

const router = express.Router()

// ── helpers ──
const drawHLine = (doc, y, x1 = 50, x2 = 550, color = '#CCCCCC', width = 0.5) => {
  doc.save().strokeColor(color).lineWidth(width).moveTo(x1, y).lineTo(x2, y).stroke().restore()
}

const badge = (doc, x, y, text, bg = '#4F46E5', fg = '#FFFFFF') => {
  const pad = 8
  const w = doc.widthOfString(text) + pad * 2
  const h = 16
  doc.save().roundedRect(x, y - 2, w, h, 4).fill(bg)
  doc.fontSize(8).fillColor(fg).font('Helvetica-Bold').text(text, x + pad, y + 1, { lineBreak: false })
  doc.restore()
  return w
}

router.get('/:id', async (req, res) => {
  try {
    const appointment = await appointmentModel.findById(req.params.id)

    if (!appointment)
      return res.status(404).json({ success: false, message: 'Appointment not found' })

    if (!appointment.prescription)
      return res.status(404).json({ success: false, message: 'Prescription not added yet' })

    const { prescription, userData, docData } = appointment

    // ── pull doctor address safely ──
    const addr1 = docData?.address?.line1 || ''
    const addr2 = docData?.address?.line2 || ''
    const fullAddress = [addr1, addr2].filter(Boolean).join(', ')

    const doc = new PDFDocument({ margin: 0, size: 'A4' })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=prescription-${req.params.id}.pdf`)
    doc.pipe(res)

    const PW = 595   // A4 width pts
    const PH = 842   // A4 height pts
    const ML = 50    // margin left
    const MR = 50    // margin right
    const CW = PW - ML - MR   // content width

    // ══════════════════════════════════════════
    // TOP COLOUR BAND
    // ══════════════════════════════════════════
    doc.rect(0, 0, PW, 130).fill('#4F46E5')

    // Clinic name
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#FFFFFF')
      .text('MediCare Health Clinic', ML, 22, { width: CW })

    // Tagline
    doc.fontSize(9).font('Helvetica').fillColor('#C7D2FE')
      .text('Your Health, Our Priority', ML, 50, { width: CW })

    // Address line
    const addressText = fullAddress || 'Varanasi, Uttar Pradesh, India'
    doc.fontSize(9).fillColor('#E0E7FF')
      .text(`📍 ${addressText}`, ML, 66, { width: CW })

    // Phone / email placeholder (optional — edit as needed)
    doc.fontSize(9).fillColor('#E0E7FF')
      .text('📞 +91-9875643221  ✉  clinic@medicare.com', ML, 82, { width: CW })

    // Rx symbol (top right)
    doc.fontSize(48).font('Helvetica-Bold').fillColor('rgba(255,255,255,0.15)')
      .text('℞', PW - 90, 10, { lineBreak: false })

    // ══════════════════════════════════════════
    // PRESCRIPTION LABEL RIBBON
    // ══════════════════════════════════════════
    doc.rect(0, 130, PW, 28).fill('#3730A3')
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#FFFFFF')
      .text('MEDICAL PRESCRIPTION', ML, 139, { width: CW, align: 'center' })

    // ══════════════════════════════════════════
    // PATIENT + DOCTOR INFO BOX
    // ══════════════════════════════════════════
    const infoY = 172
    const colW = CW / 2 - 10

    // Left box — Patient
    doc.roundedRect(ML, infoY, colW, 90, 6).fill('#F5F3FF')
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#6D28D9')
      .text('PATIENT INFORMATION', ML + 10, infoY + 10)
    drawHLine(doc, infoY + 22, ML + 10, ML + colW - 10, '#DDD6FE', 0.5)

    doc.fontSize(10).font('Helvetica-Bold').fillColor('#1F2937')
      .text(userData.name || 'N/A', ML + 10, infoY + 28)
    doc.fontSize(9).font('Helvetica').fillColor('#6B7280')
      .text(`Age  : ${userData.dob ? new Date().getFullYear() - new Date(userData.dob).getFullYear() : 'N/A'}`, ML + 10, infoY + 44)
      .text(`Email: ${userData.email || 'N/A'}`, ML + 10, infoY + 58)
      .text(`Phone: ${userData.phone || 'N/A'}`, ML + 10, infoY + 72)

    // Right box — Doctor
    const rightX = ML + colW + 20
    doc.roundedRect(rightX, infoY, colW, 90, 6).fill('#ECFDF5')
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#065F46')
      .text('DOCTOR INFORMATION', rightX + 10, infoY + 10)
    drawHLine(doc, infoY + 22, rightX + 10, rightX + colW - 10, '#A7F3D0', 0.5)

    doc.fontSize(10).font('Helvetica-Bold').fillColor('#1F2937')
      .text(`Dr. ${docData.name || 'N/A'}`, rightX + 10, infoY + 28)
    doc.fontSize(9).font('Helvetica').fillColor('#6B7280')
      .text(`Speciality : ${docData.speciality || 'N/A'}`, rightX + 10, infoY + 44)
      .text(`Degree     : ${docData.degree || 'N/A'}`, rightX + 10, infoY + 58)
      .text(`Experience : ${docData.experience || 'N/A'}`, rightX + 10, infoY + 72)

    // Date badge (top right)
    const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    doc.fontSize(8).font('Helvetica').fillColor('#6B7280')
      .text(`Date: ${dateStr}`, ML, infoY + 96, { width: CW, align: 'right' })

    // ══════════════════════════════════════════
    // MEDICATIONS TABLE
    // ══════════════════════════════════════════
    let curY = infoY + 116

    // Section header
    doc.roundedRect(ML, curY, CW, 24, 4).fill('#4F46E5')
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#FFFFFF')
      .text('PRESCRIBED MEDICATIONS', ML + 10, curY + 7)
    curY += 24

    // Table column headers
    const cols = { num: ML, name: ML + 30, dosage: ML + 240, duration: ML + 370 }
    doc.rect(ML, curY, CW, 20).fill('#EEF2FF')
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#4338CA')
      .text('#', cols.num + 8, curY + 6)
      .text('Medicine Name', cols.name, curY + 6)
      .text('Dosage', cols.dosage, curY + 6)
      .text('Duration', cols.duration, curY + 6)
    curY += 20

    // Table rows
    prescription.medications.forEach((med, i) => {
      const rowBg = i % 2 === 0 ? '#FFFFFF' : '#F9FAFB'
      doc.rect(ML, curY, CW, 26).fill(rowBg)

      // number circle
      doc.circle(cols.num + 12, curY + 13, 9).fill('#4F46E5')
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#FFFFFF')
        .text(String(i + 1), cols.num + 8, curY + 9, { width: 18, align: 'center' })

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#111827')
        .text(med.name || '—', cols.name, curY + 8, { width: 200 })
      doc.fontSize(9).font('Helvetica').fillColor('#374151')
        .text(med.dosage || '—', cols.dosage, curY + 9, { width: 120 })
        .text(med.duration || '—', cols.duration, curY + 9, { width: 130 })

      drawHLine(doc, curY + 26, ML, ML + CW, '#E5E7EB', 0.4)
      curY += 26
    })

    curY += 16

    // ══════════════════════════════════════════
    // DOCTOR NOTES
    // ══════════════════════════════════════════
    if (prescription.notes) {
      doc.roundedRect(ML, curY, CW, 20, 4).fill('#FEF3C7')
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#92400E')
        .text('📝  DOCTOR\'S NOTES & ADVICE', ML + 10, curY + 6)
      curY += 20

      doc.rect(ML, curY, CW, 1).fill('#FDE68A')
      curY += 8

      doc.fontSize(10).font('Helvetica').fillColor('#1F2937')
        .text(prescription.notes, ML + 10, curY, { width: CW - 20 })
      curY = doc.y + 16
    }

    // ══════════════════════════════════════════
    // SIGNATURE SECTION
    // ══════════════════════════════════════════
    curY = Math.max(curY, PH - 160)

    drawHLine(doc, curY, ML, ML + CW, '#E5E7EB', 1)
    curY += 16

    // Left — validity note
    doc.fontSize(8).font('Helvetica').fillColor('#9CA3AF')
      .text('⚠  This prescription is valid for 30 days from issue date.', ML, curY, { width: CW * 0.55 })
      .text('Please follow the prescribed dosage. Do not self-medicate.', ML, curY + 12, { width: CW * 0.55 })

    // Right — signature box
    const sigX = ML + CW * 0.62
    const sigW = CW * 0.38
    doc.roundedRect(sigX, curY - 6, sigW, 70, 6).stroke('#D1D5DB')

    // Signature lines
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#374151')
      .text(`Dr. ${docData.name || ''}`, sigX + 10, curY + 2, { width: sigW - 20, align: 'center' })
    doc.fontSize(8).font('Helvetica').fillColor('#6B7280')
      .text(docData.speciality || '', sigX + 10, curY + 16, { width: sigW - 20, align: 'center' })
    doc.fontSize(8).fillColor('#9CA3AF')
      .text(docData.degree || '', sigX + 10, curY + 28, { width: sigW - 20, align: 'center' })

    drawHLine(doc, curY + 44, sigX + 10, sigX + sigW - 10, '#374151', 0.8)
    doc.fontSize(7).fillColor('#9CA3AF')
      .text('Signature & Stamp', sigX + 10, curY + 48, { width: sigW - 20, align: 'center' })

    // ══════════════════════════════════════════
    // FOOTER BAND
    // ══════════════════════════════════════════
    doc.rect(0, PH - 32, PW, 32).fill('#4F46E5')
    doc.fontSize(8).font('Helvetica').fillColor('#C7D2FE')
      .text(
        `MediCare Health Clinic  •  ${addressText}  •  Generated on ${dateStr}`,
        ML, PH - 20, { width: CW, align: 'center' }
      )

    doc.end()

  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router