(() => {
  const chinaCenter = {
    lng: 105.418362,
    lat: 35.636047,
  };

  // dark or light
  const getStyle = (theme) => {
    return {
      version: 8,
      sources: {
        'raster-tiles': {
          type: 'raster',
          tiles: [`/dist/map-server/tiles_${theme}/{z}/{x}/{y}.png`],
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
  };

  // 地图通用属性
  const getMapProps = () => {
    return {
      zoom: 4,
      center: chinaCenter,
      maxZoom: 17,
      minZoom: 3,
      antialias: true,
      accessToken: 'any',
    };
  };

  // 地图位置同步
  function moveToMapPosition(master, clone) {
    var center = master.getCenter();
    var zoom = master.getZoom();
    var bearing = master.getBearing();
    var pitch = master.getPitch();

    clone.jumpTo({
      center: center,
      zoom: zoom,
      bearing: bearing,
      pitch: pitch,
    });
  }

  window.onload = () => {
    isMouseInLeft = false;
    isMouseInRight = false;
    const mapLeft = new mapboxgl.Map({
      ...getMapProps(),
      container: 'left-map',
      style: getStyle('light'),
    });
    const mapRight = new mapboxgl.Map({
      ...getMapProps(),
      container: 'right-map',
      style: getStyle('dark_blue'),
    });
    mapLeft.on('mousemove', () => {
      isMouseInLeft = true;
      isMouseInRight = false;
    });
    mapLeft.on('move', () => {
      if (isMouseInLeft) moveToMapPosition(mapLeft, mapRight);
    });
    mapRight.on('mousemove', () => {
      isMouseInRight = true;
      isMouseInLeft = false;
    });
    mapRight.on('move', () => {
      if (isMouseInRight) moveToMapPosition(mapRight, mapLeft);
    });
  };
})();
