import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Create styles for the PDF layout
const styles = StyleSheet.create({
  page: {
    padding: 20,
  },
  heading: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    marginBottom: 5,
    textDecoration: 'underline',
  },
});

const InvoicePDF = (data) => {
  const {
    billFrom,
    invoiceNo,
    price,
    administrativeFee,
    totalPrice,
    venue,
    monthNo,
    dayNo,
    dayName,
    timeIn,
    timeOut,
    
  } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.heading}>Invoice Form</Text>
        </View>
        <View>
          <Text style={styles.label}>Bill From:</Text>
          <Text style={styles.value}>{billFrom}</Text>
          <Text style={styles.label}>Invoice No:</Text>
          <Text style={styles.value}>{invoiceNo}</Text>
          <Text style={styles.label}>Price:</Text>
          <Text style={styles.value}>{price}</Text>
          <Text style={styles.label}>Administrative Fee:</Text>
          <Text style={styles.value}>{administrativeFee}</Text>
          <Text style={styles.label}>Total Price:</Text>
          <Text style={styles.value}>{totalPrice}</Text>
          <Text style={styles.label}>Venue:</Text>
          <Text style={styles.value}>{venue}</Text>
          <Text style={styles.label}>Month No:</Text>
          <Text style={styles.value}>{monthNo}</Text>
          <Text style={styles.label}>Day No:</Text>
          <Text style={styles.value}>{dayNo}</Text>
          <Text style={styles.label}>Day Name:</Text>
          <Text style={styles.value}>{dayName}</Text>
          <Text style={styles.label}>Time In:</Text>
          <Text style={styles.value}>{timeIn}</Text>
          <Text style={styles.label}>Time Out:</Text>
          <Text style={styles.value}>{timeOut}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
