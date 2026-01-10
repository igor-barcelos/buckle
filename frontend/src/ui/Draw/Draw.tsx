import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Box,
  Typography,
  IconButton,
  FormControlLabel,
  Checkbox,
  Switch,
  Button,
  Grid
} from '@mui/material';

import {
  Delete,
  Save,
} from '@mui/icons-material';

import { useModel } from '../../model/Context';
import Dialog from '../../components/Dialog/Dialog';
import Select from '../../components/Select';
import ElasticBeamColumnMember from '../../model/Elements/ElasticBeamColumn/ElasticBeamColumn'
import { observer } from 'mobx-react-lite';
import * as THREE from 'three'
import Node from '../../model/Elements/Node/Node';
import { Line } from '../../model';
import TextField from '../../components/TextField';
interface ElasticBeamColumnProps {
  open: boolean;
  onClose: () => void;
  selectedElasticBeamColumn?: any;
  freeMode?: boolean;
}

const CreateMember = ({ open, onClose, selectedElasticBeamColumn, freeMode }: ElasticBeamColumnProps) => {
  const model = useModel();
  const [sections, setSections] = useState(model?.sections)
  const [orthoMode, setOrthoMode] = useState(false)
  const [selectedSection, setSelectedSection] = useState<number>(0);
  const [nodes, setNodes] = useState<Node[]>([])
  const [nodei, setNodei] = useState<number | null>(null)
  const [nodej, setNodej] = useState<number | null>(null)
  const [gamma, setGamma] = useState<number>(0)

  const [name, setName] = useState<string>('')

  useEffect( () => {
    if(!model) return 

    const modelSections = model.sections
    const modelNodes = model.nodes
    const lineTool = Line.getInstance()
    setSections(modelSections)
    setNodes(modelNodes)
    setOrthoMode(lineTool.onOrthoMode)

    if(modelSections.length > 0 ) setSelectedSection(modelSections[0].id)

    // Don't auto-start, user will click "Start" button
    // if(freeMode) startFreeMode()

  }, [open])

  useEffect(() => {
    if(!selectedElasticBeamColumn) return 

    const sectionId = selectedElasticBeamColumn.section.id
    const section = model.sections.find((sec: any) => sec.id === sectionId)
    const nodes = selectedElasticBeamColumn.nodes
    const iNode = nodes[0]
    const jNode = nodes[1]
    const label = selectedElasticBeamColumn.label
    const gamma = selectedElasticBeamColumn.gamma
    if(section) setSelectedSection(section.id)
    setNodei(iNode.id)
    setNodej(jNode.id)
    setName(label)
    setGamma(gamma)

  },[selectedElasticBeamColumn])

  // useEffect(() => {
  //   if(model?.lineTool.state === 0) onClose()
  // },[model?.lineTool.state])

  const handleChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }

  const startFreeMode = () => {
    if (!model || !open) return;

    const lineTool = Line.getInstance()
    lineTool.start();
    lineTool.setType('elasticBeamColumn')
    const section = model.sections.find((sec: any) => sec.id === selectedSection)
    if(!section) return

    lineTool.section = section
    setOrthoMode(lineTool.onOrthoMode)

  };

  const disableFreeMode = () => {
    const lineTool = Line.getInstance()
    lineTool.stop()
    lineTool.delete()
  }

  const handleDelete = () => {
  }

  const createOrUpdate = () => {
    const iNode = model.nodes.find((node: any) => node.id === nodei )
    const jNode = model.nodes.find((node: any) => node.id === nodej )
    const section = model.sections.find((sec: any) => sec.id === selectedSection)

    if(!iNode || !jNode || !section) return 
    const nodes = [iNode, jNode]
    if(selectedElasticBeamColumn){
      const memberId = selectedElasticBeamColumn.id
      const member = model.members.find((elt: any) => elt.id === memberId)

      if(!member) return

      const {vecxz, release} = member
      member.update(nodes, section, gamma, name, release)
    }else{
      const vecxz = new THREE.Vector3(0,0,1)
      const newMember = new ElasticBeamColumnMember(model, name ,  nodes, section)
      newMember.create()
    }
  }

  const handleChangeSnap = (e: ChangeEvent<HTMLInputElement>) => {
    const {name} = e.target

    switch (name) {
      case 'onNode':
        model.snapper.toggleOnNode()
        break;
      case 'onGrid':
        model.snapper.toggleOnGrid()
        break;
      default:
        break;
    }
  }

  const handleChangeOrthoMode = (e: ChangeEvent<HTMLInputElement>) => {
    const lineTool = Line.getInstance()
    setOrthoMode(e.target.checked)
    lineTool.toogleOrthomode()
  }

  const handleSection = (e: ChangeEvent<HTMLInputElement>) => {
    const lineTool = Line.getInstance()
    const sectionId = Number(e.target.value)
    setSelectedSection(sectionId)
    lineTool.setSection(sectionId)
  }

  const getToolState = () => {
    if(!model) return

    const line = Line.getInstance()
    return line.state
  }

  // Section options
  const sectionOptions = sections?.map((sec: any) => ({
    id: sec.id,
    name: sec.name || `Section ${sec.id}`
  })) || [];

  // Node options
  const nodeOptions = nodes?.map((node: any) => ({
    id: node.id,
    name: node.name || `Node ${node.id}`
  })) || [];

  return (
    <Dialog
      open={open}
      onClose={() => {
        disableFreeMode()
        onClose()
        setName('')
      }}
      maxWidth="sm"
      fullWidth={false}
      hideBackdrop
      disableEnforceFocus
      disableAutoFocus
      draggable
      title={'New member'}
    >
        <Grid container spacing={2} alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
          <Grid item xs={4} md={4}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: '#b0b0b0',
                fontSize: '0.8rem',
                fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
              }}
            >
              Section
            </Typography>
          </Grid>
          <Grid item xs={8} md={8}>
            <Select
              label={''}
              list={sectionOptions}
              value={selectedSection}
              onChange={(e:any) => handleSection(e as any)}
              size="small"
            />
          </Grid>
        </Grid>

        {freeMode && (
          <>
            <Grid container spacing={2} alignItems="center" justifyContent="space-between">

            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                onClick={startFreeMode}
                variant="outlined"
                size="small"
                sx={{
                  backgroundColor: getToolState() !== 0 ? '#4caf50' : '#3f3f3f',
                  color: 'white',
                  borderColor: getToolState() !== 0 ? '#388e3c' : '#1e1e1e',
                  minWidth: '60px',
                  height: '28px',
                  fontSize: '0.75rem',
                  padding: '4px 12px',
                  '&:hover': {
                    backgroundColor: getToolState() !== 0 ? '#45a049' : '#4a4a4a',
                    borderColor: getToolState() !== 0 ? '#2e7d32' : '#404040',
                    color: '#e0e0e0',
                  },
                }}
              >
                Start
              </Button>
            </Box>
          </>
        )}
        { !freeMode && (
          <>
            <Grid container spacing={2} alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
              <Grid item xs={6} md={6}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: '#b0b0b0',
                    fontSize: '0.8rem',
                    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                  }}
                >
                  Node i
                </Typography>
              </Grid>
              <Grid item xs={6} md={6}>
                <Select
                  label={''}
                  list={nodeOptions}
                  value={nodei || ''}
                  onChange={(e:any) => setNodei(Number(e.target.value))}
                  size="small"
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
              <Grid item xs={6} md={6}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: '#b0b0b0',
                    fontSize: '0.8rem',
                    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                  }}
                >
                  Node j
                </Typography>
              </Grid>
              <Grid item xs={6} md={6}>
                <Select
                  label={''}
                  list={nodeOptions}
                  value={nodej || ''}
                  onChange={(e:any) => setNodej(Number(e.target.value))}
                  size="small"
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
              <Grid item xs={6} md={6}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: '#b0b0b0',
                    fontSize: '0.8rem',
                    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                  }}
                >
                  Gamma (°)
                </Typography>
              </Grid>
              <Grid item xs={6} md={6}>
                <TextField
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setGamma(Number(e.target.value))}
                  value={gamma}
                  name="gamma"
                  placeholder=""
                  type="number"
                  size="small"
                  fullWidth
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <IconButton
                onClick={handleDelete}
                size="small"
                sx={{
                  color: '#555',
                  '&:hover': {
                    color: '#f44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)'
                  }
                }}
              >
                <Delete fontSize="small" />
              </IconButton>

              <IconButton
                onClick={createOrUpdate}
                size="small"
                sx={{
                  color: '#555',
                  '&:hover': {
                    color: '#000',
                    backgroundColor: 'rgba(0, 0, 0, 0.08)'
                  }
                }}
              >
                <Save fontSize="small" />
              </IconButton>
            </Box>
          </>
        )}

    </Dialog>
  );
};

export default observer(CreateMember);
