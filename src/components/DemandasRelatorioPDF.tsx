
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: '#1e3a8a',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#e2e8f0',
    marginTop: 20,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f8fafc',
  },
  tableColSmall: {
    width: '15%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e2e8f0',
    padding: 5,
  },
  tableColLarge: {
    width: '40%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e2e8f0',
    padding: 5,
  },
  tableColMedium: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e2e8f0',
    padding: 5,
  },
  tableCell: {
    margin: 'auto',
    marginTop: 5,
    fontSize: 10,
  },
  tableCellHeader: {
    margin: 'auto',
    marginTop: 5,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#334155',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    borderTop: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
})

interface Demanda {
  id: string
  titulo: string
  categoria: string
  status: string
  prioridade: string
  created_at: string
  eleitor?: { nome: string }
}

interface DemandasRelatorioPDFProps {
  demandas: Demanda[]
}

const DemandasRelatorioPDF = ({ demandas }: DemandasRelatorioPDFProps) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR')
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Relatório Geral de Demandas</Text>
          <Text style={styles.subtitle}>Gabinete Digital 360</Text>
          <Text style={{ ...styles.subtitle, marginTop: 4 }}>
            Total de registros: {demandas.length}
          </Text>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableColSmall}>
              <Text style={styles.tableCellHeader}>Data</Text>
            </View>
            <View style={styles.tableColLarge}>
              <Text style={styles.tableCellHeader}>Título / Eleitor</Text>
            </View>
            <View style={styles.tableColMedium}>
              <Text style={styles.tableCellHeader}>Categoria</Text>
            </View>
            <View style={styles.tableColSmall}>
              <Text style={styles.tableCellHeader}>Prioridade</Text>
            </View>
            <View style={styles.tableColSmall}>
              <Text style={styles.tableCellHeader}>Status</Text>
            </View>
          </View>

          {demandas.map((item) => (
            <View style={styles.tableRow} key={item.id}>
              <View style={styles.tableColSmall}>
                <Text style={styles.tableCell}>{formatDate(item.created_at)}</Text>
              </View>
              <View style={styles.tableColLarge}>
                <Text style={styles.tableCell}>{item.titulo}</Text>
                {item.eleitor && (
                   <Text style={{ fontSize: 8, color: '#64748b' }}>Sol.: {item.eleitor.nome}</Text>
                )}
              </View>
              <View style={styles.tableColMedium}>
                <Text style={styles.tableCell}>{item.categoria}</Text>
              </View>
              <View style={styles.tableColSmall}>
                <Text style={styles.tableCell}>{item.prioridade}</Text>
              </View>
              <View style={styles.tableColSmall}>
                <Text style={styles.tableCell}>{item.status}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>Documento gerado automaticamente em {new Date().toLocaleDateString('pt-BR')}</Text>
        </View>
      </Page>
    </Document>
  )
}

export default DemandasRelatorioPDF
