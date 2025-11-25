import {Box, Chip, Paper, Typography} from '@mui/material';
import './Detail.css';

const Detail = (props: DetailProps) => {
  return (
    <Box className='flex detail-container'>
      <Typography variant='body1' className='details-label'>
        {props.name}:
      </Typography>
      <Box className='flex chip-container'>
        {
          Object.keys(props.values).map((key) => {
            console.log(key, props.values[key]);
            return (
              <Chip
                key={`${props.name}-${key}`}
                component={Paper}
                elevation={1}
                label={formatString(key)}
                sx={props.values[key] ? {bgcolor: 'primary.light'}: null}/>
            );
          })
        }
      </Box>
    </Box>
  );
};

/**
 * properly formats the input value property names
 * @param {string} str string to format
 * @returns {string} formated string
 */
function formatString(str: string): string {
  let words = str.split('_');
  words = words.map((word) => word[0].toUpperCase() + word.substring(1));
  return words.join(' ');
}

interface DetailProps {
  name: string,
  values: {[key: string]: boolean},
}

// export interface Value {
//   name: string,
//   selected: boolean,
// }

export default Detail;
