import { Container } from '@mui/material';
import SuccessWrapper from '../../../components/SuccessWrapper/SuccessWrapper';

export default function CheckoutSuccess() {
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
      <SuccessWrapper />
    </Container>
  );
}
