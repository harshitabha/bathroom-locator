import {Box, Chip, Paper, Typography} from '@mui/material';
import './Detail.css';

const Detail = (props: DetailProps) => {
  return (
    <Box
      className={`flex detail-container ${props.styles ? props.styles : ''}`}>
      <Typography variant='body1' className='details-label'>
        {props.name}:
      </Typography>
      <Box className='flex chip-container'>
        {
          Object.keys(props.values).map((key) => {
            return (
              <Chip
                key={`${props.name}-${key}`}
                component={Paper}
                elevation={1}
                onClick={() => props.handleClick(props.name, key)}
                label={formatString(key)}
                className={`detailChip ${props.values[key] ? 'selected' : ''}`}
                aria-label={
                  props.chipEditable ?
                  getChipAriaLable(formatString(key), props.values[key]) :
                  ''
                }/>
            );
          })
        }
      </Box>
    </Box>
  );
};

/**
 * Get the aria label for the chip with the given value
 * @param {string} val value for the chip
 * @param {boolean} selected is the chip selected
 * @returns {string} aria lable for the chip
 */
function getChipAriaLable(val: string, selected: boolean): string {
  if (selected) {
    return `Unselect ${val}`;
  }
  return `Select ${val}`;
}

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
  styles?: string, // any additional classes to add for styling
  chipEditable?: boolean,
  handleClick: (propName: string, attrName: string) => void;
}

export default Detail;
