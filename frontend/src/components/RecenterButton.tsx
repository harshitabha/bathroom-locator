import {Fab} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';

type RecenterButtonProps = {
  onClick: () => void;
};

/**
 * Action button to recenter the map on the user's location
 * @param {{ onClick: () => void }} props Component props
 * @returns {import('react').ReactElement} Action button element
 */
function RecenterButton(props: RecenterButtonProps) {
  const {onClick} = props;

  return (
    <Fab
      aria-label="Recenter map"
      onClick={onClick}
      sx={{
        'position': 'fixed',
        'right': 24,
        'bottom': 88,
        'zIndex': (t) => t.zIndex.modal + 1,
        'bgcolor': 'background.paper',
        'color': 'text.primary',
        'border': '1px solid rgba(0,0,0,0.2)',
        '&:hover': {
          bgcolor: 'grey.100',
        },
      }}
    >
      <MyLocationIcon />
    </Fab>
  );
}

export default RecenterButton;
