import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import { useActionState } from 'react';
import { schemaLogin, type LoginFormValues } from '../../models/login.model';
import type { ActionState } from '../../interaces';
import { createInitialState, handleZodError } from '../../helpers';
import { useAlert } from '../../hooks';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type LoginActionState = ActionState<LoginFormValues>;
const initialState = createInitialState<LoginFormValues>();

export const LoginPage = () => {
  const { showAlert } = useAlert();

  const loginApi = async (
    _: LoginActionState | undefined,
    formData: FormData,
  ): Promise<LoginActionState | undefined> => {
    const rawData: LoginFormValues = {
      username: formData.get('username') as string,
      password: formData.get('password') as string,
    };
    try {
      schemaLogin.parse(rawData);
      await delay(5000);
      showAlert('bien')
    } catch (error) {
      const err = handleZodError<LoginFormValues>(error, rawData);
      showAlert(err.message, 'error')
      return err;
    }
  };

  const [state, submitAction, isPending] = useActionState(
    loginApi,
    initialState,
  );
  return (
    <Container component="main" maxWidth="sm">
      <Box>
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component={'h1'} variant="h4" gutterBottom>
            LOGIN
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Proyecto Diplomado con React 19
          </Typography>

          {/* Errores */}

          <Box component={'form'} action={submitAction} sx={{ width: '100%' }}>
            <TextField
              name="username"
              required
              fullWidth
              label="Username"
              type="text"
              autoComplete="username"
              autoFocus
              defaultValue={state?.formData?.username}
              error={!!state?.errors.username}
              helperText={!!state?.errors.username}
              disabled={isPending}
            />
            <TextField
              name="password"
              required
              fullWidth
              label="Password"
              type="password"
              autoComplete="password"
              autoFocus
              defaultValue={state?.formData?.password}
              error={!!state?.errors.password}
              helperText={!!state?.errors.password}
              disabled={isPending}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, height: 48 }}
              disabled={isPending}
              startIcon={
                isPending ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              {isPending ? 'Logging in...' : 'Login'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
