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
import { schemaLogin } from '../../models/login.model';
import { z } from 'zod';

// Interface Login
interface LoginData {
  username: string;
  password: string;
}

// Estado de la acción
interface ActionState {
  errors: Partial<Record<keyof LoginData, string>>;
  message: string;
  formData?: Partial<LoginData>;
}

const login = async (
  _: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const rawData: LoginData = {
    username: formData.get('username') as string,
    password: formData.get('password') as string,
  };
  try {
    const validatedData = schemaLogin.parse(rawData);
    return {
      errors: {},
      message: `User ${validatedData.username} login`,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Convertir errores de Zod a formato más manejable
      const fielErrors: Partial<Record<keyof LoginData, string>> = {};
      error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof LoginData;
        fielErrors[field] = issue.message;
      });

      return {
        errors: fielErrors,
        message: 'Por favor corregir los errores en el formulario',
        formData: rawData,
      };
    }

    return {
      errors: {},
      message: '',
    };
  }
};

const initialState: ActionState = {
  errors: {},
  message: '',
};

export const LoginPage = () => {
  const [state, submitAction, isPending] = useActionState(login, initialState);
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
              defaultValue={state.formData?.username}
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
              defaultValue={state.formData?.password}
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
