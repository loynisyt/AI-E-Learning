import { Container } from '@mui/material';
import CheckoutWrapper from '../../components/CheckoutWrapper/CheckoutWrapper';

function CheckoutContent() {
  return (
    <Container
      maxWidth="lg"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        py: 3,
      }}
    >
      <CheckoutWrapper />
    </Container>
  );
}

export default function Checkout() {
  return <CheckoutContent />;
}
