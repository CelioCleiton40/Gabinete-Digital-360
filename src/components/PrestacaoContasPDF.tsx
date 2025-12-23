
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

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
  section: {
    margin: 10,
    padding: 10,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#f1f5f9',
    padding: 15,
    borderRadius: 4,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1e3a8a',
    fontWeight: 'bold',
    marginTop: 4,
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
  tableCol: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e2e8f0',
    padding: 5,
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
    width: '30%',
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
  statusBadge: {
    fontSize: 8,
    padding: '2 4',
    borderRadius: 2,
    textAlign: 'center',
  }
})

interface Despesa {
  id: string
  categoria: string
  valor: number
  status: 'aprovado' | 'pendente' | 'analise' | 'rejeitado'
  data: string
  fornecedor: string
  comprovante_url?: string
}

interface PrestacaoContasPDFProps {
  despesas: Despesa[]
  mesReferencia: string
  cotaTotal: number
}

const PrestacaoContasPDF = ({ despesas, mesReferencia, cotaTotal }: PrestacaoContasPDFProps) => {
  const totalGasto = despesas.reduce((acc, curr) => curr.status !== 'rejeitado' ? acc + curr.valor : acc, 0)
  const saldoRestante = cotaTotal - totalGasto
  const percentualUso = (totalGasto / cotaTotal) * 100

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR')
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Prestação de Contas</Text>
          <Text style={styles.subtitle}>Gabinete Digital 360 - CEAP</Text>
          <Text style={{ ...styles.subtitle, marginTop: 4 }}>Referência: {mesReferencia}</Text>
        </View>

        {/* Resumo Financeiro */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Cota Disponível</Text>
            <Text style={styles.summaryValue}>{formatCurrency(cotaTotal)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Utilizado</Text>
            <Text style={{ ...styles.summaryValue, color: '#dc2626' }}>{formatCurrency(totalGasto)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Saldo Restante</Text>
            <Text style={{ ...styles.summaryValue, color: '#16a34a' }}>{formatCurrency(saldoRestante)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Utilização</Text>
            <Text style={styles.summaryValue}>{percentualUso.toFixed(1)}%</Text>
          </View>
        </View>

        {/* Tabela de Despesas */}
        <Text style={{ fontSize: 14, marginBottom: 10, color: '#334155', fontWeight: 'bold' }}>Detalhamento de Lançamentos</Text>
        
        <View style={styles.table}>
          {/* Header da Tabela */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableColSmall}>
              <Text style={styles.tableCellHeader}>Data</Text>
            </View>
            <View style={styles.tableColLarge}>
              <Text style={styles.tableCellHeader}>Fornecedor</Text>
            </View>
            <View style={styles.tableColLarge}>
              <Text style={styles.tableCellHeader}>Categoria</Text>
            </View>
            <View style={styles.tableColSmall}>
              <Text style={styles.tableCellHeader}>Status</Text>
            </View>
            <View style={styles.tableColSmall}>
              <Text style={styles.tableCellHeader}>Valor</Text>
            </View>
          </View>

          {/* Linhas da Tabela */}
          {despesas.map((item) => (
            <View style={styles.tableRow} key={item.id}>
              <View style={styles.tableColSmall}>
                <Text style={styles.tableCell}>{formatDate(item.data)}</Text>
              </View>
              <View style={styles.tableColLarge}>
                <Text style={styles.tableCell}>{item.fornecedor}</Text>
              </View>
              <View style={styles.tableColLarge}>
                <Text style={styles.tableCell}>{item.categoria}</Text>
              </View>
              <View style={styles.tableColSmall}>
                <Text style={{
                  ...styles.tableCell,
                  color: item.status === 'aprovado' ? '#16a34a' : item.status === 'rejeitado' ? '#dc2626' : '#ca8a04'
                }}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
              <View style={styles.tableColSmall}>
                <Text style={styles.tableCell}>{formatCurrency(item.valor)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Rodapé */}
        <View style={styles.footer}>
          <Text>Documento gerado automaticamente pelo sistema Gabinete Digital 360 em {new Date().toLocaleDateString('pt-BR')}</Text>
          <Text>Este relatório serve como demonstrativo simples e não substitui a prestação de contas oficial.</Text>
        </View>
      </Page>
    </Document>
  )
}

export default PrestacaoContasPDF
