import {Fab} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

type AddBathroomButtonProps = {
  onClick: () => void;
};

/**
 * Action button to start the add bathroom flow
 * @param {{ onClick: () => void }} props Component props
 * @returns {import('react').ReactElement} Action button element
 */
function AddBathroomButton(props: AddBathroomButtonProps) {
  const {onClick} = props;
  return (
    <Fab
      color="primary"
      aria-label="Add a bathroom"
      onClick={onClick}
      sx={{
        'position': 'fixed',
        'right': 24,
        'bottom': 24,
        'zIndex': (t) => t.zIndex.modal + 1,
        'bgcolor': 'primary.main',
        'color': 'common.white',
        '&:hover': {bgcolor: 'primary.dark'},
      }}
    >
      <AddIcon />
    </Fab>
  );
};
export default AddBathroomButton;
