import ParametricLamp from '../components/3d/ParametricLamp';

export const lampEngine = {
  id: 'lamp',
  title: 'engines.lamp.title',
  description: 'engines.lamp.desc',
  Component3D: ParametricLamp,
  basePrice: 200,
  defaultState: {
    height: 25,
    baseRadius: 10,
    topRadius: 6,
    bulges: [
      { bulge: 1.5, bulgeCenter: 0.5 }
    ],
    ridgeLayers: [
      { count: 24, depth: 1.5, sharpness: 1, twist: 0 }
    ],
    lightType: 'puck',
    lightOn: true,
  },
  calculatePrice: (config, basePrice, metrics) => {
    if (metrics && metrics.weight) {
      return Math.floor(basePrice + (metrics.weight * 1.2));
    }
    const volumeProxy = Math.floor((config.height * config.baseRadius) / 5);
    return basePrice + volumeProxy;
  },
  sections: [
    {
      title: 'engines.lamp.visualSim',
      controls: [
        { type: 'checkbox', key: 'lightOn', label: 'engines.lamp.turnOnBulb' },
        { type: 'select', key: 'lightType', label: 'engines.lamp.lightType', options: [
            { label: 'engines.lamp.lightBulb', value: 'bulb' },
            { label: 'engines.lamp.lightPuck', value: 'puck' }
          ]
        }
      ]
    },
    {
      title: 'engines.lamp.bulgeList',
      controls: [
        { 
          type: 'repeater', 
          key: 'bulges', 
          label: 'engines.lamp.bulgeList', 
          itemLabel: 'engines.lamp.bulge',
          addButtonLabel: 'engines.lamp.addBulge',
          maxCount: 5,
          defaultItem: { bulge: 1.0, bulgeCenter: 0.5 },
          schema: [
            { type: 'range', key: 'bulge', label: 'engines.lamp.bulge', min: -5, max: 5, step: 0.1 },
            { type: 'range', key: 'bulgeCenter', label: 'engines.lamp.bulgeCenter', min: 0, max: 1, step: 0.05 }
          ]
        }
      ]
    },
    {
      title: 'engines.lamp.ridgesList',
      controls: [
        {
          type: 'repeater',
          key: 'ridgeLayers',
          label: 'engines.lamp.ridgesList',
          itemLabel: 'engines.lamp.ridge',
          addButtonLabel: 'engines.lamp.addRidge',
          maxCount: 3,
          defaultItem: { count: 12, depth: 1, sharpness: 1, twist: 0 },
          schema: [
            { type: 'range', key: 'count', label: 'engines.lamp.ridgesCount', min: 0, max: 64, step: 1 },
            { type: 'range', key: 'depth', label: 'engines.lamp.ridgeDepth', min: 0, max: 5, step: 0.1 },
            { type: 'range', key: 'sharpness', label: 'engines.lamp.ridgeSharpness', min: 0.1, max: 5, step: 0.1 },
            { type: 'range', key: 'twist', label: 'engines.lamp.twist', min: -360, max: 360, step: 5 }
          ]
        }
      ]
    },
    {
      title: 'engines.lamp.baseShape',
      controls: [
        { type: 'range', key: 'height', label: 'engines.lamp.height', min: 10, max: 25, step: 0.5 },
        { type: 'range', key: 'baseRadius', label: 'engines.lamp.baseRad', min: 5, max: 11.5, step: 0.5 },
        { type: 'range', key: 'topRadius', label: 'engines.lamp.topRad', min: 5, max: 11.5, step: 0.5 }
      ]
    }
  ]
};
