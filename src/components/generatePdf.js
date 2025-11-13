import React from "react";
import jsPDF from "jspdf";

export default function generatePdf() {
  const generatePDF = (payload) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Enquiry Submission Details", 14, 20);

    doc.setFontSize(12);
    doc.text(`Name: ${payload.user} ${payload.LastName}`, 14, 30);
    doc.text(`Email: ${payload.Email}`, 14, 37);
    doc.text(`Product: ${payload.ProductName}`, 14, 44);
    doc.text("Selected Tasks:", 14, 54);

    const tableRows = payload.Plans.map((task) => [
      task.Module,
      task.Subtask,
      task.Description,
      task.SelectedPlan,
      `${task.EstimatedTime} hr(s)`,
    ]);

    const totalHours = payload.Plans.reduce(
      (acc, task) => acc + Number(task.EstimatedTime),
      0
    );
    if (isNaN(totalHours)) {
      alert("Total hours is NaN. Check EstimatedTime values.");
    }

    doc.autoTable({
      head: [["Module", "Subtask", "Description", "Plan", "Est. Time"]],
      body: tableRows,
      startY: 60,
      styles: {
        fontSize: 10,
        cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
        lineColor: "#008799",
        lineWidth: 0.2,
      },
      headStyles: {
        halign: "center",
        fillColor: [0, 135, 153],
        textColor: [255, 255, 255],
      },
      columnStyles: {
        2: { cellWidth: 70 },
      },
    });

    doc.setFontSize(12);
    doc.text(`Total hours: ${totalHours}`, 14, 30);

    doc.autoTable({
      body: [
        [
          {
            content: "Total Hours",
            colSpan: 4,
            styles: {
              halign: "right",
              fontStyle: "bold",
              fillColor: [230, 230, 230],
            },
          },
          {
            content: `${totalHours} hr(s)`,
            styles: { fontStyle: "bold", fillColor: [230, 230, 230] },
          },
        ],
      ],
      startY: doc.lastAutoTable.finalY + 5,
      styles: { fontSize: 10 },
    });

    doc.save("EnquiryDetails.pdf");
  };
}
