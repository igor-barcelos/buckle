import { Tool, ToolsId } from './types';
import { Model } from '../../Model';
import Line from './Line';
import CopyTool from './Copy';
import { ElementType } from '../../../types';
import { makeAutoObservable } from 'mobx';

class ToolsController {
  private tools: Map<string, Tool> = new Map();
  private currentTool: Tool | null = null;
 
  constructor() {
    makeAutoObservable(this);
  }
 
  activate(toolId: string) {
    if (this.currentTool) this.deactivate();

    let tool = this.tools.get(toolId);

    if (!tool) {
      switch (toolId) {
        case 'column':
        case 'line':
          tool = Line.getInstance();
          break
        case 'copy':
          tool = CopyTool.getInstance();
          break
      }
    }

    if (!tool) return;
    this.tools.set(toolId, tool);
    this.currentTool = tool;
    this.currentTool.start()
  }

  deactivate() {
    if (!this.currentTool) return;
    this.currentTool.stop()
    this.currentTool = null
  }

  dispose() {
    this.deactivate();
    this.tools.forEach((tool) => {
      tool.dispose();
    });
    this.tools.clear();
  }

  getTool(toolId: string): Tool | undefined {
    return this.tools.get(toolId);
  }

  getCurrentTool(): Tool | null {
    return this.currentTool;
  }

  registerTool(toolId: string, tool: Tool) {
    this.tools.set(toolId, tool);
  }

  getCurrentToolName() : String {
    const tool = this.currentTool
    if(!tool) return ''
    return tool.uuid
  }
}

export default ToolsController;
