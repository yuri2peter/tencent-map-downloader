(() => {
  window.onload = () => {
    const box = document.createElement('div');
    box.id = 'box';
    document.body.appendChild(box);

    const styleLight = {
      version: 8,
      sources: {
        'raster-tiles': {
          type: 'raster',
          tiles: ['/dist/map-server/tiles_light/{z}/{x}/{y}.png'],
          scheme: 'tms',
          tileSize: 256,
        },
      },
      layers: [
        {
          id: 'raster-tiles',
          type: 'raster',
          source: 'raster-tiles',
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    };

    const map = new mapboxgl.Map({
      container: 'box',
      style: styleLight,
      zoom: 6,
      center: {
        lng: 117.286169,
        lat: 31.862464,
      },
      maxZoom: 17,
      minZoom: 3,
      antialias: true,
      accessToken: 'any',
    });
  };
})();
