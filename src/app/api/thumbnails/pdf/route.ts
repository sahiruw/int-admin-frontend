import { NextRequest, NextResponse } from "next/server";
import { getImageBlobById } from "@/utils/google/google-drive-pictures";
import jsPDF from "jspdf";
import { IMAGE_NOT_FOUND_DATA_URL } from "@/utils/image-not-found";

type ThumbnailItem = {
  picture_id: string;
  variety?: string;
  size?: string | number;
};

type ThumbnailItemWithImage = ThumbnailItem & {
  imageUrl?: string;
  imageSize?: {
    width?: number;
    height?: number;
  };
  imageFormat?: string;
};

const getPdfImageFormat = (mimeType?: string) => {
  if (!mimeType) return "JPEG";
  if (mimeType.includes("png")) return "PNG";
  if (mimeType.includes("webp")) return "WEBP";
  return "JPEG";
};

const fitText = (pdf: jsPDF, text: string, maxWidth: number) => {
  if (!text) return "";
  if (pdf.getTextWidth(text) <= maxWidth) return text;

  let fitted = text;
  while (fitted.length > 0 && pdf.getTextWidth(`${fitted}...`) > maxWidth) {
    fitted = fitted.slice(0, -1);
  }
  return `${fitted}...`;
};

function drawPageHeader(
  pdf: jsPDF,
  opts: {
    title: string;
    generatedAt: string;
    count: number;
    page: number;
    totalPages: number;
  },
) {
  const { title, generatedAt, count, page, totalPages } = opts;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const startX = 10;
  const startY = 12;

  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(21, 27, 38);
  pdf.setFontSize(12);
  pdf.text(title, startX, startY);

  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(98, 106, 119);
  pdf.setFontSize(8);
  pdf.text(`Generated: ${generatedAt}`, startX, startY + 4.5);
  pdf.text(`Total Koi: ${count}`, startX + 60, startY + 4.5);

  const pageText = `Page ${page} of ${totalPages}`;
  const pageTextWidth = pdf.getTextWidth(pageText);
  pdf.text(pageText, pageWidth - pageTextWidth - 10, startY + 4.5);

  pdf.setDrawColor(225, 229, 236);
  pdf.line(10, startY + 7, pageWidth - 10, startY + 7);
}

function drawFooter(pdf: jsPDF, page: number, totalPages: number) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const footerY = pageHeight - 5;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(112, 120, 133);
  pdf.text("Niigata Koi Global", 10, footerY);

  const pageText = `${page}/${totalPages}`;
  const pageTextWidth = pdf.getTextWidth(pageText);
  pdf.text(pageText, pageWidth - pageTextWidth - 10, footerY);
}

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json();
    const rawItems = Array.isArray(items) ? items : [];
    const safeItems: ThumbnailItem[] = rawItems.filter(
      (item): item is ThumbnailItem => Boolean(item?.picture_id),
    );

    const itemsWithImages: ThumbnailItemWithImage[] = await Promise.all(
      safeItems.map(async (item) => {
        try {
          const response = await getImageBlobById(item.picture_id);
          if (response) {
            const { buffer, mimeType, size } = await response;
            return {
              ...item,
              imageUrl: `data:${mimeType};base64,${buffer}`,
              imageSize: size,
              imageFormat: getPdfImageFormat(mimeType),
            };
          }
        } catch (error) {
          console.error("Error fetching image:", error);
        }

        return {
          ...item,
          imageUrl: IMAGE_NOT_FOUND_DATA_URL,
          imageFormat: "PNG",
        };
      }),
    );

    const pdf = new jsPDF("p", "mm", "a4", true);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const marginX = 10;
    const marginTop = 8;
    const marginBottom = 8;
    const headerHeight = 14;
    const footerHeight = 8;

    const numCols = 4;
    const numRows = 3;
    const spacingX = 2;
    const spacingY = 5;

    const gridStartY = marginTop + headerHeight + 2;
    const gridEndY = pageHeight - marginBottom - footerHeight;
    const gridHeight = gridEndY - gridStartY;
    const gridWidth = pageWidth - marginX * 2;
    const cellWidth = (gridWidth - spacingX * (numCols - 1)) / numCols;
    const cellHeight = (gridHeight - spacingY * (numRows - 1)) / numRows;

    const itemsPerPage = numCols * numRows;
    const totalPages = Math.max(1, Math.ceil(itemsWithImages.length / itemsPerPage));
    const generatedAt = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

    if (itemsWithImages.length === 0) {
      drawPageHeader(pdf, {
        title: "Koi Thumbnail Sheet",
        generatedAt,
        count: 0,
        page: 1,
        totalPages: 1,
      });
      drawFooter(pdf, 1, 1);
    }

    itemsWithImages.forEach((item, index) => {
      if (index > 0 && index % itemsPerPage === 0) {
        const finishedPage = Math.floor(index / itemsPerPage);
        drawFooter(pdf, finishedPage, totalPages);
        pdf.addPage();
      }

      const page = Math.floor(index / itemsPerPage) + 1;
      if (index % itemsPerPage === 0) {
        drawPageHeader(pdf, {
          title: "Koi Thumbnail Sheet",
          generatedAt,
          count: itemsWithImages.length,
          page,
          totalPages,
        });
      }

      const positionInPage = index % itemsPerPage;
      const row = Math.floor(positionInPage / numCols);
      const col = positionInPage % numCols;

      const x = marginX + col * (cellWidth + spacingX);
      const y = gridStartY + row * (cellHeight + spacingY);

      pdf.setDrawColor(220, 224, 231);
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(x, y, cellWidth, cellHeight, 2, 2, "FD");

      const cardPadding = 1.5;
      const imageAreaX = x + cardPadding;
      const imageAreaY = y + cardPadding;
      const imageAreaWidth = cellWidth - cardPadding * 2;
      const imageAreaHeight = cellHeight * 0.74;

      pdf.setFillColor(246, 248, 251);
      pdf.roundedRect(imageAreaX, imageAreaY, imageAreaWidth, imageAreaHeight, 1.5, 1.5, "F");

      let originalWidth = item.imageSize?.width || 1;
      let originalHeight = item.imageSize?.height || 1;

      // Business rule: koi photos are portrait; normalize occasional sideways metadata.
      if (originalWidth > originalHeight) {
        [originalHeight, originalWidth] = [originalWidth, originalHeight];
      }

      const aspectRatio = originalWidth / originalHeight;
      const maxWidth = imageAreaWidth;
      const maxHeight = imageAreaHeight;

      // Prefer full height for portrait images so thumbnails stay as large as possible.
      let imgHeight = maxHeight;
      let imgWidth = imgHeight * aspectRatio;

      if (imgWidth > maxWidth) {
        imgWidth = maxWidth;
        imgHeight = imgWidth / aspectRatio;
      }

      const imageX = imageAreaX + (imageAreaWidth - imgWidth) / 2;
      const imageY = imageAreaY + (imageAreaHeight - imgHeight) / 2;

      if (item.imageUrl) {
        pdf.addImage(
          item.imageUrl,
          item.imageFormat || "JPEG",
          imageX,
          imageY,
          imgWidth,
          imgHeight,
        );
      }

      const textStartY = y + imageAreaHeight + 8;
      const textWidth = cellWidth - cardPadding * 2;
      const textX = x + cardPadding;

      pdf.setTextColor(25, 28, 34);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.text(
        fitText(pdf, `ID: ${item.picture_id || "-"}`, textWidth),
        textX,
        textStartY,
      );

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(75, 83, 95);
      pdf.text(
        fitText(pdf, `Variety: ${item.variety || "-"}`, textWidth),
        textX,
        textStartY + 4.2,
      );
      pdf.text(
        fitText(pdf, `Size: ${item.size || "-"}`, textWidth),
        textX,
        textStartY + 8.4,
      );
    });

    if (itemsWithImages.length > 0) {
      drawFooter(pdf, totalPages, totalPages);
    }

    const pdfBuffer = pdf.output("arraybuffer");
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="thumbnail-grid.pdf"',
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
