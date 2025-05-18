import React, { useEffect, useRef } from 'react';
import * as OBC from '@thatopen/components';
import * as Fragments from '@thatopen/fragments';
import * as THREE from 'three';
import * as WEBIFC from 'web-ifc';
import axios from 'axios';

const IFCViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const componentsRef = useRef<OBC.Components | null>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const selectedMeshRef = useRef<THREE.Mesh | null>(null);
  const originalMaterialRef = useRef<THREE.Material | THREE.Material[] | null>(null);
  const ifcModelRef = useRef<Fragments.FragmentsGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || !inputRef.current) {
      console.error('Контейнер или input не найдены');
      return;
    }

    // Инициализация компонентов
    const components = new OBC.Components();
    componentsRef.current = components;
    const worlds = components.get(OBC.Worlds);
    const world = worlds.create<
      OBC.SimpleScene,
      OBC.SimpleCamera,
      OBC.SimpleRenderer
    >();
    world.scene = new OBC.SimpleScene(components);
    world.scene.three.background = new THREE.Color(0xcccccc);
    world.renderer = new OBC.SimpleRenderer(components, containerRef.current);
    world.renderer.three.setPixelRatio(window.devicePixelRatio);
    world.camera = new OBC.SimpleCamera(components);
    components.init();
    world.camera.controls.setLookAt(0, 10, 20, 0, 0, 0);
    console.log('Сцена инициализирована');
    console.log('Камера:', world.camera.three);

    // Добавляем освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 20, 10);
    world.scene.three.add(ambientLight, directionalLight);
    console.log('Освещение добавлено');

    // Добавляем сетку
    const grids = components.get(OBC.Grids);
    grids.create(world);
    console.log('Сетка добавлена');

    // Тестовый куб
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const cube = new THREE.Mesh(geometry, material);
    world.scene.three.add(cube);
    console.log('Тестовый куб добавлен');

    // Настройка IfcLoader
    const ifcLoader = components.get(OBC.IfcLoader);
    const setupIfcLoader = async () => {
      try {
        await ifcLoader.setup();
        console.log('IfcLoader настроен');
      } catch (error) {
        console.error('Ошибка настройки IfcLoader:', error);
      }
    };
    setupIfcLoader();

    // Обработчик клика для выбора элемента
    const handleClick = async (event: MouseEvent) => {
      if (!ifcModelRef.current || !world.camera.three) {
        console.warn('Модель или камера не инициализированы');
        return;
      }

      try {
        const rect = containerRef.current!.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.current.setFromCamera(new THREE.Vector2(x, y), world.camera.three);
        const intersects = raycaster.current.intersectObjects(ifcModelRef.current.children, true);

        if (intersects.length > 0) {
          const mesh = intersects[0].object as THREE.Mesh;

          // Восстанавливаем материал предыдущего выбранного элемента
          if (selectedMeshRef.current && originalMaterialRef.current) {
            selectedMeshRef.current.material = originalMaterialRef.current;
          }

          // Сохраняем оригинальный материал
          originalMaterialRef.current = mesh.material;

          // Создаём уникальный материал для выбранного меша
          let highlightMaterial: THREE.MeshStandardMaterial;
          if (Array.isArray(mesh.material)) {
            // Если материал — массив, берём первый и клонируем как MeshStandardMaterial
            const baseMaterial = mesh.material[0];
            highlightMaterial = new THREE.MeshStandardMaterial({
              color: 0xffff00,
              side: THREE.DoubleSide,
            });
            console.log('Массив материалов, создан новый MeshStandardMaterial');
          } else {
            // Если материал одиночный, проверяем тип
            if (mesh.material instanceof THREE.MeshStandardMaterial) {
              highlightMaterial = mesh.material.clone() as THREE.MeshStandardMaterial;
              highlightMaterial.color.set(0xffff00); // Жёлтый цвет
              console.log('Одиночный MeshStandardMaterial, клонирован');
            } else {
              // Если материал не MeshStandardMaterial, создаём новый
              highlightMaterial = new THREE.MeshStandardMaterial({
                color: 0xffff00,
                side: THREE.DoubleSide,
              });
              console.log('Неизвестный материал, создан новый MeshStandardMaterial');
            }
          }
          mesh.material = highlightMaterial;
          selectedMeshRef.current = mesh;

          console.log('Выбранный элемент:', mesh);
          console.log('Свойства userData:', mesh.userData);
          console.log('Оригинальный материал:', originalMaterialRef.current);

          // Извлечение свойств
          if (mesh.userData.expressID) {
            try {
              const expressID = mesh.userData.expressID;
              console.log('ExpressID элемента:', expressID);

              // Получаем свойства через web-ifc
              const modelID = 0; // Первая модель в web-ifc
              const props = await ifcLoader.webIfc.GetLine(modelID, expressID, true);
              console.log('Свойства элемента:', props);

              const globalId = props?.GlobalId?.value;
              if (globalId) {
                try {
                  const response = await axios.get(`https://localhost:7075/api/objects/by-globalid/${globalId}`);
                  console.log('Данные из БД:', response.data);
                } catch (error) {
                  console.error('Ошибка запроса к БД:', error);
                }
              } else {
                console.warn('GlobalId не найден в свойствах');
                console.log('Полные свойства:', JSON.stringify(props, null, 2));
              }
            } catch (error) {
              console.error('Ошибка при получении свойств:', error);
            }
          } else {
            console.warn('ExpressID не найден в userData');
          }
        }
      } catch (error) {
        console.error('Ошибка в обработчике клика:', error);
      }
    };

    // Откладываем добавление слушателя клика, чтобы камера инициализировалась
    const timeoutId = setTimeout(() => {
      if (containerRef.current && world.camera.three) {
        containerRef.current.addEventListener('click', handleClick);
        console.log('Слушатель клика добавлен');
      } else {
        console.warn('Не удалось добавить слушатель клика: камера не инициализирована');
      }
    }, 1000);

    // Загрузка IFC
    const loadIFC = async (file: File) => {
      try {
        console.log('Файл выбран:', file.name);
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const ifcModel = await ifcLoader.load(uint8Array);
        if (!ifcModel) {
          console.error('Модель не загружена');
          return;
        }

        // Применяем базовый материал ко всем мешам, создавая уникальные экземпляры
        ifcModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            console.log('Материал меша:', child.material);
            let newMaterial: THREE.MeshStandardMaterial;
            if (Array.isArray(child.material)) {
              newMaterial = new THREE.MeshStandardMaterial({
                color: 0xaaaaaa,
                side: THREE.DoubleSide,
              });
            } else {
              if (child.material instanceof THREE.MeshStandardMaterial) {
                newMaterial = child.material.clone() as THREE.MeshStandardMaterial;
                newMaterial.color.set(0xaaaaaa);
              } else {
                newMaterial = new THREE.MeshStandardMaterial({
                  color: 0xaaaaaa,
                  side: THREE.DoubleSide,
                });
              }
            }
            child.material = newMaterial;
          }
        });

        world.scene.three.add(ifcModel);
        ifcModelRef.current = ifcModel;
        console.log('Модель загружена:', ifcModel);

        // Центрирование
        const box = new THREE.Box3().setFromObject(ifcModel);
        const center = box.getCenter(new THREE.Vector3());
        ifcModel.position.sub(center);
        world.camera.controls.setLookAt(
          center.x,
          center.y + 10,
          center.z + 20,
          center.x,
          center.y,
          center.z
        );
        console.log('Модель отцентрирована:', center);
      } catch (error) {
        console.error('Ошибка загрузки IFC:', error);
      }
    };

    // Обработка файла
    const handleFileChange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) loadIFC(file);
    };
    inputRef.current.addEventListener('change', handleFileChange);

    // Очистка
    return () => {
      inputRef.current?.removeEventListener('change', handleFileChange);
      containerRef.current?.removeEventListener('click', handleClick);
      clearTimeout(timeoutId);
      components.dispose();
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      componentsRef.current = null;
      console.log('Компонент размонтирован');
    };
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div>
        <input type="file" accept=".ifc" ref={inputRef} />
        <div ref={containerRef} style={{ width: '700px', height: '600px' }} />
      </div>
    </div>
  );
};

export default IFCViewer;