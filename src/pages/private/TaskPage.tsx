import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Paper,
  Pagination,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useAlert, useAxios } from '../../hooks';

interface Task {
  id: number;
  name: string;
  done: boolean;
}

interface TaskListResponse {
  data: Task[];
  total: number;
  page: number;
  pages: number;
}

export const TaskPage = () => {
  const axios = useAxios();
  const { showAlert } = useAlert();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const [savingId, setSavingId] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const pendingCount = useMemo(
    () => tasks.filter((task) => !task.done).length,
    [tasks],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<TaskListResponse>('/tasks', {
        params: {
          page,
          limit,
          search: search || undefined,
        },
      });
      setTasks(response.data?.data ?? []);
      setPages(response.data?.pages ?? 1);
      setTotal(response.data?.total ?? 0);
    } catch (error) {
      showAlert('No se pudieron cargar las tareas', 'error');
    } finally {
      setLoading(false);
    }
  }, [axios, showAlert, page, limit, search]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = taskName.trim();
    if (!name) {
      showAlert('Escribe un nombre para la tarea', 'warning');
      return;
    }

    try {
      setCreating(true);
      const response = await axios.post<Task>('/tasks', { name });
      if (response.data?.id) {
        setTasks((prev) => [response.data, ...prev]);
      } else {
        await fetchTasks();
      }
      setTaskName('');
      setIsCreateOpen(false);
      showAlert('Tarea creada', 'success');
    } catch (error) {
      showAlert('No se pudo crear la tarea', 'error');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditingName(task.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const saveEdit = async (taskId: number) => {
    const name = editingName.trim();
    if (!name) {
      showAlert('El nombre no puede estar vacío', 'warning');
      return;
    }

    try {
      setSavingId(taskId);
      await axios.put(`/tasks/${taskId}`, { name });
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, name } : task)),
      );
      cancelEdit();
      showAlert('Tarea actualizada', 'success');
    } catch (error) {
      showAlert('No se pudo actualizar la tarea', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const toggleDone = async (task: Task) => {
    const nextDone = !task.done;
    try {
      setSavingId(task.id);
      await axios.patch(`/tasks/${task.id}`, { done: nextDone });
      setTasks((prev) =>
        prev.map((item) =>
          item.id === task.id ? { ...item, done: nextDone } : item,
        ),
      );
    } catch (error) {
      showAlert('No se pudo actualizar el estado', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const removeTask = async (taskId: number) => {
    const confirmDelete = window.confirm(
      '¿Seguro que quieres eliminar esta tarea?',
    );
    if (!confirmDelete) return;

    try {
      setSavingId(taskId);
      await axios.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      showAlert('Tarea eliminada', 'success');
    } catch (error) {
      showAlert('No se pudo eliminar la tarea', 'error');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Mis tareas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {total} tareas, {pendingCount} pendientes
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Buscar tarea"
            size="small"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <TextField
            select
            label="Por página"
            size="small"
            value={limit}
            onChange={(event) => {
              setLimit(Number(event.target.value));
              setPage(1);
            }}
            sx={{ minWidth: 140 }}
          >
            {[5, 10, 20].map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            onClick={() => setIsCreateOpen((prev) => !prev)}
          >
            {isCreateOpen ? 'Cerrar' : 'Nueva tarea'}
          </Button>
        </Stack>
      </Stack>

      {isCreateOpen && (
        <Paper component="form" onSubmit={handleCreate} sx={{ p: 3 }}>
          <Stack spacing={2} direction={{ xs: 'column', md: 'row' }}>
            <TextField
              name="name"
              label="Nombre de la tarea"
              fullWidth
              value={taskName}
              onChange={(event) => setTaskName(event.target.value)}
              disabled={creating}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ minWidth: 160 }}
              disabled={creating}
              startIcon={
                creating ? <CircularProgress size={20} color="inherit" /> : null
              }
            >
              {creating ? 'Guardando...' : 'Agregar'}
            </Button>
          </Stack>
        </Paper>
      )}

      <Paper sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : tasks.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" fontWeight={600}>
              No tienes tareas registradas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Crea una nueva tarea para comenzar
            </Typography>
          </Box>
        ) : (
          <List>
            <ListItem sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
              <ListItemText
                primary={
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="subtitle2" sx={{ flex: 1 }}>
                      Tarea
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{ width: 120, textAlign: 'center' }}
                    >
                      Estado
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{ width: 160, textAlign: 'center' }}
                    >
                      Acciones
                    </Typography>
                  </Stack>
                }
              />
            </ListItem>
            <Divider />
            {tasks.map((task, index) => {
              const isEditing = editingId === task.id;
              const isSaving = savingId === task.id;

              return (
                <Box key={task.id}>
                  <ListItem
                    disableGutters
                    sx={{ px: 2, py: 1.5 }}
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box sx={{ flex: 1 }}>
                            {isEditing ? (
                              <TextField
                                fullWidth
                                value={editingName}
                                onChange={(event) =>
                                  setEditingName(event.target.value)
                                }
                                disabled={isSaving}
                                size="small"
                              />
                            ) : (
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  textDecoration: task.done
                                    ? 'line-through'
                                    : 'none',
                                  color: task.done
                                    ? 'text.secondary'
                                    : 'inherit',
                                }}
                              >
                                {task.name}
                              </Typography>
                            )}
                          </Box>
                          <Box sx={{ width: 120, textAlign: 'center' }}>
                            <Chip
                              size="small"
                              color={task.done ? 'success' : 'warning'}
                              label={task.done ? 'Finalizada' : 'Pendiente'}
                            />
                          </Box>
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ width: 160, justifyContent: 'center' }}
                          >
                            {isEditing ? (
                              <>
                                <Tooltip title="Guardar">
                                  <span>
                                    <IconButton
                                      edge="end"
                                      color="primary"
                                      onClick={() => saveEdit(task.id)}
                                      disabled={isSaving}
                                    >
                                      <SaveIcon />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                                <Tooltip title="Cancelar">
                                  <IconButton edge="end" onClick={cancelEdit}>
                                    <CloseIcon />
                                  </IconButton>
                                </Tooltip>
                              </>
                            ) : (
                              <>
                                <Tooltip
                                  title={
                                    task.done ? 'Marcar pendiente' : 'Finalizar'
                                  }
                                >
                                  <span>
                                    <IconButton
                                      edge="end"
                                      color={task.done ? 'success' : 'default'}
                                      onClick={() => toggleDone(task)}
                                      disabled={isSaving}
                                    >
                                      {task.done ? (
                                        <CheckCircleIcon />
                                      ) : (
                                        <RadioButtonUncheckedIcon />
                                      )}
                                    </IconButton>
                                  </span>
                                </Tooltip>
                                <Tooltip title="Editar">
                                  <span>
                                    <IconButton
                                      edge="end"
                                      onClick={() => startEdit(task)}
                                      disabled={isSaving}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                                <Tooltip title="Eliminar">
                                  <span>
                                    <IconButton
                                      edge="end"
                                      color="error"
                                      onClick={() => removeTask(task.id)}
                                      disabled={isSaving}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              </>
                            )}
                          </Stack>
                        </Stack>
                      }
                    />
                  </ListItem>
                  {index < tasks.length - 1 && <Divider />}
                </Box>
              );
            })}
          </List>
        )}
      </Paper>

      {pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={pages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}
    </Stack>
  );
};
