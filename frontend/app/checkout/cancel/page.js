import { Container } from '@mui/material';
import CancelWrapper from '../../../components/CancelWrapper/CancelWrapper';

export default function CheckoutCancel() {
  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        py: 6,
      }}
    >
      <CancelWrapper />
    </Container>
  );
}
