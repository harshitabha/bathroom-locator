import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

type AddBathroomPromptProps = {
  bannerOpen: boolean;
  onCancel: () => void;
  showPeekCard: boolean;
  onPeekTouchStart: React.TouchEventHandler<HTMLDivElement>;
  onPeekTouchEnd: React.TouchEventHandler<HTMLDivElement>;
  onPeekMouseDown: React.MouseEventHandler<HTMLDivElement>;
};

export default function AddBathroomPrompt({
  bannerOpen,
  onCancel,
  showPeekCard,
  onPeekTouchStart,
  onPeekTouchEnd,
  onPeekMouseDown,
}: AddBathroomPromptProps) {
  return (
    <>
      <Snackbar
        open={bannerOpen}
        anchorOrigin={{vertical: 'top', horizontal: 'center'}}
        slotProps={{
          content: {
            sx: {
              bgcolor: 'background.paper',
              color: 'text.primary',
              borderRadius: '12px',
              boxShadow: 3,
              display: 'flex',
              alignItems: 'center',
              px: 3,
              py: 0.85,
            },
          },
        }}
        message={
          <Typography variant="subtitle1" fontWeight={500}>
            Choose a location for the bathroom
          </Typography>
        }
        action={
          <Button
            size="small"
            onClick={onCancel}
            sx={{
              color: 'text.primary',
              border: 1,
              borderColor: 'secondary.main',
              borderRadius: '8px',
              fontWeight: 600,
              ml: 0.1,
              px: 1.6,
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            Cancel
          </Button>
        }
      />
      {showPeekCard && (
        <Box
          sx={{
            position: 'fixed',
            left: 8,
            right: 8,
            bottom: 8,
            zIndex: (t) => t.zIndex.modal + 1,
          }}
        >
          <Paper
            elevation={3}
            onTouchStart={onPeekTouchStart}
            onTouchEnd={onPeekTouchEnd}
            onMouseDown={onPeekMouseDown}
            sx={{
              bgcolor: 'background.paper',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              px: 2,
              pt: 1.5,
              pb: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'grab',
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 4,
                borderRadius: 2,
                bgcolor: 'text.disabled',
                mb: 0.1,
              }}
            />
            <Typography
              variant="h6"
              fontWeight={600}
              color="text.primary"
              sx={{alignSelf: 'flex-start'}}
            >
              New Bathroom
            </Typography>
          </Paper>
        </Box>
      )}
    </>
  );
}
