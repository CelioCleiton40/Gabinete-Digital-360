
// Schematic GeoJSON for Mossoró - RN
// Center roughly at -5.188, -37.344
// This is a simplified representation for visualization purposes.

export const municipioGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    // --- CENTRO & CENTRAL ---
    {
      "type": "Feature",
      "properties": { "name": "Centro", "total_eleitores_oficial": 5000 },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-37.348, -5.190], [-37.340, -5.190], [-37.340, -5.185], [-37.348, -5.185], [-37.348, -5.190]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Paredões", "total_eleitores_oficial": 4500 },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-37.348, -5.185], [-37.340, -5.185], [-37.340, -5.180], [-37.348, -5.180], [-37.348, -5.185]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Bom Jardim", "total_eleitores_oficial": 4000 },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-37.340, -5.190], [-37.335, -5.190], [-37.335, -5.180], [-37.340, -5.180], [-37.340, -5.190]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Doze Anos", "total_eleitores_oficial": 3500 },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-37.348, -5.195], [-37.340, -5.195], [-37.340, -5.190], [-37.348, -5.190], [-37.348, -5.195]
        ]]
      }
    },

    // --- ZONA NORTE ---
    {
      "type": "Feature",
      "properties": { "name": "Santo Antônio", "total_eleitores_oficial": 12000 },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-37.355, -5.180], [-37.335, -5.180], [-37.335, -5.165], [-37.355, -5.165], [-37.355, -5.180]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Barrocas", "total_eleitores_oficial": 8000 },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-37.335, -5.180], [-37.325, -5.180], [-37.325, -5.165], [-37.335, -5.165], [-37.335, -5.180]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Santa Helena", "total_eleitores_oficial": 6000 },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-37.365, -5.180], [-37.355, -5.180], [-37.355, -5.165], [-37.365, -5.165], [-37.365, -5.180]
        ]]
      }
    },

    // --- ZONA LESTE ---
    {
      "type": "Feature",
      "properties": { "name": "Alto de São Manoel", "total_eleitores_oficial": 15000 },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-37.335, -5.200], [-37.315, -5.200], [-37.315, -5.180], [-37.335, -5.180], [-37.335, -5.200]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Dom Jaime Câmara", "total_eleitores_oficial": 9000 },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-37.315, -5.200], [-37.300, -5.200], [-37.300, -5.180], [-37.315, -5.180], [-37.315, -5.200]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Vingt Rosado", "total_eleitores_oficial": 7000 },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-37.335, -5.180], [-37.300, -5.180], [-37.300, -5.170], [-37.335, -5.170], [-37.335, -5.180]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Ilha de Santa Luzia", "total_eleitores_oficial": 5000 },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-37.340, -5.200], [-37.335, -5.200], [-37.335, -5.190], [-37.340, -5.190], [-37.340, -5.200]
        ]]
      }
    },

    // --- ZONA SUL ---
    {
      "type": "Feature",
      "properties": { "name": "Belo Horizonte", "total_eleitores_oficial": 8500 },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-37.355, -5.215], [-37.340, -5.215], [-37.340, -5.200], [-37.355, -5.200], [-37.355, -5.215]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Boa Vista", "total_eleitores_oficial": 6500 },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-37.355, -5.230], [-37.340, -5.230], [-37.340, -5.215], [-37.355, -5.215], [-37.355, -5.230]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Aeroporto", "total_eleitores_oficial": 4000 }, // Dix-Sept Rosado area
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-37.370, -5.215], [-37.355, -5.215], [-37.355, -5.200], [-37.370, -5.200], [-37.370, -5.215]
        ]]
      }
    },

    // --- ZONA OESTE ---
    {
      "type": "Feature",
      "properties": { "name": "Abolição", "total_eleitores_oficial": 14000 },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-37.380, -5.195], [-37.355, -5.195], [-37.355, -5.180], [-37.380, -5.180], [-37.380, -5.195]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Nova Betânia", "total_eleitores_oficial": 10000 },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-37.355, -5.200], [-37.340, -5.200], [-37.340, -5.195], [-37.355, -5.195], [-37.355, -5.200]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Santa Delmira", "total_eleitores_oficial": 9500 },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-37.395, -5.195], [-37.380, -5.195], [-37.380, -5.180], [-37.395, -5.180], [-37.395, -5.195]
        ]]
      }
    }
  ]
} as const
