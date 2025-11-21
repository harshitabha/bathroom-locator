import {Paper, Button, Typography} from '@mui/material';

type AddBathroomBannerProps = {
  bannerOpen: boolean;
  onCancel: () => void;
};

/**
 * Banner prompting user to pick a bathroom location
 * @param {object} props Component props
 * @returns {object} JSX element
 */
export default function AddBathroomBanner(props: AddBathroomBannerProps) {
  const {bannerOpen, onCancel} = props;

  if (!bannerOpen) return null;

  return (
    <Paper
      elevation={3}
      sx={{
        bgcolor: (theme) => theme.palette.background.default,
        color: (theme) => theme.palette.text.primary,
        borderRadius: '12px',
        boxShadow: 3,
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        px: 1.5,
        py: 1,
        justifyContent: 'space-between',
      }}
    >
      <Typography variant="subtitle1" fontWeight={500}>
        Choose a location for the bathroom
      </Typography>

      <Button
        size="small"
        onClick={onCancel}
        sx={{
          'color': (theme) => theme.palette.text.primary,
          'border': 1,
          'borderColor': '#CAC4D0',
          'borderRadius': '8px',
          'fontWeight': 600,
          'ml': 0.1,
          'mr': 0.1,
          'px': 1.6,
          'py': 0.6,
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        Cancel
      </Button>
    </Paper>
  );
}
