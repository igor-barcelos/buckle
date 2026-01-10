import React from 'react';
import { Box, Typography, Card, CardContent, CardMedia, CardActionArea, Grid } from '@mui/material';
import { PlayCircleOutline } from '@mui/icons-material';

const Tutorials = () => {
  const tutorials = [
    {
      id: 1,
      title: 'Example 01 - Single Story Steel Frame',
      subtitle: 'Static Analysis',
      description: 'A single story-steel frame with IPE 400 columns and IPE 360 beams. Linear load of 5 kN/m applied to the beam.',
      videoId: 'uvO_UpGN12s',
      speed: '2x'
    },
    // Add more tutorials here as needed
  ];

  const handleCardClick = (videoId) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box
      sx={{
        padding: '40px',
        backgroundColor: '#000000',
        color: '#ffffff',
        maxHeight: '85vh',
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '4px',
          '&:hover': {
            background: 'rgba(255,255,255,0.5)',
          },
        },
      }}
    >
      {/* Header */}
      <Box sx={{ marginBottom: '32px' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 300,
            letterSpacing: '-0.02em',
            color: '#ffffff',
          }}
        >
          Buckle Tutorials
        </Typography>
        {/* <Typography
          variant="body2"
          sx={{
            color: '#999999',
            marginTop: '8px',
          }}
        >
        </Typography> */}
      </Box>

      {/* Tutorials Grid */}
      <Grid container spacing={3}>
        {tutorials.map((tutorial) => (
          <Grid item xs={12} sm={6} md={4} key={tutorial.id}>
            <Card
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <CardActionArea onClick={() => handleCardClick(tutorial.videoId)}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={`https://img.youtube.com/vi/${tutorial.videoId}/maxresdefault.jpg`}
                    alt={tutorial.title}
                    sx={{
                      objectFit: 'cover',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      transition: 'background-color 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      },
                    }}
                  >
                    <PlayCircleOutline
                      sx={{
                        fontSize: 64,
                        color: '#ffffff',
                        opacity: 0.9,
                      }}
                    />
                  </Box>
                </Box>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#ffffff',
                      fontWeight: 500,
                      fontSize: '1rem',
                      marginBottom: '4px',
                    }}
                  >
                    {tutorial.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#2196f3',
                      fontSize: '0.875rem',
                      marginBottom: '12px',
                    }}
                  >
                    {tutorial.subtitle}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#999999',
                      fontSize: '0.813rem',
                      lineHeight: 1.5,
                    }}
                  >
                    {tutorial.description}
                  </Typography>
                  {tutorial.speed && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#666666',
                        fontSize: '0.75rem',
                        fontStyle: 'italic',
                        display: 'block',
                        marginTop: '8px',
                      }}
                    >
                      Video speed: {tutorial.speed}
                    </Typography>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Tutorials;

