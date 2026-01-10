// import * as OBC from "@thatopen/components"
// import * as THREE from "three"
// import Model from "../../Model";
// // import { loadIfcSignal } from "./signals";
// import { effect } from '@preact/signals-react';

// class IFCFileHandler  {
//   components: OBC.Components
//   fragmentsManager: OBC.FragmentsManager;
//   fragmentIfcLoader: OBC.IfcLoader;
//   model: Model;
//   constructor(model : Model){ 
//     this.model = model;
//     this.components = new OBC.Components();
//     this.fragmentsManager = this.components.get(OBC.FragmentsManager);
//     this.fragmentIfcLoader = this.components.get(OBC.IfcLoader);

//     effect(() => {
//       (async () => {
//         const {loadingIfc} = this.model.state
//         if (loadingIfc.value) {
//           console.log('loading IFC File')
//           let model = await this.getModel();
//           this.model.scene.add(model);
//           loadingIfc.value = false;
//           console.log('IFC File Loaded')
//           console.log('model', this.model.scene)
//         }
//       })();
//     })
//   }

//   init(){
//   }
//   async getModel(){
//     const file = await fetch(
//       "https://thatopen.github.io/engine_components/resources/small.ifc",
//     );
//     const data = await file.arrayBuffer();
//     const buffer = new Uint8Array(data);
  
//     const simpleMaterial = new THREE.MeshStandardMaterial({
//       metalness: 0,       // Non-metallic surface
//       roughness: 1,       // Fully rough (diffuse)
//       transparent: false,  // Allow transparency
//       opacity: 0.5        // 50% transparent
//     });
  
//     // const model = await fragmentIfcLoader.load(buffer);
//     await this.fragmentIfcLoader.load(buffer);
//     const fragmentsGroup = Array.from(this.fragmentsManager.groups.values())[0];
//     fragmentsGroup.traverse((child : any) => {
//       if (child.isMesh) {
//           child.material = [simpleMaterial];
//          }
//       });
//     const modifiedData = this.fragmentsManager.export(fragmentsGroup);
//     const modifiedBuffer = new Uint8Array(modifiedData);
//     const model = this.fragmentsManager.load(modifiedBuffer);
//     return model
//   }
// }

// export default IFCFileHandler;