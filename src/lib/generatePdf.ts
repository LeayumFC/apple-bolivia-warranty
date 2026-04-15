import jsPDF from 'jspdf';
import { Warranty, getWarrantyExpiration } from './warranties';

export function generateWarrantyPdf(warranty: Warranty): void {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, w, 50, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Certificado de Garantía', w / 2, y + 8, { align: 'center' });
  doc.setFontSize(14);
  doc.text('Apple Bolivia', w / 2, y + 20, { align: 'center' });
  y = 65;

  doc.setTextColor(30, 30, 30);

  // Warranty code
  if (warranty.warranty_code) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Código de Garantía: ${warranty.warranty_code}`, 20, y);
    y += 15;
  }

  // Product details
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalles del Producto', 20, y);
  y += 8;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, w - 20, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const details = [
    ['Tipo', warranty.product_type],
    ['Modelo', warranty.model],
    ['Número de Serie', warranty.serial_number],
    ...(warranty.imei ? [['IMEI', warranty.imei]] : []),
    ['Color', warranty.color],
    ['Almacenamiento', warranty.storage],
    ['Condición', warranty.condition],
  ];

  for (const [label, value] of details) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), 75, y);
    y += 7;
  }
  y += 5;

  // Checklist for refurbished/used
  if (warranty.condition !== 'New') {
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Estado del Dispositivo', 20, y);
    y += 8;
    doc.line(20, y, w - 20, y);
    y += 8;
    doc.setFontSize(10);

    const checks = [
      ['Salud de Batería', warranty.battery_health ? `${warranty.battery_health}%` : 'N/A'],
      ['True Tone', warranty.true_tone ? '✓' : '✗'],
      ['Face ID', warranty.face_id ? '✓' : '✗'],
      ['Touch ID', warranty.touch_id ? '✓' : '✗'],
      ['Pantalla Original', warranty.original_display ? '✓' : '✗'],
      ['Sin Rayones en Pantalla', warranty.no_screen_scratches ? '✓' : '✗'],
      ['Sin Abolladuras', warranty.no_body_dents ? '✓' : '✗'],
      ['Botones Funcionales', warranty.buttons_functional ? '✓' : '✗'],
      ['Cámaras Funcionales', warranty.cameras_functional ? '✓' : '✗'],
      ['Puerto de Carga', warranty.charging_port_functional ? '✓' : '✗'],
    ];

    for (const [label, value] of checks) {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 85, y);
      y += 7;
    }
    y += 5;
  }

  // Customer & warranty info
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Información de Garantía', 20, y);
  y += 8;
  doc.line(20, y, w - 20, y);
  y += 8;
  doc.setFontSize(10);

  const exp = getWarrantyExpiration(warranty);
  const warrantyInfo = [
    ['Cliente', warranty.customer_name || ''],
    ['Email', warranty.customer_email || ''],
    ['Fecha de Venta', warranty.sale_date || ''],
    ['Duración', `${warranty.warranty_months} meses`],
    ['Fecha de Expiración', exp ? exp.toLocaleDateString('es-BO') : ''],
  ];

  for (const [label, value] of warrantyInfo) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 75, y);
    y += 7;
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, footerY - 5, w - 20, footerY - 5);
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('Apple Bolivia — Importación de productos Apple nuevos y reacondicionados', w / 2, footerY, { align: 'center' });

  doc.save(`garantia-${warranty.serial_number}.pdf`);
}
