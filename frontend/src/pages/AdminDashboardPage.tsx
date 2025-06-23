import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Grid,
  Card,
  CardContent,
  Checkbox,
  Tooltip,
  Snackbar,
  CircularProgress,
  Avatar,
} from "@mui/material";
import {
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { adminApi } from "../api/admin";
import type { User, UserStats } from "../api/admin";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import api from "../services/api";
import NavigationHeader from "../components/NavigationHeader";

const AdminDashboardPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    role: "",
    is_active: "",
    is_verified: "",
    search: "",
  });

  // Selection
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  // Dialogs
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    role: "",
    notes: "",
  });

  // Notifications
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const { t } = useI18n();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: page + 1,
        limit: rowsPerPage,
      };

      if (filters.role) params.role = filters.role;
      if (filters.is_active !== "")
        params.is_active = filters.is_active === "true";
      if (filters.is_verified !== "")
        params.is_verified = filters.is_verified === "true";
      if (filters.search) params.search = filters.search;

      const response = await adminApi.getUsers(params);
      setUsers(response.users);
      setTotalUsers(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await adminApi.getStats();
      setStats(statsData);
    } catch (err: any) {
      console.error("Failed to load stats:", err);
    }
  };

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [page, rowsPerPage, filters]);

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      role: user.role,
      notes: user.admin_notes || "",
    });
    setEditDialogOpen(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      if (editForm.role !== selectedUser.role) {
        await adminApi.updateUserRole(
          selectedUser.id,
          editForm.role as "user" | "moderator" | "admin"
        );
      }

      if (editForm.notes !== selectedUser.admin_notes) {
        await adminApi.updateAdminNotes(selectedUser.id, editForm.notes);
      }

      setSnackbar({
        open: true,
        message: "User updated successfully",
        severity: "success",
      });

      setEditDialogOpen(false);
      loadUsers();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to update user",
        severity: "error",
      });
    }
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      await adminApi.toggleUserStatus(userId);
      setSnackbar({
        open: true,
        message: "User status updated successfully",
        severity: "success",
      });
      loadUsers();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to update user status",
        severity: "error",
      });
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedUsers(users.map((user) => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkAction = async (
    action: "activate" | "deactivate" | "role",
    role?: string
  ) => {
    if (selectedUsers.length === 0) return;

    try {
      if (action === "activate" || action === "deactivate") {
        await adminApi.bulkToggleStatus(selectedUsers, action === "activate");
      } else if (action === "role" && role) {
        await adminApi.bulkUpdateRoles(
          selectedUsers,
          role as "user" | "moderator" | "admin"
        );
      }

      setSnackbar({
        open: true,
        message: `Bulk action completed successfully`,
        severity: "success",
      });

      setSelectedUsers([]);
      loadUsers();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to perform bulk action",
        severity: "error",
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "error";
      case "moderator":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "success" : "error";
  };

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <NavigationHeader title={t("admin.title")} />

      {/* Skip to main content link for screen readers */}
      <a
        href="#admin-content"
        style={{
          position: "absolute",
          left: "-10000px",
          top: "auto",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
        onFocus={(e) => {
          e.target.style.left = "6px";
          e.target.style.top = "6px";
          e.target.style.width = "auto";
          e.target.style.height = "auto";
          e.target.style.overflow = "visible";
        }}
        onBlur={(e) => {
          e.target.style.left = "-10000px";
          e.target.style.top = "auto";
          e.target.style.width = "1px";
          e.target.style.height = "1px";
          e.target.style.overflow = "hidden";
        }}
      >
        Skip to main content
      </a>

      <Box id="admin-content" role="main" aria-labelledby="admin-title">
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            role="alert"
            aria-live="assertive"
          >
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        {stats && (
          <Box component="section" aria-labelledby="stats-title" sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              component="h2"
              id="stats-title"
              sx={{
                mb: 3,
                color: "text.primary",
                fontWeight: 600,
              }}
            >
              {t("admin.statistics")}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  role="article"
                  aria-labelledby="total-users-stat"
                  sx={{
                    "&:focus-within": {
                      outline: "2px solid",
                      outlineColor: "primary.main",
                      outlineOffset: "2px",
                    },
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Avatar
                        sx={{ bgcolor: "primary.main", mr: 2 }}
                        aria-hidden="true"
                      >
                        <PeopleIcon />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h4"
                          component="div"
                          id="total-users-stat"
                          aria-label={`${stats.totalUsers} total users`}
                        >
                          {stats.totalUsers}
                        </Typography>
                        <Typography color="text.secondary">
                          {t("admin.totalUsers")}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card
                  role="article"
                  aria-labelledby="active-users-stat"
                  sx={{
                    "&:focus-within": {
                      outline: "2px solid",
                      outlineColor: "primary.main",
                      outlineOffset: "2px",
                    },
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Avatar
                        sx={{ bgcolor: "success.main", mr: 2 }}
                        aria-hidden="true"
                      >
                        <CheckCircleIcon />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h4"
                          component="div"
                          id="active-users-stat"
                          aria-label={`${stats.activeUsers} active users`}
                        >
                          {stats.activeUsers}
                        </Typography>
                        <Typography color="text.secondary">
                          {t("admin.activeUsers")}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card
                  role="article"
                  aria-labelledby="verified-users-stat"
                  sx={{
                    "&:focus-within": {
                      outline: "2px solid",
                      outlineColor: "primary.main",
                      outlineOffset: "2px",
                    },
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Avatar
                        sx={{ bgcolor: "info.main", mr: 2 }}
                        aria-hidden="true"
                      >
                        <SecurityIcon />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h4"
                          component="div"
                          id="verified-users-stat"
                          aria-label={`${stats.verifiedUsers} verified users`}
                        >
                          {stats.verifiedUsers}
                        </Typography>
                        <Typography color="text.secondary">
                          {t("admin.verifiedUsers")}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card
                  role="article"
                  aria-labelledby="admin-users-stat"
                  sx={{
                    "&:focus-within": {
                      outline: "2px solid",
                      outlineColor: "primary.main",
                      outlineOffset: "2px",
                    },
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Avatar
                        sx={{ bgcolor: "warning.main", mr: 2 }}
                        aria-hidden="true"
                      >
                        <AdminIcon />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h4"
                          component="div"
                          id="admin-users-stat"
                          aria-label={`${stats.adminUsers} admin users`}
                        >
                          {stats.adminUsers}
                        </Typography>
                        <Typography color="text.secondary">
                          {t("admin.adminUsers")}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Filters */}
        <Paper
          sx={{ p: 2, mb: 3 }}
          role="region"
          aria-labelledby="filters-title"
        >
          <Typography variant="h6" id="filters-title" gutterBottom>
            {t("admin.filters")}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label={t("admin.search")}
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                aria-label={`${t("admin.search")} users`}
                sx={{
                  "&:focus-within": {
                    outline: "2px solid",
                    outlineColor: "primary.main",
                    outlineOffset: "2px",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel id="role-filter-label">
                  {t("admin.role")}
                </InputLabel>
                <Select
                  labelId="role-filter-label"
                  value={filters.role}
                  label={t("admin.role")}
                  onChange={(e) => handleFilterChange("role", e.target.value)}
                  aria-label={`${t("admin.filterBy")} role`}
                  sx={{
                    "&:focus-within": {
                      outline: "2px solid",
                      outlineColor: "primary.main",
                      outlineOffset: "2px",
                    },
                  }}
                >
                  <MenuItem value="">{t("admin.allRoles")}</MenuItem>
                  <MenuItem value="user">{t("admin.user")}</MenuItem>
                  <MenuItem value="moderator">{t("admin.moderator")}</MenuItem>
                  <MenuItem value="admin">{t("admin.admin")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel id="status-filter-label">
                  {t("admin.status")}
                </InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={filters.is_active}
                  label={t("admin.status")}
                  onChange={(e) =>
                    handleFilterChange("is_active", e.target.value)
                  }
                  aria-label={`${t("admin.filterBy")} status`}
                  sx={{
                    "&:focus-within": {
                      outline: "2px solid",
                      outlineColor: "primary.main",
                      outlineOffset: "2px",
                    },
                  }}
                >
                  <MenuItem value="">{t("admin.allStatuses")}</MenuItem>
                  <MenuItem value="true">{t("admin.active")}</MenuItem>
                  <MenuItem value="false">{t("admin.inactive")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel id="verification-filter-label">
                  {t("admin.verification")}
                </InputLabel>
                <Select
                  labelId="verification-filter-label"
                  value={filters.is_verified}
                  label={t("admin.verification")}
                  onChange={(e) =>
                    handleFilterChange("is_verified", e.target.value)
                  }
                  aria-label={`${t("admin.filterBy")} verification status`}
                  sx={{
                    "&:focus-within": {
                      outline: "2px solid",
                      outlineColor: "primary.main",
                      outlineOffset: "2px",
                    },
                  }}
                >
                  <MenuItem value="">
                    {t("admin.allVerificationStatuses")}
                  </MenuItem>
                  <MenuItem value="true">{t("admin.verified")}</MenuItem>
                  <MenuItem value="false">{t("admin.unverified")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <Paper
            sx={{ p: 2, mb: 3 }}
            role="region"
            aria-labelledby="bulk-actions-title"
          >
            <Typography variant="h6" id="bulk-actions-title" gutterBottom>
              {t("admin.bulkActions")} ({selectedUsers.length}{" "}
              {t("admin.selected")})
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                onClick={() => handleBulkAction("activate")}
                aria-label={`${t("admin.activate")} selected users`}
                sx={{
                  minHeight: "44px",
                  "&:focus": {
                    outline: "2px solid",
                    outlineColor: "primary.main",
                    outlineOffset: "2px",
                  },
                }}
              >
                {t("admin.activate")}
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleBulkAction("deactivate")}
                aria-label={`${t("admin.deactivate")} selected users`}
                sx={{
                  minHeight: "44px",
                  "&:focus": {
                    outline: "2px solid",
                    outlineColor: "primary.main",
                    outlineOffset: "2px",
                  },
                }}
              >
                {t("admin.deactivate")}
              </Button>
            </Box>
          </Paper>
        )}

        {/* Users Table */}
        <Paper role="region" aria-labelledby="users-table-title">
          <TableContainer>
            <Table aria-label={t("admin.usersTableDescription")}>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={
                        selectedUsers.length > 0 &&
                        selectedUsers.length < users.length
                      }
                      checked={
                        selectedUsers.length === users.length &&
                        users.length > 0
                      }
                      onChange={handleSelectAll}
                      aria-label={`${t("admin.selectAll")} users`}
                      sx={{
                        "&:focus": {
                          outline: "2px solid",
                          outlineColor: "primary.main",
                          outlineOffset: "2px",
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell scope="col" id="name-header">
                    {t("admin.name")}
                  </TableCell>
                  <TableCell scope="col" id="email-header">
                    {t("admin.email")}
                  </TableCell>
                  <TableCell scope="col" id="role-header">
                    {t("admin.role")}
                  </TableCell>
                  <TableCell scope="col" id="status-header">
                    {t("admin.status")}
                  </TableCell>
                  <TableCell scope="col" id="verification-header">
                    {t("admin.verification")}
                  </TableCell>
                  <TableCell scope="col" id="actions-header">
                    {t("admin.actions")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        aria-label={`${t("admin.select")} ${user.username}`}
                        sx={{
                          "&:focus": {
                            outline: "2px solid",
                            outlineColor: "primary.main",
                            outlineOffset: "2px",
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell headers="name-header">{user.username}</TableCell>
                    <TableCell headers="email-header">{user.email}</TableCell>
                    <TableCell headers="role-header">
                      <Chip
                        label={user.role}
                        color={getRoleColor(user.role)}
                        size="small"
                        aria-label={`Role: ${user.role}`}
                      />
                    </TableCell>
                    <TableCell headers="status-header">
                      <Chip
                        label={
                          user.is_active
                            ? t("admin.active")
                            : t("admin.inactive")
                        }
                        color={getStatusColor(user.is_active)}
                        size="small"
                        aria-label={`Status: ${
                          user.is_active
                            ? t("admin.active")
                            : t("admin.inactive")
                        }`}
                      />
                    </TableCell>
                    <TableCell headers="verification-header">
                      <Chip
                        label={
                          user.is_verified
                            ? t("admin.verified")
                            : t("admin.unverified")
                        }
                        color={user.is_verified ? "success" : "warning"}
                        size="small"
                        aria-label={`Verification: ${
                          user.is_verified
                            ? t("admin.verified")
                            : t("admin.unverified")
                        }`}
                      />
                    </TableCell>
                    <TableCell headers="actions-header">
                      <Box
                        role="group"
                        aria-label={`Actions for ${user.username}`}
                      >
                        <Tooltip title={t("admin.viewUser")}>
                          <IconButton
                            onClick={() => handleViewUser(user)}
                            color="primary"
                            size="small"
                            aria-label={`${t("admin.viewUser")} - ${
                              user.username
                            }`}
                            sx={{
                              minWidth: "44px",
                              minHeight: "44px",
                              "&:focus": {
                                outline: "2px solid",
                                outlineColor: "primary.main",
                                outlineOffset: "2px",
                              },
                            }}
                          >
                            <VisibilityIcon aria-hidden="true" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t("admin.editUser")}>
                          <IconButton
                            onClick={() => handleEditUser(user)}
                            color="primary"
                            size="small"
                            aria-label={`${t("admin.editUser")} - ${
                              user.username
                            }`}
                            sx={{
                              minWidth: "44px",
                              minHeight: "44px",
                              "&:focus": {
                                outline: "2px solid",
                                outlineColor: "primary.main",
                                outlineOffset: "2px",
                              },
                            }}
                          >
                            <EditIcon aria-hidden="true" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip
                          title={
                            user.is_active
                              ? t("admin.deactivate")
                              : t("admin.activate")
                          }
                        >
                          <IconButton
                            onClick={() => handleToggleStatus(user.id)}
                            color={user.is_active ? "warning" : "success"}
                            size="small"
                            aria-label={`${
                              user.is_active
                                ? t("admin.deactivate")
                                : t("admin.activate")
                            } - ${user.username}`}
                            sx={{
                              minWidth: "44px",
                              minHeight: "44px",
                              "&:focus": {
                                outline: "2px solid",
                                outlineColor: "primary.main",
                                outlineOffset: "2px",
                              },
                            }}
                          >
                            {user.is_active ? (
                              <BlockIcon aria-hidden="true" />
                            ) : (
                              <CheckCircleIcon aria-hidden="true" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalUsers}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            aria-label={t("admin.tablePagination")}
          />
        </Paper>

        {/* Edit User Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          aria-labelledby="edit-dialog-title"
          aria-describedby="edit-dialog-description"
        >
          <DialogTitle id="edit-dialog-title">
            {t("admin.editUser")} - {selectedUser?.username}
          </DialogTitle>
          <DialogContent id="edit-dialog-description">
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel id="role-select-label">{t("admin.role")}</InputLabel>
              <Select
                labelId="role-select-label"
                value={editForm.role}
                label={t("admin.role")}
                onChange={(e) =>
                  setEditForm({ ...editForm, role: e.target.value })
                }
                aria-required="true"
                aria-describedby="role-help"
                sx={{
                  "&:focus-within": {
                    outline: "2px solid",
                    outlineColor: "primary.main",
                    outlineOffset: "2px",
                  },
                }}
              >
                <MenuItem value="user">{t("admin.user")}</MenuItem>
                <MenuItem value="moderator">{t("admin.moderator")}</MenuItem>
                <MenuItem value="admin">{t("admin.admin")}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label={t("admin.notes")}
              value={editForm.notes}
              onChange={(e) =>
                setEditForm({ ...editForm, notes: e.target.value })
              }
              multiline
              rows={3}
              aria-describedby="notes-help"
              sx={{
                mt: 2,
                "&:focus-within": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: "2px",
                },
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setEditDialogOpen(false)}
              aria-label={t("common.cancel")}
              sx={{
                minHeight: "44px",
                "&:focus": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: "2px",
                },
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSaveEdit}
              variant="contained"
              aria-label={t("admin.saveChanges")}
              sx={{
                minHeight: "44px",
                "&:focus": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: "2px",
                },
              }}
            >
              {t("admin.saveChanges")}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View User Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          aria-labelledby="view-dialog-title"
          aria-describedby="view-dialog-description"
        >
          <DialogTitle id="view-dialog-title">
            {t("admin.viewUser")} - {selectedUser?.username}
          </DialogTitle>
          <DialogContent id="view-dialog-description">
            {selectedUser && (
              <Box>
                <Typography variant="body1" gutterBottom>
                  <strong>{t("admin.email")}:</strong> {selectedUser.email}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>{t("admin.role")}:</strong> {selectedUser.role}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>{t("admin.status")}:</strong>{" "}
                  {selectedUser.is_active
                    ? t("admin.active")
                    : t("admin.inactive")}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>{t("admin.verification")}:</strong>{" "}
                  {selectedUser.is_verified
                    ? t("admin.verified")
                    : t("admin.unverified")}
                </Typography>
                {selectedUser.admin_notes && (
                  <Typography variant="body1" gutterBottom>
                    <strong>{t("admin.notes")}:</strong>{" "}
                    {selectedUser.admin_notes}
                  </Typography>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setViewDialogOpen(false)}
              aria-label={t("common.close")}
              sx={{
                minHeight: "44px",
                "&:focus": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: "2px",
                },
              }}
            >
              {t("common.close")}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          aria-live="polite"
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default AdminDashboardPage;
