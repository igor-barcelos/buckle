import { exportModelJson } from '../../helpers';
import Model from '../Model';
import { Node, ElasticBeamColumn, BoundaryCondition, Load } from '..';
import * as THREE from 'three'
export default class WebSocketHandler {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectInterval: number = 3000;
  private model : Model
  constructor(url: string, model : Model) {
    this.url = url;
    this.model = model
  }

  /**
   * Establishes a WebSocket connection
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = (event) => {
          console.log('WebSocket connected:', event);
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          console.log('WebSocket message received:', event.data);
          try {
            const parsedData = JSON.parse(event.data);
            const { message, id , data } = parsedData;
            let answer : any; 
            switch (message) {
              case 'get_scene_info':
                const model = exportModelJson(this.model)
                answer = {
                  message: 'This is the scene state',
                  data: model,
                  id : id,
                };
                console.log('get scene state answer', answer)
                break;
              case 'add_nodes':
                for (let item of data as Node[]) {
                  const coordinates = new THREE.Vector3(item.x, item.y, item.z)
                  const name = item?.name
                  const id = item.id
                  const node  = new Node(coordinates, name, id)
                  node.model = this.model
                  node.create()
                  this.model.nodes.push(node)

                }
                answer = {
                  message : 'The nodes have been created',
                  id : id, 
                  success : true
                }
                break;
              case 'add_members':
                for(let item of data){
                  const {nodei, nodej, section, label, id} = item
                  const iNode = this.model.nodes.find((item) => item.id === nodei)
                  const jNode = this.model.nodes.find((item) => item.id === nodej)
                  // const sec = this.model.sections.find((item) => item.id === section)
                  const sec = this.model.sections[0]
                  // const sec = this.model.mock
                  if(!iNode || !jNode || !sec) return 
                  const vecxz = new THREE.Vector3(0,0,1)
                  
                  const nodes = [iNode, jNode]
                  const member = new ElasticBeamColumn(this.model, label, nodes, sec, id)
                  member.create()
                  this.model.members.push(member)
                }
                
                answer = {
                  message : 'The members have been created',
                  id : id, 
                  success : true
                }
                console.log('LET ADD MEMBERS', data)
              break
              case 'add_bc':
                for(let item of data as BoundaryCondition[]){
                  const bc = new BoundaryCondition(this.model, item)
                  bc.createOrUpdate()
                }
                answer = {
                  message : 'The boundary conditions have been created',
                  id : id, 
                  success : true
                }
                
                break;
              case 'add_linear_load':
                for(let item of data as Load[]){
                  const load = new Load(this.model, item)
                  load.createOrUpdate()
                }
                answer = {
                  message : 'The linear loads have been created',
                  id : id, 
                  success : true
                }
                break
                default:
                console.log('Unknown message type:', message);
                break;
              
            }
            this.send(answer)
          } catch (error) {
            console.error('Error parsing message:', error);
            console.log('Raw message data:', event.data);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket closed:', event);
          this.handleReconnect();
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Sends a message through the WebSocket connection
   */
  send(message: string | object): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const data = typeof message === 'string' ? message : JSON.stringify(message);
      console.log('SENDING DATA',data)
      this.ws.send(data);
      return true;
    }
    console.warn('WebSocket is not connected');
    return false;
  }

  /**
   * Closes the WebSocket connection
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Gets the current connection status
   */
  getConnectionState(): number {
    return this.ws ? this.ws.readyState : WebSocket.CLOSED;
  }

  /**
   * Checks if the WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws ? this.ws.readyState === WebSocket.OPEN : false;
  }

  /**
   * Handles automatic reconnection
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect().catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  
}

