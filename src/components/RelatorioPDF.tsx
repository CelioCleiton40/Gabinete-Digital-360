
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Register font
Font.register({
  family: 'Open Sans',
  src: 'https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0e.ttf',
})

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Open Sans',
    fontSize: 10,
    color: '#333',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#1e3a8a', // Blue 900
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f3f4f6',
    padding: 5,
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableCell: {
    fontSize: 9,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
})

interface RelatorioProps {
  titulo: string
  subtitulo: string
  colunas: string[]
  dados: any[][]
  usuario: string
}

export default function RelatorioDocument({ titulo, subtitulo, colunas, dados, usuario }: RelatorioProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{titulo}</Text>
            <Text style={styles.subtitle}>{subtitulo}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 8 }}>Gerado em: {new Date().toLocaleDateString('pt-BR')}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            {colunas.map((col, index) => (
              <View style={[styles.tableColHeader, { width: `${100 / colunas.length}%` }]} key={index}>
                <Text style={styles.tableCellHeader}>{col}</Text>
              </View>
            ))}
          </View>

          {/* Table Body */}
          {dados.map((row, rowIndex) => (
            <View style={styles.tableRow} key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <View style={[styles.tableCol, { width: `${100 / colunas.length}%` }]} key={cellIndex}>
                  <Text style={styles.tableCell}>{cell}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Gabinete Digital 360 - Relatório gerado por {usuario}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
