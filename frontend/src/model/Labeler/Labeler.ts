import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { Model } from "../Model";
import { Vector3 } from "three";

type Label = {
  id : string
  position : Vector3
  text : string
  type? : string // 'effort' | 'load' | 'length' | 'angle' | 'arc' | 'gridSnap' | 'endPointSnap' | 'prompt' | 'fixed-support' | 'pinned-support' | 'custom'
  rotation? : number
  backgroundColor? : string 
}

class Labeler {
  model : Model
  renderer : CSS2DRenderer
  enabled = true
  private labelObjects: CSS2DObject[] = [];

  set setupEvent(enabled: boolean) {
    // if (enabled) {
    //  window.addEventListener('click', this.addLabelOnClick)
    // } else {
    //   window.removeEventListener('click', this.addLabelOnClick)
    // }
  }
  constructor(model : Model) {  
    this.model = model
    this.renderer = new CSS2DRenderer();
    const vpW: number = this.model.canvas.clientWidth
    const vpH: number = this.model.canvas.clientHeight
    this.renderer.setSize(vpW, vpH);
    this.renderer.domElement.id ='label-container'
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '0px';
    this.renderer.domElement.style.width = '100vw';
    this.renderer.domElement.style.height = '100vh';
    this.renderer.domElement.style.overflow = 'hidden';
    this.renderer.domElement.style.pointerEvents = 'none';
    document.getElementById('app-container')?.appendChild(this.renderer.domElement);
    this.setupEvent = true
  }
  
  create(labels : Label[]) {

    for(const label of labels){
      const wrapper = document.createElement('div');
      const type = label.type
      const position = label.position;
      const p = document.createElement('p');
      p.className = 'label';
      p.textContent = label.text;
      const modernFont = '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif';
      
      p.style.color = 'black';
      p.style.fontWeight = 'bold';
      p.style.textAlign = 'center';
      p.style.margin = '0';
      p.style.padding = '0';
      p.style.fontFamily = modernFont;
      const pContainer = document.createElement('div');
      pContainer.style.fontSize = '12px';
      pContainer.style.fontFamily = modernFont;
      pContainer.id = label.id
      wrapper.appendChild(pContainer)

      if (type === 'effort') {
        // Effort styling - blue with rounded corners
        pContainer.style.backgroundColor = label.backgroundColor || '#42a5f5';
        pContainer.style.height = '30px';
        pContainer.style.width = '50px';
        pContainer.style.borderRadius = '5px';
      } 
      else if (type === 'length') {
        pContainer.style.backgroundColor = 'white';
        pContainer.style.height = '30px';
        pContainer.style.width = '50px';
        pContainer.style.border = '1px solid black';
        pContainer.style.color = 'black';
      }
      else if (type === 'gridSnap') {
        pContainer.style.backgroundColor = 'transparent';
        pContainer.style.height = '20px';
        pContainer.style.width = '20px';
        pContainer.style.boxShadow = 'none';  // Remove the shadow
        pContainer.style.border = 'none';     // Remove any border
        pContainer.style.padding = '0';       // Remove padding
        pContainer.style.background = 'none'; // Ensure no background
        pContainer.style.color = 'black';
        pContainer.style.fontSize = '18px';
        p.style.color = '#FF0000'; // Red X
        p.style.fontSize = '16px';
        p.style.fontWeight = 'bold';
        pContainer.style.border = '2px solid #FF0000';
        pContainer.style.borderRadius = '0%';
        pContainer.style.position = 'relative';
      }
      else if(type === 'endPointSnap'){
        pContainer.style.backgroundColor = 'transparent';
        pContainer.style.height = '20px';
        pContainer.style.width = '20px';
        pContainer.style.boxShadow = 'none';  // Remove the shadow
        pContainer.style.border = 'none';     // Remove any border
        pContainer.style.padding = '0';       // Remove padding
        pContainer.style.background = 'none'; // Ensure no background
        pContainer.style.color = 'black';
        pContainer.style.fontSize = '18px';
        p.style.color = '#FF0000'; // Red X
        p.style.fontSize = '16px';
        p.style.fontWeight = 'bold';
        pContainer.style.border = '2px solid #FF0000';
        pContainer.style.borderRadius = '50%';
        pContainer.style.position = 'relative';
      }
      else if(type === 'prompt'){
        pContainer.style.backgroundColor = '#FFFFD4'; // Light yellow background
        pContainer.style.minWidth = '150px';
        pContainer.style.padding = '4px 8px';
        pContainer.style.borderRadius = '0px'; // Remove rounded corners
        pContainer.style.border = '1px solid #A0A0A0'; // Light gray border
        p.style.color = '#000000'; // Black text
        p.style.fontSize = '12px';
        p.style.fontFamily = modernFont;
        pContainer.style.boxShadow = '2px 2px 2px rgba(0,0,0,0.1)'; // Subtle shadow
        // Position the prompt label with an offset from the cursor
        pContainer.style.transform = 'translate(60%, 0)';
        // Align the container to the left corner instead of center
        pContainer.style.justifyContent = 'flex-start';
        wrapper.style.transformOrigin = 'left top';
      }
      else if(type === 'fixed-support'){
        // Fixed support styling - red rectangle with small arrow
        pContainer.style.backgroundColor = '#d32f2f'; // Red fill
        pContainer.style.height = '25px';
        pContainer.style.width = '60px';
        pContainer.style.borderRadius = '3px';
        pContainer.style.position = 'relative';
        p.style.color = 'white';
        p.style.fontSize = '10px';
        p.style.fontWeight = 'bold';
        
        // Create small arrow indicator for fixed support
        const arrow = document.createElement('div');
        arrow.style.width = '0';
        arrow.style.height = '0';
        arrow.style.borderLeft = '6px solid transparent';
        arrow.style.borderRight = '6px solid transparent';
        arrow.style.borderTop = '8px solid #d32f2f'; // Same color as container
        arrow.style.position = 'absolute';
        arrow.style.bottom = '-8px';
        arrow.style.left = '24px'; // Center the arrow
        pContainer.appendChild(arrow);
      }
      else if(type === 'pinned-support'){
        // Pinned support styling - light blue rectangle with small arrow
        pContainer.style.backgroundColor = '#64b5f6'; // Light blue fill
        pContainer.style.height = '25px';
        pContainer.style.width = '60px';
        pContainer.style.borderRadius = '3px';
        pContainer.style.position = 'relative';
        p.style.color = 'white';
        p.style.fontSize = '10px';
        p.style.fontWeight = 'bold';
        
        // Create small arrow indicator for pinned support
        const arrow = document.createElement('div');
        arrow.style.width = '0';
        arrow.style.height = '0';
        arrow.style.borderLeft = '6px solid transparent';
        arrow.style.borderRight = '6px solid transparent';
        arrow.style.borderTop = '8px solid #64b5f6'; // Same color as container
        arrow.style.position = 'absolute';
        arrow.style.bottom = '-8px';
        arrow.style.left = '24px'; // Center the arrow
        pContainer.appendChild(arrow);
      }
      
      else {
        pContainer.style.backgroundColor = 'transparent';
        pContainer.style.height = '20px';
        pContainer.style.width = '100px';
        pContainer.style.position = 'relative';
        pContainer.style.color = 'black';
      }
      
      // if (type !== 'gridSnap') {
      //   pContainer.style.color = 'black';
      //   pContainer.style.padding = '5px';
      //   pContainer.style.boxShadow = '0 0 10px 0 rgba(0, 0, 0, 0.5)';
      // }
      pContainer.className = 'label-container';
      pContainer.style.display = 'flex';
      pContainer.style.alignItems = 'center';
      pContainer.style.justifyContent = 'center';
      pContainer.appendChild(p);

      pContainer.style.transform = `rotate(${label.rotation}deg)`;
  
      const cPointLabel = new CSS2DObject(wrapper);
      cPointLabel.position.copy(position);
      cPointLabel.userData.type = label.type
      cPointLabel.userData.id = label.id
      this.model.scene.add(cPointLabel);
      this.labelObjects.push(cPointLabel);
    }
  }

  deleteAll(type : 'effort' | 'load') {
    this.labelObjects.forEach(label => {
      if(label.userData.type === type) {
        label.element.remove();
        label.removeFromParent();
      }
    })  
  }

  dispose() {
    this.labelObjects.forEach(label => {
      label.element.remove();
      label.removeFromParent();
    });
    this.labelObjects = [];
    this.renderer.domElement.remove();
    this.setupEvent = false
  }

  updateOne(label : Label) {
    const labelObj = this.labelObjects.find(labelObj => labelObj.userData.id === label.id);
    if(labelObj) {
      if(labelObj.userData.type !== label.type){
        this.deleteOne(label.id)
        this.create([label])
        return
      }
      const childNodes = labelObj.element.childNodes
      const child = childNodes[0] as HTMLElement
      child.textContent = label.text;
      labelObj.position.copy(label.position);
      const currentLayers = this.model.camera.cam.layers
      labelObj.layers = currentLayers
      if(label.rotation) {
        // child.style.transform = `rotate(${label.rotation}deg)`;
      }
    }
  }

  batchUpdateOrCreate(labels : Label[]) {
    for(const label of labels){
      const labelObj = this.labelObjects.find(labelObj => labelObj.userData.id === label.id);
      if(labelObj) {
        this.updateOne(label)
      } else {
        this.create([label])
      }
    }
  }

  deleteOne(id: string) {
    const label = this.labelObjects.find(label => label.userData.id === id);
    if(label) {
      label.element.remove();
      label.removeFromParent();
      this.labelObjects = this.labelObjects.filter(label => label.userData.id !== id);
    }
  }

  batchDelete(ids: string[]) {
    this.labelObjects.forEach(label => {
      if(ids.includes(label.userData.id)) {
        console.log('deleting label', label.userData.id)
        label.element.remove();
        label.removeFromParent();
      }
    })
    this.labelObjects = this.labelObjects.filter(label => !ids.includes(label.userData.id));
  }
}

export default Labeler