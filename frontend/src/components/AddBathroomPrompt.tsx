import {useRef} from 'react';
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

type AddBathroomPromptProps = {
  bannerOpen: boolean;
  onCancel: () => void;
  showPeekCard: boolean;
  onExpand: () => void;
};

/**
 * Banner and peek card prompting user to pick a bathroom
 * @param {object} props Component props
 * @returns {object} JSX element
 */
export default function AddBathroomPrompt(
    props: AddBathroomPromptProps,
) {
  const {
    bannerOpen,
    onCancel,
    showPeekCard,
    onExpand,
  } = props;

  const startYRef = useRef<number | null>(null);
  const draggingRef = useRef(false);

  const onPeekTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
    startYRef.current = e.touches[0].clientY;
    draggingRef.current = true;
  };

  const onPeekTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
    if (!draggingRef.current || startYRef.current == null) return;
    const dy = startYRef.current - e.changedTouches[0].clientY;
    if (dy > 20) {
      onExpand();
    }
    startYRef.current = null;
    draggingRef.current = false;
  };

  const onPeekMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
    startYRef.current = e.clientY;
    draggingRef.current = true;
    const onUp = (ev: MouseEvent) => {
      ev.stopPropagation?.();
      if (draggingRef.current && startYRef.current != null) {
        const dy = startYRef.current - ev.clientY;
        if (dy > 20) {
          onExpand();
        }
      }
      startYRef.current = null;
      draggingRef.current = false;
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mouseup', onUp);
  };

  return (
    <>
      <Snackbar
        open={bannerOpen}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        slotProps={{
          content: {
            sx: {
              bgcolor: (theme) => theme.palette.background.default,
              color: (theme) => theme.palette.text.primary,
              borderRadius: '12px',
              boxShadow: 3,
              display: 'flex',
              alignItems: 'center',
              px: 3,
              py: 0.5,
            },
          },
        }}
        message={(
          <Typography variant="subtitle1" fontWeight={500}>
            Choose a location for the bathroom
          </Typography>
        )}
        action={(
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
              'mr': 0.2,
              'px': 1.6,
              'py': 0.6,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            Cancel
          </Button>
        )}
      />
      {showPeekCard && (
        <Box
          sx={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: (t) => t.zIndex.modal + 1,
          }}
        >
          <Paper
            elevation={3}
            onTouchStart={onPeekTouchStart}
            onTouchEnd={onPeekTouchEnd}
            onMouseDown={onPeekMouseDown}
            sx={{
              bgcolor: (theme) => theme.palette.background.default,
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
              sx={{
                alignSelf: 'flex-start',
                color: (theme) => theme.palette.text.primary,
              }}
            >
              New Bathroom
            </Typography>
          </Paper>
        </Box>
      )}
    </>
  );
}
