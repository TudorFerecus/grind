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
    bulge: 1.5,
    twist: 120,
    spiralRidges: 0,
    ridgesCount: 24,
    ridgeDepth: 1.5,
    lightType: 'puck',
    lightOn: true,
  },
  calculatePrice: (config, basePrice, metrics) => {
    if (metrics && metrics.weight) {
      // Example pricing formula: base price + 1.2 RON per gram of filament
      return Math.floor(basePrice + (metrics.weight * 1.2));
    }
    // Fallback volume proxy if metrics are not yet ready
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
      title: 'engines.lamp.baseShape',
      controls: [
        { type: 'range', key: 'height', label: 'engines.lamp.height', min: 10, max: 40, step: 0.5 },
        { type: 'range', key: 'baseRadius', label: 'engines.lamp.baseRad', min: 4, max: 20, step: 0.5 },
        { type: 'range', key: 'topRadius', label: 'engines.lamp.topRad', min: 2, max: 20, step: 0.5 },
        { type: 'range', key: 'bulge', label: 'engines.lamp.bulge', min: -5, max: 5, step: 0.1 }
      ]
    },
    {
      title: 'engines.lamp.modifiers3d',
      controls: [
        { type: 'range', key: 'twist', label: 'engines.lamp.twist', min: -360, max: 360, step: 5 },
        { type: 'range', key: 'spiralRidges', label: 'engines.lamp.spiralRidges', min: -360, max: 360, step: 5 },
        { type: 'range', key: 'ridgesCount', label: 'engines.lamp.ridgesCount', min: 0, max: 64, step: 1 },
        { type: 'range', key: 'ridgeDepth', label: 'engines.lamp.ridgeDepth', min: 0, max: 5, step: 0.1 }
      ]
    }
  ]
};
