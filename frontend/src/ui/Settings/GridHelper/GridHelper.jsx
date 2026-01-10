import { useState, useEffect } from 'react';
import {
  Grid,
	Typography,
	Box
} from '@mui/material';
import TextField from '../../../components/TextField/TextField';
import { useModel } from '../../../model/Context';
import { observer } from 'mobx-react-lite';

const GridHelper = () => {
	const model = useModel()

	const handleChange = (e) => {
		const {name, value} = e.target
    const grid = model.gridHelper.get()
		const newGrid = {...grid, [name] : Number(value) }
		model.gridHelper.update(newGrid.size, newGrid.size / newGrid.spacing)
	}
	
	return(
		<>
			<Box>
				<Typography
					sx={{
						fontSize: '0.75rem',
						mb: 0.5,
						fontWeight: 500,
						fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
					}}
				>
					Spacing
				</Typography>
				<TextField
					value={model.gridHelper.spacing}
					onChange={handleChange}
					name={'spacing'}
					placeholder="Spacing"
					fullWidth
				/>
			</Box>

			<Box>
				<Typography
					sx={{
						fontSize: '0.75rem',
						color: '#555',
						mb: 0.5,
						fontWeight: 500,
						fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
					}}
				>
					Size
				</Typography>
				<TextField
					value={model.gridHelper.size}
					onChange={handleChange}
					name={'size'}
					placeholder="Size"
					fullWidth
				/>
			</Box>
		</>
	)
}

export default observer(GridHelper)