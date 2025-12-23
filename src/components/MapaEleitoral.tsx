
import { useState, useMemo } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { municipioGeoJSON } from '@/data/municipioGeo'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import L from 'leaflet'

// Fix for default marker icon in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Eleitor {
  id: string
  bairro: string | null
}

interface MapaEleitoralProps {
  eleitores: Eleitor[]
}

export default function MapaEleitoral({ eleitores }: MapaEleitoralProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('todos')
  
  // 1. Processar dados: Agrupar eleitores por bairro
  const statsPorBairro = useMemo(() => {
    const counts: Record<string, number> = {}
    
    eleitores.forEach(e => {
      if (e.bairro) {
        const bairroNorm = e.bairro.trim().toLowerCase()
        
        // Tentativa de match flexível com os bairros do GeoJSON
        let match = 'Outros'
        
        // Lista de bairros mapeados no GeoJSON
        const bairrosMapeados = [
          'Centro', 'Paredões', 'Bom Jardim', 'Doze Anos',
          'Santo Antônio', 'Barrocas', 'Santa Helena',
          'Alto de São Manoel', 'Dom Jaime Câmara', 'Vingt Rosado', 'Ilha de Santa Luzia',
          'Belo Horizonte', 'Boa Vista', 'Aeroporto',
          'Abolição', 'Nova Betânia', 'Santa Delmira'
        ]

        for (const bairro of bairrosMapeados) {
          if (bairroNorm.includes(bairro.toLowerCase())) {
            match = bairro
            break
          }
        }
        
        counts[match] = (counts[match] || 0) + 1
      }
    })
    return counts
  }, [eleitores])

  // 2. Função de Estilo do Mapa (Heatmap / Choropleth)
  const getFeatureStyle = (feature: any) => {
    const bairroName = feature.properties.name
    const count = statsPorBairro[bairroName] || 0
    const totalOficial = feature.properties.total_eleitores_oficial || 0
    const percentage = totalOficial > 0 ? (count / totalOficial) * 100 : 0

    // Escala de cores (Verde claro a Escuro)
    let fillColor = '#ecfdf5' // < 0.1%
    if (percentage > 5) fillColor = '#047857'
    else if (percentage > 2) fillColor = '#10b981'
    else if (percentage > 0.5) fillColor = '#34d399'
    else if (percentage > 0) fillColor = '#6ee7b7'

    return {
      fillColor,
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    }
  }

  // 3. Tooltip e Interação
  const onEachFeature = (feature: any, layer: L.Layer) => {
    const bairroName = feature.properties.name
    const count = statsPorBairro[bairroName] || 0
    const totalOficial = feature.properties.total_eleitores_oficial || 0
    const percentage = totalOficial > 0 ? ((count / totalOficial) * 100).toFixed(2) : '0.00'

    const popupContent = `
      <div class="p-3 min-w-[200px] bg-white rounded-lg">
        <h3 class="font-bold text-lg text-gray-800">${bairroName}</h3>
        <div class="my-2 border-b border-gray-200"></div>
        <div class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Cadastrados:</span>
            <span class="font-semibold">${count}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Total Estimado:</span>
            <span class="font-semibold">${totalOficial}</span>
          </div>
          <div class="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
            <span class="text-gray-800 font-medium">Penetração:</span>
            <span class="font-bold text-blue-600 text-base">${percentage}%</span>
          </div>
        </div>
      </div>
    `
    
    layer.bindPopup(popupContent, {
      className: 'custom-popup',
      closeButton: false
    })
    
    // Highlight on hover
    layer.on({
      mouseover: (e) => {
        const layer = e.target
        layer.setStyle({
          weight: 4,
          color: '#3b82f6',
          dashArray: '',
          fillOpacity: 0.9
        })
        layer.openPopup()
      },
      mouseout: (e) => {
        const style = getFeatureStyle(feature)
        e.target.setStyle(style)
        layer.closePopup()
      },
      click: (e) => {
        const layer = e.target
        layer.openPopup()
      }
    })
  }

  // Filter geojson if needed
  const filteredData = useMemo(() => {
    if (selectedFilter === 'todos') return municipioGeoJSON
    return {
      ...municipioGeoJSON,
      features: municipioGeoJSON.features.filter(f => f.properties.name === selectedFilter)
    }
  }, [selectedFilter])

  return (
    <Card className="col-span-4">
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>Mapa de Calor - Mossoró/RN</CardTitle>
            <CardDescription>Distribuição da base de eleitores por bairro.</CardDescription>
          </div>
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-full md:w-[200px] z-10 relative bg-background">
              <SelectValue placeholder="Filtrar Bairro" />
            </SelectTrigger>
            <SelectContent className="z-[9999] max-h-[300px]">
              <SelectItem value="todos">Todos os Bairros</SelectItem>
              {municipioGeoJSON.features.map((f: any) => (
                <SelectItem key={f.properties.name} value={f.properties.name}>
                  {f.properties.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative h-[300px] md:h-[400px] lg:h-[500px] w-full overflow-hidden rounded-b-lg">
        {typeof window !== 'undefined' && (
          <MapContainer 
            center={[-5.1878, -37.3442]} // Centro de Mossoró
            zoom={13} 
            scrollWheelZoom="center"
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <GeoJSON 
              key={selectedFilter} // Force re-render on filter change
              data={filteredData as any} 
              style={getFeatureStyle}
              onEachFeature={onEachFeature}
            />
            
            {/* Legenda Customizada (Overlay) */}
            <div className="leaflet-bottom leaflet-right">
              <div className="leaflet-control leaflet-bar bg-white/90 backdrop-blur p-3 m-4 rounded-lg shadow-lg text-xs border border-gray-200">
                <h4 className="font-bold mb-2 text-gray-700">Penetração (%)</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#047857] border border-gray-300"></div> 
                    <span>&gt; 5% (Alta)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#10b981] border border-gray-300"></div> 
                    <span>2% - 5% (Média)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#34d399] border border-gray-300"></div> 
                    <span>0.5% - 2% (Baixa)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#6ee7b7] border border-gray-300"></div> 
                    <span>&lt; 0.5% (Mínima)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#ecfdf5] border border-gray-300"></div> 
                    <span>Sem dados</span>
                  </div>
                </div>
              </div>
            </div>
          </MapContainer>
        )}
      </CardContent>
    </Card>
  )
}
