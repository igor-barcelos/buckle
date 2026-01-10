import { ElementType } from "../../../types";

export enum ToolsId {
  LINE = 'line',
  AXES = 'axes',
  COPY = 'copy'
}

export type ToolsTitle =
  | 'Line'

export interface Tool {
  uuid : String;
  state : number;
  start: () => void;
  stop: () => void;
  dispose: () => void;
  type?: ElementType;

}

export const styles = {
  Beam: {
    color: '#FF0000', // Red for lines
    lineWidth: 2,
    dashSize: 10,
    gapSize: 5,
  },
  Axis: {
    color: '#000000', // Black for axes
    lineWidth: 0.003,
    dashSize: 0.05, 
    gapSize: 0.05 
  },

};