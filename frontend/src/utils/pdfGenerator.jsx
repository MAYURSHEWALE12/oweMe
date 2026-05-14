import jsPDF from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
import { LogoFavicon } from '../components/Logo';
applyPlugin(jsPDF);

export function generateLedgerPDF({ reportTitle, friendName, customers, transactions, perspective, netBalance }) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pw = doc.internal.pageSize.getWidth();
  const m = 15;
  const cw = pw - m * 2;

  const fmt = (n) => 'Rs. ' + Number(n || 0).toLocaleString('en-IN');
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  let totalGet = 0, totalGive = 0, finalBalance = 0;
  const isTxnMode = transactions && transactions.length > 0 && !customers;

  if (isTxnMode) {
    for (const t of transactions) {
      const isCredit = t.type === 'CREDIT_GIVEN';
      const fromLinkedPerspective = perspective === 'linked' ? !isCredit : isCredit;
      if (fromLinkedPerspective) totalGet += Number(t.amount || 0);
      else totalGive += Number(t.amount || 0);
    }
    // Use the provided netBalance if available, otherwise fall back to calculation
    finalBalance = netBalance !== undefined ? Number(netBalance) : (totalGet - totalGive);
  } else {
    (customers || []).forEach(c => {
      const bal = Number(c.runningBalance || 0);
      if (bal > 0) totalGet += bal;
      else totalGive += Math.abs(bal);
    });
  }

  const logoDataUri = LogoFavicon();

  // ===== HEADER =====
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pw, 35, 'F');
  try { doc.addImage(logoDataUri, 'SVG', m, 7, 20, 20); } catch {}
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text('OweMe', m + 23, 21);
  doc.setFontSize(7);
  doc.text(dateStr, pw - m, 14, { align: 'right' });
  doc.text('RPT-' + now.getTime().toString().slice(-8), pw - m, 20, { align: 'right' });
  if (friendName) doc.text(friendName, pw - m, 26, { align: 'right' });

  // ===== TITLE =====
  let y = 48;
  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(reportTitle || 'Ledger Report', m, y);
  y += 1;
  doc.setDrawColor(37, 99, 235);
  doc.setFillColor(37, 99, 235);
  doc.rect(m, y + 3, 30, 2.5, 'F');
  y += 10;

  // ===== SUMMARY ROW =====
  const cards = [
    { label: "You'll Get", value: fmt(totalGet), valColor: '#16a34a' },
    { label: "You'll Give", value: fmt(totalGive), valColor: '#dc2626' },
    { label: isTxnMode ? 'Current Balance' : 'Net Balance', value: fmt(finalBalance), valColor: '#2563eb' },
  ];
  const cardH = 22;

  cards.forEach((card, i) => {
    const x = m + i * 57;
    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(x, y, 52, cardH, 3, 3, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.text(card.label, x + 26, y + 8, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(card.valColor);
    doc.text(card.value, x + 26, y + 18, { align: 'center' });
  });

  // ===== TABLE =====
  y += cardH + 12;
  const cellPad = 2.5;

  let headers, rows, colStyles;

  if (isTxnMode) {
    headers = [['Date', 'Description', 'Amount', 'Type', 'Balance']];
    rows = [...transactions].reverse().map(t => {
      const desc = [t.description, t.note].filter(Boolean).join(' - ') || '—';
      const isCredit = t.type === 'CREDIT_GIVEN';
      const fromLinked = perspective === 'linked' ? !isCredit : isCredit;
      const typeLabel = t.deleted ? 'Deleted' : (fromLinked ? 'Given' : 'Received');
      return [
        { content: new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), styles: { halign: 'left' } },
        { content: desc, styles: { halign: 'left' } },
        { content: fmt(t.amount), styles: { halign: 'right', fontStyle: 'bold' } },
        { content: typeLabel, styles: { halign: 'center', fontStyle: 'bold', textColor: t.deleted ? [156, 163, 175] : (fromLinked ? [220, 38, 38] : [22, 163, 74]) } },
        { content: fmt(t.balanceAfter), styles: { halign: 'right', textColor: [107, 114, 128] } },
      ];
    });
    colStyles = {
      0: { cellWidth: 24 },
      1: { cellWidth: 76 },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 28, halign: 'right' },
    };
  } else {
    headers = [['Name', 'Phone', "You'll Get", "You'll Give", 'Since']];
    rows = (customers || []).map(c => [
      { content: c.name || '—', styles: { halign: 'left' } },
      { content: c.phone || '—', styles: { halign: 'left' } },
      { content: Number(c.runningBalance) > 0 ? fmt(c.runningBalance) : '—', styles: { halign: 'right', fontStyle: 'bold', textColor: [22, 163, 74] } },
      { content: Number(c.runningBalance) < 0 ? fmt(Math.abs(c.runningBalance)) : '—', styles: { halign: 'right', fontStyle: 'bold', textColor: [220, 38, 38] } },
      { content: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—', styles: { halign: 'center', textColor: [107, 114, 128] } },
    ]);
    colStyles = {
      0: { cellWidth: 'auto', halign: 'left' },
      1: { cellWidth: 'auto', halign: 'left' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'center' },
    };
  }

  if (rows.length === 0) rows.push([{ content: 'No records', styles: { halign: 'center', fontStyle: 'italic', textColor: [156, 163, 175] } }, '', '', '', '']);

  doc.autoTable({
    head: headers,
    body: rows,
    startY: y,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold', halign: 'center', cellPadding: 2 },
    bodyStyles: { fontSize: 7, textColor: [55, 65, 81], cellPadding: 2 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    margin: { left: m, right: m },
    pageBreak: 'auto',
    tableLineColor: [229, 231, 235],
    tableLineWidth: 0.3,
    didDrawPage: (data) => {
      const pc = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pc; i++) {
        doc.setPage(i);
        // Re-draw top header on each page
        if (i > 1) {
          doc.setFillColor(37, 99, 235);
          doc.rect(0, 0, pw, 35, 'F');
          try { doc.addImage(logoDataUri, 'SVG', m, 7, 20, 20); } catch {}
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(12);
          doc.text('OweMe', m + 23, 21);
        }
        // Footer
        doc.setPage(i);
        doc.setFontSize(6.5);
        doc.setTextColor(156, 163, 175);
        doc.setDrawColor(229, 231, 235);
        doc.line(m, 285, pw - m, 285);
        doc.text('Generated using OweMe', m, 291);
        doc.text(dateStr + ' | ' + timeStr, pw / 2, 291, { align: 'center' });
        doc.text('Page ' + i + ' of ' + pc, pw - m, 291, { align: 'right' });
      }
    },
  });

  // ===== GRAND TOTAL =====
  const fy = doc.lastAutoTable.finalY || y + 30;
  if (rows.length > 0 && rows[0][0] !== 'No records') {
    y = fy + 6;
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(37, 99, 235);
    doc.roundedRect(m, y, cw, 8, 3, 3, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(31, 41, 55);
    doc.text('Grand Total', m + 4, y + 5.5);
    if (isTxnMode) {
      doc.setTextColor('#16a34a');
      doc.text(fmt(totalGet), m + cw * 0.47, y + 5.5, { align: 'right' });
      doc.setTextColor('#dc2626');
      doc.text(fmt(totalGive), m + cw * 0.66, y + 5.5, { align: 'right' });
    } else {
      doc.setTextColor('#16a34a');
      doc.text(fmt(totalGet), m + cw * 0.55, y + 5.5, { align: 'right' });
      doc.setTextColor('#dc2626');
      doc.text(fmt(totalGive), m + cw * 0.75, y + 5.5, { align: 'right' });
    }
    doc.setTextColor('#2563eb');
    doc.text(fmt(finalBalance), m + cw - 5, y + 5.5, { align: 'right' });
  }

  // ===== FOOTER INFO =====
  let usedY = (doc.lastAutoTable.finalY || fy) + 14;
  if (usedY < 260) {
    doc.setDrawColor(229, 231, 235);
    doc.line(m, usedY, pw - m, usedY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(156, 163, 175);

    if (!isTxnMode && customers && customers.length > 0) {
      let sy = usedY + 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(31, 41, 55);
      doc.text('Settlement Summary', m, sy);
      sy += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      let hasSettlements = false;
      for (const c of customers) {
        const bal = Number(c.runningBalance || 0);
        if (bal > 0) {
          doc.setTextColor(220, 38, 38);
          doc.text(c.name + ' owes you ' + fmt(bal), m, sy);
          sy += 4; hasSettlements = true;
        } else if (bal < 0) {
          doc.setTextColor(22, 163, 74);
          doc.text('You owe ' + c.name + ' ' + fmt(Math.abs(bal)), m, sy);
          sy += 4; hasSettlements = true;
        }
        if (sy > 275) break;
      }
      if (!hasSettlements) {
        doc.setTextColor(156, 163, 175);
        doc.text('All settled up!', m, sy);
        sy += 4;
      }
      usedY = sy;
    }

    if (isTxnMode) {
      let sy = usedY + 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(31, 41, 55);
      doc.text('Settlement', m, sy);
      sy += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      if (finalBalance > 0) {
        doc.setTextColor(220, 38, 38);
        doc.text((friendName || 'This friend') + ' owes you ' + fmt(finalBalance), m, sy);
      } else if (finalBalance < 0) {
        doc.setTextColor(22, 163, 74);
        doc.text('You owe ' + (friendName || 'this friend') + ' ' + fmt(Math.abs(finalBalance)), m, sy);
      } else {
        doc.setTextColor(156, 163, 175);
        doc.text('All settled up!', m, sy);
      }
      sy += 8;
      const count = (transactions || []).length;
      doc.setTextColor(156, 163, 175);
      doc.text('Total entries: ' + count, m, sy);
      doc.text('Report period: All time', pw / 2, sy, { align: 'center' });
    } else {
      doc.text('Total friends: ' + (customers ? customers.length : 0), m, usedY + 5);
      doc.text('Statement as of ' + dateStr, pw / 2, usedY + 5, { align: 'center' });
    }
    doc.text('OweMe — Track loans with friends', pw - m, usedY + 5, { align: 'right' });
  }

  return doc;
}

export function downloadPDF(doc, filename = 'ledger-report.pdf') {
  doc.save(filename);
}