import ParametricLithophane from '../components/3d/ParametricLithophane';

export const lithophaneEngine = {
  id: 'lithophane',
  title: 'engines.lithophane.title',
  description: 'engines.lithophane.desc',
  Component3D: ParametricLithophane,
  basePrice: 150,
  defaultState: {
    modelType: 'curved',
    thickness: 3.5,
    baseThickness: 0.5,
    size: 15,
    lightOn: true,
    imageSource: null
  },
  calculatePrice: (config, basePrice) => {
    return basePrice + Math.floor(config.size * 5) + Math.floor(config.thickness * 2);
  },
  sections: [
    {
      title: 'engines.lithophane.sourceImage',
      controls: [
        { type: 'imageUpload', key: 'imageSource', label: 'engines.lithophane.uploadFile' }
      ]
    },
    {
      title: 'engines.lithophane.visualSim',
      controls: [
        { type: 'checkbox', key: 'lightOn', label: 'engines.lithophane.turnOnBulb' }
      ]
    },
    {
      title: 'engines.lithophane.baseShape',
      controls: [
        { 
          type: 'select', 
          key: 'modelType', 
          label: 'engines.lithophane.surfaceType', 
          options: [
            { value: 'flat', label: 'engines.lithophane.modelFlat' },
            { value: 'curved', label: 'engines.lithophane.modelCurved' },
            { value: 'cylinder', label: 'engines.lithophane.modelCylinder' },
            { value: 'dome', label: 'engines.lithophane.modelDome' }
          ]
        },
        { type: 'range', key: 'size', label: 'engines.lithophane.mainSize', min: 5, max: 30, step: 1 }
      ]
    },
    {
      title: 'engines.lithophane.settings',
      controls: [
        { type: 'range', key: 'thickness', label: 'engines.lithophane.thickMax', min: 2, max: 10, step: 0.1 },
        { type: 'range', key: 'baseThickness', label: 'engines.lithophane.thickMin', min: 0.4, max: 2, step: 0.1 }
      ]
    }
  ]
};
