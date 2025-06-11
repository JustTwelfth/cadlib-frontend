import React, { useEffect, useRef, useState } from 'react';
import * as BUI from '@thatopen/ui';
import * as OBC from '@thatopen/components';
import * as OBCF from '@thatopen/components-front';
import * as BUIC from '@thatopen/ui-obc';
import { Box, Typography } from '@mui/material';
import axios from 'axios';

interface TestIfcViewerProps {
  setSelectedCdeid: (cdeid: string | null) => void;
}

const TestIfcViewer: React.FC<TestIfcViewerProps> = ({ setSelectedCdeid }) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [cdeid, setCdeid] = useState<string | null>(null);

  useEffect(() => {
    try {
      BUI.Manager.init();
    } catch (error) {
      console.error('Failed to initialize BUI.Manager:', error);
    }

    const components = new OBC.Components();
    const worlds = components.get(OBC.Worlds);
    const world = worlds.create();
    const sceneComponent = new OBC.SimpleScene(components);
    sceneComponent.setup();
    world.scene = sceneComponent;

    const viewport = viewportRef.current!;
    const rendererComponent = new OBC.SimpleRenderer(components, viewport);
    world.renderer = rendererComponent;
    const cameraComponent = new OBC.SimpleCamera(components);
    world.camera = cameraComponent;
    cameraComponent.controls.setLookAt(10, 5.5, 5, -4, -1, -6.5);

    const resizeHandler = () => {
      rendererComponent.resize();
      cameraComponent.updateAspect();
    };
    window.addEventListener('resize', resizeHandler);
    components.init();

    const grids = components.get(OBC.Grids);
    grids.create(world);

    const loadModel = async () => {
      try {
        const ifcLoader = components.get(OBC.IfcLoader);
        await ifcLoader.setup({
          wasm: {
            path: '/wasm/web-ifc.wasm',
            absolute: false,
          },
        });
        const response = await fetch('http://localhost:3000/ifc_cdeid.ifc');
        if (!response.ok) {
          throw new Error(`Failed to fetch IFC model: ${response.statusText}`);
        }
        const buffer = await response.arrayBuffer();
        const typedArray = new Uint8Array(buffer);
        const model = await ifcLoader.load(typedArray);
        world.scene.three.add(model);

        const indexer = components.get(OBC.IfcRelationsIndexer);
        await indexer.process(model);

        const [propertiesTable, updatePropertiesTable] = BUIC.tables.elementProperties({
          components,
          fragmentIdMap: {},
        });
        propertiesTable.preserveStructureOnFilter = true;
        propertiesTable.indentationInText = false;

        const highlighter = components.get(OBCF.Highlighter);
        highlighter.setup({ world });
        highlighter.events.select.onHighlight.add((fragmentIdMap) => {
          updatePropertiesTable({ fragmentIdMap });

          const elementId = Object.keys(fragmentIdMap)[0];
          if (elementId) {
            setTimeout(() => {
              let cdeidValue = 'Не найдено';
              const tsv = propertiesTable.tsv;
              if (tsv) {
                const rows = tsv.split('\n').map(row => row.split('\t'));
                console.log('TSV rows:', rows);
                for (const row of rows) {
                  if (row[0]?.toLowerCase() === 'cdeid') {
                    cdeidValue = row[1] || 'Не указано';
                    break;
                  }
                }
              }
              console.log(`Selected element ID: ${elementId}`);
              console.log(`CDEID: ${cdeidValue}`);
              console.log('Selected properties (TSV):', tsv);
              setCdeid(cdeidValue);
              setSelectedCdeid(cdeidValue);
            }, 100); // Задержка 100 мс
          } else {
            console.log('No element selected');
            setCdeid(null);
            setSelectedCdeid(null);
          }
        });
        highlighter.events.select.onClear.add(() => {
          updatePropertiesTable({ fragmentIdMap: {} });
          console.log('Selection cleared');
          setCdeid(null);
          setSelectedCdeid(null);
        });
      } catch (error) {
        console.error('Error loading IFC model:', error);
      }
    };

    loadModel();

    return () => {
      components.dispose();
      window.removeEventListener('resize', resizeHandler);
    };
  }, [setSelectedCdeid]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', bgcolor: '#2C3E50', position: 'relative' }}>
      <Box sx={{ width: '100%', maxWidth: '100%' }}>
        <div ref={viewportRef} style={{ width: '100%', height: '630px' }} />
        {cdeid && (
          <Box
            sx={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              bgcolor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '8px',
              borderRadius: '4px',
            }}
          >
            <Typography variant="body1">CDEID: {cdeid}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TestIfcViewer;