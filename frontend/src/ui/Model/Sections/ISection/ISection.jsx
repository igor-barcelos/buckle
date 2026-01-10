// https://www.viktor.ai/blog/178/automate-structural-analysis-of-cross-sections-using-python-and-section-properties
// https://github.com/robbievanleeuwen/section-properties/blob/master/src/sectionproperties/pre/library/steel_sections.py#L79
import React, { useState, memo, useEffect } from 'react';
import {
  Grid,
  Typography
} from '@mui/material'

import Select from '../../../../components/Select'
import TextField from '../../../../components/TextField';

const ISection = ({section, setSection, handleChange}) => {
  const [profile, setProfile] = useState('IPE80')
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch('/isections.json')
        
        if (!response.ok)  throw new Error('Failed to fetch profiles')
        
        const data = await response.json()
        setProfiles(data)
      } catch (error) {
        console.error('Error fetching profiles:', error)
        setProfiles([])
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [])

  const handleChangeProfile = (e) => {
    setProfile(e.target.value)
    const iSection = profiles.find((item) => item.name === e.target.value)

    let newSection = {
      ...section,
      ...iSection,
      type: 'I',
    }

    setSection(newSection)
  }
  return(
    <Grid container alignItems='center' spacing={2} justifyContent='space-between'>
      <Grid item xs={6} md={6}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: '#333333',
            fontSize: '0.8rem'
          }}
        >
          Profile
        </Typography>
      </Grid>
      <Grid item xs={6} md={6}>
        <Select
          value={profile}
          label= "Profile"
          list={profiles.map(p => ({ id: p.name, name: p.name }))}
          onChange={handleChangeProfile}
        />
      </Grid>

      <Grid item xs={6} md={6}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: '#333333',
            fontSize: '0.8rem'
          }}
        >
          Width (mm)
        </Typography>
      </Grid>
      <Grid item xs={6} md={6}>
        <TextField
          value={section.width}
          name="width"
          onChange={handleChange}
        />
      </Grid>

      <Grid item xs={6} md={6}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: '#333333',
            fontSize: '0.8rem'
          }}
        >
          Depth (mm)
        </Typography>
      </Grid>
      <Grid item xs={6} md={6}>
        <TextField
          value={section.depth}
          name="depth"
          onChange={handleChange}
        />
      </Grid>

      <Grid item xs={6} md={6}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: '#333333',
            fontSize: '0.8rem'
          }}
        >
          tw (mm)
        </Typography>
      </Grid>
      <Grid item xs={6} md={6}>
        <TextField
          value={section.tw}
          name="tw"
          onChange={handleChange}
        />
      </Grid>

      <Grid item xs={6} md={6}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: '#333333',
            fontSize: '0.8rem'
          }}
        >
          tf (mm)
        </Typography>
      </Grid>
      <Grid item xs={6} md={6}>
        <TextField
          value={section.tf}
          name="tf"
          onChange={handleChange}
        />
      </Grid>

      <Grid item xs={6} md={6}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: '#333333',
            fontSize: '0.8rem'
          }}
        >
          r (mm)
        </Typography>
      </Grid>
      <Grid item xs={6} md={6}>
        <TextField
          value={section.r}
          name="r"
          onChange={handleChange}
        />
      </Grid>

    </Grid>
  )
}

export default ISection