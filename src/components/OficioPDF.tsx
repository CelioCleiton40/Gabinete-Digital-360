
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Register a standard font if needed, or use Helvetica by default
Font.register({
  family: 'Open Sans',
  src: 'https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0e.ttf',
})

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Open Sans',
    fontSize: 12,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  body: {
    marginTop: 20,
  },
  oficioInfo: {
    textAlign: 'right',
    marginBottom: 30,
  },
  paragraph: {
    marginBottom: 10,
    textAlign: 'justify',
  },
  signature: {
    marginTop: 60,
    alignItems: 'center',
  },
  signatureLine: {
    width: 200,
    borderTopWidth: 1,
    borderTopColor: '#000',
    marginBottom: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#888',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
})

interface OficioProps {
  numeroOficio: string
  ano: string
  destinatario: string
  assunto: string
  texto: string
  mandato: {
    nome_parlamentar: string
    cargo: string
    municipio_estado: string
    config_identidade: {
      cor_primaria?: string
      logo_url?: string
    }
  }
}

export default function OficioDocument({ numeroOficio, ano, destinatario, assunto, texto, mandato }: OficioProps) {
  const primaryColor = mandato.config_identidade?.cor_primaria || '#000000'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: primaryColor }]}>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: primaryColor }]}>{mandato.nome_parlamentar}</Text>
            <Text style={styles.subtitle}>{mandato.cargo} - {mandato.municipio_estado}</Text>
          </View>
          {/* Logo placeholder if we had a logo URL */}
          {/* <Image src={mandato.logo_url} style={{ width: 50, height: 50 }} /> */}
        </View>

        {/* Body */}
        <View style={styles.body}>
          <View style={styles.oficioInfo}>
            <Text>Ofício nº {numeroOficio}/{ano}</Text>
            <Text>{mandato.municipio_estado.split('-')[0].trim()}, {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text>Ao Senhor(a)</Text>
            <Text style={{ fontWeight: 'bold' }}>{destinatario}</Text>
          </View>

          <Text style={{ marginBottom: 15, fontWeight: 'bold' }}>Assunto: {assunto}</Text>

          <Text style={styles.paragraph}>Prezado(a) Senhor(a),</Text>

          <Text style={styles.paragraph}>
            {texto}
          </Text>

          <Text style={styles.paragraph}>
            Sendo o que tínhamos para o momento, reiteramos votos de elevada estima e consideração.
          </Text>
        </View>

        {/* Signature */}
        <View style={styles.signature}>
          <View style={styles.signatureLine} />
          <Text style={{ fontWeight: 'bold' }}>{mandato.nome_parlamentar}</Text>
          <Text>{mandato.cargo}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Gabinete Digital 360 - {mandato.municipio_estado}</Text>
        </View>
      </Page>
    </Document>
  )
}
