import { createElement } from 'react';
import { pdf } from '@react-pdf/renderer';
import TemplatePDF from './TemplatePDF.jsx';

export async function generatePDF(templateData, clientData) {
  const { nodes } = templateData;
  const blob = await pdf(createElement(TemplatePDF, { nodes, data: clientData })).toBlob();
  return blob;
}

export default generatePDF;
