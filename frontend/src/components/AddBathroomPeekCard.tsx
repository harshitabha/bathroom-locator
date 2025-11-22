import {useRef} from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

type AddBathroomPromptProps = {
  showPeekCard: boolean;
  onExpand: () => void;
};

/**
 * Peek card for adding bathroom
 * @param {object} props Component props
 * @returns {object} JSX element
 */
export default function AddBathroomPeekCard(props: AddBathroomPromptProps) {
  const {showPeekCard, onExpand} = props;

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
            aria-label="Expand drawer by dragging"
            onTouchStart={onPeekTouchStart}
            onTouchEnd={onPeekTouchEnd}
            onMouseDown={onPeekMouseDown}
            sx={{
              bgcolor: 'background.default',
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
                color: 'text.primary',
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
