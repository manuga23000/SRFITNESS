import { jsPDF } from 'jspdf'
import { autoTable, type CellHookData, type UserOptions } from 'jspdf-autotable'
import type { SocioConEstado } from '../types'
import { formatearFecha, textoVencimiento } from './dates'
import { ESTADO_LABEL, PLAN_LABEL } from './etiquetas'
import { formatearCelular, formatearMonto, nombreCompleto } from './format'
import { nombreMes, type ResumenMensual } from './resumen'

// Paleta del PDF: fondo blanco para que se pueda imprimir, con el verde lima de la marca.
const NEGRO: [number, number, number] = [10, 10, 11]
const LIMA: [number, number, number] = [198, 255, 0]
const GRIS: [number, number, number] = [110, 110, 120]
const GRIS_CLARO: [number, number, number] = [244, 244, 246]
const VERDE: [number, number, number] = [22, 163, 74]
const NARANJA: [number, number, number] = [234, 88, 12]
const ROJO: [number, number, number] = [225, 29, 72]

const MARGEN = 14

/** jsPDF con las fuentes estándar no tiene el espacio duro que usa Intl ("$ 25.000"). */
const txt = (s: string) => s.replace(/ | /g, ' ')
const monto = (n: number | undefined) => txt(formatearMonto(n))

/** Los encabezados y totales se alinean igual que su columna (columnStyles solo aplica al cuerpo). */
function alinearEncabezado(data: CellHookData) {
  if (data.section !== 'body') {
    const halign = data.table.styles.columnStyles[data.column.index]?.halign
    if (halign) data.cell.styles.halign = halign
  }
}

type DocConTabla = jsPDF & { lastAutoTable?: { finalY: number } }

function finalY(doc: DocConTabla, fallback: number) {
  return doc.lastAutoTable?.finalY ?? fallback
}

function colorEstado(s: SocioConEstado): [number, number, number] {
  return s.estado === 'vencido' ? ROJO : s.estado === 'por-vencer' ? NARANJA : VERDE
}

export function generarPdfResumen(r: ResumenMensual): jsPDF {
  const doc: DocConTabla = new jsPDF({ unit: 'mm', format: 'a4' })
  const ancho = doc.internal.pageSize.getWidth()
  const alto = doc.internal.pageSize.getHeight()
  const titulo = `Resumen ${nombreMes(r.mes)}`

  // ---- Encabezado
  doc.setFillColor(...NEGRO)
  doc.rect(0, 0, ancho, 34, 'F')
  doc.setFillColor(...LIMA)
  doc.roundedRect(MARGEN, 8, 18, 18, 3, 3, 'F')
  doc.setTextColor(...NEGRO)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('SR', MARGEN + 9, 19.5, { align: 'center' })
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.text('SR FITNESS GYM', MARGEN + 23, 16)
  doc.setTextColor(...LIMA)
  doc.setFontSize(11)
  doc.text(titulo.toUpperCase(), MARGEN + 23, 23)
  doc.setTextColor(180, 180, 190)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(`Generado el ${formatearFecha(r.generadoEn)}`, ancho - MARGEN, 23, { align: 'right' })

  // ---- Tarjetas de resumen
  let y = 42
  const tarjetas: { label: string; valor: string; color: [number, number, number] }[] = [
    { label: 'Socios activos', valor: String(r.activos), color: NEGRO },
    { label: 'Al día', valor: String(r.alDia), color: VERDE },
    { label: 'Por vencer', valor: String(r.porVencer), color: NARANJA },
    { label: 'Vencidos', valor: String(r.vencidos), color: ROJO },
  ]
  const gap = 4
  const anchoTarjeta = (ancho - MARGEN * 2 - gap * 3) / 4
  tarjetas.forEach((t, i) => {
    const x = MARGEN + i * (anchoTarjeta + gap)
    doc.setFillColor(...GRIS_CLARO)
    doc.roundedRect(x, y, anchoTarjeta, 22, 2, 2, 'F')
    doc.setTextColor(...GRIS)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.text(t.label.toUpperCase(), x + 4, y + 7)
    doc.setTextColor(...t.color)
    doc.setFontSize(18)
    doc.text(t.valor, x + 4, y + 17)
  })
  y += 27
  doc.setTextColor(...GRIS)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.text(`Estado de las cuotas al ${formatearFecha(r.generadoEn)}.`, MARGEN, y)

  // ---- Cobrado en el mes
  y += 6
  doc.setFillColor(...NEGRO)
  doc.roundedRect(MARGEN, y, ancho - MARGEN * 2, 20, 2, 2, 'F')
  doc.setTextColor(200, 200, 205)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text(`COBRADO EN ${nombreMes(r.mes).toUpperCase()}`, MARGEN + 5, y + 7)
  doc.setTextColor(...LIMA)
  doc.setFontSize(17)
  doc.text(monto(r.totalCobrado), MARGEN + 5, y + 16)
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.text(`${r.pagos.length} ${r.pagos.length === 1 ? 'pago' : 'pagos'}`, ancho - MARGEN - 5, y + 12, {
    align: 'right',
  })
  y += 32

  const base: Partial<UserOptions> = {
    margin: { left: MARGEN, right: MARGEN, top: 16, bottom: 16 },
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 2.2, textColor: [30, 30, 35], lineColor: [230, 230, 235] },
    headStyles: { fillColor: NEGRO, textColor: LIMA, fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [250, 250, 252] },
    theme: 'grid',
    didParseCell: alinearEncabezado,
  }

  function seccion(texto: string, subtitulo?: string) {
    if (y > alto - 40) {
      doc.addPage()
      y = 18
    }
    doc.setTextColor(...NEGRO)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(texto, MARGEN, y)
    if (subtitulo) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...GRIS)
      doc.text(subtitulo, MARGEN, y + 4.5)
      y += 4.5
    }
    y += 3
  }

  function vacio(texto: string) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8.5)
    doc.setTextColor(...GRIS)
    doc.text(texto, MARGEN, y + 4)
    y += 12
  }

  // ---- Cobrado por plan
  seccion('Cobrado por plan')
  autoTable(doc, {
    ...base,
    startY: y,
    head: [['Plan', 'Socios activos', 'Pagos del mes', 'Total cobrado']],
    body: r.porPlan.map((p) => [
      PLAN_LABEL[p.plan],
      String(r.sociosPorPlan[p.plan]),
      String(p.cantidad),
      monto(p.total),
    ]),
    foot: [['Total', String(r.activos), String(r.pagos.length), monto(r.totalCobrado)]],
    footStyles: { fillColor: GRIS_CLARO, textColor: NEGRO, fontStyle: 'bold' },
    columnStyles: { 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'right' } },
  })
  y = finalY(doc, y) + 10

  // ---- Pendientes de pago
  seccion('Cuotas vencidas y por vencer', 'Socios activos que tienen que renovar la cuota.')
  if (r.pendientes.length === 0) vacio('Nadie debe ni tiene la cuota por vencer.')
  else {
    autoTable(doc, {
      ...base,
      startY: y,
      head: [['Socio', 'Celular', 'Plan', 'Vencimiento', 'Estado']],
      body: r.pendientes.map((s) => [
        nombreCompleto(s),
        s.celular ? formatearCelular(s.celular) : '—',
        PLAN_LABEL[s.plan],
        formatearFecha(s.fechaVencimiento),
        textoVencimiento(s.diasRestantes),
      ]),
      didParseCell: (data) => {
        alinearEncabezado(data)
        if (data.section === 'body' && data.column.index === 4) {
          data.cell.styles.textColor = colorEstado(r.pendientes[data.row.index])
          data.cell.styles.fontStyle = 'bold'
        }
      },
    })
    y = finalY(doc, y) + 10
  }

  // ---- Pagos del mes
  seccion(`Pagos de ${nombreMes(r.mes)}`)
  if (r.pagos.length === 0) vacio('No se registraron pagos en este mes.')
  else {
    autoTable(doc, {
      ...base,
      startY: y,
      head: [['Fecha', 'Socio', 'Plan', 'Monto']],
      body: r.pagos.map((p) => [formatearFecha(p.fecha), p.socioNombre, PLAN_LABEL[p.plan], monto(p.monto)]),
      foot: [['', '', 'Total', monto(r.totalCobrado)]],
      footStyles: { fillColor: GRIS_CLARO, textColor: NEGRO, fontStyle: 'bold' },
      columnStyles: { 3: { halign: 'right' } },
    })
    y = finalY(doc, y) + 10
  }

  // ---- Altas y bajas
  seccion('Altas y bajas del mes')
  if (r.altas.length === 0 && r.bajas.length === 0) vacio('No hubo altas ni bajas en este mes.')
  else {
    autoTable(doc, {
      ...base,
      startY: y,
      head: [['Movimiento', 'Socio', 'Plan', 'Fecha']],
      body: [
        ...r.altas.map((s) => ['Alta', nombreCompleto(s), PLAN_LABEL[s.plan], formatearFecha(s.creadoEn)]),
        ...r.bajas.map((s) => ['Baja', nombreCompleto(s), PLAN_LABEL[s.plan], formatearFecha(s.fechaBaja)]),
      ],
      didParseCell: (data) => {
        alinearEncabezado(data)
        if (data.section === 'body' && data.column.index === 0) {
          data.cell.styles.textColor = data.cell.raw === 'Alta' ? VERDE : ROJO
          data.cell.styles.fontStyle = 'bold'
        }
      },
    })
    y = finalY(doc, y) + 10
  }

  // ---- Listado completo
  seccion('Listado de socios activos', `${r.sociosActivos.length} socios, ordenados por nombre.`)
  if (r.sociosActivos.length === 0) vacio('No hay socios activos.')
  else {
    autoTable(doc, {
      ...base,
      startY: y,
      head: [['Socio', 'Celular', 'Plan', 'Último pago', 'Monto', 'Vence', 'Estado']],
      body: r.sociosActivos.map((s) => [
        nombreCompleto(s),
        s.celular ? formatearCelular(s.celular) : '—',
        PLAN_LABEL[s.plan],
        formatearFecha(s.fechaUltimoPago),
        monto(s.montoUltimoPago),
        formatearFecha(s.fechaVencimiento),
        ESTADO_LABEL[s.estado],
      ]),
      styles: { ...base.styles, fontSize: 8 },
      columnStyles: { 4: { halign: 'right' } },
      didParseCell: (data) => {
        alinearEncabezado(data)
        if (data.section === 'body' && data.column.index === 6) {
          data.cell.styles.textColor = colorEstado(r.sociosActivos[data.row.index])
          data.cell.styles.fontStyle = 'bold'
        }
      },
    })
  }

  // ---- Pie de página en todas las hojas
  const paginas = doc.getNumberOfPages()
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...GRIS)
    doc.text(`SR Fitness Gym · ${titulo}`, MARGEN, alto - 8)
    doc.text(`Página ${i} de ${paginas}`, ancho - MARGEN, alto - 8, { align: 'right' })
  }

  return doc
}

export function nombreArchivoResumen(r: ResumenMensual): string {
  const mm = String(r.mes.getMonth() + 1).padStart(2, '0')
  return `SR-Fitness-resumen-${r.mes.getFullYear()}-${mm}.pdf`
}
