import { STLExporter } from 'three/examples/jsm/exporters/STLExporter';

/**
 * Exports a Three.js scene or specific mesh to STL
 * @param {THREE.Object3D} scene - The scene or mesh to export
 * @param {string} filename - Output filename
 */
export const exportToStl = (scene, filename = 'lamp_design.stl') => {
  if (!scene) {
    console.error("No scene provided for export.");
    return;
  }

  try {
    const exporter = new STLExporter();
    
    // Attempt to find the specific lamp shade mesh to avoid exporting lights/helpers
    let target = scene;
    scene.traverse((child) => {
      if (child.name === 'lamp_shade') {
        target = child;
      }
    });

    // CLAMP/UNIT FIX: Our internal units are in CM (e.g. 25 height).
    // STL files are unitless, but Slicers (Bambu Studio, Cura) assume 1 unit = 1mm.
    // We clone and scale by 10 to ensure 25cm becomes 250mm.
    const exportClone = target.clone();
    exportClone.scale.set(10, 10, 10);
    exportClone.updateMatrixWorld(true);

    // Parse the object and get binary STL output
    const buffer = exporter.parse(exportClone, { binary: true });
    
    // Create download link
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    return true;
  } catch (error) {
    console.error("Error exporting STL:", error);
    return false;
  }
};
